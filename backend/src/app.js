const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

const app = express();

app.use(cors()); // Allow Cross-Origin Resource Sharing for frontend
app.use(express.json()); // Express JSON middleware

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

app.get("/", (req, res) => {
  res.send("Car Dealership API is running...");
});

module.exports = app;