import query                          from '../utils/query';
import logger                         from '../utils/logger';
import AggregatedUserRequestsDbResult from '../types/AggregatedUserRequestsDbResult';

const table = 'users_requests';

export const requestResolution = {
  REQUEST_SUCCESS: 'success',
  REQUEST_NO_DATA: 'no_data',
  REQUEST_USAGE_LIMIT_REACHED: 'usage_limit_reached',
  REQUEST_BILLING_PERIOD_INVALID: 'billing_period_invalid'
};

export const getUserRequests = async (from: number, to: number): Promise<AggregatedUserRequestsDbResult[] | null> => {
  try {
    return await query(`
      SELECT DATE(created_at, 'unixepoch')                                                                       AS request_day,
             COUNT(*)                                                                                            AS total,
             SUM(CASE WHEN resolution = '${requestResolution.REQUEST_SUCCESS}' THEN 1 ELSE 0 END)                AS '${requestResolution.REQUEST_SUCCESS}',
             SUM(CASE WHEN resolution = '${requestResolution.REQUEST_BILLING_PERIOD_INVALID}' THEN 1 ELSE 0 END) AS '${requestResolution.REQUEST_BILLING_PERIOD_INVALID}',
             SUM(CASE WHEN resolution = '${requestResolution.REQUEST_USAGE_LIMIT_REACHED}' THEN 1 ELSE 0 END)    AS '${requestResolution.REQUEST_USAGE_LIMIT_REACHED}',
             SUM(CASE WHEN resolution = '${requestResolution.REQUEST_NO_DATA}' THEN 1 ELSE 0 END)                AS '${requestResolution.REQUEST_NO_DATA}'
      FROM ${table}
      WHERE created_at BETWEEN ? AND ?
      GROUP BY request_day
      ORDER BY request_day
    `, [from, to]);
  } catch (err) {
    logger.error('Error fetching user requests from time range [repository operation]', {
      from,
      to
    });
    return null;
  }
};

export const logUserRequest = async (userId: number, requestedIp: number, resolution: string, requestTime: number): Promise<boolean> => {
  try {
    await query(
      `INSERT INTO ${table} (user_id, ip, resolution, created_at)
       VALUES (?, ?, ?, ?)`,
      [userId, requestedIp, resolution, requestTime]
    );

    return true;
  } catch (err) {
    logger.error('Error logging user request [repository operation]', {
      userId,
      requestedIp,
      resolution,
      requestTime
    });
    return false;
  }
};
