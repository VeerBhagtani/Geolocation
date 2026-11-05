// Replaces /images/... and /downloads/... paths in dist-single/index.html with data URIs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'dist-single/index.html');
const MIME = { svg: 'image/svg+xml', pdf: 'application/pdf', csv: 'text/csv', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
let html = readFileSync(file, 'utf8');
const cache = {};
let n = 0;
html = html.replace(/\/(?:images|downloads)\/[\w./-]+?\.(svg|pdf|csv|xlsx)(?![\w])/g, (m, ext) => {
  const src = join(root, 'public', m);
  if (!existsSync(src)) return m;
  n++;
  return (cache[m] ||= `data:${MIME[ext]};base64,${readFileSync(src).toString('base64')}`);
});
html = html.replace('href="/favicon.svg"', `href="data:image/svg+xml;base64,${readFileSync(join(root, 'public/favicon.svg')).toString('base64')}"`);
writeFileSync(file, html);
console.log(`Inlined ${n} asset references (${Object.keys(cache).length} files). Size: ${(html.length / 1048576).toFixed(2)} MB`);
