const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    price:{
      type: Number ,
      required: true,
      min:0
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    color:{
        type: String,
        required: true,
        trim: true
    },
    images: [
     {
        type: String
     }
    ],
    createdBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     required: true
    }
  },
  
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);