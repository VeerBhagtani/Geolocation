import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { LockIcon, EyeIcon } from '../../components/Icons';
import { formatINR } from '../../utils/format';

// The key is hidden in the founder’s note (About Us), the Rani Haar whisper and the vault ledger.
const KEY_HASH = 'S3VuZGFuQDE5ODc='; // base64

const REVENUE = [['Jan', 4.82], ['Feb', 5.36], ['Mar', 4.95], ['Apr', 6.12], ['May', 7.48], ['Jun', 5.21], ['Jul', 4.67], ['Aug', 6.89], ['Sep', 7.94], ['Oct', 11.36], ['Nov', 9.85]];

function Document({ onLock }) {
  const max = Math.max(...REVENUE.map((r) => r[1]));
  return (
    <article className="page-enter mx-auto max-w-4xl rounded-3xl border border-champagne-300 bg-white p-8 shadow-luxe md:p-14" data-testid="confidential-document">
      <header className="border-b border-cream-200 pb-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-rose-700">Strictly Confidential · Internal Circulation Only</p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl">MODERN JEWELLERS — CONFIDENTIAL MANAGEMENT DOCUMENT</h1>
        <p className="mt-2 text-sm text-cocoa-400">Ref: MJ/MGMT/2026/Q4-07 · Prepared by the Office of the Managing Director · 05 November 2026</p>
      </header>

      <section className="mt-8">
        <h2 className="font-serif text-2xl text-champagne-700">1. Internal Management</h2>
        <table className="table-luxe mt-3">
          <thead><tr><th>Name</th><th>Role</th><th>Responsibility</th></tr></thead>
          <tbody>
            {[['Harish Mehta', 'Founder & Chairman', 'Board, heritage acquisitions'], ['Radhika Mehta', 'Managing Director', 'Strategy, retail expansion'], ['Sameer Kothari', 'Chief Financial Officer', 'Treasury, gold hedging'], ['Nandini Rao', 'Head of Design', 'Collections, bridal studio'], ['Arvind Soni', 'Master Karigar', 'Jaipur atelier, polki & kundan'], ['Leela Fernandes', 'Head of Operations', 'Inventory, logistics, vault']].map((r) => <tr key={r[0]}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-champagne-700">2. Inventory Position (as of 31 Oct 2026)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          {[['Gold holding', '412.6 kg'], ['Diamonds', '1,284 ct'], ['Silver', '1.9 tonnes'], ['SKUs live', '3,412']].map(([k, v]) => <div key={k} className="rounded-xl bg-cream-100 p-4"><p className="label">{k}</p><p className="font-serif text-2xl">{v}</p></div>)}
        </div>
        <p className="mt-3 text-sm text-cocoa-500">Low-stock alerts: Rani Haar (3), Aurora Rivière (2), Gulnaar Bridal Set (1), Rosé Chain Bracelet (2). Lekha Bar Chain is out of stock — reorder approved for 40 units.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-champagne-700">3. Sales Performance</h2>
        <table className="table-luxe mt-3">
          <thead><tr><th>Region</th><th>FY26 YTD Sales</th><th>Growth YoY</th><th>Top Category</th></tr></thead>
          <tbody>
            {[['West', '₹28.4 Cr', '+18.2%', 'Bridal Sets'], ['North', '₹19.7 Cr', '+12.6%', 'Diamond Rings'], ['South', '₹24.1 Cr', '+21.4%', 'Temple Necklaces'], ['East', '₹ 9.8 Cr', '+8.9%', 'Gold Bangles'], ['Online', '₹12.6 Cr', '+46.0%', 'Daily Wear']].map((r) => <tr key={r[0]}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-champagne-700">4. Monthly Revenue 2026 (₹ Crore)</h2>
        <div className="mt-4 flex h-48 items-end gap-2" role="img" aria-label="Monthly revenue bar chart">
          {REVENUE.map(([m, v]) => (
            <div key={m} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[0.6rem] text-cocoa-500">{v}</span>
              <div className="w-full rounded-t-md bg-gradient-to-t from-champagne-600 to-champagne-300" style={{ height: `${(v / max) * 100}%` }} />
              <span className="text-[0.65rem] uppercase text-cocoa-400">{m}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-cocoa-500">Total Jan–Nov: ₹{REVENUE.reduce((s, r) => s + r[1], 0).toFixed(2)} Cr. October peak driven by Dhanteras & Diwali (₹11.36 Cr). Equivalent to {formatINR(REVENUE.reduce((s, r) => s + r[1], 0) * 1e7)}.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-champagne-700">5. Special Product Codes</h2>
        <table className="table-luxe mt-3">
          <thead><tr><th>Code</th><th>Piece</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td className="font-mono">MJ-VX-9001</td><td><Link className="underline" to="/product/MJ-VX-9001">Noor-e-Kohinoor Heritage Choker</Link></td><td>Vault · Private viewing</td></tr>
            <tr><td className="font-mono">MJ-VX-9002</td><td><Link className="underline" to="/product/MJ-VX-9002">Midnight Basra Pearl Rani Haar</Link></td><td>Vault · Reference only</td></tr>
            <tr><td className="font-mono">MJ-VX-9003</td><td><Link className="underline" to="/product/MJ-VX-9003">Imperial Emerald Polki Kada</Link></td><td>Reserved for collector</td></tr>
            <tr><td className="font-mono">GOLDROOM25</td><td>Patron privilege coupon</td><td>Active till 31 Dec 2026</td></tr>
            <tr><td className="font-mono">MJ-STAFF-40</td><td>Employee festive allowance</td><td>Internal use only</td></tr>
          </tbody>
        </table>
      </section>

      <section className="mt-10 rounded-2xl border-l-4 border-champagne-500 bg-cream-100 p-6">
        <h2 className="font-serif text-2xl text-champagne-700">6. Confidential Management Announcement</h2>
        <p className="mt-3 text-cocoa-700">
          The Board has approved the acquisition of a heritage karkhana in Bikaner and the launch of a ninth flagship in Lucknow in March 2027.
          The “Noor Heritage” limited series of 27 pieces will be unveiled privately to Gold Room patrons on 14 February 2027. All staff are
          reminded that this information is embargoed until official announcement.
        </p>
        <p className="mt-4 text-sm text-cocoa-500">— Radhika Mehta, Managing Director</p>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-6 text-xs text-cocoa-400">
        <span>Fictional document for demonstration purposes.</span>
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm" onClick={() => window.print()}>Print</button>
          <button className="btn-outline btn-sm" onClick={onLock}><LockIcon width={14} /> Lock Document</button>
        </div>
      </footer>
    </article>
  );
}

export default function ConfidentialDocument() {
  const { discover } = useStore();
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('mj_confidential') === '1');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!pw.trim()) return setError('Please enter the access key.');
    if (btoa(pw.trim()) === KEY_HASH) {
      setUnlocked(true);
      setError('');
      sessionStorage.setItem('mj_confidential', '1');
      discover('confidential-unlocked');
    } else {
      setAttempts((a) => a + 1);
      setError(attempts >= 2 ? 'Access denied. Hint: the founder’s story holds the key — craft@year.' : 'Incorrect password. Access to this document is restricted.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPw('');
    }
  };
  const lock = () => { sessionStorage.removeItem('mj_confidential'); setUnlocked(false); };

  return (
    <div className="container-luxe py-12">
      {unlocked ? (
        <Document onLock={lock} />
      ) : (
        <div className="page-enter mx-auto max-w-md">
          <form onSubmit={onSubmit} noValidate className={`rounded-3xl border border-champagne-300 bg-white p-10 text-center shadow-luxe transition-transform`} aria-label="Confidential document access" style={shake ? { transform: 'translateX(-4px)' } : undefined}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-champagne-300 to-champagne-600 text-white shadow-luxe"><LockIcon width={34} height={34} /></div>
            <p className="eyebrow mt-6">Restricted Access</p>
            <h1 className="mt-2 font-serif text-2xl leading-snug">MODERN JEWELLERS — CONFIDENTIAL MANAGEMENT DOCUMENT</h1>
            <p className="mt-3 text-sm text-cocoa-500">This document is protected. Enter the management access key to continue.</p>
            <label htmlFor="doc-password" className="sr-only">Password</label>
            <div className="relative mt-6">
              <input id="doc-password" type={show ? 'text' : 'password'} value={pw} onChange={(e) => { setPw(e.target.value); setError(''); }} placeholder="Access key" autoComplete="off"
                className={`input pr-12 text-center tracking-[0.2em] ${error ? 'input-error' : ''}`} aria-invalid={!!error} aria-describedby={error ? 'doc-error' : undefined} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-400" aria-label={show ? 'Hide password' : 'Show password'}><EyeIcon width={18} /></button>
            </div>
            {error && <p id="doc-error" className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-700" role="alert">{error}</p>}
            <button type="submit" className="btn-gold mt-6 w-full">Unlock Document</button>
            <p className="mt-4 text-xs text-cocoa-300">Unauthorised access attempts are logged · {attempts} failed attempt{attempts === 1 ? '' : 's'}</p>
          </form>
          <p className="mt-6 text-center text-sm"><Link to="/" className="text-cocoa-400 underline">Return to the boutique</Link></p>
        </div>
      )}
    </div>
  );
}
