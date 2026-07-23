/**
 * Integration tests — Admin Authorization Middleware
 *
 * Strategy: mount two middlewares on a test route —
 *   1. A "user injector" middleware that sets req.user to a controlled value
 *   2. adminMiddleware under test
 * This isolates adminMiddleware from JWT verification entirely.
 *
 * WHY EVERY TEST FAILS RIGHT NOW:
 *   require("../middleware/adminMiddleware") throws:
 *   → Error: Cannot find module '../middleware/adminMiddleware'
 *   The entire suite crashes before a single test runs.
 *
 * WHAT NEEDS TO EXIST FOR TESTS TO PASS (Stage 2):
 *   src/middleware/adminMiddleware.js — Express middleware that:
 *   1. Checks req.user exists and req.user.role === "admin"
 *   2. Calls next() if condition is met
 *   3. Returns 403 Forbidden for any other case
 */

const request = require("supertest");
const express = require("express");

// ── This require FAILS right now — adminMiddleware.js does not exist yet ───────
const adminMiddleware = require("../middleware/adminMiddleware");

// ── Test App Factory ───────────────────────────────────────────────────────────
// Creates a fresh app for each test with a controlled req.user value.
// Avoids state bleed between test cases.

function createTestApp(simulatedUser) {
  const app = express();
  app.use(express.json());

  // Simulates what authMiddleware would have already done upstream
  app.use((req, _res, next) => {
    req.user = simulatedUser;
    next();
  });

  // Route protected by adminMiddleware
  app.get("/api/admin", adminMiddleware, (_req, res) =>
    res.status(200).json({ message: "Admin access granted" })
  );

  return app;
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Admin Authorization Middleware", () => {
  // ── TEST 1 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes before this test runs.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware calls next() unconditionally.
  //   res.statusCode is 200, not 403.
  //   expect(403) → FAIL
  it("should return 403 if req.user is not set (no auth middleware ran)", async () => {
    const app = createTestApp(undefined); // simulate missing req.user

    const res = await request(app).get("/api/admin");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/forbidden|not authorized|admin/i);
  });

  // ── TEST 2 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware ignores req.user.role and calls next().
  //   res.statusCode is 200, not 403.
  //   expect(403) → FAIL
  it("should return 403 if the authenticated user has role 'user'", async () => {
    const app = createTestApp({ id: "user_123", role: "user" });

    const res = await request(app).get("/api/admin");

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/forbidden|not authorized|admin/i);
  });

  // ── TEST 3 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware never calls next() or doesn't check role.
  //   res.statusCode is not 200 or req reaches handler unexpectedly.
  //   Either way the assertions about role-based access fail.
  it("should call next() and allow access if the user has role 'admin'", async () => {
    const app = createTestApp({ id: "admin_456", role: "admin" });

    const res = await request(app).get("/api/admin");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Admin access granted");
  });
});
