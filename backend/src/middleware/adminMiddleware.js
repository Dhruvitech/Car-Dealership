// ── Constants ──────────────────────────────────────────────────────────────────
const ADMIN_ROLE = "admin";

const ERROR_MESSAGES = {
  FORBIDDEN: "Forbidden. Admin access only."
};

// ── Private Helpers ────────────────────────────────────────────────────────────

/**
 * Returns true only when the user object exists and holds the admin role.
 * Encapsulates the role-check so the middleware body stays declarative.
 */
function isAdmin(user) {
  return user != null && user.role === ADMIN_ROLE;
}

/**
 * Sends a 403 Forbidden response with a consistent error message.
 * Mirrors the sendUnauthorized() pattern used in authMiddleware.
 */
function sendForbidden(res) {
  return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN });
}

// ── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Restricts access to admin users only.
 * Must be mounted AFTER authMiddleware so req.user is already populated.
 * On success: calls next().
 * On failure: responds with 403 Forbidden.
 */
function adminMiddleware(req, res, next) {
  if (isAdmin(req.user)) return next();
  return sendForbidden(res);
}

module.exports = adminMiddleware;
