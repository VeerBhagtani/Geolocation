import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Kpi, shortINR, Filters } from './AdminUI';
import { downloadCSV } from './useAdminData';
import Pagination from '../../components/Pagination';

const STORES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Jaipur', 'Kolkata', 'Chennai', 'Ahmedabad'];

export default function AdminInventory() {
  const { allProducts, adminEditProduct, notify } = useStore();
  const [f, setF] = useState({ category: '' });
  const [status, setStatus] = useState('');
  const [restock, setRestock] = useState({});
  const [page, setPage] = useState(1);
  const list = allProducts.filter((p) => (!f.category || p.category === f.category) && (!status || (status === 'out' ? p.stock === 0 : status === 'low' ? p.stock > 0 && p.stock <= 3 : p.stock > 3)));
  const shown = list.slice((page - 1) * 12, page * 12);
  const units = allProducts.reduce((s, p) => s + p.stock, 0);
  const value = allProducts.reduce((s, p) => s + p.stock * p.price, 0);
  const setStock = (p, stock) => adminEditProduct(p.id, { stock: Math.max(0, stock) });
  const doRestock = (p) => {
    const n = Number(restock[p.id] || 0);
    if (n <= 0) return notify('Enter a quantity to restock', 'error');
    setStock(p, p.stock + n);
    setRestock({ ...restock, [p.id]: '' });
    notify(`Restocked ${n} × ${p.name}`);
  };
  const exportCsv = () => downloadCSV('inventory_export.csv', [['ID', 'Name', 'Category', 'Stock', 'Unit Price', 'Stock Value'], ...list.map((p) => [p.id, p.name, p.category, p.stock, p.price, p.stock * p.price])]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Stock</p><h1 className="font-serif text-4xl">Inventory Management</h1></div>
        <button className="btn-outline btn-sm" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Units in stock" value={units} />
        <Kpi label="Stock value" value={shortINR(value)} />
        <Kpi label="Low stock" value={allProducts.filter((p) => p.stock > 0 && p.stock <= 3).length} />
        <Kpi label="Out of stock" value={allProducts.filter((p) => p.stock === 0).length} />
      </div>
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <Filters value={f} onChange={(v) => { setF(v); setPage(1); }} show={['category']} />
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Stock status
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input mt-1 !w-40 normal-case"><option value="">All</option><option value="in">In stock</option><option value="low">Low (≤3)</option><option value="out">Out of stock</option></select>
        </label>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-luxe min-w-[900px]">
          <thead><tr><th>Product</th><th>Category</th><th>Primary store</th><th>Stock</th><th>Adjust</th><th>Restock</th></tr></thead>
          <tbody>
            {shown.map((p, i) => (
              <tr key={p.id} className={p.stock === 0 ? 'bg-rose-50/40' : p.stock <= 3 ? 'bg-amber-50/40' : ''}>
                <td><p>{p.name}</p><p className="font-mono text-xs text-cocoa-400">{p.id}</p></td>
                <td>{p.category}</td><td>{STORES[(i + page) % STORES.length]}</td>
                <td className={`font-medium ${p.stock === 0 ? 'text-rose-600' : p.stock <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>{p.stock}</td>
                <td><div className="flex gap-1"><button className="h-8 w-8 rounded-full border border-cream-300" onClick={() => setStock(p, p.stock - 1)} aria-label={`Decrease ${p.name} stock`}>−</button><button className="h-8 w-8 rounded-full border border-cream-300" onClick={() => setStock(p, p.stock + 1)} aria-label={`Increase ${p.name} stock`}>+</button></div></td>
                <td><div className="flex gap-2"><input type="number" min="1" value={restock[p.id] || ''} onChange={(e) => setRestock({ ...restock, [p.id]: e.target.value })} className="input !w-20 !py-1.5" aria-label={`Restock quantity for ${p.name}`} /><button className="btn-outline btn-sm !px-3" onClick={() => doRestock(p)}>Restock</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(list.length / 12)} onChange={setPage} />
    </div>
  );
}
