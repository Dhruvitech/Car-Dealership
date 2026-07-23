/**
 * Integration tests — Vehicle Purchase Endpoint
 * POST /api/vehicles/:id/purchase
 *
 * Strategy: mock Vehicle.findById with controlled objects that include
 * a jest.fn() save() method, so the service layer can be tested
 * without a live MongoDB connection.
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../models/Vehicle", () => ({
  findById: jest.fn()
}));

const app = require("../app");
const Vehicle = require("../models/Vehicle");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";
const userToken = jwt.sign({ id: "user_id_123", role: "user" }, JWT_SECRET, { expiresIn: "1d" });

// ── Vehicle Factories ──────────────────────────────────────────────────────────

const makeVehicle = (quantity) => ({
  _id: "veh_123",
  make: "Toyota",
  model: "Camry",
  quantity,
  save: jest.fn().mockImplementation(function () {
    return Promise.resolve(this);
  })
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/vehicles/:id/purchase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization token is provided", async () => {
    const res = await request(app).post("/api/vehicles/veh_123/purchase");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 404 if vehicle is not found", async () => {
    Vehicle.findById.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/vehicles/non_existent_id/purchase")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Vehicle not found");
  });

  it("should return 400 and not call save() if vehicle is out of stock", async () => {
    const outOfStockVehicle = makeVehicle(0);
    Vehicle.findById.mockResolvedValue(outOfStockVehicle);

    const res = await request(app)
      .post("/api/vehicles/veh_123/purchase")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Vehicle is out of stock");
    expect(outOfStockVehicle.save).not.toHaveBeenCalled();
  });

  it("should decrease quantity by 1, save, and return updated vehicle on successful purchase", async () => {
    const mockVehicle = makeVehicle(3);
    Vehicle.findById.mockResolvedValue(mockVehicle);

    const res = await request(app)
      .post("/api/vehicles/veh_123/purchase")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Vehicle purchased successfully");
    expect(res.body).toHaveProperty("vehicle");
    expect(mockVehicle.quantity).toBe(2);
    expect(mockVehicle.save).toHaveBeenCalledTimes(1);
  });
});
