// complete validator for job

// see validators/auth.js to get help

const { check, validationResult } = require("express-validator");

exports.validateJobPostRequest = [
  check("name").notEmpty().withMessage("Job name cannot be empty."),
  check("desc").notEmpty().withMessage("Job description cannot be empty."),
  check("category").notEmpty().withMessage("Job category cannot be empty."),
  // other validation parameters goes here
];

// other validation methods related to job should be added here

// this method is pretty much same for all validators
exports.isJobPostReqValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
