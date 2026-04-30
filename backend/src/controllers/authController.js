const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ensureUserBoardSetup } = require("../utils/boardSetup");
const { signUserToken } = require("../utils/auth");

function normalizeAuthInput(payload = {}) {
  return {
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    email: typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "",
    password: typeof payload.password === "string" ? payload.password : ""
  };
}

function serializeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

async function register(request, response, next) {
  try {
    const input = normalizeAuthInput(request.body);

    if (!input.name) {
      return response.status(400).json({ message: "Name is required." });
    }

    if (!validateEmail(input.email)) {
      return response.status(400).json({ message: "A valid email is required." });
    }

    if (!validatePassword(input.password)) {
      return response.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: input.email });

    if (existingUser) {
      return response.status(400).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    await ensureUserBoardSetup(user._id);

    response.status(201).json({
      token: signUserToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function login(request, response, next) {
  try {
    const input = normalizeAuthInput(request.body);

    if (!validateEmail(input.email) || !input.password) {
      return response.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: input.email });

    if (!user) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    await ensureUserBoardSetup(user._id);

    response.json({
      token: signUserToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(request, response) {
  response.json({
    user: serializeUser(request.user)
  });
}

module.exports = {
  getCurrentUser,
  login,
  register
};
