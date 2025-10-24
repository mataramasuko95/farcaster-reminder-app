/* Simple Node.js starter (no external deps) */
const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, path: req.url }));
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
