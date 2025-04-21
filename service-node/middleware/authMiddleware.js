const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Auth header received:', authHeader);
    
    // Check if Authorization header exists
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token);
    
    if (!token) {
      console.log('No token found in Authorization header');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 't4LQRcBnnA6hyucvkz6WJcwzaQA3GtF92bHatyNYh4D7XeJJpKCL', (err, user) => {
      if (err) {
        console.log('Token verification error:', err);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      console.log('Token verified successfully, user:', user);
      req.user = user;
      next();
    });
  };