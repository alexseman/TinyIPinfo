import * as sqlite  from 'sqlite3';
import {existsSync} from 'fs';
import path         from 'path';
import {promisify}  from 'util';
import logger       from './logger';
import 'dotenv/config';

const sqlite3 = sqlite.verbose();
const dbPath  = path.join(__dirname, '../../..', `${process.env.IPINFO_DB_PATH}`) + `/${process.env.IPINFO_ENV}.db`;


if (! existsSync(dbPath)) {
  logger.error(`DB path ${dbPath} does not exist`)
  throw new Error(`DB path ${dbPath} does not exist`);
}

const db    = new sqlite3.Database(dbPath);
const query = promisify(db.all).bind(db);

export default query;
