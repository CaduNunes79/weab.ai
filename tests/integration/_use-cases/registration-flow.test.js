import webserver from "infra/webserver";
import activation from "models/activation";
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successfull)", () => {
  let createUserResponseBody;
  let activationTokenId;

  test("Create user account", async () => {
    const createUserResponse = await fetch(`${webserver.origin}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationUserFlow",
        email: "registrationuser.flow@weabai.com",
        password_hash: "RegistrationUserFlowPassword",
      }),
    });

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationUserFlow",
      email: "registrationuser.flow@weabai.com",
      features: ["read:activation_token"],
      password_hash: createUserResponseBody.password_hash,
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<activation@weabai.com>");
    expect(lastEmail.recipients[0]).toBe("<registrationuser.flow@weabai.com>");
    expect(lastEmail.subject).toBe("Activation user account");
    expect(lastEmail.text).toContain("RegistrationUserFlow");

    activationTokenId = orchestrator.extractUUID(lastEmail.text);

    expect(lastEmail.text).toContain(
      `${webserver.origin}/activation/${activationTokenId}`,
    );

    const activationTokenObject =
      await activation.findOneTokenValidById(activationTokenId);

    expect(activationTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(activationTokenObject.used_at).toBe(null);
  });

  test("Activation user account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenId}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("RegistrationUserFlow");

    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("User login", async () => {
    const createSessionResponse = await fetch(
      `${webserver.origin}/api/v1/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registrationuser.flow@weabai.com",
          password_hash: "RegistrationUserFlowPassword",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);

    const createSessionResponseBody = await createSessionResponse.json();

    expect(createSessionResponseBody.user_id).toBe(createUserResponseBody.id);
  });

  test("Get user information", async () => {});
});
