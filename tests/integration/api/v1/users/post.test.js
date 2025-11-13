import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
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

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "cadununes1979",
        email: "nunes.cadu1979@gmail.com",
        password_hash: responseBody.password_hash,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("cadununes1979");
      const correctPasswordMatch = await password.compare(
        "hashed_password",
        userInDatabase.password_hash,
      );

      const inCorrectPasswordMatch = await password.compare(
        "hashed_password123",
        userInDatabase.password_hash,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(inCorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usuario_duplicado1",
          email: "duplicado@gmail.com",
          password_hash: "hashed_password",
        }),
      });
      //console.log("Response: ", response);

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usuario_duplicado2",
          email: "Duplicado@gmail.com",
          password_hash: "hashed_password",
        }),
      });
      //console.log("Response: ", response);

      expect(response2.status).toBe(400);

      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email address already in use.",
        action: "Use a different email address for this operation.",
        statusCode: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usuario_duplicado",
          email: "usernameduplicado1@gmail.com",
          password_hash: "hashed_password",
        }),
      });
      //console.log("Response: ", response);

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Usuario_duplicado",
          email: "usernameduplicado2@gmail.com",
          password_hash: "hashed_password",
        }),
      });
      //console.log("Response: ", response);

      expect(response2.status).toBe(400);

      const responseBody = await response2.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username already in use.",
        action: "Use a different username for this operation.",
        statusCode: 400,
      });
    });
  });
});
