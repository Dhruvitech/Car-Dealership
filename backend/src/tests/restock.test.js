/**
 * Integration tests — Vehicle Restock Endpoint
 * POST /api/vehicles/:id/restock  (admin only)
 *
 * Strategy: mock Vehicle.findById with a factory-built object that carries
 * a jest.fn() save(), so quantity mutation is directly observable.
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../models/Vehicle", () => ({
  findById: jest.fn()
}));

const app = require("../app");
const Vehicle = require("../models/Vehicle");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";

const userToken  = jwt.sign({ id: "user_id_123",  role: "user"  }, JWT_SECRET, { expiresIn: "1d" });
const adminToken = jwt.sign({ id: "admin_id_456", role: "admin" }, JWT_SECRET, { expiresIn: "1d" });

// ── Vehicle Factory ────────────────────────────────────────────────────────────

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

describe("POST /api/vehicles/:id/restock", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization token is provided", async () => {
    const res = await request(app)
      .post("/api/vehicles/veh_123/restock")
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 403 if the user is NOT an admin", async () => {
    const res = await request(app)
      .post("/api/vehicles/veh_123/restock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/forbidden|admin/i);
  });

  it("should return 404 if vehicle is not found", async () => {
    Vehicle.findById.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/vehicles/non_existent_id/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Vehicle not found");
  });

  it("should return 400 if restock quantity is missing", async () => {
    Vehicle.findById.mockResolvedValue(makeVehicle(5));

    const res = await request(app)
      .post("/api/vehicles/veh_123/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({}); // no quantity

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if restock quantity is less than or equal to zero", async () => {
    Vehicle.findById.mockResolvedValue(makeVehicle(5));

    const res = await request(app)
      .post("/api/vehicles/veh_123/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should increase quantity, save, and return updated vehicle on valid admin restock", async () => {
    const mockVehicle = makeVehicle(5);
    Vehicle.findById.mockResolvedValue(mockVehicle);

    const res = await request(app)
      .post("/api/vehicles/veh_123/restock")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Vehicle restocked successfully");
    expect(res.body).toHaveProperty("vehicle");
    expect(mockVehicle.quantity).toBe(15);
    expect(mockVehicle.save).toHaveBeenCalledTimes(1);
  });
});
