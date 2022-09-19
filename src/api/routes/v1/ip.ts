import express         from 'express';
import ipValidation    from '../../middleware/ipAddressValidation';
import tokenValidation from '../../middleware/tokenValidation';
import usageValidation from '../../middleware/usageValidation';
import {getIp}         from '../../action/v1/ip';

const router = express.Router();

router.get('/:ip', [tokenValidation, ipValidation, usageValidation], getIp);

export default router;
