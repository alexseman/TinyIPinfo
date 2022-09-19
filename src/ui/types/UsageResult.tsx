type UsageResult = {
  'request_day': string,
  'billing_period_invalid'?: number,
  'usage_limit_reached'?: number,
  'no_data'?: number,
  'success'?: number,
  'total': number
}[];

export default UsageResult;
