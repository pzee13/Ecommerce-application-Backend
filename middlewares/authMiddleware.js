const supabase = require('../config/supabaseClient');

const checkAuth = async (req, res, next) => {
  const sessionId = req.session.userId;

  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify session with Supabase
  const { data: session, error } = await supabase.auth.getSession(sessionId);

  if (error || !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = session.user;
  next();
};

module.exports = checkAuth;

