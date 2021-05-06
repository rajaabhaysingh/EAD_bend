const mongoose = require("mongoose");

// defining message Schema
const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
