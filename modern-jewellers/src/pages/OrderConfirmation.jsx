import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatDate, formatINR } from '../utils/format';
import NotFound from './NotFound';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { orders } = useStore();
  const o = orders.find((x) => x.id === orderId);
  if (!o) return <NotFound />;
  const eta = new Date(o.date);
  eta.setDate(eta.getDate() + (o.shippingMethod === 'express' ? 2 : o.shippingMethod === 'sameday' ? 0 : 5));
  return (
    <div className="container-luxe page-enter py-10">
      <div className="mx-auto max-w-3xl">
        <div className="card p-8 text-center md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-champagne-300 to-champagne-600 text-4xl text-white shadow-luxe">✓</div>
          <p className="eyebrow mt-6">Order Confirmed</p>
          <h1 className="mt-2 font-serif text-4xl">Thank you, {o.firstName}!</h1>
          <p className="mt-3 text-cocoa-500">Your order <strong className="text-cocoa-700" data-testid="order-id">{o.id}</strong> has been placed. A confirmation has been sent to {o.email}.</p>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl bg-cream-100 p-4"><p className="label">Order date</p><p>{formatDate(o.date)}</p></div>
            <div className="rounded-xl bg-cream-100 p-4"><p className="label">Estimated delivery</p><p>{formatDate(eta)}</p></div>
            <div className="rounded-xl bg-cream-100 p-4"><p className="label">Payment</p><p>{o.paymentMethod} · {o.paymentStatus}</p></div>
          </div>
        </div>
        <div className="card mt-6 p-6">
          <h2 className="font-serif text-2xl">Order Details</h2>
          <ul className="mt-4 divide-y divide-cream-200">
            {o.items.map((it) => (
              <li key={it.id + it.size} className="flex items-center gap-4 py-3">
                <img src={it.image} alt="" className="h-16 w-16 rounded-lg" />
                <div className="flex-1"><p>{it.name}</p><p className="text-xs text-cocoa-400">{it.id} · Qty {it.qty}{it.size && ` · Size ${it.size}`}</p></div>
                <p>{formatINR(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-cream-200 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount ({o.couponCode})</dt><dd>− {formatINR(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shipping ? formatINR(o.shipping) : 'FREE'}</dd></div>
            <div className="flex justify-between"><dt>GST</dt><dd>{formatINR(o.gst)}</dd></div>
            <div className="flex justify-between text-lg font-medium"><dt>Total paid</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>
          <div className="mt-6 rounded-xl bg-cream-100 p-4 text-sm">
            <p className="label">Shipping to</p>
            <p>{o.customer}, {o.address1}{o.address2 && `, ${o.address2}`}, {o.city}, {o.state} – {o.pincode}</p>
            <p className="text-cocoa-400">{o.phone}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={`/track-order?order=${o.id}&contact=${encodeURIComponent(o.email)}`} className="btn-gold">Track Order</Link>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
          <button className="btn-ghost" onClick={() => window.print()}>Print Receipt</button>
        </div>
      </div>
    </div>
  );
}
