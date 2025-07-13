module.exports = function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        req.body = JSON.parse(body || '{}');
      } catch {
        req.body = {};
      }
      resolve();
    });
  });
};
