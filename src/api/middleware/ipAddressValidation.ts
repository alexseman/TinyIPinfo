import errorResponse from '../action/response/errorResponse';
import {isValidIpV4} from '../utils/validator/ipAddressValidator'
import ipInt         from 'ip-to-int';
import {Response}    from 'express';
import IpInfoRequest from '../types/IpInfoRequest';

const ipValidation = async (req: IpInfoRequest, res: Response, next) => {
  if (!! req.params.ip && isValidIpV4(req.params.ip)) {
    req.requestedIpAddress = req.params.ip;
    req.decimalIp          = ipInt(req.requestedIpAddress).toInt();
    return next();
  }

  return errorResponse(res, 400, 'Invalid IPv4 Address Provided');
}

export default ipValidation;
