import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/format';
import Rating from './Rating';
import { BagIcon, CompareIcon, HeartIcon } from './Icons';

export default function ProductCard({ p }) {
  const { addToCart, toggleWishlist, wishlist, toggleCompare, compare } = useStore();
  const wished = wishlist.includes(p.id);
  const comparing = compare.includes(p.id);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-luxe" data-product-id={p.id}>
      <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-cream-100">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {p.tags?.includes('new') && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-cocoa-600">New</span>}
          {p.tags?.includes('bestseller') && <span className="rounded-full bg-champagne-500 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-white">Bestseller</span>}
          {p.discountPercent > 0 && <span className="rounded-full bg-cocoa-500 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-widest text-white">{p.discountPercent}% off</span>}
        </div>
        {p.stock === 0 && <span className="absolute inset-x-0 bottom-0 bg-cocoa-700/70 py-1.5 text-center text-xs uppercase tracking-widest text-white">Out of stock</span>}
      </Link>
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button onClick={() => toggleWishlist(p.id)} aria-label={wished ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`} aria-pressed={wished}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${wished ? 'text-rose-500' : 'text-cocoa-500'}`}>
          <HeartIcon filled={wished} width={18} />
        </button>
        <button onClick={() => toggleCompare(p.id)} aria-label={comparing ? `Remove ${p.name} from comparison` : `Compare ${p.name}`} aria-pressed={comparing}
          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100 ${comparing ? 'bg-champagne-500 text-white !opacity-100' : 'bg-white/90 text-cocoa-500'}`}>
          <CompareIcon width={18} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-champagne-600">{p.category} · {p.metalGroup}</p>
        <Link to={`/product/${p.id}`} className="mt-1 font-serif text-lg leading-snug text-cocoa-800 hover:text-champagne-700">{p.name}</Link>
        <p className="mt-0.5 text-[0.7rem] text-cocoa-300">{p.id} · {p.weight}</p>
        <div className="mt-2"><Rating value={p.rating} count={p.reviewsCount} /></div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-lg font-medium text-cocoa-800">{formatINR(p.price)}</p>
            {p.mrp > p.price && <p className="text-xs text-cocoa-300 line-through">{formatINR(p.mrp)}</p>}
          </div>
          <button onClick={() => addToCart(p.id)} disabled={p.stock === 0} aria-label={`Add ${p.name} to bag`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne-400 text-champagne-700 transition hover:bg-champagne-500 hover:text-white disabled:opacity-40">
            <BagIcon width={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
