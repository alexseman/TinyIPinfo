type UserDbResult = {
  id: number,
  email?: string,
  first_name?: string,
  last_name?: string,
  token?: string,
  usage?: number,
  usage_limit?: number,
  billing_period_start?: number,
  billing_period_end?: number,
  created_at?: number
};

export default UserDbResult;
