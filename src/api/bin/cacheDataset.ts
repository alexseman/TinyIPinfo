import {parse}                 from 'csv-parse';
import ipInt                   from 'ip-to-int';
import {createReadStream}      from 'fs';
import isValidImportable       from '../utils/validator/importValidator';
import logger                  from '../utils/logger';
import ImportableIpRangeRecord from '../types/ImportableIpRangeRecord';
import {redis, execPipeline}   from '../utils/redis';
import 'dotenv/config';

const parser = parse({delimiter: ',', columns: true, relax_column_count: true});

let ipRanges: ImportableIpRangeRecord[] = [];
let cities                              = {};
let regions                             = {};
let countries                           = {};
let timezones                           = {};

let ipRangeIndex   = 0;
let citiesIndex    = 0;
let regionsIndex   = 0;
let countriesIndex = 0;
let timezonesIndex = 0;

const alphabeticOnly = (string) => string.replace(/[^0-9a-zA-Z]/g, '');

parser.on('readable', () => {
  let record;
  let recordValidation;

  while (null !== (record = parser.read())) {
    recordValidation = isValidImportable(record);

    if (! recordValidation.valid) {
      console.error('Validation failed on dataset item import:', record);
      logger.error('Validation failed on dataset item import:', record);
      continue;
    }

    let cityRecord                             = {} as {
      key: number,
      city: string,
      postal: string,
      latitude: string,
      longitude: string,
      country_key: number,
      region_key: number,
      timezone_key: number,
    };
    let ipRangeRecord: ImportableIpRangeRecord = {
      start_ip: 0,
      end_ip: 0,
      join_key: 0,
      city_key: 0,
    };
    // we can have cities or even regions from different countries with the same name, so we have to compose
    // a unique(ish) key from country + region + city in order to not index such a duplicate in the wrong country
    const cityKey = (record.country + alphabeticOnly(record.region) + alphabeticOnly(record.city)).toLowerCase();

    ipRangeRecord.start_ip = ipInt(record.start_ip).toInt();
    ipRangeRecord.end_ip   = ipInt(record.end_ip).toInt();
    ipRangeRecord.join_key = ipInt(record.join_key).toInt();

    if (cities.hasOwnProperty(cityKey)) {
      ipRangeRecord.city_key = cities[cityKey].key;
    } else {
      ipRangeRecord.city_key = citiesIndex;

      cityRecord.key       = citiesIndex++;
      cityRecord.city      = record.city;
      cityRecord.postal    = record.postal_code;
      cityRecord.latitude  = record.latitude;
      cityRecord.longitude = record.longitude;

      if (countries.hasOwnProperty(record.country)) {
        cityRecord.country_key = countries[record.country];
      } else {
        cityRecord.country_key    = countriesIndex;
        countries[record.country] = countriesIndex++;
      }

      if (regions.hasOwnProperty(record.region)) {
        cityRecord.region_key = regions[record.region];
      } else {
        cityRecord.region_key  = regionsIndex;
        regions[record.region] = regionsIndex++;
      }

      if (timezones.hasOwnProperty(record.timezone)) {
        cityRecord.timezone_key = timezones[record.timezone];
      } else {
        cityRecord.timezone_key    = timezonesIndex;
        timezones[record.timezone] = timezonesIndex++;
      }

      cities[cityKey] = cityRecord;
    }

    ipRanges[ipRangeIndex++] = ipRangeRecord;
  }
});

createReadStream(`${process.env.IPINFO_DB_PATH}/dataset.csv`).pipe(parser).on('finish', async () => {

  const pipeline = redis.pipeline();

  for (const timezone in timezones) {
    pipeline.set(`${process.env.IPINFO_REDIS_KEY_TIMEZONES}:${timezones[timezone]}`, timezone);
  }

  await execPipeline(pipeline, 'Timezones insertion');

  for (const region in regions) {
    pipeline.set(`${process.env.IPINFO_REDIS_KEY_REGIONS}:${regions[region]}`, region);
  }

  await execPipeline(pipeline, 'Regions insertion');

  for (const country in countries) {
    pipeline.set(`${process.env.IPINFO_REDIS_KEY_COUNTRIES}:${countries[country]}`, country);
  }

  await execPipeline(pipeline, 'Countries insertion');

  for (const city in cities) {
    let key = cities[city].key;
    delete cities[city].key;
    pipeline.hset(`${process.env.IPINFO_REDIS_KEY_CITIES}:${key}`, cities[city]);
  }

  await execPipeline(pipeline, 'Cities insertion');

  for (let i = 0; i < ipRanges.length; i++) {
    pipeline.zadd(`${process.env.IPINFO_REDIS_KEY_IPRANGES}`, ipRanges[i].start_ip, `${i}s`);
    pipeline.zadd(`${process.env.IPINFO_REDIS_KEY_IPRANGES}`, ipRanges[i].end_ip, `${i}e`);
    pipeline.hset(`${process.env.IPINFO_REDIS_KEY_IPRANGESCITIES}:${i}`, ipRanges[i]);
  }

  await execPipeline(pipeline, 'IP ranges insertion');

  console.log('Finished importing dataset');
  process.exit();
});
