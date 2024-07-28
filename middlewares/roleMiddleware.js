const checkRole = (requiredRole) => {
    return async (req, res, next) => {
      const role = req.session.role;
        console.log(role,"rple")
      if (!role || role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      next();
    };
  };
  
  module.exports = checkRole;
  