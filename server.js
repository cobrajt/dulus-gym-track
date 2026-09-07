// Servidor local mínimo para probar la PWA sin instalar dependencias.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

http.createServer((request, response) => {
  const requestPath = request.url === '/' ? 'index.html' : decodeURIComponent(request.url).replace(/^\/+/, '');
  const filePath = path.resolve(root, requestPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    return response.end();
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      return response.end('Not found');
    }
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
}).listen(4173, () => console.log('Dulus Gym Track disponible en http://localhost:4173'));
