const authService = require("../services/authService");

// ── Private Helper ─────────────────────────────────────────────────────────────

/**
 * Sends a JSON error response using the status code attached to the error,
 * defaulting to 500 for unexpected server errors.
 * Eliminates the duplicated catch block pattern across handlers.
 */
function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ error: error.message });
}

// ── Route Handlers ─────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully", user });
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
