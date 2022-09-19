## Tiny IPinfo
1. [Approach](#approach)
2. [Usage Tracking](#usage-tracking)
3. [Live Bulk Update](#live-bulk-update)
4. [Installation](#installation)
5. [Rough Edges](#rough-edges)

## Approach
***
The approach taken is to have the dataset cached in-memory with Redis using a sorted set structure.
Each IP range has its start and end IP converted to decimal form and used as a score for the set.
This enables us to immediately query for a given IP address by converting it to decimal form and
then perform a `ZRANGEBYSCORE` operation with the `min` argument set to the given IP's decimal value
and the `max` argument set to `+inf` and with `LIMIT` set to `0 1` as we are only interested if a
single result is returned or not. This is because the set is sorted by the scores (the IP ranges' start
and end) and if we do obtain a result then that would be the value for the end IP for an IP range which
translates to the fact that the requested IP is between one of the ranges in the set.

The downside to this approach is that using a set we need to have unique values stored for each score.
And also due to the fact that for many IP ranges we have repeating data like city, region, country, etc.
and of course storage limitations for the cache it would have been suboptimal to directly store for each
set element all the geolocation data for an IP range. Thus, during the dataset import operation we perform
a breakdown of the geolocation data into arrays which will then be translated into Redis hashmaps and
keeping an integer index reference between some of them, all the while our starting point being the value
in the set element with the found score from the `ZRANGEBYSCORE` operation in the form of 'XXs' or 'XXe',
where "XX" stands for an integer reference and 's' and 'e' being appended to the beginning IP and end IP
respectively.

A table-like overview of the data structures:
  
| ipranges            |
|---------------------|
| start_ip            |
| end_ip              |  
| ipranges_cities_key |


| ipranges_cities |
|-----------------|
| key             |
| start_ip        |
| end_ip          |
| join_key        |
| city_id         |  

`ipranges_cities` correlates with the `ipinfo:iprangescities:XX` hashmap key. Its key field is the XX used in
the key, and it is also the part of the "XXs" and "XXe" value for the sorted set elements. It has in turn the decimal
values for the respective range start and end IPs as we have to make a double check that the requested IP address
is actually in range as we can hit corner cases - for example a requested IP's decimal value can be out of our stored
ranges but still have as a maximum a score from our sorted set.
Regarding the `join_key`, I could not find a use for it with this sorted set approach, but I'm sure it can be useful
in a different scenario, especially in a RDBMS where it can be used in `JOIN` queries possibly even `SELF JOINs`. 
And the `city_id` field holds the reference to the `ipinfo:cities:YY` hashmap which centralizes much of the geolocation
data of an IP range.

| cities       |
|--------------|
| key          |
| name         |
| postal       |
| latitude     |
| longitude    |
| region_key   |
| country_key  |
| timezone_key |

| regions | countries | timezones |
|---------|-----------|-----------|
| key     | key       | key       |
| name    | name      | name      |

In the `cities` structure, the `key` field represents the `YY` value from the aforementioned `ipinfi:cities:YY` pivot
hashmap. Rest of the keys found in the structure point to their respective entries as simple key/value stores (`GET`/`SET`).

As one can see, this solution can entail repeated Redis calls from the application and RTTs can add up which impacts
performance, and to mitigate this a custom Redis command is employed which is composed by a Lua script that receives the
keys needed and as a single argument the decimal value for the requested IP. The script can either return an empty result or
an array with all the geolocation data for the IP.


## Usage Tracking
***
For the usage tracking mechanism I felt compelled to make use of a database as I needed it first and foremost to log
requests and their time and resolution which can then be used for the usage tracking area of the UI. I hope this does
not go against the specifications as I have seen the phrase "ultimate data source for serving data in an API" being
applied only to the IP geolocation info endpoint. 

I chose SQLite due to both the scope of the project (not needing to have a distributed DB setup) and the fact that it
is a ready-heavy application rather than a write-heavy one, scenario in which SQLite really shines.
The schema consists of two tables: `users` where of special importance are the `token` field and the `usage` and
`usage_limit` fields used for rate limiting, and the `users_requests` table which logs each request made by a user,
the IP for which he requested geolocation info, the resolution of the request and its creation timestamp.

Caching is employed for the usage tracking and rate limiting: each user's token is part of the `ipinfo:users:TOKEN`
hashmap key which holds the up-to-date usage for the token and its usage limit. 

The check to see if a token is still eligible for requests is also made with a custom Redis command which holds a script
that checks the usage against the usage limit and returns a message for each scenario which in turn dictates either if
the request goes ahead towards IP geolocation fetching or, if the user is not eligible, we adapt the server response accordingly.
The usage incrementation takes place at Redis level and afterwards, after the response is served by the API, it is incremented
also in the database.

This is more of a business level decision but usage is incremented also for requests that did not have any geolocation data
for the given IP.

It is also taken into account the situation in which the cache for a token is missing and a validation from the DB takes place
and afterwards the cache for the respective token is created.

A users requests endpoint is exposed for the UI which receives a `from` & `to` timestamp values and returns ann array of
objects aggregated first by the day of the request and then by counts of each request resolution type.

## Live Bulk Update
***
The manner in which a live bulk update can be performed depends on the scenario. Still, every scenario involves first
retrieving the keys used for each cache entity (e.g. which integer key is correlated to which city in Redis) by retrieving
first the keys correlated for the low level entities (regions, countries & timezones) and afterwards going up to the city
level but without going to `ipranges_cities` and `ipranges` levels. This is needed in order for not to overwrite an 
existing cache key upon parsing the new CSV, for example in the sample CSV the first entry is a city from Japan and being
the first it received the cache key of `ipinfo:cities:0` but if in the new CSV my first city is a different one, and I don't
take into account the pre-existing mapping I can overwrite the `ipinfo:cities:0` entry with the new city. What can easily
mitigate this is having the entities already stored in a database and using their table primary keys (integer or not) as
their Redis key suffix - in such a situation I can rely on the DB that the id of the "Towada" city is for example `37` and
I can reliably use it for the cache key `ipinfo:cities:37` without having to worry about entries from a new CSV knowing
full well that those entities will employ their own cache key suffix given from the DB id.
But without such a source of truth we have to do this kind of reverse-remap.

Scenarios:  
- one which would involve just additions of new IP ranges without them overlapping the pre-existing ones.
In such a situation we just perform the `ZADD` operations for the ranges and create new `ipranges_cities` entities
holding the new IP range and city to which it is correlated in the CSV. It can also involve the creationof newlow level
entities and cities (if new cities need to be added then the `ipranges_cities` will be the last to be created).
- another situation would be one where an IP range is correlated with a different city (and as a consequence it can even be
in a different region/country/timezone). This would involve updating the `ipranges_cities` cache entry for that IP range and
entering the key for the new city. If the city does not exist in the above-mentioned reverse-mapping we then insert it in the cache.
- other situations would involve changes at the city level like postal code or even region changes due to administrative reorganizations, 
these being also simple as they involve updating the city hashmap and eventually creating new low level entities.
- a more complex one would be where there are IP new ip ranges to be added that overlap existing ones, in the sense
that if we have a pre-existing range of `108.198.193.192` ->	`108.198.193.255` and in the new CSV we receive `108.198.193.200`
-> `108.198.193.220` and/or `108.198.193.230` ->	`108.198.193.255` then we must remove the set elements that were holding
the scores for the initial IP range and their correlated `ipranges_cities` entities and insert the new ranges together with their
corresponding `iprange_cities` entities and the eventual new other entities (city, region, country, timezone).


Although the above points are mentioned like different situations the checks and actions that each situation entails have to be
performed for each entry from the new CSV.


## Installation
***
- the Docker images have to be built:
  ```
  $ docker-compose build
  ```
- then the containers need to be started:
  ```
  $ docker-compose up -d
  ```
- several steps need to be performed in the app container:
  ```
  $ docker exec -it tinyipinfo_app bash
  ```
- we have to import into Redis the dataset and then the user usage data:
  ```
  $ npm run cache:dataset
  $ npm run cache:users
  ```
- we need to initialize the client by setting an env var with a user token, then building the client and restarting nginx.
Not 100% sure why with this image nginx needs to be restarted, but I see that otherwise it doesn't take into account our `default.conf`.
And this installation of nginx sometimes fails to restart, even without conf changes, in case it happens please run `service nginx restart` and it will restart successfully.
  ```
  $ source ./init-client.sh
  ```
- afterwards we need to start the server, which enables the app to be accessible at `http://localhost:4040`;
  ```
  $ npm run server:start
  ```
- and then in a new terminal window we have to start the usage data generation process in order to have some usage statistics
to show on the UI's "API Usage" section.
This process can take about 10 minutes, depending on the config of the `artillery.yml` file. The max set in the current config is
200 req/second for 360 seconds. Running the same tests again and again resulted for me both 200 responses for all 200 requests
and non-200 in other scenarios where I had a smaller request time interval, and I've capped out the usage for some tokens or the
request time was out of the user's `billing_period_start` and `billing_period_end`.
And also sometimes at 200 req/second I have received timeouts for some requests, but I'm also on Docker on Mac which isn't
really fast to begin with. The resulting report can be accessed at `http://localhost:4040/report.html`.
  ```
  $ ### in a new terminal window:
  $ docker exec -it tinyipinfo_app bash
  $ ### after entering the container, while the server runs in the initial window:
  $ ./generate-usage.sh
  ```
- a rudimentary OpenApi doc is available at `http://localhost:4040/doc.html`
## Rough Edges
***
There are plenty of rough edges in the app, it's not 100% like it would have wanted it to be.

- first and foremost I did not have the time to write some tests like I said I would, most probably I would have managed
that in the coming weekend. I would go about it first writing "happy flow" type of tests with Cucumber, and then I would go
on with unit testing, starting with the repositories and then the custom Redis commands (which they appear to be tricky to test);
- that segways into the fact that I would have liked to have a clear separation in both the API and the UI for dev/prod/test
environments and modes of operating;
- I'm really not sure if I should have covered a certain scenario in the data structure: the possibility for a city, more exactly
big metropolies, that can have multiple lat/long coordinates. That would have complicated things a bit as it would have been
the need for an extra `ipinfo:cities_coordinates:XX` hashmap in Redis and an extra field named `coordinates_key` in the cities
hashmaps;
- there's room for better and stricter typing, more types & abstractions (regarding use of TypeScript);
- the OpenApi docs are poor, I would have liked to define better schemas and put examples for values and objects;
- I'm pretty sure those Lua scripts can be better;
- regarding the UI, I would have liked to have the time to centralize the app state so that when browsing from one page to another
one could pick from where he left off, plus many more details like a spinner animation when fetching data, and of course prettier
styling.
- and also linting is missing;
