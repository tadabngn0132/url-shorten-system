const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token);
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 't4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
    });
  };