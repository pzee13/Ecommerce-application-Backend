// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const cors = require('cors');
// const morgan = require('morgan');

// const authRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const sessionRoutes = require('./routes/sessionRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');


// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//     // Remove useNewUrlParser and useUnifiedTopology
//   })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));
  
// // Set up session store
// const store = new MongoDBStore({
//   uri: process.env.MONGODB_URI,
//   collection: 'sessions',
// });

// // Catch errors
// store.on('error', function(error) {
//   console.error('Session store error:', error);
// });

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());
// app.use(morgan('dev'));

// // Session configuration
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     store: store,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );

// // Import routes

// // Use routes
// app.use('/api/', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/payment', paymentRoutes);

// app.get('/', (req, res) => {
//   res.send('Welcome to the E-Commerce Platform!');
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const morgan = require('morgan');
const Stripe = require('stripe');


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require('./models/OrderModel');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Set up session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
});

// Catch errors
store.on('error', function (error) {
  console.error('Session store error:', error);
});

app.post(
    '/api/orders/stripewebhook',
    express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
  
    try {
      // Verify the Stripe signature
      console.log(req.body,"body",sig,"sig",endpointSecret,"end");
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  
      console.log(event,"event")
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
  
        try {
          const orderId = session.metadata.orderId;
          
          // Update order status
          const order = await Order.findByIdAndUpdate(orderId, { isPaid: true });
  
          if (!order) {
            console.error('Order not found:', orderId);
            return res.status(404).send('Order not found');
          }
  
          console.log('Order marked as paid:', orderId);
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
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);


const userRoutes = require('./routes/userRoutes'); // Correct import
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Use routes
app.use('/api/users', userRoutes); // Changed '/api/' to '/api/users'
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce Platform!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
