
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const Stripe = require('stripe');


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require('./models/OrderModel');
const Cart = require('./models/CartModel');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));



app.post(
    '/api/orders/stripewebhook',
    express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
    try {
      // Verify the Stripe signature
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        try {
          const orderId = session.metadata.orderId;

          const order = await Order.findByIdAndUpdate(orderId, { isPaid: true });

          if (!order) {
            return res.status(404).send('Order not found');
          }

          const userId = order.user; // Retrieve userId from the order

        const cart = await Cart.findOneAndDelete({ user: userId });

        if (!cart) {
 
          return res.status(404).send('Cart not found');
        }

        } catch (err) {
            console.error('Error updating order:', err.message);
        }
  
        break;
      // Add more event types if needed

      default:
        console.warn('Unhandled event type:', event.type);
    }
  
    res.json({ received: true });
}
);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173', // Adjust as needed
    credentials: true,
  }));
app.use(morgan('dev'));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);


const userRoutes = require('./routes/userRoutes'); // Correct import
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');


app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);



app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce Platform!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
