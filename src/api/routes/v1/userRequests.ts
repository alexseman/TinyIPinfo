import express                      from 'express';
import {getUserRequests}            from '../../action/v1/userRequests';
import userRequestsRangesValidation from '../../middleware/userRequestsRangesValidation';

const router = express.Router();

router.get('/', [userRequestsRangesValidation], getUserRequests);

export default router;
