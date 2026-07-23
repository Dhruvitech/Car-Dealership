const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";
const JWT_EXPIRES_IN = "1d";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// ── Private Helpers ────────────────────────────────────────────────────────────

function throwError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function sanitize(user) {
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.password;
  return plain;
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── Service Class ──────────────────────────────────────────────────────────────

class AuthService {
  async registerUser({ name, email, password, role }) {
    // 1. Validate required fields
    if (!name)     throwError("Name is required", 400);
    if (!email)    throwError("Email is required", 400);
    if (!password) throwError("Password is required", 400);

    // 2. Validate email format
    if (!EMAIL_REGEX.test(email)) throwError("Please provide a valid email address", 400);

    // 3. Validate password length
    if (password.length < MIN_PASSWORD_LENGTH) {
      throwError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }

    // 4. Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) throwError("Email is already registered", 400);

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 6. Persist user with specified role ("user" or "admin")
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    const sanitizedUser = sanitize(newUser);
    const token = generateToken(newUser);

    // 7. Return token & sanitized user
    return { token, user: sanitizedUser };
  }

  async loginUser({ email, password }) {
    if (!email)    throwError("Email is required", 400);
    if (!password) throwError("Password is required", 400);

    const user = await User.findOne({ email });
    if (!user) throwError("Invalid email or password", 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throwError("Invalid email or password", 401);

    const token = generateToken(user);

    return { token, user: sanitize(user) };
  }
}

module.exports = new AuthService();
