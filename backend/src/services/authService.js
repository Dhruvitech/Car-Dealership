const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";
const JWT_EXPIRES_IN = "1d";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// ── Private Helpers ────────────────────────────────────────────────────────────

/**
 * Creates and throws an error with an HTTP status code attached.
 * Eliminates the 3-line throw pattern repeated throughout the service.
 */
function throwError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

/**
 * Returns a plain user object with the password field removed.
 * Prevents leaking hashed passwords in API responses.
 */
function sanitize(user) {
  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.password;
  return plain;
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

    // 6. Persist user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    // 7. Return sanitized user (no password)
    return sanitize(newUser);
  }

  async loginUser({ email, password }) {
    // 1. Validate required fields
    if (!email)    throwError("Email is required", 400);
    if (!password) throwError("Password is required", 400);

    // 2. Verify email exists in DB
    const user = await User.findOne({ email });
    if (!user) throwError("Invalid email or password", 401);

    // 3. Compare submitted password against stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throwError("Invalid email or password", 401);

    // 4. Sign JWT with user identity and role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Return token and sanitized user (no password)
    return { token, user: sanitize(user) };
  }
}

module.exports = new AuthService();
