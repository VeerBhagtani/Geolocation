import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { suggestions } from '../utils/search';
import { formatINR, categoryToSlug } from '../utils/format';
import { HistoryIcon, SearchIcon, CloseIcon } from './Icons';

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Mangalsutra', 'Bridal Sets', 'Accessories'];
const POPULAR = ['Diamond rings', 'Jhumkas', 'Mangalsutra', 'Gold bangles under 1 lakh', 'Silver'];

export default function SearchBar({ onDone, autoFocus = false }) {
  const { allProducts, searchHistory, addSearch, clearSearchHistory, discover } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const nav = useNavigate();
  const box = useRef(null);

  const s = useMemo(() => suggestions(allProducts, q, cat), [allProducts, q, cat]);
  const flat = s.products;

  useEffect(() => {
    const out = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  const go = (query) => {
    const value = (query ?? q).trim();
    if (!value && !cat) return;
    addSearch(value);
    const hidden = allProducts.find((p) => p.hidden && (p.id.toLowerCase() === value.toLowerCase() || (p.secretKeywords || []).includes(value.toLowerCase())));
    if (hidden) discover('secret-search');
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    nav(cat ? `/shop/${categoryToSlug(cat)}?${params}` : `/shop?${params}`);
    setOpen(false);
    onDone?.();
  };
  const openProduct = (p) => {
    addSearch(q || p.name);
    if (p.hidden) discover('secret-search');
    nav(`/product/${p.id}`);
    setOpen(false);
    setQ('');
    onDone?.();
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); active >= 0 && flat[active] ? openProduct(flat[active]) : go(); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={box} className="relative w-full">
      <form role="search" onSubmit={(e) => { e.preventDefault(); go(); }}
        className="flex items-center overflow-hidden rounded-full border border-cream-300 bg-white shadow-sm focus-within:border-champagne-500 focus-within:ring-2 focus-within:ring-champagne-300/40">
        <label htmlFor="search-category" className="sr-only">Search category</label>
        <select id="search-category" value={cat} onChange={(e) => setCat(e.target.value)}
          className="hidden h-10 cursor-pointer border-r border-cream-200 bg-cream-100 px-3 text-xs uppercase tracking-wider text-cocoa-600 outline-none sm:block">
          <option value="">All</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input id="site-search" type="search" value={q} autoFocus={autoFocus} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)} onKeyDown={onKey}
          placeholder="Search by name, ID (MJ-DR-1004), material or price…"
          className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-cocoa-300" aria-label="Search products"
          aria-autocomplete="list" aria-controls="search-suggestions" aria-expanded={open} />
        {q && <button type="button" onClick={() => setQ('')} className="px-1 text-cocoa-300 hover:text-cocoa-600" aria-label="Clear search"><CloseIcon width={16} /></button>}
        <button type="submit" className="flex h-10 w-12 items-center justify-center text-champagne-600 hover:text-champagne-700" aria-label="Submit search"><SearchIcon /></button>
      </form>

      {open && (
        <div id="search-suggestions" role="listbox" className="page-enter absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-cream-200 bg-white p-3 shadow-luxe">
          {!q && (
            <>
              {searchHistory.length > 0 && (
                <div className="mb-3">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="eyebrow !tracking-[0.2em]">Recent searches</span>
                    <button className="text-xs text-cocoa-400 underline hover:text-champagne-600" onClick={clearSearchHistory}>Clear history</button>
                  </div>
                  {searchHistory.map((h) => (
                    <button key={h} onClick={() => { setQ(h); go(h); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-cocoa-600 hover:bg-cream-100">
                      <HistoryIcon width={16} className="text-cocoa-300" />{h}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-2">
                <span className="eyebrow !tracking-[0.2em]">Popular searches</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {POPULAR.map((p) => <button key={p} className="chip hover:border-champagne-400" onClick={() => { setQ(p); go(p); }}>{p}</button>)}
                </div>
              </div>
            </>
          )}
          {q && (
            <>
              {(s.categories.length > 0 || s.materials.length > 0) && (
                <div className="mb-2 flex flex-wrap gap-2 px-2">
                  {s.categories.map((c) => <button key={c} className="chip" onClick={() => { nav(`/shop/${categoryToSlug(c)}`); setOpen(false); onDone?.(); }}>in {c}</button>)}
                  {s.materials.map((m) => <button key={m} className="chip" onClick={() => go(m)}>{m}</button>)}
                </div>
              )}
              {flat.length === 0 ? (
                <p className="px-3 py-4 text-sm text-cocoa-400">No pieces match “{q}”. Try a product ID, material or “under 50000”.</p>
              ) : (
                flat.map((p, i) => (
                  <button key={p.id} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => openProduct(p)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left ${i === active ? 'bg-cream-100' : ''}`}>
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-cocoa-700">{p.name}</span>
                      <span className="block text-xs text-cocoa-400">{p.id} · {p.category} · {p.material.split(' with ')[0]}</span>
                    </span>
                    <span className="text-sm font-medium text-champagne-700">{formatINR(p.price)}</span>
                  </button>
                ))
              )}
              <button onClick={() => go()} className="mt-2 w-full rounded-lg bg-cream-100 py-2 text-xs uppercase tracking-widest text-cocoa-600 hover:bg-cream-200">
                View all results for “{q}”
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
