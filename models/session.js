import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors";

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

async function refreshSession(sessionId) {
  const newExpiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const updatedSession = await runUpdateQuery(sessionId, newExpiresAt);

  return updatedSession;

  async function runUpdateQuery(sessionId, newExpiresAt) {
    const results = await database.query({
      text: `UPDATE
          sys_sessions
        SET
          expires_at = $2,
          updated_at = NOW()
        WHERE
          id = $1
        RETURNING *;
        `,
      values: [sessionId, newExpiresAt],
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

async function findValidSessionByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sys_sessions
        WHERE
          token = $1
          AND expires_at > NOW()
        LIMIT 1
        ;`,
      values: [sessionToken],
    });

    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Invalid session token.",
        action: "Please log in to continue.",
      });
    }

    return results.rows[0];
  }
}

async function expiredById(sessionId) {
  const expiredSessionObject = await runUpdateQuery(sessionId);

  return expiredSessionObject;

  async function runUpdateQuery(sessionId) {
    const results = await database.query({
      text: `UPDATE
         sys_sessions
       SET
         expires_at = expires_at - interval '1 year',
         updated_at = NOW()
       WHERE
         id = $1
       RETURNING *;
       `,
      values: [sessionId],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  refreshSession,
  findValidSessionByUserId,
  findValidSessionByToken,
  expiredById,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
