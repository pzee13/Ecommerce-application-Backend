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
// const sessionRoutes = require('./routes/sessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Use routes
app.use('/api/users', userRoutes); // Changed '/api/' to '/api/users'
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
// app.use('/api/sessions', sessionRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce Platform!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
