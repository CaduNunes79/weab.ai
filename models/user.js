import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const existingUser = await runSelectQuery(username);
  return existingUser;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
          ;`,
      values: [username],
    });

    //console.log("Valid Unique Email: ", result.rows[0]);
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "User not found.",
        action: "Check the provided data for errors.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const result = await database.query({
      text: `SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1);`,
      values: [email],
    });

    //console.log("Valid Unique Email: ", result.rows[0]);
    if (result.rowCount > 0) {
      throw new ValidationError({
        message: "Email already in use.",
        action: "Use a different email address.",
      });
    }
    return result.rows[0];
  }

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1);`,
      values: [username],
    });

    //console.log("Valid Unique Email: ", result.rows[0]);
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "Username already in use.",
        action: "Use a different username.",
      });
    }
    return results.rows[0];
  }

  async function hashPasswordInObject(userInputValues) {
    const hashadPassword = await password.hash(userInputValues.password_hash);
    userInputValues.password_hash = hashadPassword;
  }

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO
        users
        (username, email, password_hash)
      VALUES
        ($1, $2, $3)
        RETURNING *;
        `,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password_hash,
      ],
    });

    //console.log("Created User: ", result.rows[0]);
    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
