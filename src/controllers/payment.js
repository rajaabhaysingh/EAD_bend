const Payment = require("../models/payment");
const Application = require("../models/application");

const Razorpay = require("razorpay");
const env = require("dotenv");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

env.config();

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

// initiatePayment
exports.initiatePayment = async (req, res) => {
  const { amount, desc, applicationId } = req.body;

  const options = {
    amount: parseInt(amount * 100), // amount in the smallest currency unit
    currency: "INR", // change this for other currency
    receipt: applicationId,
    payment_capture: true,
  };

  await razorpay.orders.create(options, async (err, order) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    if (order) {
      // create tempPaymentDetails
      const tempPaymentDetails = new Payment({
        amount: order.amount,
        rzp_order_id: order.id,
        receipt_id: order.receipt,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at,
        attempts: order.attempts,
        desc,
      });

      tempPaymentDetails.save((error, savedPaymentObj) => {
        if (error) {
          return res.status(400).json({
            error,
          });
        }

        if (savedPaymentObj) {
          return res.status(201).json({
            data: {
              order_id: order.id,
              amount: order.amount,
              currency: order.currency,
              key_id: process.env.RZP_KEY_ID,
            },
          });
        } else {
          return res.status(400).json({
            error: "Some error occured initiating payment.",
          });
        }
      });
    }
  });
};

//updatePayment
// NOTE: webhook to catch successful payments
// create new payment entry
exports.createPayment = async (req, res) => {
  // -- helper function --
  // pushPaymentDetailToApplication
  const pushPaymentDetailToApplication = async (paymentDetails) => {
    await Application.findOneAndUpdate(
      {
        _id: paymentDetails.receipt_id,
      },
      {
        $push: {
          payments: paymentDetails._id,
        },
      },
      {
        new: true,
      }
    ).exec((err, applUpdtd) => {
      if (err) {
        // log error
      }

      if (applUpdtd) {
        // mendatory (dummy) response to razorpay to keep connection alive
        return res.status(200).json({
          status: "Thankyou razorpay.",
        });
      }
    });
  };

  if (req.body.payload.payment.entity) {
    const {
      id,
      amount,
      currency,
      status,
      order_id,
      invoice_id,
      is_intl,
      method,
      amt_refunded,
      refund_status,
      captured,
      description,
      card_id,
      card,
      bank,
      wallet,
      vpa,
      email,
      contact,
      fee,
      tax,
      notes,
      error_code,
      error_description,
      error_source,
      error_step,
      error_reason,
    } = req.body.payload.payment.entity;

    const shasum = crypto.createHmac("sha256", process.env.RZP_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    // handling multiple "same" request (incase if it occurs)
    await Payment.findOne({
      event_id: req.headers["x-razorpay-event-id"],
      rzp_order_id: order_id,
    }).exec(async (err, duplicatePaymentObj) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (duplicatePaymentObj) {
        // find one and update
        await Payment.findOneAndUpdate(
          {
            _id: duplicatePaymentObj._id,
          },
          {
            $set: {
              rzp_payment_id: id,
              amount,
              currency,
              status,
              rzp_order_id: order_id,
              rzp_invoice_id: invoice_id,
              is_intl,
              method,
              amt_refunded,
              refund_status,
              captured,
              desc: description,
              card_id,
              card,
              bank,
              wallet,
              vpa,
              email,
              contact,
              fee,
              tax,
              notes,
              error_code,
              error_desc: error_description,
              error_source,
              error_step,
              error_reason,
              verified: digest === req.headers["x-razorpay-signature"],
              event_id: req.headers["x-razorpay-event-id"],
              receipt_id: duplicatePaymentObj.receipt_id,
            },
          },
          {
            new: true,
            overwrite: true,
          }
        ).exec((error, updatedPayment) => {
          if (error) {
            // log error
          }

          if (updatedPayment) {
            // NOTE: add this entry to application payments
            pushPaymentDetailToApplication(updatedPayment);
          }
        });
      } else {
        // update initiated payment
        await Payment.findOneAndUpdate(
          {
            rzp_order_id: order_id,
          },
          {
            $set: {
              rzp_payment_id: id,
              amount,
              currency,
              status,
              rzp_order_id: order_id,
              rzp_invoice_id: invoice_id,
              is_intl,
              method,
              amt_refunded,
              refund_status,
              captured,
              desc: description,
              card_id,
              card,
              bank,
              wallet,
              vpa,
              email,
              contact,
              fee,
              tax,
              notes,
              error_code,
              error_desc: error_description,
              error_source,
              error_step,
              error_reason,
              verified: digest === req.headers["x-razorpay-signature"],
              event_id: req.headers["x-razorpay-event-id"],
            },
          },
          {
            new: true,
          }
        ).exec((err, updatedPayment) => {
          if (err) {
            // log error
          }

          if (updatedPayment) {
            // NOTE: add this entry to application payments
            pushPaymentDetailToApplication(updatedPayment);
          }
        });
      }
    });
  } else {
    console.log("No payment object received");
  }
};
