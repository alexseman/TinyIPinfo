import {getTotal, getChunked} from '../repository/userRepository';
import {redis, execPipeline}  from '../utils/redis';
import UserDbResult           from '../types/UserDbResult';
import 'dotenv/config';

const run = async () => {
  await cacheUsers();
  process.exit();
}

const cacheUsers = async () => {
  let i: number             = 0;
  let users: UserDbResult[] = [];
  const chunk: number       = 500;
  const total: number       = await getTotal();
  const pipeline            = redis.pipeline();

  while (total > i * chunk) {
    users = await getChunked([
      'id',
      'token',
      'usage',
      'usage_limit',
      'billing_period_start',
      'billing_period_end'
    ], chunk, i * chunk);

    let user: UserDbResult;
    for (user of users) {
      pipeline.hset(`${process.env.IPINFO_REDIS_KEY_USERS}:${user.token}`, user);
    }

    await execPipeline(pipeline, `Chunk ${chunk} of users usage caching`);
    i++;
  }
}

run();


