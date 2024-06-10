// server.js ou routes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51PPvUdRvCobcJd2pkxdOS73xesWGFGMG5YhMJeZDcGTjloQQ58O2ZuRLnbWEDF3vBac0DUyADjbMUa71Pg4TuKVc00iGqbbGDf');

router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ message: 'Amount and currency are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
