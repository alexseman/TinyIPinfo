import rDnsLookup                 from '../../services/rdns';
import {findIp}                   from '../../repository/ipRepository';
import {redis}                    from '../../utils/redis';
import {updateUser}               from '../../repository/userRepository';
import * as userRequestRepository from '../../repository/userRequestRepository';
import errorResponse              from '../response/errorResponse';
import logger                     from '../../utils/logger';
import IpInfoRequest              from '../../types/IpInfoRequest';

export const getIp = async (req: IpInfoRequest, res) => {
  const response    = await findIp(req.decimalIp);
  const requestMeta = {
    ipv4: req.requestedIpAddress,
    decimal: req.decimalIp,
    user: req.newUsageData!.id,
    token: req.newUsageData!.token,
    time: req.requestTime
  };

  logger.info(`Handling request for IP info`, requestMeta);

  if (!response || ! Object.keys(response).length) {
    errorResponse(
      res,
      404,
      `No info about ${req.requestedIpAddress}`
    );

    logger.info(`No information found for ${req.requestedIpAddress}/${req.decimalIp}`, requestMeta);

    await userRequestRepository.logUserRequest(
      req.newUsageData!.id,
      req.decimalIp!,
      userRequestRepository.requestResolution.REQUEST_NO_DATA,
      req.requestTime!
    );
    return;
  }

  res.status(200).send({
    ip: req.requestedIpAddress,
    ...await rDnsLookup(req.requestedIpAddress),
    ...response
  });

  logger.info(`Successfully queried information for ${req.requestedIpAddress}/${req.decimalIp}`, requestMeta);

  await updateUser({usage: req.newUsageData!.usage}, {'token': req.token});
  await userRequestRepository.logUserRequest(
    req.newUsageData!.id,
    req.decimalIp!,
    userRequestRepository.requestResolution.REQUEST_SUCCESS,
    req.requestTime!
  );
  if (!! req.updateUsageCache) {
    await redis.hset(`ipinfo:users:${req.token}`, req.newUsageData!);
  }
};
