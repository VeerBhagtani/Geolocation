import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';

export default function GoldRoom() {
  const { discover, products, notify } = useStore();
  useEffect(() => discover('gold-room'), [discover]);
  const picks = products.filter((p) => p.collections.includes('royal')).sort((a, b) => b.price - a.price).slice(0, 3);
  const copy = async () => {
    try { await navigator.clipboard.writeText('GOLDROOM25'); } catch { /* ignore */ }
    notify('GOLDROOM25 copied — 25% patron privilege');
  };
  return (
    <div className="page-enter" data-section="gold-room">
      <section className="relative overflow-hidden py-24 text-center" style={{ background: 'radial-gradient(circle at 50% 30%, #fff6dc 0%, #ecd39a 55%, #c9a24e 100%)' }}>
        <div className="container-luxe relative">
          <p className="text-xs uppercase tracking-[0.5em] text-cocoa-700">Secret Section · Patrons Only</p>
          <h1 className="mt-4 font-serif text-6xl text-cocoa-800 md:text-8xl">The Gold Room</h1>
          <p className="mx-auto mt-6 max-w-xl text-cocoa-700">You walked through a door that isn’t on any map. Welcome to the private salon of Modern Jewellers.</p>
        </div>
      </section>
      <section className="container-luxe -mt-10">
        <div className="card mx-auto max-w-2xl border-2 !border-champagne-400 p-10 text-center">
          <p className="eyebrow">Your patron privilege</p>
          <p className="mt-3 font-serif text-5xl text-champagne-700">25% OFF</p>
          <p className="mt-4 rounded-xl bg-cream-100 py-3 font-mono text-2xl tracking-[0.4em]">GOLDROOM25</p>
          <div className="mt-6 flex justify-center gap-3"><button className="btn-gold" onClick={copy}>Copy Code</button><Link to="/collections/royal" className="btn-outline">Shop Royal</Link></div>
        </div>
      </section>
      <section className="container-luxe mt-16 grid gap-6 md:grid-cols-3">
        {picks.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="card overflow-hidden transition hover:shadow-luxe">
            <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
            <div className="p-5"><p className="font-serif text-xl">{p.name}</p><p className="text-sm text-cocoa-500">{formatINR(p.price)} · {formatINR(p.price * 0.75)} with privilege</p></div>
          </Link>
        ))}
      </section>
    </div>
  );
}
