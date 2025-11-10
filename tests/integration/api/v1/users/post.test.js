import { version as uuidVersion } from "uuid";
import database from "infra/database";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      await database.query({
        text: "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3);",
        values: ["existing_user", "contato@gmail.com", "hashed_password"],
      });

      //const users = await database.query("SELECT * FROM users;");
      //console.log("Rows: ", users.rows);

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "cadununes1979",
          email: "nunes.cadu1979@gmail.com",
          password_hash: "hashed_password",
        }),
      });
      //console.log("Response: ", response);

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      //console.log("Response Body: ", responseBody);

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "cadununes1979",
        email: "nunes.cadu1979@gmail.com",
        password_hash: "hashed_password",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
  });
});
