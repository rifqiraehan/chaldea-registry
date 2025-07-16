const { login, register } = require('../controllers/authController');

module.exports = async function authRoutes(req, res, parsedUrl) {
  console.log(`[AUTH_ROUTES] Handling ${req.method} ${parsedUrl.pathname}`);
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
    console.log('[AUTH_ROUTES] Calling login controller.');
    return login(req, res);
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/register') {
    console.log('[AUTH_ROUTES] Calling register controller.');
    return register(req, res);
  }
};