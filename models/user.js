import database from "infra/database.js";

async function create(userInputValues) {
  const result = await database.query({
    text: "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *;",
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password_hash,
    ],
  });

  console.log("Created User: ", result.rows[0]);
  return result.rows[0];
}

const user = {
  create,
};

export default user;
