import { useState } from 'react';
import useAdminData from './useAdminData';
import { Filters, StatusPill } from './AdminUI';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { formatDate, formatINR } from '../../utils/format';

export default function AdminCustomers() {
  const { customers, allOrders } = useAdminData();
  const [q, setQ] = useState('');
  const [f, setF] = useState({ region: '' });
  const [tier, setTier] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState(null);
  const withStats = customers.map((c) => {
    const os = allOrders.filter((o) => o.email === c.email);
    return { ...c, orders: os.length, spend: os.reduce((s, o) => s + o.total, 0), list: os };
  });
  const list = withStats.filter((c) => (!f.region || c.region === f.region) && (!tier || c.tier === tier) && (c.name + c.email + c.id).toLowerCase().includes(q.toLowerCase()));
  const shown = list.slice((page - 1) * 12, page * 12);
  return (
    <div className="space-y-6">
      <div><p className="eyebrow">Patrons</p><h1 className="font-serif text-4xl">Customer Management</h1></div>
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="flex-1 text-xs uppercase tracking-wider text-cocoa-500">Search<input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name, email or ID" className="input mt-1 normal-case" /></label>
        <Filters value={f} onChange={(v) => { setF(v); setPage(1); }} show={['region']} />
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Tier
          <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(1); }} className="input mt-1 !w-36 normal-case"><option value="">All</option><option>Platinum</option><option>Gold</option><option>Silver</option><option>New</option></select>
        </label>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-luxe min-w-[880px]">
          <thead><tr><th>Customer</th><th>ID</th><th>City</th><th>Region</th><th>Tier</th><th>Orders</th><th>Lifetime spend</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id}>
                <td><p>{c.name}</p><p className="text-xs text-cocoa-400">{c.email}</p></td><td className="font-mono text-xs">{c.id}</td><td>{c.city}</td><td>{c.region}</td>
                <td><StatusPill s={c.tier} /></td><td>{c.orders}</td><td>{formatINR(c.spend)}</td><td>{formatDate(c.joined)}</td>
                <td><button className="text-xs text-champagne-700 underline" onClick={() => setView(c)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(list.length / 12)} onChange={setPage} />
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name} wide>
        {view && (
          <div className="space-y-3 text-sm">
            <p>{view.email} · {view.phone} · {view.city}</p>
            <p>Tier: {view.tier} · Member since {formatDate(view.joined)}</p>
            <table className="table-luxe"><thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{view.list.map((o) => <tr key={o.id}><td>{o.id}</td><td>{formatDate(o.date)}</td><td>{formatINR(o.total)}</td><td><StatusPill s={o.status} /></td></tr>)}
                {!view.list.length && <tr><td colSpan={4} className="text-cocoa-400">No orders yet.</td></tr>}</tbody></table>
          </div>
        )}
      </Modal>
    </div>
  );
}
