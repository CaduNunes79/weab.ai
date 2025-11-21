import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  let storedUser;

  try {
    storedUser = await user.findUserByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Authentication data does not match our records.",
        action: "Provide valid credentials to log in.",
      });
    }
  }

  const passwordMatch = await password.compare(
    providedPassword,
    storedUser.password_hash,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError({
      message: "Password don't match",
      action: "Provide valid credentials to log in.",
    });
  }

  return storedUser;
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
