const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');


const getCart = async (req, res) => {
  try {
    const { userId } = req.session;

    const order = await Order.findOne({ user: userId, status: 'pending' }).populate('products.product');

    if (!order) {
      return res.json({ products: [] });
    }

    res.json(order.products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const { userId } = req.session;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find or create a pending order for the user
    let order = await Order.findOne({ user: userId, status: 'pending' });

    if (!order) {
      order = new Order({
        user: userId,
        products: [],
        totalAmount: 0,
      });
    }

    // Check if the product is already in the cart
    const existingProductIndex = order.products.findIndex(
      (p) => p.product.toString() === productId
    );

    if (existingProductIndex >= 0) {
      // Update quantity
      order.products[existingProductIndex].quantity += quantity;
    } else {
      // Add new product to the cart
      order.products.push({ product: productId, quantity });
    }

    // Calculate the total amount
    order.totalAmount = order.products.reduce((total, item) => {
      return total + item.quantity * item.product.price;
    }, 0);

    await order.save();
    res.json(order.products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Place an order
const placeOrder = async (req, res) => {
  const { userId } = req.session;

  try {
    const order = await Order.findOne({ user: userId, status: 'pending' });

    if (!order) {
      return res.status(404).json({ error: 'No items in the cart' });
    }

    // Update order status
    order.status = 'completed';
    await order.save();

    res.json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getCart,
  addToCart,
  placeOrder,
};
