/**
 * STAGE 1 — FAILING TESTS ONLY
 * JWT Authentication Middleware
 *
 * WHY EVERY TEST FAILS RIGHT NOW:
 *   require("../middleware/authMiddleware") throws:
 *   → Error: Cannot find module '../middleware/authMiddleware'
 *   This causes the entire test suite to fail before even one test runs.
 *
 * WHAT NEEDS TO EXIST FOR TESTS TO PASS (Stage 2):
 *   src/middleware/authMiddleware.js — an Express middleware function that:
 *   1. Reads the Authorization header
 *   2. Rejects missing token  → 401
 *   3. Rejects invalid token  → 401
 *   4. Rejects expired token  → 401
 *   5. Verifies valid token   → calls next(), attaches decoded user to req.user
 */

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// ── This require FAILS right now — authMiddleware.js does not exist yet ────────
const authMiddleware = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";

// ── Mini Express app used ONLY for middleware testing ─────────────────────────
// A real protected route that uses the middleware.
// Isolates the middleware tests from the auth routes.
const testApp = express();
testApp.use(express.json());

testApp.get("/api/protected", authMiddleware, (req, res) => {
  // If middleware passes, req.user must be populated with decoded token payload
  return res.status(200).json({ message: "Access granted", user: req.user });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("JWT Authentication Middleware", () => {
  // ── TEST 1 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes before this test even runs.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware calls next() with no checks.
  //   res.statusCode is 200, not 401.
  //   expect(401) → FAIL
  it("should return 401 if no Authorization header is provided", async () => {
    const res = await request(testApp).get("/api/protected");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/no token|token required|authorization/i);
  });

  // ── TEST 2 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware ignores header and calls next().
  //   res.statusCode is 200, not 401.
  //   expect(401) → FAIL
  it("should return 401 if the Authorization header is not in Bearer format", async () => {
    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", "invalidtokenwithnobearer");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/no token|token required|authorization/i);
  });

  // ── TEST 3 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware calls next() without verifying the signature.
  //   res.statusCode is 200, not 401.
  //   expect(401) → FAIL
  it("should return 401 if the token has an invalid signature", async () => {
    const fakeToken = jwt.sign(
      { id: "user_123", role: "user" },
      "WRONG_SECRET_KEY",  // signed with wrong key — verification must reject it
      { expiresIn: "1d" }
    );

    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/invalid token|unauthorized/i);
  });

  // ── TEST 4 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware calls next() without checking token expiry.
  //   res.statusCode is 200, not 401.
  //   expect(401) → FAIL
  it("should return 401 if the token is expired", async () => {
    const expiredToken = jwt.sign(
      { id: "user_123", role: "user" },
      JWT_SECRET,
      { expiresIn: "0s" }  // expires immediately
    );

    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/invalid token|unauthorized|expired/i);
  });

  // ── TEST 5 ──────────────────────────────────────────────────────────────────
  // Why it fails NOW:
  //   Module not found → suite crashes.
  //
  // Why it WOULD fail if module existed with no logic:
  //   Middleware calls next() but never sets req.user.
  //   res.body.user is undefined or null.
  //   expect(res.body.user.id) → FAIL
  it("should call next() and attach decoded user to req.user on a valid token", async () => {
    const validToken = jwt.sign(
      { id: "user_abc", role: "admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Access granted");

    // req.user must be populated with the decoded JWT payload
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id", "user_abc");
    expect(res.body.user).toHaveProperty("role", "admin");
  });
});
