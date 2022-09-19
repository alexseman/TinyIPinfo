import logger                                    from '../utils/logger';
import {parseCacheArrayResponseToKeyValueObject} from '../utils/utils';
import {redis}                                   from '../utils/redis';

export const findIp = async (decimalIp: number) => {
  try {
    // @ts-ignore
    const cacheResponse = await redis.findIpRangeIndexAndGetRangeInfo(
      `${process.env.IPINFO_REDIS_KEY_IPRANGES}`,
      `${process.env.IPINFO_REDIS_KEY_IPRANGESCITIES}:`,
      `${process.env.IPINFO_REDIS_KEY_CITIES}:`,
      `${process.env.IPINFO_REDIS_KEY_REGIONS}:`,
      `${process.env.IPINFO_REDIS_KEY_COUNTRIES}:`,
      `${process.env.IPINFO_REDIS_KEY_TIMEZONES}:`,
      decimalIp
    );

    if (! cacheResponse.length) {
      return {};
    }

    return parseCacheArrayResponseToKeyValueObject(cacheResponse);
  } catch (err) {
    logger.error('Error during find IP [repository operation]', {
      decimalIp,
      err
    });
  }
};
