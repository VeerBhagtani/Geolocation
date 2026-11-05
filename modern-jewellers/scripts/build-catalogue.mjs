// Generates src/data/products.json and the product/banner SVG artwork in public/images.
// Run: npm run generate:catalogue
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imgDir = join(root, 'public/images/products');
const bannerDir = join(root, 'public/images/banners');
mkdirSync(imgDir, { recursive: true });
mkdirSync(bannerDir, { recursive: true });

/* ----------------------------- SVG artwork ----------------------------- */
const METALS = {
  gold: ['#fff4c7', '#ecc66a', '#c9962f', '#8a6118'],
  rose: ['#ffe6da', '#eab09a', '#c97c63', '#8e4d3a'],
  white: ['#ffffff', '#e4e7ec', '#b5bcc6', '#7d8590'],
  silver: ['#ffffff', '#dfe2e6', '#a9afb8', '#6f767f'],
  oxidised: ['#cfc9c0', '#9a948b', '#6c665e', '#46423c'],
};
const GEMS = {
  diamond: ['#ffffff', '#d6e8fb', '#7fa6cf'],
  ruby: ['#ff9fb5', '#d81b4f', '#7d0b2a'],
  emerald: ['#a6f0c6', '#1e9b5f', '#0b4f2f'],
  sapphire: ['#b8ccff', '#2a4fc2', '#14266b'],
  pearl: ['#ffffff', '#f7efe2', '#dccdb4'],
  moonstone: ['#ffffff', '#dfe8f5', '#b4c0d6'],
  polki: ['#fffbea', '#f1ead2', '#cdbf96'],
  onyx: ['#5a5550', '#2a2622', '#111'],
};
const BGS = [
  ['#fffdf8', '#f6ecd8'],
  ['#fffaf2', '#f1e2c8'],
  ['#fffdf9', '#efe4d4'],
  ['#fffcf5', '#f3e6cf'],
];

let uid = 0;
function defs(metal, gem) {
  const m = METALS[metal];
  const g = GEMS[gem] || GEMS.diamond;
  uid++;
  return {
    id: uid,
    svg: `
    <linearGradient id="m${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${m[0]}"/><stop offset=".35" stop-color="${m[1]}"/>
      <stop offset=".7" stop-color="${m[2]}"/><stop offset="1" stop-color="${m[3]}"/>
    </linearGradient>
    <radialGradient id="mb${uid}" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="${m[0]}"/><stop offset=".45" stop-color="${m[1]}"/><stop offset="1" stop-color="${m[3]}"/>
    </radialGradient>
    <radialGradient id="g${uid}" cx=".35" cy=".3" r=".9">
      <stop offset="0" stop-color="${g[0]}"/><stop offset=".5" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/>
    </radialGradient>
    <radialGradient id="p${uid}" cx=".35" cy=".3" r=".9">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f6eee0"/><stop offset="1" stop-color="#d4c3a6"/>
    </radialGradient>
    <filter id="s${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#6e5236" flood-opacity=".28"/>
    </filter>`,
    M: `url(#m${uid})`,
    MB: `url(#mb${uid})`,
    G: `url(#g${uid})`,
    P: `url(#p${uid})`,
    S: `url(#s${uid})`,
  };
}

