const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

// defining job Schema
const jobSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    jobThumbnail: {
      type: String,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
    },
    durationUnit: {
      type: String,
      enum: ["Minute", "Hour", "Day", "Month", "Unknown"],
      default: "Unknown",
    },
    isPermanent: {
      type: Boolean,
      default: false,
    },
    reqQty: {
      type: Number,
      index: true,
      required: true,
    },
    reqQtyUnit: {
      type: String,
      enum: ["Man", "Woman", "Man OR Woman"],
      default: "Man OR Woman",
      required: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    payscale: {
      type: Number,
      index: true,
    },
    payscaleUnit: {
      type: String,
      enum: ["Task", "Hour", "Day", "Month", "Unknown", "Other"],
      default: "Unknown",
    },
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    facilities: [
      {
        key: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
        },
      },
    ],
    faqs: [
      {
        que: {
          type: String,
          trim: true,
        },
        answer: {
          type: String,
          trim: true,
        },
      },
    ],
    views: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
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

    // applications
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],

    // fill this up and complete remaining part
  },
  { timestamps: true }
);

jobSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Job", jobSchema);
