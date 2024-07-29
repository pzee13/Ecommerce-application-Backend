const supabase  = require('../config/supabaseClient');
const Session = require('../models/SessionModel');

const checkAuth = async (req, res, next) => {
    //Bearer token
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log(token,"token")

  try {

    const { data, error } = await supabase.auth.getUser(token);

      
    console.log("Supabase response data ayt:", data);
    console.log("Supabase response errorvayth:", error);

        if (error || !data.user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }



    const session = await Session.findOne({ token });

    if (!session) {
      return res.status(401).json({ error: 'Session not found' });
    }

    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkAuth;
