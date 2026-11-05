import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';

export default function HiddenCatalogue() {
  const { allProducts, addToCart, discover } = useStore();
  const vault = allProducts.filter((p) => p.hidden);
  const [code, setCode] = useState('');
  const [found, setFound] = useState(null);
  const lookup = (e) => {
    e.preventDefault();
    const p = allProducts.find((x) => x.id.toLowerCase() === code.trim().toLowerCase());
    setFound(p || 'none');
    if (p?.hidden) discover('secret-search');
  };
  return (
    <div className="page-enter">
      <section className="bg-gradient-to-b from-cocoa-300/30 to-cream-50 py-20 text-center">
        <p className="eyebrow">By Invitation Only</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">The Private Vault Catalogue</h1>
        <p className="mx-auto mt-4 max-w-2xl text-cocoa-500">Unlisted heritage masterpieces held in our Kala Ghoda vault. These pieces never appear in the public boutique.</p>
      </section>
      <div className="container-luxe">
        <form onSubmit={lookup} className="card mx-auto -mt-8 flex max-w-xl gap-3 p-4" aria-label="Reference code lookup">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter a reference code, e.g. MJ-VX-…" className="input" aria-label="Reference code" />
          <button className="btn-gold btn-sm" type="submit">Look up</button>
        </form>
        {found === 'none' && <p className="mt-3 text-center text-sm text-rose-600" role="alert">No piece matches that reference code.</p>}
        {found && found !== 'none' && <p className="mt-3 text-center text-sm text-emerald-700">Found: <Link to={`/product/${found.id}`} className="underline">{found.name}</Link></p>}

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {vault.map((p) => (
            <article key={p.id} className="card overflow-hidden" data-product-id={p.id}>
              <Link to={`/product/${p.id}`}><img src={p.image} alt={p.name} className="aspect-square w-full object-cover" /></Link>
              <div className="p-6">
                <p className="font-mono text-xs tracking-widest text-champagne-700">{p.id}</p>
                <Link to={`/product/${p.id}`} className="mt-1 block font-serif text-2xl hover:text-champagne-700">{p.name}</Link>
                <p className="mt-2 text-sm text-cocoa-500">{p.description}</p>
                <p className="mt-4 text-xl font-medium">{formatINR(p.price)}</p>
                <p className="text-xs text-cocoa-400">{p.material} · {p.weight}</p>
                <div className="mt-4 flex gap-2">
                  <button className="btn-gold btn-sm" onClick={() => addToCart(p.id)}>Reserve</button>
                  <Link to="/contact" className="btn-outline btn-sm">Private Viewing</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
