import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

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

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findValidSessionByToken(sessionToken);
  const expiredSession = await session.expiredById(sessionObject.id);

  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}
