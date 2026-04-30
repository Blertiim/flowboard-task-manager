const User = require("../models/User");
const { verifyUserToken } = require("../utils/auth");

async function requireAuth(request, response, next) {
  try {
    const header = request.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return response.status(401).json({ message: "Authentication is required." });
    }

    const token = header.slice("Bearer ".length).trim();

    if (!token) {
      return response.status(401).json({ message: "Authentication token is missing." });
    }

    const payload = verifyUserToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return response.status(401).json({ message: "User session is no longer valid." });
    }

    request.user = user;
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Authentication failed." });
  }
}

module.exports = { requireAuth };
