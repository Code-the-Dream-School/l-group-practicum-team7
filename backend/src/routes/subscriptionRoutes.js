const express = require('express');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.post('/demo-checkout', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const orderId = `demo_${crypto.randomUUID()}`;

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planId: req.body.planId || 'pulsemind_pro_demo',
        status: 'active',
        demo: true,
        orderId,
        amountCents: req.body.amountCents || 499,
        currency: req.body.currency || 'USD',
        paymentBrand: req.body.payment?.brand || 'demo-card',
        paymentLast4: req.body.payment?.last4 || '',
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      orderId: subscription.orderId,
      status: subscription.status,
      premium: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process demo checkout',
    });
  }
});

router.post('/demo-reset', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        status: 'inactive',
        cancelledAt: new Date(),
      },
      { new: true }
    );

    return res.json({
      premium: false,
      status: subscription?.status || 'inactive',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to reset demo subscription',
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const subscription = await Subscription.findOne({ userId });

    return res.json({
      premium: subscription?.status === 'active',
      subscription,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load subscription',
    });
  }
});

module.exports = router;