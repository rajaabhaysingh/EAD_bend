const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
  banner: {
    type: String,
    required: true,
  },
  visible_at: {
    type: Date,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "mid", "high"],
    default: "low",
  },
  type: {
    type: String,
    required: true,
    default: "General",
  },
  actionUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
