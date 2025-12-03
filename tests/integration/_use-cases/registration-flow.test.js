import activation from "models/activation";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successfull)", () => {
  let createUserResponseBody;
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationUserFlow",
          email: "registrationuser.flow@weabai.com",
          password_hash: "RegistrationUserFlowPassword",
        }),
      },
    );

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

    const activationToken = await activation.findOneByUserId(
      createUserResponseBody.id,
    );
    expect(lastEmail.sender).toBe("<activation@weabai.com>");
    expect(lastEmail.recipients[0]).toBe("<registrationuser.flow@weabai.com>");
    expect(lastEmail.subject).toBe("Activation user account");
    expect(lastEmail.text).toContain("RegistrationUserFlow");
    expect(lastEmail.text).toContain(activationToken.id);
  });

  test("Activation user account", async () => {});

  test("User login", async () => {});

  test("Get user information", async () => {});
});
