import Redis, {Redis as RedisInterface} from 'ioredis';
import logger                           from './logger'

// @ts-ignore
export const redis: TinyIpInfoRedis = new Redis({host: 'redis'});

interface TinyIpInfoRedis extends RedisInterface {
  checkIfTokenEligibleForUsage: (usersKey: string, requestToken: string, requestTime: number) => Promise<[]>;
  findIpRangeIndexAndGetRangeInfo: (ipRangesKey: string, ipRangesCitiesKey: string, citiesKey: string,
                                    regionsKey: string, countriesKey: string, timezonesKey: string,
                                    decimalIp: number) => Promise<[]>;
}

redis.defineCommand('checkIfTokenEligibleForUsage', {
  numberOfKeys: 1,
  lua: `
    local response = {}
		local now = tonumber(ARGV[2])
		local usage = tonumber(redis.call('hget', KEYS[1] .. ARGV[1], 'usage'))

		if (usage == nil) or (usage == false) then
      table.insert(response, 'message')
		  table.insert(response, 'no_data')
			return response
		end

		local usage_limit = tonumber(redis.call('hget', KEYS[1] .. ARGV[1], 'usage_limit'))
    local id = redis.call('hget', KEYS[1] .. ARGV[1], 'id')

		table.insert(response, 'id')
		table.insert(response, id)
    table.insert(response, 'message')

		if usage >= usage_limit then
			table.insert(response, 'usage_limit_reached')
			return response
		end

		local billing_period_start = tonumber(redis.call('hget', KEYS[1] .. ARGV[1], 'billing_period_start'))
		local billing_period_end = tonumber(redis.call('hget', KEYS[1] .. ARGV[1], 'billing_period_end'))

		if now < billing_period_start or now > billing_period_end then
			table.insert(response, 'billing_period_invalid')
			return response
		end

		redis.call('hincrby', KEYS[1] .. ARGV[1], 'usage', 1)

    table.insert(response, 'success')
		table.insert(response, 'usage')
		table.insert(response, usage + 1)

		return response
	`
});

redis.defineCommand('findIpRangeIndexAndGetRangeInfo', {
  numberOfKeys: 6,
  lua: `
		local ip = tonumber(ARGV[1])

		local range_index = redis.call('zrangebyscore', KEYS[1], ARGV[1], '+inf', 'LIMIT', 0, 1)
		if (range_index == nil) or (range_index == false) then
			return {}
		end

		range_index = string.match(unpack(range_index), '%d+')
		local ipranges_cities_index = KEYS[2] .. range_index

		local start_ip = tonumber(redis.call('hget', ipranges_cities_index, 'start_ip'))
		local end_ip = tonumber(redis.call('hget', ipranges_cities_index, 'end_ip'))
		if (start_ip == false) or (end_ip == false) then
			return {}
		end

		if ip < start_ip or ip > end_ip then
			return {}
		end

		local city_key = redis.call('hget', ipranges_cities_index, 'city_key')
		if (city_key == false) then
			return {}
		end

		local city_data = redis.call('hgetall', KEYS[3] .. city_key)

		if (city_data == false) then
			return {}
		end

		local response = {}
		local loc = ',';

		for i in pairs(city_data) do
	    if (i % 2) ~= 0 then
	      if (city_data[i]) == 'city' or (city_data[i]) == 'postal' then
	        table.insert(response, city_data[i])
	        table.insert(response, city_data[i+1])
        elseif (city_data[i]) == 'latitude' then
          loc = city_data[i+1] .. loc
        elseif (city_data[i]) == 'longitude' then
          loc = loc .. city_data[i+1]
        elseif (city_data[i]) == 'country_key' then
          local country = redis.call('get', KEYS[5] .. city_data[i+1])
					if (country) ~= not nil then
						table.insert(response, 'country')
						table.insert(response, country)
					end
				elseif (city_data[i]) == 'region_key' then
          local region = redis.call('get', KEYS[4] .. city_data[i+1])
					if (region) ~= not nil then
						table.insert(response, 'region')
						table.insert(response, region)
					end
				elseif (city_data[i]) == 'timezone_key' then
          local timezone = redis.call('get', KEYS[6] .. city_data[i+1])
					if (timezone) ~= not nil then
						table.insert(response, 'timezone')
						table.insert(response, timezone)
					end
        end
      end
		end

		table.insert(response, 'loc')
		table.insert(response, loc)
		return response
	`
});

export const execPipeline = async (pipeline, operation) => {
  await pipeline
    .exec()
    .then(r => {
      console.log(`${operation} operation succeeded`);
    })
    .catch((err) => {
      console.error(`Error during ${operation} pipeline operation`);
      logger.error(`Error during ${operation} pipeline operation`, err);
    });
};

