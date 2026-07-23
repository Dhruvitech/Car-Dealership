const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  async registerUser({ name, email, password, role }) {
    // 1. Validate required fields
    if (!name) {
      const error = new Error("Name is required");
      error.statusCode = 400;
      throw error;
    }
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    if (!password) {
      const error = new Error("Password is required");
      error.statusCode = 400;
      throw error;
    }

    // 2. Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email is already registered");
      error.statusCode = 400;
      throw error;
    }

    // 3. Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Save user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    // 5. Return sanitized user object (without password)
    const userObject = newUser.toObject ? newUser.toObject() : { ...newUser };
    delete userObject.password;

    return userObject;
  }

  async loginUser({ email, password }) {
    // 1. Validate required fields
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    if (!password) {
      const error = new Error("Password is required");
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify email — find user in DB
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // 3. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // 4. Generate JWT
    const secret = process.env.JWT_SECRET || "mySuperSecretKey123";
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: "1d" }
    );

    // 5. Sanitize user — remove password before returning
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;

    return { token, user: userObject };
  }
}

module.exports = new AuthService();
