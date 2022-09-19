import {Request}    from 'express';
import UserDbResult from './UserDbResult';

type IpInfoRequest = Request & {
  requestedIpAddress?: string,
  decimalIp: number,
  newUsageData?: UserDbResult,
  requestTime?: number,
  token?: string,
  updateUsageCache?: boolean
};

export default IpInfoRequest;
