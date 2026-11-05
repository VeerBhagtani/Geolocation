import { useState } from 'react';
import { Link } from 'react-router-dom';
import faqs from '../data/faqs.json';
import Breadcrumbs from '../components/Breadcrumbs';
import { ChevronDown } from '../components/Icons';

export default function FAQ() {
  const cats = ['All', ...new Set(faqs.map((f) => f.category))];
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(0);
  const list = faqs.filter((f) => (cat === 'All' || f.category === cat) && (f.q + f.a).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'FAQs' }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title text-center">Frequently Asked Questions</h1>
        <div className="divider-gold" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions…" className="input mt-6" aria-label="Search FAQs" />
        <div className="mt-4 flex flex-wrap gap-2">
          {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? '!border-champagne-500 !bg-champagne-500 !text-white' : ''}`}>{c}</button>)}
        </div>
        <div className="mt-6 space-y-3">
          {list.map((f, i) => (
            <div key={f.q} className="card overflow-hidden">
              <button className="flex w-full items-center justify-between gap-4 p-5 text-left" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span className="font-serif text-xl">{f.q}</span>
                <ChevronDown className={`shrink-0 text-champagne-600 transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="page-enter px-5 pb-5 text-cocoa-500">{f.a}</p>}
            </div>
          ))}
          {!list.length && <p className="text-center text-cocoa-400">No matching questions. <Link to="/contact" className="underline">Ask us directly</Link>.</p>}
        </div>
      </div>
    </div>
  );
}
