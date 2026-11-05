import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { Filters } from './AdminUI';
import { formatINR, slugify } from '../../utils/format';
import useForm, { rules } from '../../hooks/useForm';
import { Input, Select, Textarea } from '../../components/Field';
import { CATEGORIES } from './useAdminData';

const PER = 10;

function ProductForm({ initial, onSave, isNew }) {
  const form = useForm(initial, {
    name: [rules.required], category: [rules.required], metalGroup: [rules.required], material: [rules.required],
    price: [rules.required, (v) => (Number(v) <= 0 ? 'Price must be positive' : '')], stock: [(v) => (v === '' || Number(v) < 0 ? 'Stock must be 0 or more' : '')],
  });
  const submit = (e) => {
    e.preventDefault();
    if (form.validate()) onSave({ ...form.values, price: Number(form.values.price), mrp: Number(form.values.mrp || form.values.price), stock: Number(form.values.stock) });
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Input form={form} name="name" label="Product name" required className="sm:col-span-2" />
      <Select form={form} name="category" label="Category" required options={CATEGORIES} disabled={!isNew} />
      <Select form={form} name="metalGroup" label="Metal" required options={['Gold', 'Diamond', 'Silver']} disabled={!isNew} />
      <Input form={form} name="material" label="Material" required className="sm:col-span-2" />
      <Input form={form} name="price" label="Price (₹)" type="number" required />
      <Input form={form} name="mrp" label="MRP (₹)" type="number" />
      <Input form={form} name="stock" label="Stock quantity" type="number" required />
      <Input form={form} name="weightGrams" label="Weight (g)" type="number" step="0.01" />
      <Textarea form={form} name="description" label="Description" rows={3} className="sm:col-span-2" />
      <button className="btn-gold sm:col-span-2" type="submit">{isNew ? 'Add Product' : 'Save Changes'}</button>
    </form>
  );
}

export default function AdminProducts() {
  const { allProducts, adminEditProduct, adminAddProduct, adminDeleteProduct, notify } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState({ category: '' });
  const [metal, setMetal] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const list = allProducts.filter((p) => (!f.category || p.category === f.category) && (!metal || p.metalGroup === metal) && (p.name + p.id).toLowerCase().includes(q.toLowerCase()));
  const pages = Math.ceil(list.length / PER);
  const shown = list.slice((page - 1) * PER, page * PER);

  const save = (vals) => {
    adminEditProduct(editing.id, { name: vals.name, material: vals.material, price: vals.price, mrp: vals.mrp, stock: vals.stock, description: vals.description, weightGrams: Number(vals.weightGrams), weight: `${Number(vals.weightGrams).toFixed(2)} g` });
    notify(`${vals.name} updated`);
    setEditing(null);
  };
  const add = (vals) => {
    const prefix = { Gold: 'G', Diamond: 'D', Silver: 'S' }[vals.metalGroup];
    const id = `MJ-N${prefix}-${String(Date.now()).slice(-4)}`;
    const w = Number(vals.weightGrams || 1);
    adminAddProduct({
      id, name: vals.name, slug: slugify(vals.name), category: vals.category, metalGroup: vals.metalGroup, material: vals.material,
      purity: vals.metalGroup === 'Silver' ? '92.5% Silver' : vals.metalGroup === 'Diamond' ? '18K (750)' : '22K (916)',
      weight: `${w.toFixed(2)} g`, weightGrams: w, price: vals.price, mrp: vals.mrp, discountPercent: vals.mrp > vals.price ? Math.round(((vals.mrp - vals.price) / vals.mrp) * 100) : 0,
      stock: vals.stock, availability: vals.stock <= 0 ? 'Out of Stock' : vals.stock <= 3 ? 'Only a Few Left' : 'In Stock',
      rating: 5, reviewsCount: 0, popularity: 50, dateAdded: new Date().toISOString().slice(0, 10), collections: ['everyday'], occasion: 'Daily Wear', tags: ['new'],
      image: allProducts.find((p) => p.category === vals.category && p.metalGroup === vals.metalGroup)?.image || allProducts[0].image,
      description: vals.description || `${vals.name} — a new addition to the Modern Jewellers boutique.`,
      specifications: { Metal: vals.material, 'Gross Weight': `${w.toFixed(2)} g`, Hallmark: 'BIS Hallmarked · HUID', Warranty: 'Lifetime maintenance' },
    });
    notify(`${vals.name} added as ${id}`);
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Catalogue</p><h1 className="font-serif text-4xl">Product Management</h1></div>
        <button className="btn-gold" onClick={() => setAdding(true)}>+ Add Product</button>
      </div>
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <label className="flex-1 text-xs uppercase tracking-wider text-cocoa-500">Search<input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Name or ID" className="input mt-1 normal-case" /></label>
        <Filters value={f} onChange={(v) => { setF(v); setPage(1); }} show={['category']} />
        <label className="text-xs uppercase tracking-wider text-cocoa-500">Metal
          <select value={metal} onChange={(e) => { setMetal(e.target.value); setPage(1); }} className="input mt-1 !w-36 normal-case"><option value="">All</option><option>Gold</option><option>Diamond</option><option>Silver</option></select>
        </label>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-luxe min-w-[860px]">
          <thead><tr><th>Product</th><th>ID</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded-lg" /><span>{p.name}{p.hidden && <span className="ml-2 chip !py-0">Vault</span>}</span></div></td>
                <td className="font-mono text-xs">{p.id}</td><td>{p.category}</td><td>{formatINR(p.price)}</td><td>{p.stock}</td><td>{p.availability}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/product/${p.id}`} className="btn-ghost btn-sm !px-3">View</Link>
                    <button className="btn-outline btn-sm !px-3" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn-sm btn !px-3 text-rose-600 hover:bg-rose-50" onClick={() => setConfirm(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} onChange={setPage} />
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.id || ''}`} wide>
        {editing && <ProductForm initial={{ ...editing, weightGrams: editing.weightGrams }} onSave={save} />}
      </Modal>
      <Modal open={adding} onClose={() => setAdding(false)} title="Add New Product" wide>
        <ProductForm isNew initial={{ name: '', category: '', metalGroup: '', material: '', price: '', mrp: '', stock: '10', weightGrams: '', description: '' }} onSave={add} />
      </Modal>
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete product?">
        <p className="text-cocoa-600">Remove <strong>{confirm?.name}</strong> ({confirm?.id}) from the catalogue? You can restore it via “Revert Admin Edits”.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn bg-rose-600 text-white hover:bg-rose-700" onClick={() => { adminDeleteProduct(confirm.id); notify(`${confirm.name} deleted`, 'info'); setConfirm(null); }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
