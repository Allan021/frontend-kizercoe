// Avisa a Bing (y por Bing, a ChatGPT y Copilot) qué URLs cambiaron, sin
// esperar a que pasen a rastrear. Correr DESPUÉS de desplegar: npm run indexnow
// La llave tiene que estar ya en línea en https://www.kizercode.com/0357771efe37a10a13dadb9bdb8e143e.txt
import { readFileSync } from 'node:fs';

const HOST = 'www.kizercode.com';
const KEY = '0357771efe37a10a13dadb9bdb8e143e';
const urlList = [...readFileSync('dist/sitemap-0.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error('dist/sitemap-0.xml sin URLs: corré npm run build primero');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs → ${res.status} ${res.statusText}`);
if (!res.ok) process.exit(1);
