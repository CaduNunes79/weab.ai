import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { NotFoundError } from "infra/errors";
import user from "./user";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function createActivationToken(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;
}

async function runInsertQuery(userId, expiresAt) {
  const result = await database.query({
    text: `
      INSERT INTO
        sys_user_activation_tokens (user_id, expires_at)
      VALUES
        ($1, $2)
      RETURNING
        *;`,
    values: [userId, expiresAt],
  });

  return result.rows[0];
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "WeaB.ai <activation@weabai.com>",
    to: `${user.username} <${user.email}>`,
    subject: "Activation user account",
    text: `Hello ${user.username},\n\n
Please activate your account by clicking the link below:\n\n
${webserver.origin}/activation/${activationToken.id}\n\nThank you!\n`,
  });
}

async function findOneTokenValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);
  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sys_user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        ORDER BY
          created_at DESC
        LIMIT
          1
        ;`,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Activation token not found or is no longer valid.",
        action: "Provide a valid activation token.",
      });
    }

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          sys_user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
          AND used_at IS NULL
        RETURNING
          *;`,
      values: [activationTokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Activation token not found or already used.",
        action: "Provide a valid activation token.",
      });
    }

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, ["create:session"]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  createActivationToken,
  findOneTokenValidById,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
