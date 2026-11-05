import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import useForm, { rules } from '../hooks/useForm';
import { Input } from '../components/Field';
import { seedOrders, ORDER_STATUSES } from '../data/adminSeed';
import { formatDate, formatINR } from '../utils/format';

const STEPS = ORDER_STATUSES.slice(0, 5);

export default function TrackOrder() {
  const { orders, admin, notify } = useStore();
  const [sp] = useSearchParams();
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const form = useForm({ order: sp.get('order') || '', contact: sp.get('contact') || '' }, { order: [rules.required], contact: [rules.required] });

  const find = (orderId, contact) => {
    const all = [...orders, ...seedOrders];
    const o = all.find((x) => x.id.toLowerCase() === orderId.trim().toLowerCase());
    const c = contact.trim().toLowerCase().replace(/\s/g, '');
    if (o && (o.email?.toLowerCase() === c || o.phone?.replace(/\s/g, '').endsWith(c.replace(/^\+91/, '')))) {
      setResult({ ...o, status: admin.orderStatus[o.id] || o.status });
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
      notify('We couldn’t find an order with those details', 'error');
    }
  };
  useEffect(() => {
    if (sp.get('order') && sp.get('contact')) find(sp.get('order'), sp.get('contact'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.validate()) find(form.values.order, form.values.contact);
  };
  const stepIndex = result ? STEPS.indexOf(result.status) : -1;

  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Track Order' }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title text-center">Track Your Order</h1>
        <div className="divider-gold" />
        <form onSubmit={onSubmit} noValidate className="card mt-6 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end" aria-label="Order tracking">
          <Input form={form} name="order" label="Order number" required placeholder="MJ-ORD-240117" />
          <Input form={form} name="contact" label="Email or mobile" required placeholder="ananya.iyer@example.in" />
          <button className="btn-gold" type="submit">Track</button>
        </form>
        <p className="mt-2 text-center text-xs text-cocoa-400">Demo: MJ-ORD-240117 with ananya.iyer@example.in</p>
        {notFound && <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700" role="alert">No order matches those details. Please check your order number and contact information.</p>}
        {result && (
          <div className="card page-enter mt-8 p-6" data-testid="tracking-result">
            <div className="flex flex-wrap justify-between gap-2">
              <div><p className="label">Order</p><p className="font-serif text-2xl">{result.id}</p></div>
              <div className="text-right"><p className="label">Placed on</p><p>{formatDate(result.date)}</p></div>
            </div>
            {result.status === 'Cancelled' ? (
              <p className="mt-6 rounded-xl bg-rose-50 p-4 text-rose-700">This order was cancelled. Any payment has been refunded to the original method.</p>
            ) : (
              <ol className="mt-8 grid grid-cols-5 gap-2">
                {STEPS.map((s, i) => (
                  <li key={s} className="text-center">
                    <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 ${i <= stepIndex ? 'border-champagne-500 bg-champagne-500 text-white' : 'border-cream-300 text-cocoa-300'}`}>{i <= stepIndex ? '✓' : i + 1}</div>
                    <p className={`mt-2 text-[0.65rem] uppercase tracking-wider ${i <= stepIndex ? 'text-cocoa-700' : 'text-cocoa-300'}`}>{s}</p>
                  </li>
                ))}
              </ol>
            )}
            <ul className="mt-8 divide-y divide-cream-200 text-sm">
              {result.items.map((it, i) => <li key={i} className="flex justify-between py-2"><span>{it.name} × {it.qty}</span><span>{formatINR(it.price * it.qty)}</span></li>)}
            </ul>
            <p className="mt-4 text-right font-medium">Total: {formatINR(result.total)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
