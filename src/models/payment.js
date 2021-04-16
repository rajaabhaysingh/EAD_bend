const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // sent with rzp payment header
    event_id: {
      type: String,
    },
    rzp_payment_id: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    rzp_order_id: {
      type: String,
      required: true,
    },
    // to identify application Id
    receipt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    rzp_invoice_id: {
      type: String,
    },
    desc: {
      type: String,
      trim: true,
    },
    is_intl: {
      type: Boolean,
      required: true,
      default: false,
    },
    method: {
      type: String,
    },
    amt_refunded: {
      type: Number,
      default: 0,
    },
    refund_status: {
      type: String,
    },
    captured: {
      type: Boolean,
      required: true,
      default: false,
    },
    card_id: {
      type: String,
    },
    card: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      last4: {
        type: String,
      },
      network: {
        type: String,
      },
      type: {
        type: String,
      },
    },
    bank: {
      type: String,
    },
    wallet: {
      type: String,
    },
    vpa: {
      type: String,
    },
    email: {
      type: String,
    },
    contact: {
      type: Number,
    },
    fee: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    notes: [
      {
        key: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    error_code: {
      type: String,
    },
    error_desc: {
      type: String,
    },
    error_source: {
      type: String,
    },
    error_step: {
      type: String,
    },
    error_reason: {
      type: String,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
