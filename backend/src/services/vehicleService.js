const Vehicle = require("../models/Vehicle");

// ── Private Helpers ────────────────────────────────────────────────────────────

/**
 * Creates and throws an error with an HTTP status code attached.
 */
function throwError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

// ── Service Class ──────────────────────────────────────────────────────────────

class VehicleService {
  /**
   * Creates a new vehicle record in the database.
   */
  async createVehicle(vehicleData, userId) {
    const { make, model, category, price, quantity, color, images } = vehicleData;

    // Validate presence of required fields
    if (!make || !model || !category || price === undefined || !color) {
      throwError("Missing required vehicle fields", 400);
    }

    // Validate numerical boundaries
    if (typeof price !== "number" || price < 0) {
      throwError("Price must be a non-negative number", 400);
    }

    if (quantity !== undefined && (typeof quantity !== "number" || quantity < 0)) {
      throwError("Quantity must be a non-negative number", 400);
    }

    const vehicle = await Vehicle.create({
      make: make.trim(),
      model: model.trim(),
      category: category.trim(),
      price,
      quantity: quantity !== undefined ? quantity : 0,
      color: color.trim(),
      images: images || [],
      createdBy: userId
    });

    return vehicle;
  }

  /**
   * Fetches all vehicle records.
   */
  async getAllVehicles() {
    return await Vehicle.find({});
  }

  /**
   * Updates an existing vehicle by ID.
   */
  async updateVehicle(id, updateData) {
    const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!vehicle) {
      throwError("Vehicle not found", 404);
    }

    return vehicle;
  }

  /**
   * Deletes a vehicle by ID.
   */
  async deleteVehicle(id) {
    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      throwError("Vehicle not found", 404);
    }

    return vehicle;
  }

  /**
   * Searches vehicles by make, model, category, and price range.
   */
  async searchVehicles(filters = {}) {
    const query = {};

    if (filters.make) {
      query.make = { $regex: filters.make, $options: "i" };
    }
    if (filters.model) {
      query.model = { $regex: filters.model, $options: "i" };
    }
    if (filters.category) {
      query.category = { $regex: filters.category, $options: "i" };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = Number(filters.maxPrice);
      }
    }

    return await Vehicle.find(query);
  }
}

module.exports = new VehicleService();
