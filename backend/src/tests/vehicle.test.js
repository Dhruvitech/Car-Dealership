/**
 * STAGE 1 — FAILING TESTS ONLY
 * Vehicle CRUD Endpoints
 *
 * WHY EVERY TEST FAILS RIGHT NOW:
 *   1. vehicleRoutes.js is not mounted at /api/vehicles in app.js
 *   2. vehicleController.js does not exist
 *   3. vehicleService.js does not exist
 *
 * WHAT NEEDS TO EXIST FOR TESTS TO PASS (Stage 2):
 *   - POST /api/vehicles (create vehicle, authenticated)
 *   - GET /api/vehicles (list vehicles, authenticated)
 *   - PUT /api/vehicles/:id (update vehicle, authenticated)
 *   - DELETE /api/vehicles/:id (delete vehicle, ADMIN ONLY)
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock Vehicle model before requiring app or model
jest.mock("../models/Vehicle", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

const app = require("../app");
const Vehicle = require("../models/Vehicle");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";

// Helper token generators
const userToken = jwt.sign({ id: "user_id_123", role: "user" }, JWT_SECRET, { expiresIn: "1d" });
const adminToken = jwt.sign({ id: "admin_id_456", role: "admin" }, JWT_SECRET, { expiresIn: "1d" });

describe("Vehicle CRUD Endpoints (/api/vehicles)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. POST /api/vehicles (Create Vehicle)
  // ─────────────────────────────────────────────────────────────
  describe("POST /api/vehicles", () => {
    it("should return 401 if no authorization token is provided", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .send({
          make: "Toyota",
          model: "Camry",
          category: "Sedan",
          price: 25000,
          quantity: 5,
          color: "Silver"
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          make: "Toyota"
          // Missing model, category, price, color
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should create a new vehicle and return 201 Created", async () => {
      const mockVehicle = {
        _id: "veh_123",
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 5,
        color: "Silver",
        createdBy: "user_id_123"
      };

      Vehicle.create.mockResolvedValue(mockVehicle);

      const res = await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          make: "Toyota",
          model: "Camry",
          category: "Sedan",
          price: 25000,
          quantity: 5,
          color: "Silver"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Vehicle created successfully");
      expect(res.body).toHaveProperty("vehicle");
      expect(res.body.vehicle.make).toBe("Toyota");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. GET /api/vehicles (Get All Vehicles)
  // ─────────────────────────────────────────────────────────────
  describe("GET /api/vehicles", () => {
    it("should return 401 if no authorization token is provided", async () => {
      const res = await request(app).get("/api/vehicles");

      expect(res.statusCode).toBe(401);
    });

    it("should return 200 with an array of vehicles", async () => {
      const mockVehicles = [
        { _id: "veh_1", make: "Honda", model: "Civic", category: "Sedan", price: 22000, quantity: 3, color: "Blue" },
        { _id: "veh_2", make: "Ford", model: "Mustang", category: "Sports", price: 45000, quantity: 1, color: "Red" }
      ];

      Vehicle.find.mockResolvedValue(mockVehicles);

      const res = await request(app)
        .get("/api/vehicles")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("vehicles");
      expect(Array.isArray(res.body.vehicles)).toBe(true);
      expect(res.body.vehicles.length).toBe(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. PUT /api/vehicles/:id (Update Vehicle)
  // ─────────────────────────────────────────────────────────────
  describe("PUT /api/vehicles/:id", () => {
    it("should return 401 if no authorization token is provided", async () => {
      const res = await request(app)
        .put("/api/vehicles/veh_123")
        .send({ price: 26000 });

      expect(res.statusCode).toBe(401);
    });

    it("should return 404 if vehicle to update is not found", async () => {
      Vehicle.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/vehicles/non_existent_id")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 26000 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Vehicle not found");
    });

    it("should update vehicle details and return 200 OK", async () => {
      const updatedVehicle = {
        _id: "veh_123",
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 26000,
        quantity: 5,
        color: "Silver"
      };

      Vehicle.findByIdAndUpdate.mockResolvedValue(updatedVehicle);

      const res = await request(app)
        .put("/api/vehicles/veh_123")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: 26000 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Vehicle updated successfully");
      expect(res.body.vehicle.price).toBe(26000);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. DELETE /api/vehicles/:id (Delete Vehicle - ADMIN ONLY)
  // ─────────────────────────────────────────────────────────────
  describe("DELETE /api/vehicles/:id", () => {
    it("should return 401 if no authorization token is provided", async () => {
      const res = await request(app).delete("/api/vehicles/veh_123");

      expect(res.statusCode).toBe(401);
    });

    it("should return 403 Forbidden if user is NOT an admin", async () => {
      const res = await request(app)
        .delete("/api/vehicles/veh_123")
        .set("Authorization", `Bearer ${userToken}`); // non-admin token

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(/forbidden|admin/i);
    });

    it("should return 404 if vehicle to delete is not found", async () => {
      Vehicle.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/vehicles/non_existent_id")
        .set("Authorization", `Bearer ${adminToken}`); // admin token

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Vehicle not found");
    });

    it("should delete vehicle and return 200 OK when requested by Admin", async () => {
      const deletedVehicle = { _id: "veh_123", make: "Toyota", model: "Camry" };
      Vehicle.findByIdAndDelete.mockResolvedValue(deletedVehicle);

      const res = await request(app)
        .delete("/api/vehicles/veh_123")
        .set("Authorization", `Bearer ${adminToken}`); // admin token

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Vehicle deleted successfully");
    });
  });
});
