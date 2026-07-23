const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock User model so tests run without a live MongoDB connection
jest.mock("../models/User");


describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    it("should return status 400 if name is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/name/i);
    });

    it("should return status 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", password: "password123" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/email/i);
    });

    it("should return status 400 if password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test User", email: "test@example.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/password/i);
    });
  });

  describe("Duplicate Check", () => {
    it("should return status 400 if email is already registered", async () => {
      User.findOne.mockResolvedValue({ _id: "existing_id", email: "test@example.com" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/already registered|already exists/i);
      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    });
  });

  describe("Successful Registration", () => {
    it("should hash password, save user, and return 201 Created", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockImplementation(async (userData) => ({
        _id: "user_id_123",
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const payload = {
        name: "John Doe",
        email: "john@example.com",
        password: "securePassword123"
      };

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "john@example.com");
      expect(res.body.user).not.toHaveProperty("password");

      expect(User.create).toHaveBeenCalledTimes(1);
      const createdArg = User.create.mock.calls[0][0];
      expect(createdArg.password).not.toBe(payload.password);

      const isPasswordHashed = await bcrypt.compare(payload.password, createdArg.password);
      expect(isPasswordHashed).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────
//  STAGE 1 — FAILING TESTS ONLY
//     POST /api/auth/login
//
//     These tests are written BEFORE any implementation.
//     They will FAIL because:
//       - authRoutes.js has no POST /login route
//       - authController.js has no login() handler
//       - authService.js has no loginUser() method
//     Running these right now will produce:
//       → 404 Not Found on every request
//       → All expect() assertions will fail
// ─────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── TEST 1 ─────────────────────────────────────────────────
  // Why it fails:
  //   POST /api/auth/login does not exist yet.
  //   Express returns 404. res.statusCode is 404, not 400.
  //   expect(400) → FAIL
  describe("Validation", () => {
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "secret123" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/email/i);
    });

    // ── TEST 2 ───────────────────────────────────────────────
    // Why it fails:
    //   Same reason — route does not exist.
    //   res.statusCode is 404, not 400.
    //   expect(400) → FAIL
    it("should return 400 if password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "john@example.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/password/i);
    });
  });

  describe("Email Verification", () => {
    // ── TEST 3 ───────────────────────────────────────────────
    // Why it fails:
    //   Route does not exist → 404.
    //   Even if it did, there is no service logic to call
    //   User.findOne and return 401 for a missing user.
    //   expect(401) → FAIL
    it("should return 401 if email is not registered", async () => {
      User.findOne.mockResolvedValue(null); // simulate: no user found in DB

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "ghost@example.com", password: "secret123" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/invalid email or password/i);
    });
  });

  describe("Password Comparison", () => {
    // ── TEST 4 ───────────────────────────────────────────────
    // Why it fails:
    //   Route does not exist → 404.
    //   Even if it did, there is no bcrypt.compare() call
    //   in any service to compare passwords.
    //   expect(401) → FAIL
    it("should return 401 if password is incorrect", async () => {
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      User.findOne.mockResolvedValue({
        _id: "user_abc",
        email: "john@example.com",
        password: hashedPassword,
        role: "user",
        toObject: function () { return { ...this }; }
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "john@example.com", password: "wrongPassword" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/invalid email or password/i);
    });
  });

  describe("Successful Login & JWT Generation", () => {
    // ── TEST 5 ───────────────────────────────────────────────
    // Why it fails:
    //   Route does not exist → 404.
    //   Even if route existed, there is no jwt.sign() call
    //   anywhere in the codebase yet.
    //   expect(200) → FAIL
    //   expect(res.body.token) → FAIL (token is undefined)
    //   expect(res.body.user) → FAIL (user is undefined)
    //   jwt.verify() → FAIL (no token to verify)
    it("should return 200 with a JWT token and sanitized user on valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("correctPassword", 10);
      const mockUser = {
        _id: "user_abc",
        name: "John Doe",
        email: "john@example.com",
        password: hashedPassword,
        role: "user",
        toObject: function () {
          const copy = { ...this };
          delete copy.toObject;
          return copy;
        }
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "john@example.com", password: "correctPassword" });

      // 1. HTTP status must be 200 OK
      expect(res.statusCode).toBe(200);

      // 2. Response must have a message
      expect(res.body).toHaveProperty("message", "Login successful");

      // 3. Response must include a JWT token string
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");

      // 4. Response must include user info
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("john@example.com");

      // 5. Password must NOT appear in the response (security)
      expect(res.body.user).not.toHaveProperty("password");

      // 6. JWT payload must contain id and role
      const secret = process.env.JWT_SECRET || "mySuperSecretKey123";
      const decoded = jwt.verify(res.body.token, secret);
      expect(decoded).toHaveProperty("id", "user_abc");
      expect(decoded).toHaveProperty("role", "user");
    });
  });
});
