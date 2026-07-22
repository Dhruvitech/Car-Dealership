const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Mock User model to isolate unit/integration testing without requiring a live MongoDB connection
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

      // Verify User.create was called with hashed password
      expect(User.create).toHaveBeenCalledTimes(1);
      const createdArg = User.create.mock.calls[0][0];
      expect(createdArg.password).not.toBe(payload.password);
      
      const isPasswordHashed = await bcrypt.compare(payload.password, createdArg.password);
      expect(isPasswordHashed).toBe(true);
    });
  });
});
