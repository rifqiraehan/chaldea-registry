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

  sendJson(res, 404, { message: 'Endpoint not found' });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = server;
