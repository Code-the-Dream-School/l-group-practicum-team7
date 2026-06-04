const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    planId: {
      type: String,
      required: true,
      default: 'pulsemind_pro_demo',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active',
    },
    demo: {
      type: Boolean,
      default: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    amountCents: {
      type: Number,
      default: 499,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentBrand: String,
    paymentLast4: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);