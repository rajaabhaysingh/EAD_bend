const express = require("express");
const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const { signup, login } = require("../controllers/admin");
const {
  validateAdminSignupRequest,
  validateEmailId,
  isAuthRequestValidated,
} = require("../validators/admin");

const router = express.Router();

// saving dp files inside profile_pic folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "profile_pic"));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

// login process
router.post("/login", validateEmailId, isAuthRequestValidated, login);

// signup process
router.post(
  "/signup",
  upload.single("profilePicture"),
  validateAdminSignupRequest,
  isAuthRequestValidated,
  signup
);

module.exports = router;
