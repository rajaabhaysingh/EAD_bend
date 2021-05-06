const express = require("express");
const {
  startConversation,
  getConversation,
} = require("../controllers/conversation");

const { requireSignIn } = require("../commonMiddlewares");

const router = express.Router();

// start conv
router.post("/start-conversation", requireSignIn, startConversation);

// get conversation
router.get("/get", requireSignIn, getConversation);

module.exports = router;
