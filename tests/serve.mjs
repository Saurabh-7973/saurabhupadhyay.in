// A static server for the checks: serves ../public the way Cloudflare's
// static assets do for this site (/guidester -> guidester.html, 404.html for
// anything missing). No dependencies.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT ?? 8080);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.xml': 'application/xml',
  '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.webm': 'video/webm', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

async function file(path) {
  try { return (await stat(path)).isFile() ? path : null; } catch { return null; }
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = normalize(url).replace(/^(\.\.[/\\])+/, '');
  const base = join(root, safe);
  const found = (await file(base)) ?? (await file(base + '.html')) ?? (await file(join(base, 'index.html')));
  const path = found ?? join(root, '404.html');
  res.writeHead(found ? 200 : 404, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(await readFile(path));
}).listen(port, () => console.log(`serving public/ on http://127.0.0.1:${port}`));
