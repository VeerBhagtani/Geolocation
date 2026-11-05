import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import useAdminData, { filterOrders, downloadCSV } from './useAdminData';
import { DEFAULT_FILTERS, Filters, StatusPill } from './AdminUI';
import { ORDER_STATUSES } from '../../data/adminSeed';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { formatDate, formatINR } from '../../utils/format';

export default function AdminOrders() {
  const { adminSetOrderStatus, notify } = useStore();
  const { allOrders } = useAdminData();
  const [f, setF] = useState(DEFAULT_FILTERS);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState(null);
  const list = filterOrders(allOrders, f).filter((o) => (!status || o.status === status) && (o.id + o.customer).toLowerCase().includes(q.toLowerCase()));
  const shown = list.slice((page - 1) * 12, page * 12);
  const change = (o, s) => { adminSetOrderStatus(o.id, s); notify(`${o.id} marked as ${s}`); };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Fulfilment</p><h1 className="font-serif text-4xl">Order Management</h1></div>
        <button className="btn-outline btn-sm" onClick={() => downloadCSV('orders_export.csv', [['Order', 'Customer', 'Date', 'Region', 'Total', 'Payment', 'Status'], ...list.map((o) => [o.id, o.customer, o.date.slice(0, 10), o.region, o.total, o.paymentStatus, o.status])])}>Export CSV</button>
      </div>
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Search<input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Order ID or customer" className="input mt-1 !w-56 normal-case" /></label>
        <Filters value={f} onChange={(v) => { setF(v); setPage(1); }} />
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Order status
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input mt-1 !w-40 normal-case"><option value="">All</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      </div>
      <p className="text-sm text-cocoa-500">{list.length} orders · {formatINR(list.reduce((s, o) => s + o.total, 0))}</p>
      <div className="card overflow-x-auto">
        <table className="table-luxe min-w-[980px]">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Region</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td className="font-medium">{o.id}</td><td>{o.customer}</td><td>{formatDate(o.date)}</td><td>{o.region}</td><td>{o.items.length}</td><td>{formatINR(o.total)}</td>
                <td><StatusPill s={o.paymentStatus} /></td>
                <td><select value={o.status} onChange={(e) => change(o, e.target.value)} className="input !w-40 !py-1.5" aria-label={`Status for ${o.id}`}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                <td><button className="text-xs text-champagne-700 underline" onClick={() => setView(o)}>View</button></td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={9} className="text-center text-cocoa-400">No orders match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(list.length / 12)} onChange={setPage} />
      <Modal open={!!view} onClose={() => setView(null)} title={view?.id} wide>
        {view && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div><p className="label">Customer</p><p>{view.customer}</p><p className="text-cocoa-400">{view.email}</p></div>
              <div><p className="label">Placed</p><p>{formatDate(view.date)}</p><p className="text-cocoa-400">{view.region} · {view.city}</p></div>
              <div><p className="label">Payment</p><p>{view.paymentMethod}</p><StatusPill s={view.paymentStatus} /></div>
            </div>
            <table className="table-luxe"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
              <tbody>{view.items.map((i, k) => <tr key={k}><td>{i.name} <span className="text-cocoa-400">({i.id})</span></td><td>{i.qty}</td><td>{formatINR(i.price * i.qty)}</td></tr>)}</tbody></table>
            <p className="text-right text-lg font-medium">Total {formatINR(view.total)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
