import { parsePriceQuery } from './format';

const norm = (s) => String(s || '').toLowerCase().trim();

/** True if a hidden product may surface for this query (exact product ID or secret keyword). */
export function hiddenMatch(p, q) {
  const n = norm(q);
  if (!n) return false;
  return norm(p.id) === n || (p.secretKeywords || []).some((k) => norm(k) === n);
}

/**
 * Search across name, product ID, category, material, metal, collection and occasion,
 * with price phrases ("under 50000", "1 lakh to 3 lakh"). Hidden products only surface
 * on an exact product ID or secret keyword.
 */
export function searchProducts(allProducts, q, category = '') {
  const raw = norm(q);
  const price = parsePriceQuery(raw);
  const text = price ? price.rest : raw;
  const terms = text.split(/\s+/).filter((t) => t && !['jewellery', 'jewelry', 'in', 'for', 'with', 'the', 'rs', 'inr'].includes(t));
  return allProducts.filter((p) => {
    if (p.hidden) return hiddenMatch(p, q);
    if (category && p.category !== category) return false;
    if (price) {
      if (price.min != null && p.price < price.min) return false;
      if (price.max != null && p.price > price.max) return false;
    }
    if (!terms.length) return true;
    const hay = norm([p.id, p.name, p.category, p.material, p.metalGroup, p.purity, p.occasion, ...(p.collections || []), ...(p.tags || [])].join(' '));
    return terms.every((t) => hay.includes(t) || hay.includes(t.replace(/s$/, '')));
  });
}

export function suggestions(allProducts, q, category = '') {
  const n = norm(q);
  if (!n) return { products: [], categories: [], materials: [] };
  const products = searchProducts(allProducts, q, category).slice(0, 6);
  const visible = allProducts.filter((p) => !p.hidden);
  const categories = [...new Set(visible.map((p) => p.category))].filter((c) => norm(c).includes(n)).slice(0, 3);
  const materials = [...new Set(visible.map((p) => p.material.split(' with ')[0]))].filter((m) => norm(m).includes(n)).slice(0, 3);
  return { products, categories, materials };
}
