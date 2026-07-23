const jwt = require("jsonwebtoken");

// ── Constants ──────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";

const ERROR_MESSAGES = {
  NO_TOKEN: "No token provided. Authorization denied.",
  INVALID_TOKEN: "Invalid token. Authorization denied."
};

// ── Private Helper ─────────────────────────────────────────────────────────────

/**
 * Sends a 401 Unauthorized response with a descriptive error message.
 * Centralises the error response format so it's consistent across all rejection paths.
 */
function sendUnauthorized(res, message) {
  return res.status(401).json({ error: message });
}

/**
 * Extracts the Bearer token from the Authorization header.
 * Returns null if the header is absent, malformed, or the token is empty.
 */
function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim(); // "Bearer " is 7 characters
  return token || null; // reject "Bearer " with nothing after it
}

// ── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Protects routes by validating the JWT in the Authorization header.
 * On success: populates req.user with the decoded payload and calls next().
 * On failure: responds with 401 Unauthorized.
 */
function authMiddleware(req, res, next) {
  const token = extractBearerToken(req.headers["authorization"]);

  if (!token) {
    return sendUnauthorized(res, ERROR_MESSAGES.NO_TOKEN);
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return sendUnauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
  }
}

module.exports = authMiddleware;
