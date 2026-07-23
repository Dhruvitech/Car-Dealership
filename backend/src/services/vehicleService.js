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

/**
 * Builds a dynamic MongoDB query object from search query parameters.
 */
function buildSearchQuery(filters = {}) {
  const query = {};

  const stringFields = ["make", "model", "category"];
  stringFields.forEach((field) => {
    if (filters[field] && typeof filters[field] === "string" && filters[field].trim()) {
      query[field] = { $regex: filters[field].trim(), $options: "i" };
    }
  });

  const minPrice = parseFloat(filters.minPrice);
  const maxPrice = parseFloat(filters.maxPrice);

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    query.price = {};
    if (!isNaN(minPrice)) query.price.$gte = minPrice;
    if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
  }

  return query;
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
   * Searches vehicles by make, model, category, and price range using query filters.
   */
  async searchVehicles(filters = {}) {
    const query = buildSearchQuery(filters);
    return await Vehicle.find(query);
  }
}

module.exports = new VehicleService();
