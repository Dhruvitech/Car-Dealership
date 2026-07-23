/**
 * Integration tests — JWT Authentication Middleware
 *
 * Strategy: spin up a minimal Express app with one protected route so the
 * middleware can be tested in isolation — independently of any auth route.
 */

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";

// ── Test App Setup ─────────────────────────────────────────────────────────────
// A dedicated mini-app so middleware tests never depend on production routes.

const testApp = express();
testApp.use(express.json());

testApp.get("/api/protected", authMiddleware, (req, res) =>
  res.status(200).json({ message: "Access granted", user: req.user })
);

// ── Token Factories ────────────────────────────────────────────────────────────
// Centralise token creation so test cases stay focused on behaviour.

const makeValidToken = (payload = { id: "user_abc", role: "admin" }) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

const makeExpiredToken = () =>
  jwt.sign({ id: "user_123", role: "user" }, JWT_SECRET, { expiresIn: "0s" });

const makeTamperedToken = () =>
  jwt.sign({ id: "user_123", role: "user" }, "WRONG_SECRET_KEY", { expiresIn: "1d" });

// ─────────────────────────────────────────────────────────────────────────────

describe("JWT Authentication Middleware", () => {
  it("should return 401 if no Authorization header is provided", async () => {
    const res = await request(testApp).get("/api/protected");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/no token|token required|authorization/i);
  });

  it("should return 401 if the Authorization header is not in Bearer format", async () => {
    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", "invalidtokenwithnobearer");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/no token|token required|authorization/i);
  });

  it("should return 401 if the token has an invalid signature", async () => {
    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", `Bearer ${makeTamperedToken()}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/invalid token|unauthorized/i);
  });

  it("should return 401 if the token is expired", async () => {
    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", `Bearer ${makeExpiredToken()}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/invalid token|unauthorized|expired/i);
  });

  it("should call next() and attach decoded user to req.user on a valid token", async () => {
    const res = await request(testApp)
      .get("/api/protected")
      .set("Authorization", `Bearer ${makeValidToken()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Access granted");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id", "user_abc");
    expect(res.body.user).toHaveProperty("role", "admin");
  });
});
