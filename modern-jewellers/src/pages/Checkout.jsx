import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import CartSummary from '../components/CartSummary';
import useForm, { rules } from '../hooks/useForm';
import { Input, Select, Textarea, RadioGroup, Checkbox } from '../components/Field';
import { formatINR } from '../utils/format';
import { LockIcon } from '../components/Icons';

export const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const REGION = { North: ['Chandigarh', 'Delhi', 'Haryana', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Uttarakhand'], South: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana'], East: ['Assam', 'Bihar', 'Odisha', 'West Bengal'] };
const regionOf = (s) => Object.keys(REGION).find((r) => REGION[r].includes(s)) || 'West';

export default function Checkout() {
  const { cartItems, user, placeOrder, notify, prefs, setPrefs, totals } = useStore();
  const nav = useNavigate();
  const [processing, setProcessing] = useState(false);
  const requiredIf = (field, val) => (v, all) => (all[field] === val && !String(v || '').trim() ? 'This field is required' : '');
  const form = useForm(
    {
      firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '',
      address1: '', address2: '', city: '', state: '', pincode: prefs.pincode || '', addressType: 'Home', landmark: '',
      billingSame: true, preferredDate: '', giftWrap: false, giftMessage: '', paymentMethod: 'UPI',
      upiId: '', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '', bank: '', notes: '', terms: false,
    },
    {
      firstName: [rules.required], lastName: [rules.required], email: [rules.required, rules.email], phone: [rules.required, rules.phone],
      address1: [rules.required], city: [rules.required], state: [rules.required], pincode: [rules.required, rules.pincode],
      paymentMethod: [rules.required], terms: [rules.required],
      upiId: [requiredIf('paymentMethod', 'UPI'), (v, a) => (a.paymentMethod === 'UPI' && v && !/^[\w.-]+@[\w]+$/.test(v) ? 'Enter a valid UPI ID (e.g. name@okbank)' : '')],
      cardNumber: [requiredIf('paymentMethod', 'Credit / Debit Card'), (v, a) => (a.paymentMethod === 'Credit / Debit Card' && v && !/^\d{16}$/.test(v.replace(/\s/g, '')) ? 'Enter a 16-digit card number' : '')],
      cardName: [requiredIf('paymentMethod', 'Credit / Debit Card')],
      cardExpiry: [requiredIf('paymentMethod', 'Credit / Debit Card'), (v, a) => (a.paymentMethod === 'Credit / Debit Card' && v && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? 'Use MM/YY' : '')],
      cardCvv: [requiredIf('paymentMethod', 'Credit / Debit Card'), (v, a) => (a.paymentMethod === 'Credit / Debit Card' && v && !/^\d{3}$/.test(v) ? '3 digits' : '')],
      bank: [requiredIf('paymentMethod', 'Net Banking')],
    },
  );

  if (!cartItems.length && !processing) {
    return (
      <div className="container-luxe page-enter">
        <Breadcrumbs items={[{ label: 'Bag', to: '/cart' }, { label: 'Checkout' }]} />
        <div className="card mx-auto max-w-xl p-12 text-center">
          <p className="font-serif text-3xl">Nothing to check out yet</p>
          <Link to="/shop" className="btn-gold mt-6">Shop Now</Link>
        </div>
      </div>
    );
  }

  const v = form.values;
  const codBlocked = v.paymentMethod === 'Cash on Delivery' && totals.total > 50000;
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) {
      notify('Please complete all required fields', 'error');
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (codBlocked) return notify('Cash on Delivery is available only for orders up to ₹50,000', 'error');
    setProcessing(true);
    setTimeout(() => {
      const { cardNumber, cardCvv, cardExpiry, ...safe } = v;
      const order = placeOrder({ ...safe, cardLast4: cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : undefined, shippingMethod: prefs.shippingMethod, region: regionOf(v.state) });
      nav(`/order-confirmation/${order.id}`);
    }, 1600);
  };

  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Bag', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="section-title mb-2">Secure Checkout</h1>
      <p className="mb-8 flex items-center gap-2 text-sm text-cocoa-400"><LockIcon width={16} /> Simulated checkout — no real payment will be taken.</p>
      <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_380px]" aria-label="Checkout form">
        <div className="space-y-6">
          <section className="card space-y-5 p-6">
            <h2 className="font-serif text-2xl">1. Customer Details</h2>
            {!user && <p className="text-sm text-cocoa-500">Have an account? <Link to="/login?redirect=/checkout" className="text-champagne-700 underline">Sign in</Link> for faster checkout.</p>}
            <div className="grid gap-5 sm:grid-cols-2">
              <Input form={form} name="firstName" label="First name" required autoComplete="given-name" />
              <Input form={form} name="lastName" label="Last name" required autoComplete="family-name" />
              <Input form={form} name="email" label="Email" type="email" required autoComplete="email" />
              <Input form={form} name="phone" label="Mobile number" type="tel" required placeholder="98765 43210" autoComplete="tel" />
            </div>
          </section>

          <section className="card space-y-5 p-6">
            <h2 className="font-serif text-2xl">2. Shipping Address</h2>
            <Input form={form} name="address1" label="Address line 1" required placeholder="Flat / House no., Building" autoComplete="address-line1" />
            <Input form={form} name="address2" label="Address line 2" placeholder="Street, Area" autoComplete="address-line2" />
            <div className="grid gap-5 sm:grid-cols-3">
              <Input form={form} name="city" label="City" required autoComplete="address-level2" />
              <Select form={form} name="state" label="State" required options={STATES} />
              <Input form={form} name="pincode" label="PIN code" required inputMode="numeric" maxLength={6}
                onBlur={() => /^\d{6}$/.test(v.pincode) && setPrefs({ ...prefs, pincode: v.pincode })} />
            </div>
            <Input form={form} name="landmark" label="Landmark" placeholder="Near…" />
            <RadioGroup form={form} name="addressType" label="Address type" options={['Home', 'Office', 'Other']} />
            <Checkbox form={form} name="billingSame" label="Billing address is the same as shipping address" />
          </section>

          <section className="card space-y-5 p-6">
            <h2 className="font-serif text-2xl">3. Delivery</h2>
            <div className="space-y-2 text-sm" role="radiogroup" aria-label="Delivery method">
              {[['standard', 'Standard insured delivery (3–5 days)'], ['express', 'Express delivery (24–48 hrs) + ₹999'], ['sameday', 'Same-day delivery (metro) + ₹1,499']].map(([val, l]) => (
                <label key={val} className="flex cursor-pointer items-center gap-2 rounded-xl border border-cream-200 bg-cream-50 px-4 py-3">
                  <input type="radio" name="checkout-shipping" checked={prefs.shippingMethod === val} onChange={() => setPrefs({ ...prefs, shippingMethod: val })} className="accent-champagne-500" />
                  {l}
                </label>
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input form={form} name="preferredDate" label="Preferred delivery date" type="date" min={new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10)} hint="Optional — we’ll do our best" />
            </div>
            <Checkbox form={form} name="giftWrap" label="Add complimentary luxury gift wrapping" />
            {v.giftWrap && <Textarea form={form} name="giftMessage" label="Gift message" rows={2} maxLength={200} placeholder="With love…" />}
          </section>

          <section className="card space-y-5 p-6">
            <h2 className="font-serif text-2xl">4. Payment (Simulated)</h2>
            <RadioGroup form={form} name="paymentMethod" label="Payment method" required inline={false} options={['UPI', 'Credit / Debit Card', 'Net Banking', 'EMI', 'Cash on Delivery']} />
            {v.paymentMethod === 'UPI' && <Input form={form} name="upiId" label="UPI ID" placeholder="yourname@okbank" required />}
            {(v.paymentMethod === 'Credit / Debit Card' || v.paymentMethod === 'EMI') && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Input form={form} name="cardNumber" label="Card number" placeholder="4111 1111 1111 1111" inputMode="numeric" required={v.paymentMethod !== 'EMI'} className="sm:col-span-2" />
                <Input form={form} name="cardName" label="Name on card" required={v.paymentMethod !== 'EMI'} />
                <div className="grid grid-cols-2 gap-3">
                  <Input form={form} name="cardExpiry" label="Expiry" placeholder="MM/YY" required={v.paymentMethod !== 'EMI'} />
                  <Input form={form} name="cardCvv" label="CVV" type="password" maxLength={3} required={v.paymentMethod !== 'EMI'} />
                </div>
                {v.paymentMethod === 'EMI' && <p className="text-sm text-cocoa-500 sm:col-span-2">No-cost EMI: {formatINR(totals.total / 6)} × 6 months (simulated).</p>}
              </div>
            )}
            {v.paymentMethod === 'Net Banking' && <Select form={form} name="bank" label="Select bank" required options={['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda']} />}
            {codBlocked && <p className="field-error">Cash on Delivery is available for orders up to ₹50,000 only.</p>}
            <Textarea form={form} name="notes" label="Order notes" rows={2} placeholder="Any special instructions" />
            <Checkbox form={form} name="terms" label="I agree to the Terms of Sale and Return Policy" required />
          </section>
        </div>
        <div>
          <CartSummary showCoupon>
            <ul className="max-h-60 space-y-3 overflow-y-auto border-t border-cream-200 pt-4">
              {cartItems.map((x) => (
                <li key={x.id + x.size} className="flex items-center gap-3 text-sm">
                  <img src={x.product.image} alt="" className="h-12 w-12 rounded-lg" />
                  <span className="flex-1">{x.product.name} <span className="text-cocoa-400">× {x.qty}</span></span>
                  <span>{formatINR(x.product.price * x.qty)}</span>
                </li>
              ))}
            </ul>
            <button type="submit" className="btn-gold w-full" disabled={processing} id="place-order">
              {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing…</> : `Place Order · ${formatINR(totals.total)}`}
            </button>
          </CartSummary>
        </div>
      </form>
    </div>
  );
}
