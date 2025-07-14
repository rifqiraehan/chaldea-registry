module.exports = function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) return resolve(req.body);

    let body = '';
    req.on('data', chunk => (body += chunk.toString()));

    req.on('end', () => {
      try {
        req.body = JSON.parse(body || '{}');
        resolve(req.body);
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);

    setTimeout(() => reject(new Error('Request body read timed out')), 5000);
  });
};
