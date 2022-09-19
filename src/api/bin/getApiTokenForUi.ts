import {getChunked} from '../repository/userRepository';

const run = async () => {
  const tokenResult = await getChunked(['token'], 1, 0);
  console.log(tokenResult[0].token);
}

run();
