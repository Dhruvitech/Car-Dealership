const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json({
      message: "User registered successfully",
      user
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
};
