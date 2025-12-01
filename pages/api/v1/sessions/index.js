import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  let newSession;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password_hash,
  );

  newSession = await session.findValidSessionByUserId(authenticatedUser.id);

  if (newSession === undefined) {
    newSession = await session.create(authenticatedUser.id);
  } else {
    // Refresh session expiration
  }

  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}
