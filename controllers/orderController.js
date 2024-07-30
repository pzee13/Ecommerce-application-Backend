


const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Cart = require('../models/CartModel');
const Stripe = require('stripe');
const supabase = require('../config/supabaseClient');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate session with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Extract user information from the session
  const { user } = data; // `data.user` is the user object

  // Fetch user role from MongoDB
  const userr = await User.findOne({ supabaseId: user.id });

  if (!userr) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = userr._id;
  const { products, totalAmount } = req.body;

  try {
    const order = new Order({ user: userId, products, totalAmount });
    await order.save();

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:5173/orders',
      cancel_url: 'http://localhost:5173/orders',
      metadata: { orderId: order._id.toString() },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error placing order:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserOrders = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate session with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Extract user information from the session
  const { user } = data; // `data.user` is the user object

  // Fetch user role from MongoDB
  const userr = await User.findOne({ supabaseId: user.id });

  if (!userr) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = userr._id;



  try {
    const orders = await Order.find({ user: userId , isPaid:true }).populate('products.product');
    console.log(orders)
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
};
