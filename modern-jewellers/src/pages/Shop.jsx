import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGrid, { SkeletonGrid } from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import { CloseIcon, FilterIcon } from '../components/Icons';
import { CATEGORY_SLUGS, formatINR } from '../utils/format';
import { searchProducts } from '../utils/search';
import collections from '../data/collections.json';

const PER_PAGE = 12;
const CATEGORIES = Object.values(CATEGORY_SLUGS);
const METALS = ['Gold', 'Diamond', 'Silver'];
const OCCASIONS = ['Bridal', 'Festive', 'Daily Wear'];
const PURITIES = ['22K (916)', '18K (750)', '92.5% Silver'];
const SORTS = [
  ['featured', 'Featured'],
  ['popular', 'Popularity'],
  ['newest', 'Newest Arrivals'],
  ['price-asc', 'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
  ['rating', 'Customer Rating'],
];
const PRICE_PRESETS = [[0, 10000], [10000, 50000], [50000, 150000], [150000, 500000], [500000, null]];

const list = (sp, k) => (sp.get(k) ? sp.get(k).split(',').filter(Boolean) : []);

function FilterGroup({ title, options, selected, onToggle, render }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-cream-200 py-4">
      <button className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-cocoa-700" onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}<span className="text-champagne-600">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {options.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm text-cocoa-600 hover:text-champagne-700">
              <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)} className="h-4 w-4 accent-champagne-500" />
              {render ? render(o) : o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Shop({ presetMetal }) {
  const { allProducts } = useStore();
  const { category: catSlug } = useParams();
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);

  const pathCategory = catSlug ? CATEGORY_SLUGS[catSlug] : null;
  const q = sp.get('q') || '';
  const f = {
    category: pathCategory ? [pathCategory] : list(sp, 'category'),
    metal: presetMetal ? [presetMetal] : list(sp, 'metal'),
    collection: list(sp, 'collection'),
    occasion: list(sp, 'occasion'),
    purity: list(sp, 'purity'),
    min: sp.get('min') || '',
    max: sp.get('max') || '',
    instock: sp.get('instock') === '1',
    sort: sp.get('sort') || 'featured',
    page: parseInt(sp.get('page') || '1', 10),
  };

  const update = (patch, resetPage = true) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v.join(',') : v === true ? '1' : v === false ? '' : String(v ?? '');
      if (val) next.set(k, val);
      else next.delete(k);
    });
    if (resetPage && !('page' in patch)) next.delete('page');
    setSp(next);
  };
  const toggle = (key, value) => update({ [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value] });

  const results = useMemo(() => {
    let r = q ? searchProducts(allProducts, q) : allProducts.filter((p) => !p.hidden);
    if (f.category.length) r = r.filter((p) => f.category.includes(p.category));
    if (f.metal.length) r = r.filter((p) => f.metal.includes(p.metalGroup));
    if (f.collection.length) r = r.filter((p) => p.collections.some((c) => f.collection.includes(c)));
    if (f.occasion.length) r = r.filter((p) => f.occasion.includes(p.occasion));
    if (f.purity.length) r = r.filter((p) => f.purity.includes(p.purity));
    if (f.min) r = r.filter((p) => p.price >= Number(f.min));
    if (f.max) r = r.filter((p) => p.price <= Number(f.max));
    if (f.instock) r = r.filter((p) => p.stock > 0);
    const s = [...r];
    if (f.sort === 'popular') s.sort((a, b) => b.popularity - a.popularity);
    else if (f.sort === 'newest') s.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    else if (f.sort === 'price-asc') s.sort((a, b) => a.price - b.price);
    else if (f.sort === 'price-desc') s.sort((a, b) => b.price - a.price);
    else if (f.sort === 'rating') s.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    return s;
  }, [allProducts, q, sp.toString(), pathCategory, presetMetal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [sp.toString(), catSlug, presetMetal]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(f.page, pages);
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const title = q ? `Search results for “${q}”` : pathCategory || (presetMetal ? `${presetMetal} Jewellery` : f.collection.length === 1 ? collections.find((c) => c.slug === f.collection[0])?.name : 'Shop All Jewellery');
  const crumbs = [{ label: 'Shop', to: '/shop' }];
  if (presetMetal) crumbs.push({ label: `${presetMetal} Jewellery` });
  else if (pathCategory) crumbs.push({ label: pathCategory });
  else if (q) crumbs.push({ label: 'Search' });

  const activeChips = [
    ...(!pathCategory ? f.category.map((v) => ['category', v]) : []),
    ...(!presetMetal ? f.metal.map((v) => ['metal', v]) : []),
    ...f.collection.map((v) => ['collection', v]),
    ...f.occasion.map((v) => ['occasion', v]),
    ...f.purity.map((v) => ['purity', v]),
  ];
  const clearAll = () => setSp(q ? new URLSearchParams({ q }) : new URLSearchParams());

  const filters = (
    <div data-testid="filters">
      <div className="flex items-center justify-between pb-2">
        <h2 className="font-serif text-2xl">Refine</h2>
        <button className="text-xs uppercase tracking-widest text-champagne-600 underline" onClick={clearAll}>Clear all</button>
      </div>
      <div className="border-b border-cream-200 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cocoa-700">Price (₹)</p>
        <div className="flex items-center gap-2">
          <input type="number" min="0" placeholder="Min" value={f.min} onChange={(e) => update({ min: e.target.value })} className="input !py-2" aria-label="Minimum price" id="price-min" />
          <span className="text-cocoa-300">–</span>
          <input type="number" min="0" placeholder="Max" value={f.max} onChange={(e) => update({ max: e.target.value })} className="input !py-2" aria-label="Maximum price" id="price-max" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map(([a, b]) => (
            <button key={a} className={`chip ${String(a) === f.min && String(b ?? '') === f.max ? '!border-champagne-500 !bg-champagne-500 !text-white' : ''}`} onClick={() => update({ min: a || '', max: b ?? '' })}>
              {b ? `${formatINR(a)}–${formatINR(b)}` : `${formatINR(a)}+`}
            </button>
          ))}
        </div>
      </div>
      {!pathCategory && <FilterGroup title="Category" options={CATEGORIES} selected={f.category} onToggle={(v) => toggle('category', v)} />}
      {!presetMetal && <FilterGroup title="Metal / Type" options={METALS} selected={f.metal} onToggle={(v) => toggle('metal', v)} />}
      <FilterGroup title="Purity" options={PURITIES} selected={f.purity} onToggle={(v) => toggle('purity', v)} />
      <FilterGroup title="Collection" options={collections.map((c) => c.slug)} selected={f.collection} onToggle={(v) => toggle('collection', v)} render={(s) => collections.find((c) => c.slug === s).name} />
      <FilterGroup title="Occasion" options={OCCASIONS} selected={f.occasion} onToggle={(v) => toggle('occasion', v)} />
      <label className="flex cursor-pointer items-center gap-2.5 py-4 text-sm text-cocoa-600">
        <input type="checkbox" checked={f.instock} onChange={(e) => update({ instock: e.target.checked })} className="h-4 w-4 accent-champagne-500" />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={crumbs} />
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-cream-100 to-cream-200 px-6 py-10 text-center md:py-14">
        <p className="eyebrow">Modern Jewellers</p>
        <h1 className="section-title mt-2">{title}</h1>
        <p className="mt-2 text-sm text-cocoa-500">{results.length} {results.length === 1 ? 'piece' : 'pieces'} · BIS hallmarked · Certified</p>
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-64 shrink-0 lg:block">{filters}</aside>
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button className="btn-outline btn-sm lg:hidden" onClick={() => setDrawer(true)}><FilterIcon width={16} /> Filters {activeChips.length > 0 && `(${activeChips.length})`}</button>
            <div className="flex flex-wrap gap-2">
              {activeChips.map(([k, v]) => (
                <button key={k + v} onClick={() => toggle(k, v)} className="chip gap-1 !border-champagne-400">
                  {k === 'collection' ? collections.find((c) => c.slug === v)?.name : v} <CloseIcon width={12} />
                </button>
              ))}
              {(f.min || f.max) && (
                <button onClick={() => update({ min: '', max: '' })} className="chip gap-1 !border-champagne-400">
                  {f.min ? formatINR(f.min) : '₹0'} – {f.max ? formatINR(f.max) : 'Any'} <CloseIcon width={12} />
                </button>
              )}
            </div>
            <label className="ml-auto flex items-center gap-2 text-xs uppercase tracking-widest text-cocoa-500">
              Sort by
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value })} className="input !w-auto !py-2 normal-case tracking-normal" id="sort-select">
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {loading ? (
            <SkeletonGrid n={6} />
          ) : shown.length ? (
            <ProductGrid products={shown} cols={3} />
          ) : (
            <div className="card p-12 text-center">
              <p className="font-serif text-3xl">No pieces found</p>
              <p className="mt-2 text-cocoa-500">Try removing a filter, searching by product ID, or exploring our collections.</p>
              <div className="mt-6 flex justify-center gap-3"><button className="btn-gold" onClick={clearAll}>Clear filters</button><Link to="/collections" className="btn-outline">Collections</Link></div>
            </div>
          )}
          <Pagination page={page} pages={pages} onChange={(n) => { update({ page: n }, false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-label="Filters">
          <div className="absolute inset-0 bg-cocoa-800/30" onClick={() => setDrawer(false)} />
          <div className="page-enter absolute inset-y-0 right-0 w-[86%] max-w-sm overflow-y-auto bg-cream-50 p-6">
            <div className="mb-2 flex justify-end"><button onClick={() => setDrawer(false)} aria-label="Close filters"><CloseIcon /></button></div>
            {filters}
            <button className="btn-gold mt-4 w-full" onClick={() => setDrawer(false)}>Show {results.length} results</button>
          </div>
        </div>
      )}
    </div>
  );
}
