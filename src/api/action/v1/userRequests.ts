import * as userRequestRepository from '../../repository/userRequestRepository';
import errorResponse              from '../response/errorResponse';
import UserRequests               from '../../types/UserRequests';
import {Response}                 from 'express';

export const getUserRequests = async (req: UserRequests, res: Response) => {
  const to           = req.to;
  const from         = req.from;
  const userRequests = await userRequestRepository.getUserRequests(from, to);

  if (! userRequests) {
    errorResponse(
      res,
      500,
      `Error fetching user requests for range ${from} ${to}`
    );
  }

  res.status(200).json(userRequests);
};
