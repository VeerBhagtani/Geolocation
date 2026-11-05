import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/format';

export default function CartSummary({ children, showCoupon = true }) {
  const { totals, applyCoupon, removeCoupon, coupon, prefs } = useStore();
  const [code, setCode] = useState('');
  return (
    <div className="card sticky top-36 space-y-4 p-6" data-testid="cart-summary">
      <h2 className="font-serif text-2xl">Order Summary</h2>
      {showCoupon && (
        <div>
          <label htmlFor="coupon" className="label">Discount coupon</label>
          {coupon ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-champagne-400 bg-cream-100 px-3 py-2 text-sm">
              <span><strong className="tracking-widest text-champagne-700">{coupon}</strong> applied{totals.discount === 0 && ' (minimum not met)'}</span>
              <button className="text-xs text-cocoa-400 underline" onClick={removeCoupon}>Remove</button>
            </div>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (applyCoupon(code)) setCode(''); }}>
              <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" className="input uppercase" />
              <button className="btn-outline btn-sm" type="submit">Apply</button>
            </form>
          )}
        </div>
      )}
      <dl className="space-y-2 border-t border-cream-200 pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-cocoa-500">Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
        {totals.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount ({coupon})</dt><dd>− {formatINR(totals.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-cocoa-500">Shipping ({prefs.shippingMethod === 'express' ? 'Express' : prefs.shippingMethod === 'sameday' ? 'Same-day' : 'Standard'})</dt><dd>{totals.shipping === 0 ? <span className="text-emerald-700">FREE</span> : formatINR(totals.shipping)}</dd></div>
        <div className="flex justify-between"><dt className="text-cocoa-500">GST (3%)</dt><dd>{formatINR(totals.gst)}</dd></div>
        <div className="flex justify-between border-t border-cream-200 pt-3 text-lg font-medium"><dt>Total</dt><dd data-testid="cart-total">{formatINR(totals.total)}</dd></div>
      </dl>
      {totals.subtotal > 0 && totals.subtotal < 25000 && <p className="text-xs text-cocoa-400">Add {formatINR(25000 - totals.subtotal)} more for free insured shipping.</p>}
      {children}
    </div>
  );
}
