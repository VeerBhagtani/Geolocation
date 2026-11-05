import { useState } from 'react';
import { Link } from 'react-router-dom';
import stores from '../data/stores.json';
import Breadcrumbs from '../components/Breadcrumbs';
import { ClockIcon, PhoneIcon, PinIcon } from '../components/Icons';

export default function StoreLocator() {
  const [region, setRegion] = useState('All');
  const [service, setService] = useState('');
  const [q, setQ] = useState('');
  const [active, setActive] = useState(stores[0].id);
  const services = [...new Set(stores.flatMap((s) => s.services))];
  const list = stores.filter((s) => (region === 'All' || s.region === region) && (!service || s.services.includes(service)) && (s.city + s.address).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Store Locator' }]} />
      <h1 className="section-title text-center">Find a Modern Jewellers Store</h1>
      <div className="divider-gold" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search city or PIN…" className="input" aria-label="Search stores" />
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="input" aria-label="Region"><option>All</option><option>North</option><option>South</option><option>East</option><option>West</option></select>
        <select value={service} onChange={(e) => setService(e.target.value)} className="input" aria-label="Service"><option value="">All services</option>{services.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-cream-200 bg-gradient-to-br from-cream-100 to-cream-200 shadow-soft" aria-label="Store map">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M30 8 L45 6 L52 14 L60 18 L72 30 L80 40 L74 48 L66 50 L60 58 L52 70 L48 86 L44 94 L40 86 L36 74 L28 66 L20 56 L22 46 L18 40 L24 30 L28 20Z" fill="#fff" stroke="#dcbc72" strokeWidth=".6" />
          </svg>
          {stores.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{ left: `${s.x}%`, top: `${s.y}%` }} aria-label={`${s.city} store`}
              className={`absolute -translate-x-1/2 -translate-y-full transition ${active === s.id ? 'scale-125 text-cocoa-700' : 'text-champagne-600 hover:scale-110'} ${list.includes(s) ? '' : 'opacity-30'}`}>
              <PinIcon width={26} height={26} />
              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap text-[0.6rem] font-medium uppercase tracking-wider">{s.city}</span>
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {list.map((s) => (
            <div key={s.id} onClick={() => setActive(s.id)} className={`card cursor-pointer p-5 transition ${active === s.id ? '!border-champagne-400 shadow-luxe' : ''}`} data-store={s.id}>
              <p className="eyebrow">{s.city} · {s.region}</p>
              <p className="mt-1 font-serif text-xl">{s.name}</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-cocoa-500"><PinIcon width={16} className="mt-0.5 shrink-0" />{s.address}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-cocoa-500"><PhoneIcon width={16} /><a href={`tel:${s.phone.replace(/\s/g, '')}`} className="hover:text-champagne-700">{s.phone}</a></p>
              <p className="mt-1 flex items-center gap-2 text-sm text-cocoa-500"><ClockIcon width={16} />{s.hours}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{s.services.map((x) => <span key={x} className="chip">{x}</span>)}</div>
              <div className="mt-4 flex gap-2">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`} target="_blank" rel="noreferrer" className="btn-outline btn-sm">Directions</a>
                <Link to="/contact" className="btn-ghost btn-sm">Book Appointment</Link>
              </div>
            </div>
          ))}
          {!list.length && <p className="text-cocoa-400">No stores match your filters.</p>}
        </div>
      </div>
    </div>
  );
}
