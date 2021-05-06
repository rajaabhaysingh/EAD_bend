const Conversation = require("../models/conversation");

// startConversation
exports.startConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  // first find if conversation already exist
  await Conversation.findOne({
    members: [senderId, receiverId],
  }).exec(async (err, conversation) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (conversation) {
      // if already exists
      return res.status(200).json({
        data: conversation,
      });
    } else {
      //   else create a new conversation
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });

      await newConversation.save(async (error, savedConv) => {
        if (error) {
          return res.status(400).json({
            error: error,
          });
        }

        if (savedConv) {
          return res.status(201).json({
            data: savedConv,
          });
        } else {
          return res.status(400).json({
            error:
              "Some unknown error occurred while instantiating the conversation.",
          });
        }
      });
    }
  });
};

// getConversation
exports.getConversation = async (req, res) => {
  await Conversation.find({
    members: { $in: [req.user._id] },
  })
    .populate("members", "_id firstName lastName middleName profilePicture")
    .exec(async (err, conversations) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (conversations) {
        return res.status(200).json({
          data: conversations,
        });
      } else {
        return res.status(404).json({
          error: "No conversations found.",
        });
      }
    });
};
