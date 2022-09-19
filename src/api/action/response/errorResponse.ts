import {Response} from 'express';

const errorResponse = (responseObject: Response, status: number, message: string) => {
  return responseObject.status(status).json({
    status,
    message
  });
};

export default errorResponse;
