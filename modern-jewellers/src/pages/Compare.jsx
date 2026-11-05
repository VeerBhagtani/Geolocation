import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import Rating from '../components/Rating';
import { formatINR } from '../utils/format';

export default function Compare() {
  const { compare, getProduct, toggleCompare, addToCart, setCompare } = useStore();
  const items = compare.map(getProduct).filter(Boolean);
  const specKeys = [...new Set(items.flatMap((p) => Object.keys(p.specifications)))];
  const rows = [
    ['Price', (p) => <span className="font-medium">{formatINR(p.price)}</span>],
    ['Product ID', (p) => p.id],
    ['Category', (p) => p.category],
    ['Material', (p) => p.material],
    ['Weight', (p) => p.weight],
    ['Rating', (p) => <Rating value={p.rating} count={p.reviewsCount} />],
    ['Availability', (p) => p.availability],
    ...specKeys.map((k) => [k, (p) => p.specifications[k] || '—']),
  ];
  const cheapest = items.length ? Math.min(...items.map((p) => p.price)) : 0;
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Compare' }]} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="section-title">Compare Jewellery</h1>
        {items.length > 0 && <button className="btn-ghost btn-sm" onClick={() => setCompare([])}>Clear comparison</button>}
      </div>
      {items.length < 1 ? (
        <div className="card mx-auto max-w-xl p-12 text-center">
          <p className="font-serif text-3xl">Nothing to compare yet</p>
          <p className="mt-2 text-cocoa-500">Use the compare icon on any product card to add up to 4 pieces.</p>
          <Link to="/shop" className="btn-gold mt-6">Browse Jewellery</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-cream-200 bg-white shadow-soft">
          <table className="table-luxe min-w-[720px]" data-testid="compare-table">
            <thead>
              <tr>
                <th className="w-44">Piece</th>
                {items.map((p) => (
                  <th key={p.id} className="!normal-case !tracking-normal">
                    <div className="flex flex-col items-start gap-2">
                      <img src={p.image} alt={p.name} className="h-28 w-28 rounded-xl" />
                      <Link to={`/product/${p.id}`} className="font-serif text-lg text-cocoa-800 hover:text-champagne-700">{p.name}</Link>
                      {p.price === cheapest && items.length > 1 && <span className="chip !bg-emerald-50 !text-emerald-700">Best value</span>}
                      <div className="flex gap-2">
                        <button className="btn-gold btn-sm" onClick={() => addToCart(p.id)} disabled={p.stock === 0}>Add to bag</button>
                        <button className="btn-ghost btn-sm" onClick={() => toggleCompare(p.id)}>Remove</button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, fn]) => (
                <tr key={label}><th className="!bg-cream-50">{label}</th>{items.map((p) => <td key={p.id}>{fn(p)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
