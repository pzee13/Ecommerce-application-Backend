const supabase = require('../config/supabaseClient');

const checkAuth = async (req, res, next) => {
  console.log("checking auth");
  const sessionId = req.session.userId;
  console.log(sessionId,"sess");

  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify session with Supabase
  const { data, error } = await supabase.auth.getSession(sessionId);
  console.log(data)

  if (error || !data) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = data.session.user;
  console.log(req.user,"user");
  next();
};

module.exports = checkAuth;

