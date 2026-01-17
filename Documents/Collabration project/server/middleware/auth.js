const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isCompany = (req, res, next) => {
  if (req.userRole !== 'company') {
    return res.status(403).json({ message: 'Access denied. Company role required.' });
  }
  next();
};

const isDeveloper = (req, res, next) => {
  if (req.userRole !== 'developer') {
    return res.status(403).json({ message: 'Access denied. Developer role required.' });
  }
  next();
};

module.exports = { auth, isCompany, isDeveloper };
