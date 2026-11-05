import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import CartSummary from '../components/CartSummary';
import ProductRail from '../components/ProductRail';
import SectionHeading from '../components/SectionHeading';
import { TrashIcon, HeartIcon } from '../components/Icons';
import { deliveryEstimate, formatDate, formatINR } from '../utils/format';

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, toggleWishlist, wishlist, prefs, setPrefs, products, clearCart } = useStore();
  const nav = useNavigate();
  const est = deliveryEstimate(prefs.pincode, prefs.shippingMethod);
  const suggestions = products.filter((p) => !cartItems.some((c) => c.id === p.id) && p.price < 60000).sort((a, b) => b.popularity - a.popularity).slice(0, 8);

  if (!cartItems.length) {
    return (
      <div className="container-luxe page-enter">
        <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />
        <div className="card mx-auto max-w-xl p-12 text-center">
          <p className="font-serif text-4xl">Your bag is empty</p>
          <p className="mt-2 text-cocoa-500">Discover handcrafted pieces made to be treasured.</p>
          <div className="mt-6 flex justify-center gap-3"><Link to="/shop" className="btn-gold">Shop Now</Link><Link to="/wishlist" className="btn-outline">View Wishlist</Link></div>
        </div>
        <section className="mt-16"><SectionHeading eyebrow="Popular right now" title="You Might Like" /><ProductRail products={suggestions} /></section>
      </div>
    );
  }

  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />
      <h1 className="section-title mb-8">Shopping Bag <span className="text-2xl text-cocoa-400">({cartItems.reduce((s, x) => s + x.qty, 0)})</span></h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cartItems.map(({ product: p, qty, size, id }) => (
            <div key={id + size} className="card flex gap-4 p-4" data-cart-item={id}>
              <Link to={`/product/${id}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-cream-100"><img src={p.image} alt={p.name} className="h-full w-full object-cover" /></Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link to={`/product/${id}`} className="font-serif text-xl hover:text-champagne-700">{p.name}</Link>
                    <p className="text-xs text-cocoa-400">{id} · {p.material.split(' with ')[0]} · {p.weight}{size && ` · Size ${size}`}</p>
                    <p className={`mt-1 text-xs ${p.stock <= 3 ? 'text-amber-600' : 'text-emerald-700'}`}>{p.availability}</p>
                  </div>
                  <p className="text-lg font-medium">{formatINR(p.price * qty)}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                  <div className="flex items-center rounded-full border border-cream-300">
                    <button className="h-8 w-8 text-cocoa-500" onClick={() => updateQty(id, size, qty - 1)} aria-label={`Decrease quantity of ${p.name}`}>−</button>
                    <input type="number" min="1" max={p.stock} value={qty} onChange={(e) => updateQty(id, size, Number(e.target.value) || 1)} className="w-10 bg-transparent text-center text-sm outline-none" aria-label={`Quantity of ${p.name}`} />
                    <button className="h-8 w-8 text-cocoa-500" onClick={() => updateQty(id, size, qty + 1)} aria-label={`Increase quantity of ${p.name}`}>+</button>
                  </div>
                  <button className="flex items-center gap-1 text-xs uppercase tracking-widest text-cocoa-400 hover:text-champagne-700" onClick={() => { if (!wishlist.includes(id)) toggleWishlist(id); removeFromCart(id, size); }}>
                    <HeartIcon width={14} /> Move to wishlist
                  </button>
                  <button className="flex items-center gap-1 text-xs uppercase tracking-widest text-cocoa-400 hover:text-rose-600" onClick={() => removeFromCart(id, size)} aria-label={`Remove ${p.name}`}>
                    <TrashIcon width={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <Link to="/shop" className="btn-ghost btn-sm">← Continue shopping</Link>
            <button className="btn-ghost btn-sm" onClick={clearCart}>Empty bag</button>
          </div>

          <div className="card space-y-4 p-6" data-section="shipping-calculator">
            <h3 className="font-serif text-2xl">Shipping Calculator</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ship-pin" className="label">Delivery PIN code</label>
                <input id="ship-pin" className="input" inputMode="numeric" placeholder="400001" value={prefs.pincode} onChange={(e) => setPrefs({ ...prefs, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
              </div>
              <div>
                <span className="label">Delivery method</span>
                <div className="space-y-2 text-sm">
                  {[['standard', 'Standard insured (3–5 days)', 'Free above ₹25,000'], ['express', 'Express (24–48 hrs)', '+ ₹999'], ['sameday', 'Same-day (metro PIN codes)', '+ ₹1,499']].map(([v, l, c]) => (
                    <label key={v} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" name="shipping-method" value={v} checked={prefs.shippingMethod === v} onChange={() => setPrefs({ ...prefs, shippingMethod: v })} className="accent-champagne-500"
                        disabled={v === 'sameday' && est && !est.sameDayAvailable} />
                      <span className="flex-1 text-cocoa-600">{l}</span><span className="text-xs text-cocoa-400">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {prefs.pincode.length === 6 && est && (
              <p className="text-sm text-emerald-700">Estimated delivery to {prefs.pincode}: <strong>{formatDate(est.date)}</strong>{!est.sameDayAvailable && ' · Same-day not available for this PIN'}</p>
            )}
            {prefs.pincode.length > 0 && prefs.pincode.length < 6 && <p className="field-error">Enter a 6-digit PIN code</p>}
          </div>
        </div>
        <CartSummary>
          <button className="btn-gold w-full" onClick={() => nav('/checkout')} id="proceed-checkout">Proceed to Checkout</button>
          <p className="text-center text-xs text-cocoa-400">Try WELCOME10, FESTIVE15, SILVER500 or SHAADI25K</p>
        </CartSummary>
      </div>
    </div>
  );
}
