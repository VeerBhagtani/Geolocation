// Real jewellery photography hot-linked from Unsplash (free licence: https://unsplash.com/license).
// Each local SVG path maps to a photo; if a photo fails to load (offline / removed),
// the global handler in main.jsx swaps the <img> back to the local SVG artwork.

const P = {
  rings: ['1605100804763-247f67b3557e', '1603561591411-07134e71a2a9', '1602173574767-37ac01994b2a', '1601121141461-9d6647bca1ed', '1584302179602-e4c3d3fd629d', '1600721391776-b5cd0e0048f9', '1543294001-f7cd5d7fb516'],
  necklaces: ['1599643478518-a784e5dc4c8f', '1617038220319-276d3cfab638', '1589128777073-263566ae5e4d', '1515562141207-7a88fb7ce338', '1601821765780-754fa98637c1', '1617038260897-41a1f14a8ca0', '1573408301185-9146fe634ad0'],
  earrings: ['1535632066927-ab7c9ab60908', '1596944924616-7b38e7cfac36', '1588444837495-c6cfeb53f32d', '1606760227091-3dd870d97f1d', '1630019852942-f89202989a59'],
  bracelets: ['1611591437281-460bfbe1220a', '1611085583191-a3b181a88401', '1611652022419-a9419f74343d'],
  bangles: ['1609587312208-cea54be969e7', '1610694955371-d4a3e0ce4b52', '1630019852942-f89202989a59'],
};

const MAP = {
  // Rings
  'aarohi-filigree-gold-ring': P.rings[0], 'padmini-lotus-ruby-cocktail-ring': P.rings[1], 'ira-everyday-gold-band': P.rings[2],
  'celestia-solitaire-diamond-ring': P.rings[4], 'nakshatra-halo-diamond-ring': P.rings[3], 'anant-eternity-pav-band': P.rings[5],
  'chandra-moonstone-silver-ring': P.rings[6],
  // Necklaces
  'rani-haar-temple-necklace': P.necklaces[0], 'meera-kundan-polki-choker': P.necklaces[1], 'swarna-lakshmi-coin-necklace': P.necklaces[6],
  'aurora-diamond-rivi-re-necklace': P.necklaces[2], 'tara-diamond-pendant-necklace': P.necklaces[3], 'noor-sterling-silver-crescent-pendant': P.necklaces[4],
  'ganga-oxidised-silver-necklace': P.necklaces[5], 'lekha-gold-bar-chain': P.necklaces[3],
  // Earrings
  'rajwadi-gold-jhumkas': P.earrings[0], 'solitaire-diamond-studs': P.earrings[1], 'chandbali-pearl-earrings': P.earrings[2],
  'mira-silver-hoop-earrings': P.earrings[3], 'ayra-diamond-drop-earrings': P.earrings[4],
  // Bracelets
  'kaveri-gold-link-bracelet': P.bracelets[0], 'lumi-re-diamond-tennis-bracelet': P.bracelets[1], 'charm-story-silver-bracelet': P.bracelets[2],
  'ros-delicate-chain-bracelet': P.bracelets[0],
  // Bangles
  'maharani-carved-gold-bangles-pair': P.bangles[0], 'shahi-antique-gold-kada': P.bangles[1], 'zoya-diamond-studded-bangle': P.bangles[2],
  'tarini-silver-bangles-set-of-4': P.bracelets[2], 'nitya-slim-gold-bangles-pair': P.bangles[0],
  // Mangalsutra
  'saubhagya-diamond-mangalsutra': P.necklaces[3], 'parampara-vati-mangalsutra': P.necklaces[6], 'sutra-minimal-bracelet-mangalsutra': P.bracelets[1],
  // Bridal sets
  'shubh-vivaah-polki-bridal-set': P.bangles[0], 'gulnaar-diamond-bridal-set': P.necklaces[2], 'kesar-temple-bridal-set': P.necklaces[0],
  // Accessories
  'sitara-kundan-maang-tikka': P.earrings[0], 'heritage-gold-cufflinks': P.rings[2], 'mayura-peacock-diamond-brooch': P.necklaces[1],
  'ghungroo-silver-payal-pair': P.bracelets[2], 'phool-diamond-nose-pin': P.earrings[1],
  // Vault pieces
  'noor-e-kohinoor-heritage-choker': P.necklaces[1], 'midnight-basra-pearl-rani-haar': P.necklaces[5], 'imperial-emerald-polki-kada': P.bangles[1],
  // Banners
  'hero-royal': P.necklaces[0], 'hero-diamond': P.rings[4], 'hero-bridal': P.bangles[0],
  'collection-royal': P.necklaces[1], 'collection-bridal': P.bangles[1], 'collection-everyday': P.necklaces[3],
  'collection-festival': P.earrings[0], 'collection-limited': P.rings[3],
};

export const FALLBACKS = {};

/** Local SVG path → Unsplash photo URL (unique per path so the fallback is exact). */
export function photo(path) {
  const key = path?.match(/\/([\w-]+)\.svg$/)?.[1];
  const id = key && MAP[key];
  if (!id) return path;
  const w = path.includes('/banners/') ? 1800 : 900;
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80&mj=${key}`;
  FALLBACKS[url] = path;
  return url;
}

/** Swap any failed Unsplash image back to its local SVG artwork. */
export function installImageFallback() {
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img?.tagName !== 'IMG') return;
    const fb = FALLBACKS[img.getAttribute('src')];
    if (fb) img.src = fb;
  }, true);
}
