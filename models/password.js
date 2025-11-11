import bcryptjs from "bcryptjs";

const SALT_ROUNDS = getNumberOfRounds();

async function hash(password) {
  const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(plainPassword, hashedPassword) {
  const isMatch = await bcryptjs.compare(plainPassword, hashedPassword);
  return isMatch;
}

const password = {
  hash,
  compare,
};

export default password;
