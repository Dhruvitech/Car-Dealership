const Vehicle = require("../models/Vehicle");

class VehicleService {
  async createVehicle(vehicleData, userId) {
    const { make, model, category, price, quantity, color, images } = vehicleData;

    if (!make || !model || !category || price === undefined || !color) {
      const error = new Error("Missing required vehicle fields");
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity: quantity !== undefined ? quantity : 0,
      color,
      images: images || [],
      createdBy: userId
    });

    return vehicle;
  }

  async getAllVehicles() {
    const vehicles = await Vehicle.find({});
    return vehicles;
  }

  async updateVehicle(id, updateData) {
    const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  async deleteVehicle(id) {
    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }
}

module.exports = new VehicleService();
