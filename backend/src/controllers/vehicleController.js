const vehicleService = require("../services/vehicleService");

// ── Private Helper ─────────────────────────────────────────────────────────────

/**
 * Handles controller error responses consistently.
 */
function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({ error: error.message });
}

// ── Route Handlers ─────────────────────────────────────────────────────────────

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body, req.user.id);
    return res.status(201).json({
      message: "Vehicle created successfully",
      vehicle
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    return res.status(200).json({ vehicles });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    return res.status(200).json({
      message: "Vehicle deleted successfully"
    });
  } catch (error) {
    return handleError(res, error);
  }
};
