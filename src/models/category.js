const mongoose = require("mongoose");

// defining application Schema
const categorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    categoryImage: { type: String },
    parentId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
