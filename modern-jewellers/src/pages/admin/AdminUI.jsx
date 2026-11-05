import { CATEGORIES, DATE_RANGES } from './useAdminData';
import { REGIONS, PAYMENT_STATUSES } from '../../data/adminSeed';

export function Filters({ value, onChange, show = ['range', 'category', 'region', 'payment'] }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="flex flex-wrap gap-3" data-testid="admin-filters">
      {show.includes('range') && (
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Date range
          <select value={value.range} onChange={set('range')} className="input mt-1 !w-44 normal-case tracking-normal" id="filter-range">
            {DATE_RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      )}
      {show.includes('category') && (
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Category
          <select value={value.category} onChange={set('category')} className="input mt-1 !w-44 normal-case tracking-normal" id="filter-category">
            <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      )}
      {show.includes('region') && (
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Sales region
          <select value={value.region} onChange={set('region')} className="input mt-1 !w-36 normal-case tracking-normal" id="filter-region">
            <option value="">All regions</option>{REGIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      )}
      {show.includes('payment') && (
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Payment status
          <select value={value.payment} onChange={set('payment')} className="input mt-1 !w-36 normal-case tracking-normal" id="filter-payment">
            <option value="">All</option>{PAYMENT_STATUSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      )}
    </div>
  );
}
export const DEFAULT_FILTERS = { range: 'all', category: '', region: '', payment: '' };

export function Kpi({ label, value, sub }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-widest text-cocoa-400">{label}</p>
      <p className="mt-2 font-serif text-3xl text-cocoa-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-cocoa-400">{sub}</p>}
    </div>
  );
}

export function BarChart({ data, format = (v) => v, height = 200 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }} role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[0.6rem] text-cocoa-500 opacity-0 transition group-hover:opacity-100">{format(d.value)}</span>
          <div className="w-full rounded-t-md bg-gradient-to-t from-champagne-600 to-champagne-300 transition-all" style={{ height: `${(d.value / max) * 85}%`, minHeight: d.value ? 3 : 0 }} title={`${d.label}: ${format(d.value)}`} />
          <span className="text-[0.6rem] uppercase text-cocoa-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function HBar({ data, format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between text-sm"><span className="text-cocoa-600">{d.label}</span><span className="text-cocoa-500">{format(d.value)}</span></div>
          <div className="mt-1 h-2 rounded-full bg-cream-200"><div className="h-2 rounded-full bg-gradient-to-r from-champagne-400 to-champagne-600" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function StatusPill({ s }) {
  const c = { Paid: 'bg-emerald-50 text-emerald-700', Delivered: 'bg-emerald-50 text-emerald-700', Pending: 'bg-amber-50 text-amber-700', Processing: 'bg-amber-50 text-amber-700', Packed: 'bg-sky-50 text-sky-700', Shipped: 'bg-sky-50 text-sky-700', 'Out for Delivery': 'bg-indigo-50 text-indigo-700', Refunded: 'bg-stone-100 text-stone-600', Failed: 'bg-rose-50 text-rose-700', Cancelled: 'bg-rose-50 text-rose-700', Open: 'bg-amber-50 text-amber-700', Replied: 'bg-sky-50 text-sky-700', Closed: 'bg-stone-100 text-stone-600' }[s] || 'bg-cream-100 text-cocoa-600';
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${c}`}>{s}</span>;
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function monthly(orders) {
  const m = MONTHS.map((label) => ({ label, value: 0, count: 0 }));
  orders.filter((o) => o.paymentStatus !== 'Failed' && o.paymentStatus !== 'Refunded').forEach((o) => {
    const d = new Date(o.date);
    if (d.getFullYear() === 2026) { m[d.getMonth()].value += o.total; m[d.getMonth()].count++; }
  });
  return m;
}
export const shortINR = (n) => (n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${Math.round(n).toLocaleString('en-IN')}`);