const r2 = (n) => Math.round(n * 10) / 10;
function along(cx, cy, rx, ry, a0, a1, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = a0 + ((a1 - a0) * i) / Math.max(1, n - 1);
    pts.push([r2(cx + rx * Math.cos(t)), r2(cy + ry * Math.sin(t)), t]);
  }
  return pts;
}
const bead = (x, y, r, fill) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><circle cx="${r2(x - r * 0.35)}" cy="${r2(y - r * 0.35)}" r="${r2(r * 0.3)}" fill="#fff" opacity=".7"/>`;
function gem(x, y, r, d, shape = 'round') {
  if (shape === 'drop') {
    return `<path d="M${x} ${y - r * 1.4} C ${x + r} ${y - r * 0.2}, ${x + r} ${y + r}, ${x} ${y + r} C ${x - r} ${y + r}, ${x - r} ${y - r * 0.2}, ${x} ${y - r * 1.4}Z" fill="${d.G}" stroke="${d.M}" stroke-width="${r2(r * 0.18)}"/>
      <path d="M${x} ${y - r * 0.9} L ${x + r * 0.45} ${y + r * 0.2} L ${x} ${y + r * 0.75} L ${x - r * 0.45} ${y + r * 0.2}Z" fill="#fff" opacity=".35"/>`;
  }
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const t = (Math.PI / 4) * i + Math.PI / 8;
    pts.push(`${r2(x + r * Math.cos(t))},${r2(y + r * Math.sin(t))}`);
  }
  const inner = [];
  for (let i = 0; i < 8; i++) {
    const t = (Math.PI / 4) * i;
    inner.push(`${r2(x + r * 0.55 * Math.cos(t))},${r2(y + r * 0.55 * Math.sin(t))}`);
  }
  return `<circle cx="${x}" cy="${y}" r="${r2(r * 1.15)}" fill="${d.M}"/>
    <polygon points="${pts.join(' ')}" fill="${d.G}"/>
    <polygon points="${inner.join(' ')}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="${r2(r * 0.06)}"/>
    ${pts.map((p) => `<line x1="${x}" y1="${y}" x2="${p.split(',')[0]}" y2="${p.split(',')[1]}" stroke="#5f7f9f" stroke-opacity=".35" stroke-width="${r2(r * 0.05)}"/>`).join('')}
    <circle cx="${r2(x - r * 0.35)}" cy="${r2(y - r * 0.4)}" r="${r2(r * 0.18)}" fill="#fff" opacity=".85"/>`;
}
const sparkle = (x, y, s) =>
  `<path d="M${x} ${y - s} L${x + s * 0.2} ${y - s * 0.2} L${x + s} ${y} L${x + s * 0.2} ${y + s * 0.2} L${x} ${y + s} L${x - s * 0.2} ${y + s * 0.2} L${x - s} ${y} L${x - s * 0.2} ${y - s * 0.2}Z" fill="#fff" opacity=".9"/>`;

const SHAPES = {
  ring(d, o) {
    const band = `<ellipse cx="400" cy="470" rx="170" ry="150" fill="none" stroke="${d.M}" stroke-width="${o.thin ? 22 : 34}"/>
      <ellipse cx="400" cy="470" rx="170" ry="150" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" transform="translate(-6 -8)"/>`;
    let top = '';
    if (o.style === 'band') {
      top = along(400, 470, 170, 150, Math.PI * 1.05, Math.PI * 1.95, 13).map(([x, y]) => gem(x, y, 11, d)).join('');
    } else if (o.style === 'filigree') {
      top = `<path d="M300 330 Q400 240 500 330 Q400 300 300 330Z" fill="${d.M}"/>` +
        along(400, 315, 70, 30, Math.PI, Math.PI * 2, 7).map(([x, y]) => bead(x, y, 9, d.MB)).join('') +
        `<circle cx="400" cy="300" r="30" fill="${d.MB}"/><circle cx="400" cy="300" r="14" fill="${d.M}"/>`;
    } else if (o.style === 'cocktail') {
      top = `<ellipse cx="400" cy="300" rx="110" ry="62" fill="${d.MB}"/>` +
        along(400, 300, 95, 50, 0, Math.PI * 2, 14).map(([x, y]) => bead(x, y, 9, d.MB)).join('') + gem(400, 295, 42, d);
    } else {
      top = `<path d="M370 330 L380 270 M430 330 L420 270 M360 300 L440 300" stroke="${d.M}" stroke-width="10" stroke-linecap="round"/>`;
      if (o.style === 'halo') top += along(400, 270, 62, 62, 0, Math.PI * 2, 16).map(([x, y]) => gem(x, y, 9, d)).join('');
      top += gem(400, 270, o.style === 'halo' ? 42 : 52, d);
    }
    return `<g filter="${d.S}">${band}${top}</g>`;
  },
  pendant(d, o) {
    const chain = along(400, 180, 230, 330, 0.12 * Math.PI, 0.88 * Math.PI, 46)
      .map(([x, y, t]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.5" fill="none" stroke="${d.M}" stroke-width="3" transform="rotate(${r2((t * 180) / Math.PI + 90)} ${x} ${y})"/>`)
      .join('');
    let p = '';
    if (o.style === 'bar') p = `<rect x="330" y="505" width="140" height="22" rx="11" fill="${d.MB}"/>`;
    else if (o.style === 'crescent') p = `<path d="M400 520 a70 70 0 1 0 0.1 0 Z" fill="none"/><path d="M350 540 A70 70 0 1 0 460 520 A55 55 0 1 1 350 540Z" fill="${d.MB}"/>` + gem(410, 580, 20, d);
    else p = `<circle cx="400" cy="518" r="12" fill="${d.MB}"/>` + gem(400, 580, 46, d, o.drop ? 'drop' : 'round');
    return `<g filter="${d.S}">${chain}${p}</g>`;
  },
  haar(d, o) {
    let g = '';
    const layers = o.layers || 3;
    for (let l = 0; l < layers; l++) {
      const pts = along(400, 150, 210 + l * 32, 290 + l * 50, 0.14 * Math.PI, 0.86 * Math.PI, 26 + l * 4);
      g += pts.map(([x, y]) => bead(x, y, o.coins ? 15 : 9 + l, o.coins && l === layers - 1 ? d.MB : d.MB)).join('');
      if (o.drops && l === layers - 1)
        g += pts.filter((_, i) => i % 3 === 1).map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 28}" stroke="${d.M}" stroke-width="3"/>${bead(x, y + 36, 9, d.P)}`).join('');
      if (o.coins && l === layers - 1)
        g += pts.filter((_, i) => i % 2 === 0).map(([x, y]) => `<circle cx="${x}" cy="${y + 30}" r="20" fill="${d.MB}" stroke="${d.M}" stroke-width="3"/><circle cx="${x}" cy="${y + 30}" r="11" fill="none" stroke="#fff" stroke-opacity=".5"/>`).join('');
    }
    g += `<path d="M340 560 Q400 520 460 560 L430 640 Q400 670 370 640Z" fill="${d.MB}" stroke="${d.M}" stroke-width="4"/>` + gem(400, 590, 30, d);
    if (o.stones) g += along(400, 150, 210, 290, 0.25 * Math.PI, 0.75 * Math.PI, 9).map(([x, y]) => gem(x, y + 4, 14, d)).join('');
    return `<g filter="${d.S}">${g}</g>`;
  },
  riviere(d) {
    const pts = along(400, 160, 230, 360, 0.12 * Math.PI, 0.88 * Math.PI, 30);
    return `<g filter="${d.S}">${pts.map(([x, y], i) => gem(x, y, 10 + Math.sin((i / 29) * Math.PI) * 10, d)).join('')}${gem(400, 560, 38, d, 'drop')}</g>`;
  },
  jhumka(d, o) {
    const one = (cx) => {
      let s = `<circle cx="${cx}" cy="230" r="30" fill="${d.MB}"/>${gem(cx, 230, 16, d)}`;
      s += `<line x1="${cx}" y1="262" x2="${cx}" y2="300" stroke="${d.M}" stroke-width="5"/>`;
      if (o.style === 'chandbali') {
        s += `<path d="M${cx - 95} 330 A95 95 0 0 0 ${cx + 95} 330 A140 140 0 0 1 ${cx - 95} 330Z" fill="${d.MB}" stroke="${d.M}" stroke-width="3" transform="translate(0 30)"/>`;
        s += along(cx, 360, 92, 92, 0.05 * Math.PI, 0.95 * Math.PI, 13).map(([x, y]) => bead(x, y + 18, 9, d.P)).join('');
      } else {
        s += `<path d="M${cx - 85} 450 Q${cx - 80} 300 ${cx} 300 Q${cx + 80} 300 ${cx + 85} 450Z" fill="${d.MB}" stroke="${d.M}" stroke-width="3"/>`;
        s += along(cx, 400, 70, 30, Math.PI, 2 * Math.PI, 9).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity=".5"/>`).join('');
        s += along(cx, 450, 85, 6, 0, Math.PI, 11).map(([x]) => bead(x, 470, 9, d.P)).join('');
      }
      return s;
    };
    return `<g filter="${d.S}">${one(260)}${one(540)}</g>`;
  },
  studs(d) {
    return `<g filter="${d.S}">${gem(270, 400, 70, d)}${gem(530, 400, 70, d)}${sparkle(330, 330, 18)}${sparkle(590, 330, 18)}</g>`;
  },
  hoops(d) {
    return `<g filter="${d.S}"><circle cx="270" cy="420" r="120" fill="none" stroke="${d.M}" stroke-width="18"/><circle cx="530" cy="420" r="120" fill="none" stroke="${d.M}" stroke-width="18"/></g>`;
  },
  drops(d) {
    const one = (cx) => `${gem(cx, 230, 26, d)}<line x1="${cx}" y1="258" x2="${cx}" y2="380" stroke="${d.M}" stroke-width="5"/>` +
      along(cx, 300, 2, 60, -Math.PI / 2, Math.PI / 2, 4).map(([, y]) => gem(cx, y + 20, 10, d)).join('') + gem(cx, 450, 52, d, 'drop');
    return `<g filter="${d.S}">${one(280)}${one(520)}</g>`;
  },
  bracelet(d, o) {
    const pts = along(400, 420, 230, 150, 0, Math.PI * 2, o.tennis ? 34 : 24);
    const items = pts.map(([x, y, t]) =>
      o.tennis ? gem(x, y, 13, d) : `<ellipse cx="${x}" cy="${y}" rx="20" ry="12" fill="none" stroke="${d.M}" stroke-width="8" transform="rotate(${r2((t * 180) / Math.PI + 90)} ${x} ${y})"/>`).join('');
    const charms = o.charms ? pts.filter((_, i) => i % 4 === 0 && pts[i][1] > 420).map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 34}" stroke="${d.M}" stroke-width="3"/>${gem(x, y + 50, 14, d)}`).join('') : '';
    return `<g filter="${d.S}">${items}${charms}</g>`;
  },
  bangle(d, o) {
    const n = o.count || 2;
    let g = '';
    for (let i = 0; i < n; i++) {
      const y = 360 + i * (o.thick ? 0 : 44) - (n - 1) * 20;
      g += `<ellipse cx="400" cy="${y + 60}" rx="250" ry="120" fill="none" stroke="${d.M}" stroke-width="${o.thick ? 56 : 24}"/>`;
      if (o.carved) g += along(400, y + 60, 250, 120, 0.05 * Math.PI, 0.95 * Math.PI, 18).map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="${o.thick ? 11 : 5}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>`).join('');
      if (o.stones) g += along(400, y + 60, 250, 120, 0.08 * Math.PI, 0.92 * Math.PI, 15).map(([x, yy]) => gem(x, yy, o.thick ? 13 : 8, d)).join('');
    }
    return `<g filter="${d.S}">${g}</g>`;
  },
  mangalsutra(d, o) {
    const pts = along(400, 170, 220, 340, 0.12 * Math.PI, 0.88 * Math.PI, 52);
    const chain = pts.map(([x, y], i) => bead(x, y, i % 6 === 0 ? 8 : 6, i % 6 === 0 ? d.MB : '#26211d')).join('');
    let p = `<circle cx="400" cy="520" r="10" fill="${d.MB}"/>`;
    if (o.style === 'vati') p += `<path d="M330 540 a38 38 0 0 0 70 0Z M400 540 a38 38 0 0 0 70 0Z" fill="${d.MB}" stroke="${d.M}" stroke-width="3"/>`;
    else p += `<path d="M400 535 L455 590 L400 650 L345 590Z" fill="${d.MB}" stroke="${d.M}" stroke-width="3"/>${gem(400, 592, 22, d)}`;
    return `<g filter="${d.S}">${chain}${p}</g>`;
  },
  braceletMangalsutra(d) {
    const pts = along(400, 420, 230, 140, 0, Math.PI * 2, 40);
    return `<g filter="${d.S}">${pts.map(([x, y], i) => bead(x, y, 8, i % 5 === 0 ? d.MB : '#26211d')).join('')}${gem(400, 560, 26, d)}</g>`;
  },
  bridal(d, o) {
    const neck = SHAPES.haar(d, { layers: 3, drops: true, stones: true }).replace(/<g filter="[^"]+">|<\/g>$/g, '');
    const ear = (cx) => `${gem(cx, 520, 18, d)}<path d="M${cx - 40} 600 Q${cx} 540 ${cx + 40} 600Z" fill="${d.MB}"/>${bead(cx - 30, 615, 7, d.P)}${bead(cx, 620, 7, d.P)}${bead(cx + 30, 615, 7, d.P)}`;
    return `<g filter="${d.S}"><g transform="translate(400 380) scale(.82) translate(-400 -400)">${neck}</g>${ear(110)}${ear(690)}</g>`;
  },
  tikka(d) {
    return `<g filter="${d.S}"><path d="M400 90 L400 340" stroke="${d.M}" stroke-width="5"/>${along(400, 90, 1, 250, 0, Math.PI / 2, 8).map(([, y]) => bead(400, y, 6, d.MB)).join('')}
      <circle cx="400" cy="440" r="95" fill="${d.MB}" stroke="${d.M}" stroke-width="5"/>${along(400, 440, 80, 80, 0, Math.PI * 2, 16).map(([x, y]) => gem(x, y, 9, d)).join('')}${gem(400, 440, 40, d)}
      ${along(400, 540, 70, 10, 0.1 * Math.PI, 0.9 * Math.PI, 7).map(([x, y]) => bead(x, y + 20, 10, d.P)).join('')}</g>`;
  },
  cufflinks(d) {
    const one = (x) => `<rect x="${x - 85}" y="315" width="170" height="170" rx="26" fill="${d.MB}" stroke="${d.M}" stroke-width="8"/><rect x="${x - 55}" y="345" width="110" height="110" rx="14" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>${gem(x, 400, 26, d)}`;
    return `<g filter="${d.S}">${one(270)}${one(530)}</g>`;
  },
  brooch(d) {
    let g = along(400, 430, 220, 220, Math.PI * 1.05, Math.PI * 1.95, 9).map(([x, y]) =>
      `<line x1="400" y1="470" x2="${x}" y2="${y}" stroke="${d.M}" stroke-width="5"/><ellipse cx="${x}" cy="${y}" rx="30" ry="42" fill="${d.MB}"/>${gem(x, y, 16, d)}`).join('');
    g += `<ellipse cx="400" cy="520" rx="40" ry="70" fill="${d.MB}"/><circle cx="400" cy="440" r="30" fill="${d.MB}"/>${gem(400, 520, 22, d)}`;
    return `<g filter="${d.S}">${g}</g>`;
  },
  anklet(d) {
    const one = (cy) => along(400, cy, 280, 70, 0, Math.PI, 26).map(([x, y], i) =>
      `<ellipse cx="${x}" cy="${y}" rx="12" ry="7" fill="none" stroke="${d.M}" stroke-width="4"/>${i % 3 === 0 ? `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="${d.M}" stroke-width="2"/>${bead(x, y + 30, 9, d.MB)}` : ''}`).join('');
    return `<g filter="${d.S}">${one(280)}${one(420)}</g>`;
  },
  nosepin(d) {
    const petals = along(400, 400, 70, 70, 0, Math.PI * 2, 7).slice(0, 6).map(([x, y]) => gem(x, y, 32, d)).join('');
    return `<g filter="${d.S}"><circle cx="400" cy="400" r="110" fill="${d.MB}" opacity=".9"/>${petals}${gem(400, 400, 34, d)}</g>`;
  },
};

function renderSVG({ shape, metal, gem: gemName, opts = {} }, bgIndex = 0, label = '') {
  const d = defs(metal, gemName);
  const bg = BGS[bgIndex % BGS.length];
  const body = SHAPES[shape](d, opts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${label}">
  <defs>${d.svg}
    <radialGradient id="bg${d.id}" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg${d.id})"/>
  <ellipse cx="400" cy="720" rx="260" ry="26" fill="#8b6a48" opacity=".08"/>
  ${body}
  ${sparkle(640, 150, 12)}${sparkle(160, 640, 9)}
  <text x="400" y="770" text-anchor="middle" font-family="Georgia, serif" font-size="16" letter-spacing="6" fill="#a8865f" opacity=".55">MODERN JEWELLERS</text>
</svg>`;
}

/* ------------------------------- Products ------------------------------- */
// [id, name, category, metalGroup, material, purity, weight(g), price, mrp, stock, rating, reviews, popularity, added, collections, occasion, tags, art, description]
const P = [
  ['MJ-GR-1001', 'Aarohi Filigree Gold Ring', 'Rings', 'Gold', '22K Yellow Gold', '22K (916)', 4.2, 31450, 33900, 18, 4.7, 124, 88, '2026-06-14', ['everyday', 'festival'], 'Daily Wear', ['bestseller'],
    { shape: 'ring', metal: 'gold', gem: 'polki', opts: { style: 'filigree' } },
    'Hand-finished filigree scrolls inspired by Rajasthani jharokhas crown this lightweight 22K gold ring. Comfortable enough for every day, refined enough for every celebration.'],
  ['MJ-GR-1002', 'Padmini Lotus Ruby Cocktail Ring', 'Rings', 'Gold', '22K Yellow Gold with Burmese-style Ruby', '22K (916)', 6.85, 54800, 58200, 7, 4.8, 61, 74, '2026-08-02', ['royal', 'festival'], 'Festive', ['offer'],
    { shape: 'ring', metal: 'gold', gem: 'ruby', opts: { style: 'cocktail' } },
    'A blooming lotus of beaded gold cradles a deep crimson ruby at its heart. A statement cocktail ring designed for sangeet nights and grand evenings.'],
  ['MJ-GR-1003', 'Ira Everyday Gold Band', 'Rings', 'Gold', '18K Yellow Gold', '18K (750)', 2.4, 16900, 16900, 42, 4.6, 208, 92, '2026-03-21', ['everyday'], 'Daily Wear', ['bestseller'],
    { shape: 'ring', metal: 'gold', gem: 'diamond', opts: { style: 'band', thin: true } },
    'A slim, high-polish band with a whisper of micro-set accents. Stack it, gift it, wear it forever.'],
  ['MJ-DR-1004', 'Celestia Solitaire Diamond Ring', 'Rings', 'Diamond', '18K White Gold with 0.75 ct Solitaire', '18K (750)', 3.9, 148500, 156000, 5, 4.9, 87, 96, '2026-09-10', ['bridal', 'limited'], 'Bridal', ['bestseller', 'new'],
    { shape: 'ring', metal: 'white', gem: 'diamond', opts: {} },
    'An IGI-certified 0.75 carat round brilliant solitaire (F colour, VVS1) set in a four-prong 18K white gold crown. The engagement ring she has always imagined.'],
  ['MJ-DR-1005', 'Nakshatra Halo Diamond Ring', 'Rings', 'Diamond', '18K Rose Gold with Diamonds', '18K (750)', 4.1, 86200, 92500, 9, 4.7, 54, 81, '2026-10-01', ['everyday', 'limited'], 'Daily Wear', ['new', 'offer'],
    { shape: 'ring', metal: 'rose', gem: 'diamond', opts: { style: 'halo' } },
    'A constellation of sixteen brilliant-cut diamonds encircles a luminous centre stone, set in blush-toned 18K rose gold.'],
  ['MJ-DR-1006', 'Anant Eternity Pavé Band', 'Rings', 'Diamond', '18K White Gold with Pavé Diamonds', '18K (750)', 3.3, 72400, 72400, 12, 4.8, 73, 79, '2026-05-18', ['bridal', 'everyday'], 'Bridal', [],
    { shape: 'ring', metal: 'white', gem: 'diamond', opts: { style: 'band' } },
    'Thirteen hand-matched diamonds run the length of this eternity band — a symbol of anant (infinite) love.'],
  ['MJ-SR-1007', 'Chandra Moonstone Silver Ring', 'Rings', 'Silver', '925 Sterling Silver with Rainbow Moonstone', '92.5% Silver', 5.6, 3450, 3950, 35, 4.5, 142, 70, '2026-07-07', ['everyday'], 'Daily Wear', ['offer'],
    { shape: 'ring', metal: 'silver', gem: 'moonstone', opts: {} },
    'A softly glowing rainbow moonstone set in rhodium-plated sterling silver. Dreamy, minimal and made for daily wear.'],

  ['MJ-GN-2001', 'Rani Haar Temple Necklace', 'Necklaces', 'Gold', '22K Yellow Gold with Pearls', '22K (916)', 48.6, 412000, 438000, 3, 4.9, 39, 90, '2026-02-11', ['royal', 'bridal'], 'Bridal', ['bestseller'],
    { shape: 'haar', metal: 'gold', gem: 'ruby', opts: { layers: 3, drops: true } },
    'Three cascading strands of hand-beaded 22K gold, finished with a temple-motif pendant and freshwater pearl drops. A true heirloom of South Indian temple artistry.'],
  ['MJ-GN-2002', 'Meera Kundan Polki Choker', 'Necklaces', 'Gold', '22K Gold with Uncut Polki & Kundan', '22K (916)', 38.2, 235000, 249000, 4, 4.8, 44, 85, '2026-08-25', ['royal', 'festival'], 'Festive', ['offer'],
    { shape: 'haar', metal: 'gold', gem: 'polki', opts: { layers: 2, stones: true, drops: true } },
    'Uncut polki diamonds are hand-set in pure gold foil using the centuries-old kundan technique. A regal choker for the modern maharani.'],
  ['MJ-GN-2003', 'Swarna Lakshmi Coin Necklace', 'Necklaces', 'Gold', '22K Yellow Gold', '22K (916)', 32.4, 186500, 186500, 6, 4.7, 52, 77, '2026-04-09', ['festival', 'royal'], 'Festive', [],
    { shape: 'haar', metal: 'gold', gem: 'ruby', opts: { layers: 2, coins: true } },
    'Antique-finish Lakshmi coins strung on a beaded gold chain — the classic kasu mala, reimagined for today.'],
  ['MJ-DN-2004', 'Aurora Diamond Rivière Necklace', 'Necklaces', 'Diamond', '18K White Gold with 6.2 ct Diamonds', '18K (750)', 22.8, 565000, 565000, 2, 5.0, 18, 83, '2026-10-12', ['limited', 'royal'], 'Bridal', ['new'],
    { shape: 'riviere', metal: 'white', gem: 'diamond' },
    'A graduated river of 31 brilliant diamonds, culminating in a pear-shaped drop. Limited to twelve pieces worldwide.'],
  ['MJ-DN-2005', 'Tara Diamond Pendant Necklace', 'Necklaces', 'Diamond', '18K Yellow Gold with Diamond', '18K (750)', 3.2, 48900, 52900, 21, 4.8, 167, 94, '2026-09-02', ['everyday'], 'Daily Wear', ['bestseller', 'new', 'offer'],
    { shape: 'pendant', metal: 'gold', gem: 'diamond', opts: {} },
    'A single star-bright diamond suspended on a delicate cable chain. Effortless elegance from desk to dinner.'],
  ['MJ-SN-2006', 'Noor Sterling Silver Crescent Pendant', 'Necklaces', 'Silver', '925 Sterling Silver with Cubic Zirconia', '92.5% Silver', 6.1, 4250, 4250, 28, 4.6, 96, 68, '2026-07-19', ['everyday', 'festival'], 'Daily Wear', [],
    { shape: 'pendant', metal: 'silver', gem: 'moonstone', opts: { style: 'crescent' } },
    'A luminous crescent moon in polished sterling silver, inspired by the Noor — the light — that guides every [[heirloom]] we craft.'],
  ['MJ-SN-2007', 'Ganga Oxidised Silver Necklace', 'Necklaces', 'Silver', 'Oxidised 925 Sterling Silver', '92.5% Silver', 42.0, 6800, 7900, 15, 4.5, 81, 62, '2026-06-30', ['festival'], 'Festive', ['offer'],
    { shape: 'haar', metal: 'oxidised', gem: 'onyx', opts: { layers: 2, drops: true } },
    'Tribal-inspired oxidised silver with ghungroo drops — pairs beautifully with handloom sarees and kurtas.'],
  ['MJ-GN-2008', 'Lekha Gold Bar Chain', 'Necklaces', 'Gold', '18K Yellow Gold', '18K (750)', 3.6, 21300, 21300, 0, 4.4, 58, 60, '2026-05-05', ['everyday'], 'Daily Wear', [],
    { shape: 'pendant', metal: 'gold', gem: 'diamond', opts: { style: 'bar' } },
    'A minimalist horizontal bar on a fine 18K chain — personalise it with up to eight engraved letters.'],

  ['MJ-GE-3001', 'Rajwadi Gold Jhumkas', 'Earrings', 'Gold', '22K Yellow Gold with Pearls', '22K (916)', 18.4, 78400, 82600, 11, 4.8, 133, 91, '2026-08-18', ['festival', 'royal'], 'Festive', ['bestseller', 'offer'],
    { shape: 'jhumka', metal: 'gold', gem: 'ruby', opts: {} },
    'Dome-shaped jhumkas with granulated detailing and dancing pearl fringes — every movement sounds like a celebration.'],
  ['MJ-DE-3002', 'Solitaire Diamond Studs', 'Earrings', 'Diamond', '18K White Gold with 0.50 ct tw Diamonds', '18K (750)', 1.8, 96000, 96000, 14, 4.9, 112, 89, '2026-04-27', ['everyday', 'bridal'], 'Daily Wear', ['bestseller'],
    { shape: 'studs', metal: 'white', gem: 'diamond' },
    'A perfectly matched pair of brilliant-cut diamonds in secure screw-back settings. The forever essential.'],
  ['MJ-GE-3003', 'Chandbali Pearl Earrings', 'Earrings', 'Gold', '22K Gold with Pearls & Kundan', '22K (916)', 16.2, 64200, 64200, 8, 4.7, 47, 72, '2026-10-20', ['bridal', 'festival'], 'Bridal', ['new'],
    { shape: 'jhumka', metal: 'gold', gem: 'emerald', opts: { style: 'chandbali' } },
    'Moon-shaped chandbalis with a kundan-set emerald stud and a fringe of seed pearls, inspired by Hyderabadi heritage.'],
  ['MJ-SE-3004', 'Mira Silver Hoop Earrings', 'Earrings', 'Silver', '925 Sterling Silver', '92.5% Silver', 4.4, 2950, 3450, 50, 4.4, 214, 75, '2026-03-02', ['everyday'], 'Daily Wear', ['offer'],
    { shape: 'hoops', metal: 'silver', gem: 'diamond' },
    'Lightweight, high-shine hoops in hypoallergenic sterling silver — your everyday finishing touch.'],
  ['MJ-DE-3005', 'Ayra Diamond Drop Earrings', 'Earrings', 'Diamond', '18K White Gold with Diamonds', '18K (750)', 5.2, 112800, 119500, 6, 4.8, 33, 70, '2026-10-28', ['limited', 'bridal'], 'Bridal', ['new', 'offer'],
    { shape: 'drops', metal: 'white', gem: 'diamond' },
    'Graduated diamonds descend into a pear-cut drop that catches light with every turn of the head.'],

  ['MJ-GB-4001', 'Kaveri Gold Link Bracelet', 'Bracelets', 'Gold', '22K Yellow Gold', '22K (916)', 16.8, 92600, 92600, 10, 4.6, 64, 73, '2026-05-26', ['everyday', 'royal'], 'Daily Wear', [],
    { shape: 'bracelet', metal: 'gold', gem: 'diamond', opts: {} },
    'Fluid interlocking links in high-polish 22K gold with a secure box clasp. Substantial, yet supple.'],
  ['MJ-DB-4002', 'Lumière Diamond Tennis Bracelet', 'Bracelets', 'Diamond', '18K White Gold with 3.4 ct Diamonds', '18K (750)', 11.2, 248000, 262000, 3, 4.9, 29, 80, '2026-09-21', ['limited', 'bridal'], 'Bridal', ['new', 'offer'],
    { shape: 'bracelet', metal: 'white', gem: 'diamond', opts: { tennis: true } },
    'A continuous line of 34 hand-matched diamonds in a classic four-prong tennis setting with a double safety lock.'],
  ['MJ-SB-4003', 'Charm Story Silver Bracelet', 'Bracelets', 'Silver', '925 Sterling Silver with Enamel Charms', '92.5% Silver', 9.6, 5400, 5400, 24, 4.5, 77, 66, '2026-07-28', ['everyday'], 'Daily Wear', [],
    { shape: 'bracelet', metal: 'silver', gem: 'sapphire', opts: { charms: true } },
    'A sterling silver chain with hand-enamelled charms — add a new chapter to her story every year.'],
  ['MJ-GB-4004', 'Rosé Delicate Chain Bracelet', 'Bracelets', 'Gold', '18K Rose Gold', '18K (750)', 3.1, 28900, 31200, 2, 4.6, 91, 78, '2026-08-08', ['everyday'], 'Daily Wear', ['offer'],
    { shape: 'bracelet', metal: 'rose', gem: 'diamond', opts: {} },
    'A whisper-light rose gold chain bracelet with an adjustable slider. The perfect gift, beautifully boxed.'],

  ['MJ-GG-5001', 'Maharani Carved Gold Bangles (Pair)', 'Bangles', 'Gold', '22K Yellow Gold', '22K (916)', 46.0, 296000, 296000, 4, 4.9, 41, 87, '2026-02-26', ['bridal', 'royal'], 'Bridal', ['bestseller'],
    { shape: 'bangle', metal: 'gold', gem: 'ruby', opts: { count: 2, carved: true } },
    'A pair of hand-engraved 22K gold bangles featuring peacock and paisley motifs by master karigars of Kolkata.'],
  ['MJ-GG-5002', 'Shahi Antique Gold Kada', 'Bangles', 'Gold', '22K Antique Gold with Rubies', '22K (916)', 28.5, 124500, 131000, 5, 4.7, 36, 69, '2026-06-03', ['royal', 'festival'], 'Festive', ['offer'],
    { shape: 'bangle', metal: 'gold', gem: 'ruby', opts: { count: 1, thick: true, stones: true } },
    'A bold, openable kada with an antique nakashi finish and ruby accents — fit for royalty.'],
  ['MJ-DG-5003', 'Zoya Diamond Studded Bangle', 'Bangles', 'Diamond', '18K Yellow Gold with 2.1 ct Diamonds', '18K (750)', 21.4, 318000, 318000, 3, 4.8, 22, 71, '2026-10-15', ['limited', 'royal'], 'Bridal', ['new'],
    { shape: 'bangle', metal: 'gold', gem: 'diamond', opts: { count: 1, thick: true, stones: true } },
    'Fifteen bezel-set diamonds orbit this sculptural 18K gold bangle — modern architecture for the wrist.'],
  ['MJ-SG-5004', 'Tarini Silver Bangles (Set of 4)', 'Bangles', 'Silver', '925 Sterling Silver', '92.5% Silver', 38.0, 7900, 8900, 19, 4.5, 59, 64, '2026-04-14', ['everyday', 'festival'], 'Daily Wear', ['offer'],
    { shape: 'bangle', metal: 'silver', gem: 'diamond', opts: { count: 4, carved: true } },
    'Four slim textured sterling silver bangles to stack, mix and jingle through your day.'],
  ['MJ-GG-5005', 'Nitya Slim Gold Bangles (Pair)', 'Bangles', 'Gold', '22K Yellow Gold', '22K (916)', 12.6, 68700, 68700, 16, 4.7, 118, 86, '2026-09-29', ['everyday'], 'Daily Wear', ['bestseller', 'new'],
    { shape: 'bangle', metal: 'gold', gem: 'diamond', opts: { count: 2 } },
    'Featherweight 22K gold bangles with a diamond-cut sparkle finish — designed for a lifetime of daily wear.'],

  ['MJ-MS-6001', 'Saubhagya Diamond Mangalsutra', 'Mangalsutra', 'Diamond', '18K Yellow Gold with Diamonds & Black Beads', '18K (750)', 8.4, 74600, 79800, 13, 4.8, 156, 93, '2026-07-12', ['bridal', 'everyday'], 'Bridal', ['bestseller', 'offer'],
    { shape: 'mangalsutra', metal: 'gold', gem: 'diamond', opts: {} },
    'A contemporary diamond pendant on a double strand of black beads and gold — tradition you can wear every day.'],
  ['MJ-MS-6002', 'Parampara Vati Mangalsutra', 'Mangalsutra', 'Gold', '22K Yellow Gold with Black Beads', '22K (916)', 11.2, 58300, 58300, 9, 4.7, 102, 76, '2026-03-15', ['bridal'], 'Bridal', [],
    { shape: 'mangalsutra', metal: 'gold', gem: 'diamond', opts: { style: 'vati' } },
    'The classic Maharashtrian twin-vati pendant on a traditional black bead chain, crafted in 22K gold.'],
  ['MJ-MS-6003', 'Sutra Minimal Bracelet Mangalsutra', 'Mangalsutra', 'Gold', '18K Yellow Gold with Black Beads & Diamond', '18K (750)', 3.8, 26400, 26400, 22, 4.6, 88, 82, '2026-10-05', ['everyday'], 'Daily Wear', ['new'],
    { shape: 'braceletMangalsutra', metal: 'gold', gem: 'diamond' },
    'A modern bracelet-style mangalsutra with a single diamond — for brides who love minimalism.'],

  ['MJ-BS-7001', 'Shubh Vivaah Polki Bridal Set', 'Bridal Sets', 'Gold', '22K Gold with Polki, Rubies & Emeralds', '22K (916)', 142.0, 875000, 875000, 2, 5.0, 16, 84, '2026-01-30', ['bridal', 'royal', 'limited'], 'Bridal', ['bestseller'],
    { shape: 'bridal', metal: 'gold', gem: 'polki' },
    'Our signature bridal ensemble: a layered polki necklace with matching earrings, set with rubies and emeralds. Eighteen months in the making.'],
  ['MJ-BS-7002', 'Gulnaar Diamond Bridal Set', 'Bridal Sets', 'Diamond', '18K White Gold with 14 ct Diamonds', '18K (750)', 96.0, 1140000, 1185000, 1, 4.9, 9, 67, '2026-10-24', ['bridal', 'limited'], 'Bridal', ['new', 'offer'],
    { shape: 'bridal', metal: 'white', gem: 'diamond' },
    'A breathtaking diamond necklace and earring suite for the reception — 14 carats of pure brilliance.'],
  ['MJ-BS-7003', 'Kesar Temple Bridal Set', 'Bridal Sets', 'Gold', '22K Temple Gold with Rubies', '22K (916)', 118.0, 620000, 649000, 3, 4.8, 21, 73, '2026-05-12', ['bridal', 'festival'], 'Bridal', ['offer'],
    { shape: 'bridal', metal: 'gold', gem: 'ruby' },
    'Goddess Lakshmi motifs, ruby cabochons and pearl drops in a complete South Indian temple bridal set.'],

  ['MJ-AC-8001', 'Sitara Kundan Maang Tikka', 'Accessories', 'Gold', '22K Gold with Kundan & Pearls', '22K (916)', 9.8, 38600, 41200, 10, 4.7, 49, 71, '2026-09-14', ['bridal', 'festival'], 'Bridal', ['offer'],
    { shape: 'tikka', metal: 'gold', gem: 'polki' },
    'A radiant kundan sun with seed-pearl fringe — the crowning glory of every bridal look.'],
  ['MJ-AC-8002', 'Heritage Gold Cufflinks', 'Accessories', 'Gold', '22K Yellow Gold with Onyx', '22K (916)', 12.4, 42000, 42000, 8, 4.6, 27, 58, '2026-06-21', ['royal'], 'Festive', [],
    { shape: 'cufflinks', metal: 'gold', gem: 'onyx' },
    'Square 22K gold cufflinks inlaid with black onyx — the groom\'s finest detail.'],
  ['MJ-AC-8003', 'Mayura Peacock Diamond Brooch', 'Accessories', 'Diamond', '18K Gold with Diamonds & Emeralds', '18K (750)', 14.6, 135000, 135000, 2, 4.9, 12, 63, '2026-10-30', ['limited', 'royal'], 'Festive', ['new'],
    { shape: 'brooch', metal: 'gold', gem: 'emerald' },
    'A fanned peacock tail of emeralds and diamonds — wear it on a sherwani, saree pallu or blazer lapel.'],
  ['MJ-AC-8004', 'Ghungroo Silver Payal (Pair)', 'Accessories', 'Silver', '925 Sterling Silver', '92.5% Silver', 28.0, 4800, 5200, 30, 4.6, 134, 74, '2026-08-11', ['everyday', 'festival'], 'Daily Wear', ['offer'],
    { shape: 'anklet', metal: 'silver', gem: 'diamond' },
    'Traditional sterling silver anklets with soft-chime ghungroos — a gentle melody with every step.'],
  ['MJ-AC-8005', 'Phool Diamond Nose Pin', 'Accessories', 'Diamond', '18K Gold with Diamonds', '18K (750)', 0.6, 12600, 12600, 40, 4.7, 189, 85, '2026-09-25', ['everyday'], 'Daily Wear', ['bestseller', 'new'],
    { shape: 'nosepin', metal: 'gold', gem: 'diamond' },
    'A tiny diamond flower in 18K gold with a secure screw back. Small in size, big on sparkle.'],
];

const HIDDEN = [
  ['MJ-VX-9001', 'Noor-e-Kohinoor Heritage Choker', 'Necklaces', 'Diamond', '22K Gold with Old-Mine Diamonds & Basra Pearls', '22K (916)', 182.0, 4800000, 4800000, 1, 5.0, 3, 99, '2026-11-01', ['royal', 'limited'], 'Bridal', ['vault'],
    { shape: 'haar', metal: 'gold', gem: 'diamond', opts: { layers: 4, stones: true, drops: true } },
    'An unlisted museum-grade choker recreated from a 19th-century Nizami design. Viewing by private appointment only at our Mumbai flagship.', ['kohinoor', 'noor-e-kohinoor']],
  ['MJ-VX-9002', 'Midnight Basra Pearl Rani Haar', 'Necklaces', 'Gold', '22K Gold with Natural Basra Pearls', '22K (916)', 156.0, 2250000, 2250000, 1, 5.0, 2, 97, '2026-10-18', ['royal', 'limited'], 'Bridal', ['vault'],
    { shape: 'haar', metal: 'gold', gem: 'pearl', opts: { layers: 4, drops: true } },
    'Five hundred natural Basra pearls in four graduated strands, clasped with a polki-set gold medallion. Never displayed in stores.', []],
  ['MJ-VX-9003', 'Imperial Emerald Polki Kada', 'Bangles', 'Gold', '22K Gold with Colombian Emeralds & Polki', '22K (916)', 64.0, 1680000, 1680000, 1, 5.0, 1, 95, '2026-10-22', ['royal', 'limited'], 'Bridal', ['vault'],
    { shape: 'bangle', metal: 'gold', gem: 'emerald', opts: { count: 1, thick: true, stones: true } },
    'A single imperial kada set with fifteen Colombian emeralds — commissioned for a private collector and offered only by reference code.', []],
];

const slug = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function specs(p) {
  const [, , category, metalGroup, material, purity, weight] = p;
  const stone = /Diamond|diamond/.test(material) ? 'Natural Diamonds (EF colour, VVS–VS clarity)' :
    /Ruby/.test(material) ? 'Natural Rubies' : /Emerald/.test(material) ? 'Natural Emeralds' :
    /Polki|Kundan/.test(material) ? 'Uncut Polki / Kundan' : /Pearl/.test(material) ? 'Freshwater / Basra Pearls' :
    /Moonstone/.test(material) ? 'Rainbow Moonstone' : /Onyx/.test(material) ? 'Black Onyx' : /Zirconia/.test(material) ? 'Cubic Zirconia' : 'None';
  return {
    'Metal': material.split(' with ')[0],
    'Purity': purity,
    'Gross Weight': `${weight.toFixed(2)} g`,
    'Net Metal Weight': `${(weight * (stone === 'None' ? 1 : 0.92)).toFixed(2)} g`,
    'Gemstone': stone,
    'Hallmark': metalGroup === 'Silver' ? 'BIS 925 Hallmarked' : `BIS Hallmarked · HUID`,
    'Certification': metalGroup === 'Diamond' ? 'IGI / SGL Certified' : metalGroup === 'Silver' ? 'Purity Certificate' : 'BIS Hallmark Certificate',
    'Finish': metalGroup === 'Silver' ? 'Rhodium / Oxidised' : /Antique|Temple/.test(material + p[1]) ? 'Antique Matte' : 'High Polish',
    'Size': category === 'Rings' ? 'Adjustable / Sizes 8–20' : category === 'Bangles' ? '2.4, 2.6, 2.8' : category === 'Necklaces' || category === 'Mangalsutra' ? '16–18 inch' : 'Standard',
    'Making Charges': metalGroup === 'Silver' ? 'Included' : `${category === 'Bridal Sets' ? 18 : 12}% of metal value`,
    'Warranty': 'Lifetime maintenance · 1-year manufacturing warranty',
    'Returns': '15-day easy returns · Lifetime exchange',
  };
}

function build(p, hidden = false) {
  const [id, name, category, metalGroup, material, purity, weight, price, mrp, stock, rating, reviews, popularity, dateAdded, collections, occasion, tags, art, description, secretKeywords] = p;
  const file = `${slug(name)}.svg`;
  writeFileSync(join(imgDir, file), renderSVG(art, parseInt(id.slice(-2), 10), name));
  return {
    id, name, slug: slug(name), category, metalGroup, material, purity,
    weight: `${weight.toFixed(2)} g`, weightGrams: weight,
    price, mrp, discountPercent: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    stock, availability: stock === 0 ? 'Out of Stock' : stock <= 3 ? 'Only a Few Left' : 'In Stock',
    rating, reviewsCount: reviews, popularity, dateAdded, collections, occasion, tags,
    image: `/images/products/${file}`,
    description, specifications: specs(p),
    ...(hidden ? { hidden: true, secretKeywords } : {}),
  };
}

const products = [...P.map((p) => build(p)), ...HIDDEN.map((p) => build(p, true))];
writeFileSync(join(root, 'src/data/products.json'), JSON.stringify(products, null, 2));

/* ------------------------------- Banners ------------------------------- */
function banner(file, art, tone) {
  const d = defs(art.metal, art.gem);
  const body = SHAPES[art.shape](d, art.opts || {});
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
  <defs>${d.svg}
    <linearGradient id="bgx${d.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tone[0]}"/><stop offset="1" stop-color="${tone[1]}"/></linearGradient>
    <radialGradient id="glow${d.id}" cx=".7" cy=".45" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bgx${d.id})"/>
  <circle cx="1120" cy="420" r="420" fill="url(#glow${d.id})"/>
  <g opacity=".18" stroke="#c9a24e" fill="none">${[0, 1, 2, 3, 4].map((i) => `<circle cx="1120" cy="420" r="${260 + i * 70}" stroke-width="1"/>`).join('')}</g>
  <g transform="translate(720 20) scale(1.05)">${body}</g>
  ${sparkle(1450, 160, 16)}${sparkle(900, 760, 12)}${sparkle(1380, 700, 10)}
</svg>`;
  writeFileSync(join(bannerDir, file), svg);
}
banner('hero-royal.svg', { shape: 'haar', metal: 'gold', gem: 'ruby', opts: { layers: 3, drops: true, stones: true } }, ['#fdf8ee', '#efdcb8']);
banner('hero-diamond.svg', { shape: 'riviere', metal: 'white', gem: 'diamond' }, ['#fffdf8', '#ece3d6']);
banner('hero-bridal.svg', { shape: 'bridal', metal: 'gold', gem: 'polki' }, ['#fdf6ec', '#f0d9c4']);
banner('collection-royal.svg', { shape: 'haar', metal: 'gold', gem: 'emerald', opts: { layers: 2, coins: true } }, ['#f8efdc', '#e7cf9f']);
banner('collection-bridal.svg', { shape: 'tikka', metal: 'gold', gem: 'ruby' }, ['#fbefe6', '#eccdb8']);
banner('collection-everyday.svg', { shape: 'pendant', metal: 'rose', gem: 'diamond', opts: {} }, ['#fffaf4', '#f1e2d3']);
banner('collection-festival.svg', { shape: 'jhumka', metal: 'gold', gem: 'ruby', opts: {} }, ['#fdf3e1', '#efd59f']);
banner('collection-limited.svg', { shape: 'brooch', metal: 'white', gem: 'sapphire' }, ['#fbfaf7', '#e6e0d6']);

console.log(`Generated ${products.length} products and artwork.`);
