import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import useAdminData, { filterOrders } from './useAdminData';
import { BarChart, DEFAULT_FILTERS, Filters, HBar, Kpi, StatusPill, monthly, shortINR } from './AdminUI';
import { formatDate, formatINR } from '../../utils/format';

export default function AdminDashboard() {
  const { allProducts } = useStore();
  const { allOrders, customers, enquiries } = useAdminData();
  const [f, setF] = useState(DEFAULT_FILTERS);
  const orders = filterOrders(allOrders, f);
  const paid = orders.filter((o) => o.paymentStatus === 'Paid');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const products = allProducts.filter((p) => !f.category || p.category === f.category);
  const lowStock = products.filter((p) => p.stock <= 3).sort((a, b) => a.stock - b.stock);
  const byCat = [...new Set(allProducts.map((p) => p.category))].map((c) => ({ label: c, value: allProducts.filter((p) => p.category === c).reduce((s, p) => s + p.stock, 0) }));
  const customerCount = f.region ? customers.filter((c) => c.region === f.region).length : customers.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Overview</p><h1 className="font-serif text-4xl">Admin Dashboard</h1></div>
        <Filters value={f} onChange={setF} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total revenue" value={shortINR(revenue)} sub={`${paid.length} paid orders`} />
        <Kpi label="Total orders" value={orders.length} sub={`${orders.filter((o) => o.paymentStatus === 'Pending').length} pending payment`} />
        <Kpi label="Total customers" value={customerCount} sub={f.region ? `${f.region} region` : 'All regions'} />
        <Kpi label="Total products" value={products.length} sub={`${products.filter((p) => p.hidden).length} unlisted vault pieces`} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Monthly Sales 2026</h2><Link to="/admin/reports" className="text-xs text-champagne-700 underline">Full report</Link></div>
          <div className="mt-6"><BarChart data={monthly(orders)} format={shortINR} /></div>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Inventory Overview</h2><Link to="/admin/inventory" className="text-xs text-champagne-700 underline">Manage</Link></div>
          <p className="mb-4 text-xs text-cocoa-400">Units in stock by category</p>
          <HBar data={byCat} />
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <section className="card p-6" data-testid="low-stock">
          <h2 className="font-serif text-2xl">Low-Stock Alerts <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-sm text-rose-700">{lowStock.length}</span></h2>
          <ul className="mt-4 divide-y divide-cream-200">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <img src={p.image} alt="" className="h-10 w-10 rounded-lg" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm">{p.name}</p><p className="text-xs text-cocoa-400">{p.id}</p></div>
                <span className={`text-sm font-medium ${p.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>{p.stock === 0 ? 'Out' : `${p.stock} left`}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card overflow-hidden p-6">
          <div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Recent Orders</h2><Link to="/admin/orders" className="text-xs text-champagne-700 underline">All orders</Link></div>
          <div className="mt-4 overflow-x-auto">
            <table className="table-luxe">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Region</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id}><td className="font-medium">{o.id}</td><td>{o.customer}</td><td>{formatDate(o.date)}</td><td>{o.region}</td><td>{formatINR(o.total)}</td><td><StatusPill s={o.paymentStatus} /></td><td><StatusPill s={o.status} /></td></tr>
                ))}
                {!orders.length && <tr><td colSpan={7} className="text-center text-cocoa-400">No orders match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="card p-6" data-testid="enquiries">
        <h2 className="font-serif text-2xl">Customer Enquiries</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {enquiries.slice(0, 6).map((e) => (
            <div key={e.id} className="rounded-xl border border-cream-200 p-4">
              <div className="flex items-center justify-between gap-2"><p className="font-medium text-cocoa-700">{e.subject}</p><StatusPill s={e.status} /></div>
              <p className="mt-1 line-clamp-2 text-sm text-cocoa-500">{e.message}</p>
              <p className="mt-2 text-xs text-cocoa-400">{e.id} · {e.name} · {formatDate(e.date)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
