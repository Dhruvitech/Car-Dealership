const express = require("express");

const app = express();

app.use(express.json()); // aExpress doesn't automatically parse JSON. so s Express converts the incoming JSON into a JavaScript object.

app.get("/", (req, res) => {
  res.send("Car Dealership API is running...");
});

module.exports = app;