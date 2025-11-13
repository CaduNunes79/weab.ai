import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError } from "infra/errors.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  try {
    const userStored = await user.findOneByEmail(userInputValues.email);

    const passwordMatch = await password.compare(
      userInputValues.password_hash,
      userStored.password_hash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Passwprd don't match",
        action: "Provide valid credentials to log in.",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Authentication data does not match our records.",
      action: "Provide valid credentials to log in.",
    });
  }
  return response.status(201).json({});
}
