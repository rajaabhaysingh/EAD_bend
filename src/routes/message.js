const express = require("express");
const { newMessage, getMessages } = require("../controllers/message");

const { requireSignIn } = require("../commonMiddlewares");

const router = express.Router();

// send new message
router.post("/new", requireSignIn, newMessage);

// get messages
router.get("/:conversationId", requireSignIn, getMessages);

module.exports = router;
