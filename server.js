// Servidor local mínimo para probar la PWA sin instalar dependencias.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const requestPath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const filePath = path.resolve(root, requestPath);

  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
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
