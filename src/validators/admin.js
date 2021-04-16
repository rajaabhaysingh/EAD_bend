const { check, validationResult } = require("express-validator");

exports.validateAdminSignupRequest = [
  check("firstName").notEmpty().withMessage("Firstname cannot be empty."),
  check("middleName")
    .notEmpty()
    .withMessage(
      "Middle name cannot be empty. If you don't have middle name, type N/A."
    ),
  check("lastName")
    .notEmpty()
    .withMessage(
      "Lastname cannot be empty. If you don't have last name, type N/A."
    ),
  check("email").isEmail().withMessage("Invalid email address."),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long."),
  check("phone")
    .isMobilePhone("en-IN")
    .withMessage("Invalid Phone number provided."),
  check("secret").notEmpty().withMessage("Signup secret is required."),
];

exports.validateEmailId = [
  check("email").isEmail().withMessage("Invalid email address."),
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
