const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email
    },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
}

function verifyUserToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signUserToken,
  verifyUserToken
};
