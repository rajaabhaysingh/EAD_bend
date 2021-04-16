const mongoose = require("mongoose");

// defining application Schema
const applicationSchema = mongoose.Schema(
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
    priority: {
      type: String,
      required: true,
      enum: [
        "normal",
        "low corporate",
        "mid corporate",
        "high corporate",
        "normal prime",
        "corporate prime",
      ],
      default: "normal",
    },
    status: {
      type: String,
      required: true,
      enum: ["applied", "accepted", "rejected", "unknown"],
      default: "applied",
    },
    coverLetter: [
      {
        file: {
          type: String,
        },
      },
    ],
    availableFrom: {
      type: Date,
      required: true,
    },
    availableTill: {
      type: Date,
    },
    permanentlyAvailable: {
      type: Boolean,
      default: false,
      required: true,
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
