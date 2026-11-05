import { useState } from 'react';
import { Link } from 'react-router-dom';
import coupons from '../data/coupons.json';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import { formatINR } from '../utils/format';

function Countdown() {
  const end = new Date('2026-11-30T23:59:59');
  const diff = Math.max(0, end - new Date());
  const d = Math.floor(diff / 864e5), h = Math.floor((diff % 864e5) / 36e5);
  return <span className="font-medium">{d} days {h} hrs left</span>;
}

export default function Offers() {
  const { products, notify } = useStore();
  const [min, setMin] = useState(0);
  const offers = products.filter((p) => p.discountPercent > 0 && p.discountPercent >= min).sort((a, b) => b.discountPercent - a.discountPercent);
  const copy = async (code) => {
    try { await navigator.clipboard.writeText(code); } catch { /* clipboard unavailable */ }
    notify(`Code ${code} copied — apply it in your bag`);
  };
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Offers' }]} />
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-champagne-400 via-champagne-300 to-cream-200 p-10 text-center shadow-luxe md:p-16">
        <p className="eyebrow !text-cocoa-700">Festive Season Sale · <Countdown /></p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">Up to 15% Off + Zero Making Charges</h1>
        <p className="mx-auto mt-3 max-w-xl text-cocoa-700">On select gold and diamond jewellery. Offers valid till 30 November 2026.</p>
      </div>

      <section className="mt-14">
        <SectionHeading eyebrow="Apply at checkout" title="Coupon Codes" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {coupons.filter((c) => !c.secret).map((c) => (
            <div key={c.code} className="card relative overflow-hidden border-dashed !border-champagne-400 p-6 text-center">
              <p className="font-serif text-3xl text-champagne-700">{c.type === 'percent' ? `${c.value}% OFF` : `${formatINR(c.value)} OFF`}</p>
              <p className="mt-1 text-sm text-cocoa-500">{c.label}</p>
              <p className="mt-4 rounded-lg bg-cream-100 py-2 font-mono tracking-[0.3em] text-cocoa-700">{c.code}</p>
              <button className="btn-outline btn-sm mt-4" onClick={() => copy(c.code)}>Copy Code</button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Pieces on Offer</h2>
          <label className="flex items-center gap-2 text-sm text-cocoa-500">Minimum discount
            <select value={min} onChange={(e) => setMin(Number(e.target.value))} className="input !w-auto">
              <option value={0}>Any</option><option value={5}>5%+</option><option value={8}>8%+</option><option value={10}>10%+</option>
            </select>
          </label>
        </div>
        <ProductGrid products={offers} />
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {[['Gold Exchange Bonanza', '100% value on old gold exchange + ₹2,000 bonus per 10 g.', '/stores'], ['No-Cost EMI', 'Up to 9 months no-cost EMI on orders above ₹30,000.', '/faq'], ['Bridal Privilege', '₹25,000 off bridal orders above ₹3,00,000 with SHAADI25K.', '/collections/bridal']].map(([t, d, to]) => (
          <Link to={to} key={t} className="card p-8 transition hover:-translate-y-1 hover:shadow-luxe">
            <p className="font-serif text-2xl">{t}</p><p className="mt-2 text-sm text-cocoa-500">{d}</p>
            <span className="mt-4 inline-block text-xs uppercase tracking-widest text-champagne-700 underline">Learn more</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
