function getOrigin() {
  if (["development", "test"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3000";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `http://${process.env.VERCEL_ENV}`;
  }

  return "https://weabai.com.br";
}

const webserver = {
  origin: getOrigin(),
};

export default webserver;
