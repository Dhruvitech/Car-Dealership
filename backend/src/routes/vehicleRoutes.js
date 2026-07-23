const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All vehicle routes require authentication
router.use(authMiddleware);

router.post("/", vehicleController.createVehicle);
router.get("/", vehicleController.getAllVehicles);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", adminMiddleware, vehicleController.deleteVehicle);

module.exports = router;
