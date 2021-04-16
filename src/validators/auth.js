const { check, validationResult, checkSchema } = require("express-validator");

var typeSchema = {
  type: {
    in: "body",
    matches: {
      options: [
        /\b(?:individual|organization|individual prime|organization prime)\b/,
      ],
      errorMessage: "Invalid account type.",
    },
  },
};

exports.validateAuthSignupRequest = [
  check("firstName").notEmpty().withMessage("Firstname cannot be empty."),
  check("email").isEmail().withMessage("Invalid email address."),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long."),
  check("passwordConfirm")
    .isLength({ min: 8 })
    .withMessage("Confirm password must be atleast 8 characters long."),
  check("phone")
    .isMobilePhone("en-IN")
    .withMessage("Invalid Phone number provided."),
  checkSchema(typeSchema),
  check("reCAPTCHA").notEmpty().withMessage("reCAPTCHA cannot be empty"),
];

exports.validateEmailVerify = [
  check("email").isEmail().withMessage("Invalid email address."),
  check("otp").notEmpty().withMessage("OTP cannot be empty."),
];

exports.validateEmailId = [
  check("email").isEmail().withMessage("Invalid email address."),
];

exports.validateVerifyResetPassword = [
  check("userId")
    .notEmpty()
    .withMessage(
      "UserId cannot be empty. Make sure password reset link is not tempered."
    ),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long."),
  check("passwordConfirm")
    .isLength({ min: 8 })
    .withMessage("Confirm password must be atleast 8 characters long."),
  check("resetToken")
    .notEmpty()
    .withMessage(
      "Token cannot be empty. Make sure password reset link is not tempered."
    ),
];

exports.isAuthRequestValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
