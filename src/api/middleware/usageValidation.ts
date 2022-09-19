import {findUserByToken}                                                from '../repository/userRepository';
import {parseCacheArrayResponseToKeyValueObject, generateRandomBetween} from '../utils/utils';
import errorResponse                                                    from '../action/response/errorResponse';
import * as userRequestRepository                                       from '../repository/userRequestRepository';
import UserDbResult                                                     from '../types/UserDbResult';
import {Response}                                                       from 'express';
import IpInfoRequest                                                    from '../types/IpInfoRequest';
import {redis}                                                          from '../utils/redis';
import 'dotenv/config';

const parseErrorMessage = (message, token) => message.replace(/%TOKEN%/, token);
const errorMessages     = {
  402: {
    message: 'Request made for token %TOKEN% is outside valid billing period',
    resolution: userRequestRepository.requestResolution.REQUEST_BILLING_PERIOD_INVALID
  },
  403: {
    message: 'Unauthorized token %TOKEN%',
    resolution: ''
  },
  429: {
    message: 'Usage allowance for token %TOKEN% has been reached',
    resolution: userRequestRepository.requestResolution.REQUEST_USAGE_LIMIT_REACHED
  }
};

const usageValidation = async (req: IpInfoRequest, res: Response, next) => {
  let requestTime = Math.floor(Date.now() / 1000);
  if (req.query.mode && req.query.mode === 'artillery') {
    requestTime = generateRandomBetween(
      Number(process.env.IPINFO_TEST_DATA_BILLING_PERIOD_START),
      Number(process.env.IPINFO_TEST_DATA_BILLING_PERIOD_END)
    );
  }

  const cachedTokenResponse = await redis.checkIfTokenEligibleForUsage(
    `${process.env.IPINFO_REDIS_KEY_USERS}:`,
    req.token!,
    requestTime
  );

  const parsedResponse: any = parseCacheArrayResponseToKeyValueObject(cachedTokenResponse);

  switch (parsedResponse.message) {
    case userRequestRepository.requestResolution.REQUEST_NO_DATA:
      const usageValidation = await validateUsageFromDb(req.token, requestTime);

      if (! usageValidation.success) {
        if (usageValidation.code !== 403) {
          await userRequestRepository.logUserRequest(
            usageValidation.user!.id,
            req.decimalIp!,
            errorMessages[usageValidation.code].resolution,
            requestTime
          );
        }

        return errorResponse(
          res,
          usageValidation.code,
          parseErrorMessage(errorMessages[usageValidation.code].message, req.token)
        );
      }

      req.updateUsageCache = true;
      req.newUsageData     = usageValidation.user;
      break;
    case userRequestRepository.requestResolution.REQUEST_USAGE_LIMIT_REACHED:
      await userRequestRepository.logUserRequest(
        parsedResponse.id,
        req.decimalIp!,
        errorMessages[429].resolution,
        requestTime
      );

      return errorResponse(
        res,
        429,
        parseErrorMessage(errorMessages[429].message, req.token)
      );
    case userRequestRepository.requestResolution.REQUEST_BILLING_PERIOD_INVALID:
      await userRequestRepository.logUserRequest(
        parsedResponse.id,
        req.decimalIp!,
        errorMessages[402].resolution,
        requestTime
      );

      return errorResponse(
        res,
        402,
        parseErrorMessage(errorMessages[402].message, req.token)
      );
    case userRequestRepository.requestResolution.REQUEST_SUCCESS:
      req.newUsageData = parsedResponse;
  }

  req.requestTime = requestTime;
  next();
};

const validateUsageFromDb = async (token, requestTime): Promise<{ success: boolean, code: number, user?: UserDbResult }> => {
  const user: UserDbResult | null = await findUserByToken(
    token,
    ['id', 'usage', 'usage_limit', 'billing_period_start', 'billing_period_end']
  );

  if (! user) {
    return {
      success: false,
      code: 403
    };
  }

  if (user!.usage! >= user!.usage_limit!) {
    return {
      success: false,
      code: 429,
      user
    };
  }

  if (requestTime < user!.billing_period_start! || requestTime > user!.billing_period_end!) {
    return {
      success: false,
      code: 402,
      user
    };
  }

  user!.usage!++;
  return {
    success: true,
    code: 200,
    user
  };
};

export default usageValidation;
