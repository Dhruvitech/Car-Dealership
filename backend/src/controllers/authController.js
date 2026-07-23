const authService = require("../services/authService");

// ── Private Helper ─────────────────────────────────────────────────────────────

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ error: error.message });
}

// ── Route Handlers ─────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const { token, user } = await authService.registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully", token, user });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return handleError(res, error);
  }
};
