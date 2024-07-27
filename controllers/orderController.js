const Order = require('../models/OrderModel');

const placeOrder = async (req, res) => {
  const { userId } = req.session;
  const { products, totalAmount } = req.body;

  try {
    const order = new Order({ user: userId, products, totalAmount });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserOrders = async (req, res) => {
  const { userId } = req.session;

  try {
    const orders = await Order.find({ user: userId }).populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getUserOrders
};
