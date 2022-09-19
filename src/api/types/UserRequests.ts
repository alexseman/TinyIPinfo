import {Request} from 'express';

type UserRequests = Request & {
  to: number,
  from: number
};

export default UserRequests;
