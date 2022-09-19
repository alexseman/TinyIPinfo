import errorResponse          from '../action/response/errorResponse';
import unixTimestampValidator from '../utils/validator/unixTimestampValidator';
import UserRequests           from '../types/UserRequests';
import {Response}             from 'express';

const userRequestsRangesValidation = (req: UserRequests, res: Response, next) => {
  const to   = Number(req.query.to);
  const from = Number(req.query.from);

  if (! (to && from) || ! (unixTimestampValidator(to) && unixTimestampValidator(from))) {
    return errorResponse(
      res,
      400,
      'Missing or invalid timestamps provided for user requests range'
    );
  }

  if (from > to) {
    return errorResponse(
      res,
      400,
      'Start of interval cannot be past end of interval for user requests time range'
    );
  }

  req.to   = to;
  req.from = from;
  return next();
}

export default userRequestsRangesValidation;
