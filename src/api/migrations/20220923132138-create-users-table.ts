let dbm;
let type;
let seed;
let promise;
/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm     = options.dbmigrate;
  type    = dbm.dataType;
  seed    = seedLink;
  promise = options.promise;
};
exports.up    = function (db) {
  return db.runSql(`
    CREATE TABLE IF NOT EXISTS users
    (
      "id"                   INTEGER PRIMARY KEY,
      "email"                TEXT    NOT NULL,
      "first_name"           TEXT    NOT NULL,
      "last_name"            TEXT    NOT NULL,
      "token"                TEXT    NOT NULL,
      "usage"                INTEGER NOT NULL DEFAULT 0.00,
      "usage_limit"          INTEGER NOT NULL DEFAULT 0.00,
      "billing_period_start" INTEGER NOT NULL,
      "billing_period_end"   INTEGER NOT NULL,
      "created_at"           INTEGER NOT NULL,
      UNIQUE (token)
    );
    CREATE TABLE IF NOT EXISTS users_requests
    (
      "user_id"    INTEGER NOT NULL,
      "ip"         INTEGER NOT NULL,
      "resolution" TEXT    NOT NULL,
      "created_at" INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
};
exports.down  = function (db) {
  return db.runSql(`
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS users_requests;
  `);
};
exports._meta = {
  'version': 1
};
