const mongoose = require("mongoose");

// defining review Schema
const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    review: {
      type: String,
      trim: true,
      required: true,
    },
    star: {
      type: Number,
      required: true,
    },
    inappropriateFlag: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
