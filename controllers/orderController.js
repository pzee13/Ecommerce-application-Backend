// const Order = require('../models/OrderModel');
// const Product = require('../models/ProductModel');
// const Cart = require('../models/CartModel');
// const User = require('../models/UserModel');

// const placeOrder = async (req, res) => {
//     const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

//     if (!token) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }
  
//     // Validate session with Supabase
//     const { data, error } = await supabase.auth.getUser(token);
  
//     if (error || !data.user) {
//       return res.status(401).json({ error: 'Invalid or expired token' });
//     }
  
//     // Extract user information from the session
//     const { user } = data; // `data.user` is the user object
  
//     // Fetch user role from MongoDB
//     const userr = await User.findOne({ supabaseId: user.id });
  
//     if (!userr) {
//       return res.status(404).json({ error: 'User not found' });
//     }
  
//     const userId = userr._id;
  
//   const { products, totalAmount } = req.body;

//   try {
//     const order = new Order({ user: userId, products, totalAmount });
//     await order.save();
//     res.status(201).json(order);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const getUserOrders = async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   // Validate session with Supabase
//   const { data, error } = await supabase.auth.getUser(token);

//   if (error || !data.user) {
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }

//   // Extract user information from the session
//   const { user } = data; // `data.user` is the user object

//   // Fetch user role from MongoDB
//   const userr = await User.findOne({ supabaseId: user.id });

//   if (!userr) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const userId = userr._id;

//   try {
//     const orders = await Order.find({ user: userId }).populate('products.product');
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// module.exports = {
//   placeOrder,
//   getUserOrders
// };


// const Order = require('../models/OrderModel');
// const User = require('../models/UserModel');
// const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// const supabase = require('../config/supabaseClient'); 


// const placeOrder = async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   // Validate session with Supabase
//   const { data, error } = await supabase.auth.getUser(token);

//   if (error || !data.user) {
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }

//   // Extract user information from the session
//   const { user } = data; // `data.user` is the user object

//   // Fetch user role from MongoDB
//   const userr = await User.findOne({ supabaseId: user.id });

//   if (!userr) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const userId = userr._id;
//   const { products, totalAmount } = req.body;

//   try {
//     const order = new Order({ user: userId, products, totalAmount });
//     await order.save();

//     // Create Stripe Checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: products.map(item => ({
//         price_data: {
//           currency: 'inr',
//           product_data: {
//             name: item.product.name,
//           },
//           unit_amount: item.product.price * 100,
//         },
//         quantity: item.quantity,
//       })),
//       mode: 'payment',
//       success_url: 'http://localhost:5173/orders?session_id={CHECKOUT_SESSION_ID}',
//       cancel_url: 'http://localhost:5173/orders',
//       metadata: { orderId: order._id.toString() },
//     });

//     res.json({ id: session.id });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const getUserOrders = async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   // Validate session with Supabase
//   const { data, error } = await supabase.auth.getUser(token);

//   if (error || !data.user) {
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }

//   // Extract user information from the session
//   const { user } = data; // `data.user` is the user object

//   // Fetch user role from MongoDB
//   const userr = await User.findOne({ supabaseId: user.id });

//   if (!userr) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const userId = userr._id;

//   try {
//     const orders = await Order.find({ user: userId }).populate('products.product');
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// const handleStripeWebhook = async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const endpointSecret = "whsec_dff92d8ed6a4e81f90ee2455c377312e633bc1083ad1ece9d2d2f82ad8cdc960";
  
//     let event;
  
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//       console.error('Webhook Error:', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
  
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
  
//       try {
//         const orderId = session.metadata.orderId;
//         await Order.findByIdAndUpdate(orderId, { isPaid: true });
//       } catch (err) {
//         console.error('Order Update Error:', err.message);
//       }
//     }
  
//     res.json({ received: true });
//   };
  
// module.exports = {
//   placeOrder,
//   getUserOrders,
//   handleStripeWebhook,
// };


const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
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

const handleStripeWebhook = async (req, res) => {
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
};

module.exports = {
  placeOrder,
  getUserOrders,
  handleStripeWebhook,
};
