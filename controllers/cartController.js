

const Product = require('../models/ProductModel');
const Cart = require('../models/CartModel');
const User = require('../models/UserModel');
const supabase = require('../config/supabaseClient'); 

// Get Cart
const getCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];  // Assuming token is in "Bearer <token>" format

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate session with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    
    const { user } = data; // `data.user` is the user object

    // Fetch user role from MongoDB
    const userr = await User.findOne({ supabaseId: user.id });

    if (!userr) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userr._id;

    // Fetch and populate cart
    const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price description stock',
      });
  
      if (!cart) {
        return res.json({ items: [] });
      }
  
     
      const items = cart.items.map(item => ({
        product: item.product || {}, 
        quantity: item.quantity,
      }));
  
      const totalAmount = items.reduce((total, item) => {
        const productPrice = item.product.price || 0; // Default to 0 if price is not available
        return total + item.quantity * productPrice;
      }, 0);
  
      res.json({ items, totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate session with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

 
  const { user } = data; 

  // Fetch user role from MongoDB
  const userr = await User.findOne({ supabaseId: user.id });

  if (!userr) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = userr._id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if there's enough stock available
    if (quantity > product.stock) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Find or create a cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Check if the product is already in the cart
    const existingProductIndex = cart.items.findIndex(
      (p) => p.product.toString() === productId
    );

    if (existingProductIndex >= 0) {
      // Update quantity
      cart.items[existingProductIndex].quantity += quantity;
    } else {
      // Add new product to the cart
      cart.items.push({ product: productId, quantity });
    }

    // Populate product details to calculate total amount
    await cart.populate({
      path: 'items.product',
      select: 'price', // Ensure these fields are included
    });

    // Calculate the total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const productPrice = item.product.price; // Access the price from populated product
      return total + item.quantity * productPrice;
    }, 0);

    cart.totalAmount = totalAmount;

    await cart.save();

    // Populate again to ensure the response has complete product details
    await cart.populate({
      path: 'items.product',
      select: 'name price stock', 
    });

    res.json({
      message: 'Product added to cart successfully',
      items: cart.items.map(item => ({
        product: {
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          stock: item.product.stock, 
        },
        quantity: item.quantity,
      })),
      totalAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Cart
const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  console.log(req.body, "cart Body");

  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format


  console.log("token  is " , token);    
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate session with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  console.log("Supabase response data:", data);
      console.log("Supabase response error:", error);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }


  const { user } = data; // `data.user` is the user object

  // Fetch user role from MongoDB
  const userr = await User.findOne({ supabaseId: user.id });

  if (!userr) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = userr._id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if there's enough stock available
    if (quantity > product.stock) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price stock', 
    });

    console.log(cart,"cart")

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Check if the product is already in the cart
    const existingProductIndex = cart.items.findIndex(
        (item) => item.product._id.toString() === productId
      );

    console.log("existingProductIndex",existingProductIndex)

    if (existingProductIndex >= 0) {
      // Update quantity if it's greater than zero
      if (quantity > 0) {
        cart.items[existingProductIndex].quantity = quantity;
      } else {
        return res.status(400).json({ error: 'Quantity must be greater than zero' });
      }
    } 
    // Calculate the total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const productPrice = item.product.price; 
      return total + item.quantity * productPrice;
    }, 0);

    cart.totalAmount = totalAmount;

    await cart.save();

    res.json({
      message: 'Cart updated successfully',
      items: cart.items.map(item => ({
        quantity: item.quantity,
      })),
      totalAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validate session with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

 
  const { user } = data; // `data.user` is the user object

  // Fetch user role from MongoDB
  const userr = await User.findOne({ supabaseId: user.id });

  if (!userr) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userId = userr._id;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price stock', 
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find and remove the product from the cart
    cart.items = cart.items.filter((item) => item.product._id.toString() !== productId);

    console.log(cart.items,"cart items");

    // Calculate the total amount
    const totalAmount = cart.items.reduce((total, item) => {
      const productPrice = item.product.price; 
      return total + item.quantity * productPrice;
    }, 0);

    cart.totalAmount = totalAmount;

    console.log(cart.totalAmount,"totalAmount")

    await cart.save();

    res.json({
      message: 'Product removed from cart successfully',
      totalAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
};
