const { check, validationResult } = require("express-validator");

exports.validatePayment = [
  check("amount").notEmpty().withMessage("Amount cannot be empty."),
  check("desc").notEmpty().withMessage("Descriprion cannot be empty."),
  check("applicationId")
    .notEmpty()
    .withMessage("Application-id cannot be empty."),
];

exports.isPaymentRequestValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
