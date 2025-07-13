const { create, list, update, remove } = require('../controllers/accountController');
const verifyToken = require('../utils/verifyToken');

module.exports = async function accountRoutes(req, res, parsedUrl) {
  await new Promise((resolve) => {
    verifyToken(req, res, resolve);
  });

  if (!req.user) return;

  if (req.method === 'POST' && parsedUrl.pathname === '/api/account') {
    return create(req, res);
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/account') {
    return list(req, res);
  }

  if (req.method === 'DELETE' && parsedUrl.pathname === '/api/account') {
    return remove(req, res, parsedUrl);
  }

  if (req.method === 'PUT' && parsedUrl.pathname === '/api/account') {
    return update(req, res, parsedUrl);
  }
};
