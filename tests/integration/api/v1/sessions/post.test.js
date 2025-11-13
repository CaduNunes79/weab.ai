import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password_hash: "correct_password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrong_email@gmail.com",
          password_hash: "correct_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Authentication data does not match our records.",
        action: "Provide valid credentials to log in.",
        statusCode: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "correct_email@gmai.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct_email@gmail.com",
          password_hash: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Authentication data does not match our records.",
        action: "Provide valid credentials to log in.",
        statusCode: 401,
      });
    });

    test("With incorrect `email` but incorrect `password`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect_email@gmail.com",
          password_hash: "incorrect_password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Authentication data does not match our records.",
        action: "Provide valid credentials to log in.",
        statusCode: 401,
      });
    });
  });
});
