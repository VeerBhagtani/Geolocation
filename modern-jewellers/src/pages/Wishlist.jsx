import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { formatINR } from '../utils/format';
import { TrashIcon } from '../components/Icons';

export default function Wishlist() {
  const { wishlist, getProduct, toggleWishlist, addToCart } = useStore();
  const items = wishlist.map(getProduct).filter(Boolean);
  const moveAll = () => items.forEach((p) => p.stock > 0 && addToCart(p.id));
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="section-title">My Wishlist <span className="text-2xl text-cocoa-400">({items.length})</span></h1>
        {items.length > 0 && <button className="btn-outline btn-sm" onClick={moveAll}>Add all to bag</button>}
      </div>
      {!items.length ? (
        <div className="card mx-auto max-w-xl p-12 text-center">
          <p className="font-serif text-3xl">Your wishlist is waiting</p>
          <p className="mt-2 text-cocoa-500">Tap the heart on any piece to save it here.</p>
          <Link to="/shop" className="btn-gold mt-6">Explore Jewellery</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="card overflow-hidden" data-wishlist-item={p.id}>
              <Link to={`/product/${p.id}`}><img src={p.image} alt={p.name} className="aspect-square w-full object-cover" /></Link>
              <div className="space-y-2 p-4">
                <Link to={`/product/${p.id}`} className="font-serif text-lg hover:text-champagne-700">{p.name}</Link>
                <p className="font-medium">{formatINR(p.price)}</p>
                <p className="text-xs text-cocoa-400">{p.availability}</p>
                <div className="flex gap-2 pt-2">
                  <button className="btn-gold btn-sm flex-1" disabled={p.stock === 0} onClick={() => { addToCart(p.id); toggleWishlist(p.id); }}>Move to bag</button>
                  <button className="btn-ghost btn-sm !px-3" onClick={() => toggleWishlist(p.id)} aria-label={`Remove ${p.name} from wishlist`}><TrashIcon width={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
