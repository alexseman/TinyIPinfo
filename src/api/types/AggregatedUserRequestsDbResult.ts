type AggregatedUserRequestsDbResult = {
  request_day: string,
  total: number,
  success: number,
  no_data: number,
  usage_limit_reached: number,
  billing_period_invalid: number
};

export default AggregatedUserRequestsDbResult;
