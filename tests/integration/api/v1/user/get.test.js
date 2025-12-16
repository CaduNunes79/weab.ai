import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import setCookieParser from "set-cookie-parser";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/users", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json({});

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        features: ["read:activation_token"],
        password_hash: createdUser.password_hash,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(createdUser.id)).toBe(4);
      expect(Date.parse(createdUser.created_at)).not.toBeNaN();
      expect(Date.parse(createdUser.updated_at)).not.toBeNaN();

      const RenewedSessionObject = await session.findValidSessionByToken(
        sessionObject.token,
      );

      expect(
        RenewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        RenewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentSessionToken =
        "2f5d99816dae4d07e3903f81cbe7e92734f74f0639944671b8b5becd1ecc6d56d126c16f6caaaf26226a3056a822f6dd";

      const response = await fetch("http://localhost:3000/api/v1/users", {
        headers: {
          Cookie: `session_id=${nonexistentSessionToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json({});

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid session token.",
        action: "Please log in to continue.",
        statusCode: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/users", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json({});

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid session token.",
        action: "Please log in to continue.",
        statusCode: 401,
      });
    });
  });
});
