module.exports = function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) {
      return resolve(req.body);
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', err => {
      reject(err);
    });

    setTimeout(() => {
      reject(new Error('Request body read timed out'));
    }, 5000);
  });
};
