import query        from '../utils/query';
import logger       from '../utils/logger';
import UserDbResult from '../types/UserDbResult';

const table = 'users';

export const getTotal = async (): Promise<number> => {
  try {
    const totalQuery = await query(`SELECT COUNT(id) AS total
                                    FROM ${table}`) as [{ total: number }];

    if (! (totalQuery.length && totalQuery[0].total)) {
      throw new Error('Failed fetching total count of users');
    }

    return totalQuery[0].total;
  } catch (err) {
    logger.error('Error during get total users count [repository operation]', err);
    return 0;
  }
};

export const getChunked = async (fields: string[] = [], chunk: number, offset: number): Promise<UserDbResult[]> => {
  let fieldsSql = '*';

  try {
    if (fields.length) {
      fieldsSql = fields.join(',');
    }

    const users = await query(
      `SELECT ${fieldsSql}
       FROM ${table}
       LIMIT ? OFFSET ?`,
      [chunk, offset]
    ) as [UserDbResult];

    if (users.length) {
      return users;
    }

    return [];
  } catch (err) {
    logger.error('Error during get chunked users [repository operation]', {
      fields,
      chunk,
      offset,
      err
    });
    return [];
  }
}

export const findUserByToken = async (token: string, fields: string[] = []): Promise<UserDbResult | null> => {
  let fieldsSql = '*';
  try {
    if (fields.length) {
      fieldsSql = fields.join(',');
    }

    const user = await query(
      `SELECT ${fieldsSql}
       FROM ${table}
       WHERE token = ?
       LIMIT 1`,
      // @ts-ignore
      [token]
    );

    if (! user.length) {
      return null;
    }

    return user[0];
  } catch (err) {
    logger.error('Error during find user by token [repository operation]', {
      token,
      fields,
      err
    });
    return null;
  }
};

export const updateUser = async (data: {}, conditions: {}) => {
  try {
    let params        = [];
    let setSql        = '';
    let conditionsSql = '';

    for (const item in data) {
      setSql += `${item} = ?,`
      // @ts-ignore
      params.push(data[item]);
    }

    for (const condition in conditions) {
      conditionsSql += `${condition} = ?,`
      // @ts-ignore
      params.push(conditions[condition]);
    }

    await query(
      `UPDATE ${table}
       SET ${setSql.slice(0, -1)}
       WHERE ${conditionsSql.slice(0, -1)}`,
      // @ts-ignore
      params
    );

  } catch (err) {
    logger.error('Error during update user [repository operation]', {
      data,
      conditions,
      err
    });
  }
};
