import crypto from "node:crypto";
import database from "infra/database.js";

export const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newSession = await runInsertQuery(token, userId, expiresAt);

  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `INSERT INTO
          sys_sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, $3)
        RETURNING *;
        `,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function refreshSession(token) {
  const newExpiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const updatedSession = await runUpdateQuery(token, newExpiresAt);

  return updatedSession;

  async function runUpdateQuery(token, newExpiresAt) {
    const results = await database.query({
      text: `UPDATE
          sys_sessions
        SET
          expires_at = $1,
          updated_at = NOW()
        WHERE
          token = $2
        RETURNING *;
        `,
      values: [newExpiresAt, token],
    });

    return results.rows[0];
  }
}

async function findValidSessionByUserId(user_id) {
  const hasValidSession = await runSelectQuery(user_id);
  return hasValidSession;

  async function runSelectQuery(user_id) {
    const results = await database.query({
      text: `SELECT
        id, token, user_id, expires_at, created_at, updated_at
      FROM
        sys_sessions
      WHERE
        user_id = $1
        AND expires_at > NOW()
    ;
      `,
      values: [user_id],
    });
    return results.rows[0];
  }
}

const session = {
  create,
  refreshSession,
  findValidSessionByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
