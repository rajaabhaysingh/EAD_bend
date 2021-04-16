const mongoose = require("mongoose");

// defining user Schema
const userSchema = mongoose.Schema(
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
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "super-user"],
      default: "user",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "individual",
        "organization",
        "individual prime",
        "organization prime",
      ],
      default: "individual",
    },
    active: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      max: 13,
    },
    profilePicture: {
      type: String,
    },
    tempVerifCode: {
      type: String,
    },
    codeExpTime: {
      type: Date,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    ratedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratings: {
      oneStar: {
        type: Number,
        default: 0,
      },
      twoStar: {
        type: Number,
        default: 0,
      },
      threeStar: {
        type: Number,
        default: 0,
      },
      fourStar: {
        type: Number,
        default: 0,
      },
      fiveStar: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
