import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

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
        message: "Email already in use.",
        action: "Use a different email address.",
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
        action: "Use a different username.",
        statusCode: 400,
      });
    });
  });
});
