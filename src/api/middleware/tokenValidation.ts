import {tokenRegex}   from '../utils/validator/tokenValidator';
import {extractToken} from '../utils/utils';
import errorResponse  from '../action/response/errorResponse';
import IpInfoRequest  from '../types/IpInfoRequest';
import {Response}     from 'express';

const tokenValidation = (req: IpInfoRequest, res: Response, next) => {
  const token = extractToken(req);

  if (!! token && tokenRegex.test(token)) {
    req.token = token;
    return next();
  }

  return errorResponse(res, 400, 'Missing Token or Invalid Format Provided');
}

export default tokenValidation;
