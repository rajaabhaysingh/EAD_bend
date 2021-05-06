const mongoose = require("mongoose");

// defining conversation Schema
const conversationSchema = mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
