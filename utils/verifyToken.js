const jwt = require('jsonwebtoken');
const sendJson = require('./sendJson');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendJson(res, 401, { message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return sendJson(res, 403, { message: 'Invalid token' });
  }
}

module.exports = verifyToken;
