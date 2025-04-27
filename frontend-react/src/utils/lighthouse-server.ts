import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', '..', 'dist');
const testPort = 3030;

console.log(`Serving static files from: ${distPath}`);

const server = createServer(async (req, res) => {
  try {
    const url = req.url || '/';
    console.log(`Request for: ${url}`);

    let filePath: string;
    if (url === '/' || url === '/index.html') {
      filePath = join(distPath, 'index.html');
    } else if (url.startsWith('/assets/')) {
      filePath = join(distPath, url);
    } else {
      filePath = join(distPath, 'index.html');
    }

    try {
      const content = await readFile(filePath);
      const contentType = getContentType(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        const indexContent = await readFile(join(distPath, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexContent);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const contentTypes: Record<string, string> = {
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

export function startServer(): Promise<number> {
  return new Promise((resolve) => {
    server.listen(testPort, () => {
      console.log(`Simple SPA server running at http://localhost:${testPort}`);
      resolve(testPort);
    });
  });
}

export function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Simple SPA server closed');
      resolve();
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}