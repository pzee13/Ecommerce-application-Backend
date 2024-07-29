const supabase  = require('../config/supabaseClient');
const User = require('../models/UserModel');

const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Get the token from the request (e.g., from headers)
      const token = req.headers.authorization?.split(' ')[1]; // Assuming token is in "Bearer <token>" format

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate session with Supabase
      const { data, error } = await supabase.auth.getUser(token);;

      if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Extract user information from the session
      const { user } = data; // `data.user` is the user object

      // Fetch user role from MongoDB
      const dbUser = await User.findOne({ supabaseId: user.id });

      if (!dbUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (dbUser.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Add user to request object for further use
      req.user = dbUser;

      next();
    } catch (error) {
      console.error('Error checking role:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = checkRole;
