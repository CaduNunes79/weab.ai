import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

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

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          sys_user_activation_tokens
        WHERE
          user_id = $1
        ORDER BY
          created_at DESC
        LIMIT 1;`,
      values: [userId],
    });

    return results.rows[0];
  }
}

const activation = {
  sendEmailToUser,
  createActivationToken,
  findOneByUserId,
};

export default activation;
