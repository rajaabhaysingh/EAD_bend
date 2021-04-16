const { check, validationResult } = require("express-validator");

exports.validateAddCategory = [
  check("categoryName")
    .notEmpty()
    .withMessage("Category name cannot be empty.")
    .trim(),
];

exports.isAddCategoryRequestValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
