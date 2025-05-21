const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const distPath = path.join(process.cwd(), 'dist', 'frontend-angular');
const testPort = 3030;

// Verificar que la carpeta dist existe
if (!fs.existsSync(distPath)) {
  console.error(`Error: El directorio de distribución no existe en ${distPath}`);
  process.exit(1);
}

// Cache para archivos estáticos
const fileCache = new Map();

// Función para determinar el tipo de contenido según la extensión del archivo
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase().substring(1);
  const contentTypes = {
    'html': 'text/html',
    'js': 'text/javascript',
    'css': 'text/css',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'json': 'application/json',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'font/eot',
    'ico': 'image/x-icon',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

// Cargar archivo en caché
function loadFileIntoCache(filePath) {
  if (fileCache.has(filePath)) {
    return fileCache.get(filePath);
  }

  try {
    const content = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);
    fileCache.set(filePath, { content, contentType });
    return { content, contentType };
  } catch (err) {
    return null;
  }
}

// Cargar archivos críticos en caché al inicio
const indexPath = path.join(distPath, 'index.html');
loadFileIntoCache(indexPath);

// Listar archivos JS y CSS y precargarlos
for (const file of fs.readdirSync(distPath)) {
  if (file.endsWith('.js') || file.endsWith('.css')) {
    loadFileIntoCache(path.join(distPath, file));
  }
}

console.log(`Servidor optimizado para servir archivos desde: ${distPath}`);

// Crear el servidor
const server = http.createServer((req, res) => {
  try {
    const url = req.url || '/';

    // Establecer cabeceras de caché
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Manejar las solicitudes de archivos estáticos explícitamente
    if (url.match(/\.js$|\.css$|\.png$|\.jpg$|\.svg$|\.ico$|\.woff$|\.woff2$|\.ttf$|\.eot$/)) {
      const filePath = path.join(distPath, url);
      const fileData = loadFileIntoCache(filePath);

      if (fileData) {
        res.writeHead(200, { 'Content-Type': fileData.contentType });
        res.end(fileData.content);
      } else {
        // Si el archivo no existe, servir index.html (comportamiento de SPA)
        const indexData = fileCache.get(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexData.content);
      }
      return;
    }

    // Para todas las demás rutas, devuelve index.html (necesario para SPA)
    const indexData = fileCache.get(indexPath);
    if (indexData) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexData.content);
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error interno del servidor');
    }
  } catch (error) {
    console.error('Error del servidor:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error interno del servidor');
  }
});

// Exportar funciones para iniciar y detener el servidor
function startServer() {
  return new Promise((resolve) => {
    server.listen(testPort, '127.0.0.1', () => {
      console.log(`Servidor ejecutándose en http://localhost:${testPort}`);
      resolve(testPort);
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Servidor cerrado');
      resolve();
    });
  });
}

// Ejecutar el servidor si se llama directamente a este archivo
if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  stopServer
};
