const express = require("express");
const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const {
  signup,
  login,
  verifyEmailOtp,
  regenerateEmailOTP,
  sendResetPasswordLink,
  verifyResetPassword,
  logout,
} = require("../controllers/auth");
const {
  validateAuthSignupRequest,
  validateEmailId,
  isAuthRequestValidated,
  validateEmailVerify,
  validateVerifyResetPassword,
} = require("../validators/auth");

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
  validateAuthSignupRequest,
  isAuthRequestValidated,
  signup
);

// email verify
router.post(
  "/verify-email",
  validateEmailVerify,
  isAuthRequestValidated,
  verifyEmailOtp
);

// regenerate email otp
router.post(
  "/regenrate-email-otp",
  validateEmailId,
  isAuthRequestValidated,
  regenerateEmailOTP
);

// sendResetPasswordLink
router.post(
  "/send-reset-password-link",
  validateEmailId,
  isAuthRequestValidated,
  sendResetPasswordLink
);

// verifyResetPassword
router.post(
  "/verify-reset-password",
  validateVerifyResetPassword,
  isAuthRequestValidated,
  verifyResetPassword
);

// verifyResetPassword
router.post("/logout", logout);

module.exports = router;
