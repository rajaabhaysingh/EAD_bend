const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 50,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    pinCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    locality: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 100,
    },
    addressLine: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 100,
      index: true,
    },
    cityDistrictTown: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
    landmark: {
      type: String,
      min: 10,
      max: 100,
    },
    lat: {
      type: String,
      index: true,
    },
    long: {
      type: String,
      index: true,
    },
    alternatePhone: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
