const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// defining user Schema
const adminSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 63,
    },
    middleName: {
      type: String,
      trim: true,
      min: 1,
      max: 63,
    },
    lastName: {
      type: String,
      trim: true,
      min: 1,
      max: 63,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "super-user"],
      default: "admin",
    },
    phone: {
      type: String,
      max: 13,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

// getting virtual field fullName
adminSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.middleName} ${this.lastName}`;
});

// method used to authenticate login (pwd matching)
adminSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.password_hash);
  },
};

module.exports = mongoose.model("Admin", adminSchema);
