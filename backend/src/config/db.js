const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,            // Allow up to 10 parallel DB connections
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is unreachable (5s)
      socketTimeoutMS: 45000,     // Close idle sockets after 45s
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;