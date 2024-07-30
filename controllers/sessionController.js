const Session = require('../models/SessionModel');
const supabase = require('../config/supabaseClient');
const User = require('../models/UserModel');

const getAllSessions = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
    const sessions = await Session.find({user:userId});
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllSessions
};
