const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";

function authMiddleware(req, res, next) {
  // 1. Read Authorization header
  const authHeader = req.headers["authorization"];

  // 2. Reject if header is missing or not in "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided. Authorization denied." });
  }

  // 3. Extract token string after "Bearer "
  const token = authHeader.split(" ")[1];

  // 4. Verify token — rejects invalid signature AND expired tokens
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 5. Attach decoded payload to req.user so downstream handlers can use it
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token. Authorization denied." });
  }
}

module.exports = authMiddleware;
