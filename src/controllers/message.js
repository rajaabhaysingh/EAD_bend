const Message = require("../models/message");

// newMessage
exports.newMessage = async (req, res) => {
  const { text, conversationId } = req.body;

  const newMessage = new Message({
    text: text,
    conversationId,
    sender: req.user._id,
  });

  await newMessage.save(async (err, savedMsg) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (savedMsg) {
      return res.status(201).json({
        data: savedMsg,
      });
    } else {
      return res.status(400).json({
        error: "Some unknown error occurred while sending the message.",
      });
    }
  });
};

// getMessages
exports.getMessages = async (req, res) => {
  await Message.find({
    conversationId: req.params.conversationId,
  }).exec(async (err, messages) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (messages) {
      return res.status(200).json({
        data: messages,
      });
    } else {
      return res.status(404).json({
        error: "No messages found.",
      });
    }
  });
};
