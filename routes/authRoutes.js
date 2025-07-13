const { login, register } = require('../controllers/authController');

module.exports = async function authRoutes(req, res, parsedUrl) {
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
    return login(req, res);
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/register') {
    return register(req, res);
  }
};
