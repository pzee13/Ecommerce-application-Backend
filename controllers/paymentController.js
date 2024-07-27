const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const processPayment = async (req, res) => {
  const { amount, currency, source } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: source,
      confirm: true,
    });

    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ error: 'Payment processing error' });
  }
};

module.exports = {
  processPayment
};
