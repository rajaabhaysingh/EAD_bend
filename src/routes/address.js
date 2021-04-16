const express = require("express");
const { requireSignIn, userMiddleware } = require("../commonMiddlewares");
const {
  addAddress,
  getAddress,
  updateAddress,
} = require("../controllers/address");

const router = express.Router();

router.post("/create", requireSignIn, userMiddleware, addAddress);
router.get("/get", requireSignIn, userMiddleware, getAddress);
router.put("/update", requireSignIn, userMiddleware, updateAddress);

module.exports = router;
