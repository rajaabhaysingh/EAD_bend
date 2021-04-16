const { check, validationResult } = require("express-validator");

exports.validateAddReview = [
  check("jobId").notEmpty().withMessage("JobId cannot be empty."),
  check("star").notEmpty().withMessage("Rating cannot be empty."),
  check("review").notEmpty().withMessage("Review text cannot be empty."),
];

exports.isAddReviewRequestValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
