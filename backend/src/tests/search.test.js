/**
 * STAGE 1 — FAILING TESTS ONLY
 * Vehicle Search Endpoint (GET /api/vehicles/search)
 *
 * WHY EVERY TEST FAILS RIGHT NOW:
 *   1. vehicleRoutes.js has no GET /search route defined
 *   2. vehicleController.js has no searchVehicles handler
 *   3. vehicleService.js has no searchVehicles method to construct query filters
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock Vehicle model before requiring app
jest.mock("../models/Vehicle", () => ({
  find: jest.fn()
}));

const app = require("../app");
const Vehicle = require("../models/Vehicle");

const JWT_SECRET = process.env.JWT_SECRET || "mySuperSecretKey123";
const userToken = jwt.sign({ id: "user_id_123", role: "user" }, JWT_SECRET, { expiresIn: "1d" });

describe("GET /api/vehicles/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization token is provided", async () => {
    const res = await request(app).get("/api/vehicles/search?make=Toyota");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should search vehicles by make, model, and category", async () => {
    const mockResults = [
      { _id: "veh_1", make: "Toyota", model: "Camry", category: "Sedan", price: 25000, color: "Silver" }
    ];

    Vehicle.find.mockResolvedValue(mockResults);

    const res = await request(app)
      .get("/api/vehicles/search?make=Toyota&model=Camry&category=Sedan")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("vehicles");
    expect(res.body.vehicles.length).toBe(1);
    expect(res.body.vehicles[0].make).toBe("Toyota");
  });

  it("should search vehicles by price range (minPrice and maxPrice)", async () => {
    const mockResults = [
      { _id: "veh_1", make: "Honda", model: "Civic", price: 22000 }
    ];

    Vehicle.find.mockResolvedValue(mockResults);

    const res = await request(app)
      .get("/api/vehicles/search?minPrice=20000&maxPrice=30000")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("vehicles");
    expect(res.body.vehicles.length).toBe(1);
    expect(res.body.vehicles[0].price).toBe(22000);
  });

  it("should return 200 with an empty array if no vehicles match the search criteria", async () => {
    Vehicle.find.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/vehicles/search?make=NonExistentMake")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("vehicles");
    expect(res.body.vehicles).toEqual([]);
  });
});
