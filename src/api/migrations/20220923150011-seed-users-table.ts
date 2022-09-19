import {faker}                 from '@faker-js/faker';
import {generateRandomBetween} from '../utils/utils';
import 'dotenv/config';

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm  = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  let i            = 0;
  const noOfUsers  = 1000;
  const usageLimit = 50000;
  const now        = Date.now();

  while (i < noOfUsers) {
    db.insert(
      'users',
      [
        'email', 'first_name', 'last_name', 'token', 'usage', 'usage_limit',
        'billing_period_start', 'billing_period_end', 'created_at'
      ],
      [
        faker.internet.email(),
        faker.name.firstName(),
        faker.name.lastName(),
        faker.random.alphaNumeric(14),
        generateRandomBetween(1, usageLimit),
        usageLimit,
        process.env.IPINFO_TEST_DATA_BILLING_PERIOD_START,
        process.env.IPINFO_TEST_DATA_BILLING_PERIOD_END,
        now
      ]
    );

    i++;
  }

  return null;
};

exports.down = function (db) {
  db.runSql('DELETE FROM users');
  db.runSql('DELETE FROM users_requests');

  return null;
};

exports._meta = {
  'version': 1
};
