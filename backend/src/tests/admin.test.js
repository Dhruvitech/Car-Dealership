/**
 * Integration tests — Admin Authorization Middleware
 *
 * Strategy: a fresh Express app is created per test with a controlled req.user,
 * simulating what authMiddleware would have already set upstream.
 * This isolates adminMiddleware from JWT verification entirely.
 */

const request = require("supertest");
const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");

// ── Test App Factory ───────────────────────────────────────────────────────────
// Injects a controlled req.user value before adminMiddleware runs.
// A fresh app per test prevents state bleed between cases.

function createTestApp(simulatedUser) {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.user = simulatedUser;
    next();
  });

  app.get("/api/admin", adminMiddleware, (_req, res) =>
    res.status(200).json({ message: "Admin access granted" })
  );

  return app;
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Admin Authorization Middleware", () => {
  it("should return 403 if req.user is not set (no auth middleware ran)", async () => {
    const res = await request(createTestApp(undefined)).get("/api/admin");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/forbidden|not authorized|admin/i);
  });

  it("should return 403 if the authenticated user has role 'user'", async () => {
    const res = await request(
      createTestApp({ id: "user_123", role: "user" })
    ).get("/api/admin");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/forbidden|not authorized|admin/i);
  });

  it("should call next() and allow access if the user has role 'admin'", async () => {
    const res = await request(
      createTestApp({ id: "admin_456", role: "admin" })
    ).get("/api/admin");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Admin access granted");
  });
});
