const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n) => inr.format(Math.round(n || 0));
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const slugify = (s) => s.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const CATEGORY_SLUGS = {
  rings: 'Rings',
  necklaces: 'Necklaces',
  earrings: 'Earrings',
  bracelets: 'Bracelets',
  bangles: 'Bangles',
  mangalsutra: 'Mangalsutra',
  'bridal-sets': 'Bridal Sets',
  accessories: 'Accessories',
};
export const categoryToSlug = (c) => Object.keys(CATEGORY_SLUGS).find((k) => CATEGORY_SLUGS[k] === c) || slugify(c);

/** Shipping rules: free above ₹25,000, otherwise ₹499. Express +₹999. Same-day (metro pins) +₹1,499. */
export const METRO_PIN_PREFIXES = ['11', '40', '56', '60', '50', '70', '38', '30'];
export function calcShipping(subtotal, method = 'standard', pincode = '') {
  if (subtotal <= 0) return 0;
  let base = subtotal >= 25000 ? 0 : 499;
  if (method === 'express') base += 999;
  if (method === 'sameday') base += 1499;
  if (method === 'sameday' && pincode && !METRO_PIN_PREFIXES.includes(pincode.slice(0, 2))) base += 0;
  return base;
}
export function deliveryEstimate(pincode, method = 'standard') {
  if (!/^\d{6}$/.test(pincode || '')) return null;
  const metro = METRO_PIN_PREFIXES.includes(pincode.slice(0, 2));
  const days = method === 'sameday' ? (metro ? 0 : 2) : method === 'express' ? (metro ? 1 : 2) : metro ? 3 : 5;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return { metro, days, date: d, sameDayAvailable: metro };
}
export const GST_RATE = 0.03;

/** Parse price phrases in a search query: "under 50000", "below 1 lakh", "above 2 lakh", "10000-50000". */
export function parsePriceQuery(q) {
  const s = q.toLowerCase().replace(/,/g, '').replace(/₹/g, '');
  const num = (v, unit) => {
    let n = parseFloat(v);
    if (/lakh|lac|l\b/.test(unit || '')) n *= 100000;
    else if (/k\b/.test(unit || '')) n *= 1000;
    return n;
  };
  let m = s.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|k|l)?\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(lakh|lac|k|l)?/);
  if (m) return { min: num(m[1], m[2] || m[4]), max: num(m[3], m[4]), rest: s.replace(m[0], '').trim() };
  m = s.match(/(under|below|less than|upto|up to|within)\s*(\d+(?:\.\d+)?)\s*(lakh|lac|k|l)?/);
  if (m) return { max: num(m[2], m[3]), rest: s.replace(m[0], '').trim() };
  m = s.match(/(above|over|more than|from)\s*(\d+(?:\.\d+)?)\s*(lakh|lac|k|l)?/);
  if (m) return { min: num(m[2], m[3]), rest: s.replace(m[0], '').trim() };
  return null;
}
