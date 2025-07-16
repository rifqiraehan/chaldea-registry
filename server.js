const http = require('http');
const url = require('url');
require('dotenv').config({ quiet: true });

const accountRoutes = require('./routes/accountRoutes');
const authRoutes = require('./routes/authRoutes');
const parseJsonBody = require('./utils/parseJsonBody');
const sendJson = require('./utils/sendJson');

const PORT = process.env.PORT || 3000;
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  try {
    await parseJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { message: err.message });
  }

  if (parsedUrl.pathname.startsWith('/api/auth')) {
    return authRoutes(req, res, parsedUrl);
  }

  if (parsedUrl.pathname.startsWith('/api/account')) {
    return accountRoutes(req, res, parsedUrl);
  }

  if (parsedUrl.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  sendJson(res, 404, { message: 'Endpoint not found' });
});
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = server;
