const express = require("express");
const { createPayment, initiatePayment } = require("../controllers/payment");
const {
  validatePayment,
  isPaymentRequestValidated,
} = require("../validators/payments");

const router = express.Router();

router.post(
  "/initiate",
  validatePayment,
  isPaymentRequestValidated,
  initiatePayment
);

// for rzp webhook
router.post("/pay_now", createPayment);

module.exports = router;
