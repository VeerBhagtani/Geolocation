import { useState } from 'react';
import useAdminData, { filterOrders, downloadCSV } from './useAdminData';
import { BarChart, DEFAULT_FILTERS, Filters, HBar, Kpi, monthly, shortINR } from './AdminUI';
import { REGIONS, PAYMENT_STATUSES } from '../../data/adminSeed';
import { formatINR } from '../../utils/format';

export default function AdminReports() {
  const { allOrders } = useAdminData();
  const [f, setF] = useState(DEFAULT_FILTERS);
  const orders = filterOrders(allOrders, f);
  const valid = orders.filter((o) => o.paymentStatus === 'Paid');
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const months = monthly(orders);
  const cat = {};
  const prod = {};
  valid.forEach((o) => o.items.forEach((i) => {
    cat[i.category] = (cat[i.category] || 0) + i.price * i.qty;
    prod[i.name] = (prod[i.name] || 0) + i.qty;
  }));
  const byRegion = REGIONS.map((r) => ({ label: r, value: valid.filter((o) => o.region === r).reduce((s, o) => s + o.total, 0) }));
  const byPay = PAYMENT_STATUSES.map((p) => ({ label: p, value: orders.filter((o) => o.paymentStatus === p).length }));
  const top = Object.entries(prod).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const exportCsv = () => downloadCSV('sales_report_2026.csv', [['Month', 'Revenue (INR)', 'Orders'], ...months.map((m) => [m.label, Math.round(m.value), m.count])]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Analytics</p><h1 className="font-serif text-4xl">Sales Reports</h1></div>
        <div className="flex gap-2"><button className="btn-outline btn-sm" onClick={exportCsv}>Export CSV</button><button className="btn-ghost btn-sm" onClick={() => window.print()}>Print</button></div>
      </div>
      <Filters value={f} onChange={setF} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Revenue (paid)" value={shortINR(revenue)} />
        <Kpi label="Orders" value={orders.length} />
        <Kpi label="Avg. order value" value={shortINR(valid.length ? revenue / valid.length : 0)} />
        <Kpi label="Refund / fail rate" value={`${orders.length ? Math.round((orders.filter((o) => ['Refunded', 'Failed'].includes(o.paymentStatus)).length / orders.length) * 100) : 0}%`} />
      </div>
      <section className="card p-6">
        <h2 className="font-serif text-2xl">Monthly Sales Information — 2026</h2>
        <div className="mt-6"><BarChart data={months} format={shortINR} height={240} /></div>
        <div className="mt-6 overflow-x-auto">
          <table className="table-luxe">
            <thead><tr><th>Month</th>{months.map((m) => <th key={m.label}>{m.label}</th>)}</tr></thead>
            <tbody>
              <tr><th>Revenue</th>{months.map((m) => <td key={m.label} className="whitespace-nowrap">{shortINR(m.value)}</td>)}</tr>
              <tr><th>Orders</th>{months.map((m) => <td key={m.label}>{m.count}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6"><h2 className="mb-4 font-serif text-2xl">By Category</h2><HBar data={Object.entries(cat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)} format={shortINR} /></section>
        <section className="card p-6"><h2 className="mb-4 font-serif text-2xl">By Region</h2><HBar data={byRegion} format={shortINR} /></section>
        <section className="card p-6"><h2 className="mb-4 font-serif text-2xl">Payment Status</h2><HBar data={byPay} format={(v) => `${v} orders`} /></section>
      </div>
      <section className="card p-6">
        <h2 className="font-serif text-2xl">Top Selling Products</h2>
        <table className="table-luxe mt-4"><thead><tr><th>#</th><th>Product</th><th>Units sold</th></tr></thead>
          <tbody>{top.map(([n, u], i) => <tr key={n}><td>{i + 1}</td><td>{n}</td><td>{u}</td></tr>)}</tbody></table>
        <p className="mt-3 text-xs text-cocoa-400">Revenue figures include GST and shipping. Total: {formatINR(revenue)}</p>
      </section>
    </div>
  );
}
