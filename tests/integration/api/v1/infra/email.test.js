import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Test <sender@weabai.com>",
      to: "recipient@weabai.com",
      subject: "Send email test",
      text: "Hello world, this is a send mail test.",
    });

    await email.send({
      from: "Test <sender@weabai.com>",
      to: "recipient@weabai.com",
      subject: "Last sended email",
      text: "Hello world, body of last email sended.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<sender@weabai.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient@weabai.com>");
    expect(lastEmail.subject).toBe("Last sended email");
    expect(lastEmail.text).toBe("Hello world, body of last email sended.\n");
  });
});
