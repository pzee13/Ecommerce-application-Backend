const checkRole = (requiredRole) => {
    return async (req, res, next) => {
      const { user } = req;
  
      if (!user || user.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      next();
    };
  };
  
  module.exports = checkRole;
  