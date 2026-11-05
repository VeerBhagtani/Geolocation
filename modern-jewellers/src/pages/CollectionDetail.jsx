import { photo } from '../data/photos';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import collections from '../data/collections.json';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import NotFound from './NotFound';

export default function CollectionDetail() {
  const { slug } = useParams();
  const { products } = useStore();
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);
  const c = collections.find((x) => x.slug === slug);
  if (!c) return <NotFound />;
  const inCol = products.filter((p) => p.collections.includes(slug));
  const cats = ['All', ...new Set(inCol.map((p) => p.category))];
  let list = cat === 'All' ? inCol : inCol.filter((p) => p.category === cat);
  list = [...list].sort((a, b) => (sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : sort === 'newest' ? b.dateAdded.localeCompare(a.dateAdded) : b.popularity - a.popularity));
  const pages = Math.ceil(list.length / 8);
  const shown = list.slice((page - 1) * 8, page * 8);
  return (
    <div className="page-enter">
      <div className="relative h-[360px] overflow-hidden md:h-[440px]">
        <img src={photo(c.banner)} alt={c.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/70 to-transparent" />
        <div className="container-luxe relative flex h-full flex-col justify-center">
          <p className="eyebrow">{c.tagline}</p>
          <h1 className="mt-2 font-serif text-5xl md:text-6xl">{c.name}</h1>
          <p className="mt-4 max-w-lg text-cocoa-500">{c.description}</p>
        </div>
      </div>
      <div className="container-luxe">
        <Breadcrumbs items={[{ label: 'Collections', to: '/collections' }, { label: c.name }]} />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {cats.map((x) => (
              <button key={x} onClick={() => { setCat(x); setPage(1); }} className={`chip ${cat === x ? '!border-champagne-500 !bg-champagne-500 !text-white' : ''}`}>{x}</button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto" aria-label="Sort collection">
            <option value="popular">Popularity</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option>
          </select>
        </div>
        <ProductGrid products={shown} />
        <Pagination page={page} pages={pages} onChange={setPage} />
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {collections.filter((x) => x.slug !== slug).map((x) => <Link key={x.slug} to={`/collections/${x.slug}`} className="btn-outline btn-sm">{x.name}</Link>)}
        </div>
      </div>
    </div>
  );
}
