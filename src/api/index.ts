import express            from 'express';
import ipRoutes           from './routes/v1/ip';
import userRequestsRoutes from './routes/v1/userRequests';
import logger             from './utils/logger';
import errorResponse      from './action/response/errorResponse';
import 'dotenv/config';

const app = express();

app.use('/api/v1/ip', ipRoutes);
app.use('/api/v1/user-requests', userRequestsRoutes);

app.all('*', (req, res) => {
  return errorResponse(
    res,
    404,
    'Invalid route or resource'
  );
});

app.listen(process.env.IPINFO_PORT, () => {
  logger.info(`Server is listening at port ${process.env.IPINFO_PORT}`);
});
