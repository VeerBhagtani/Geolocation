import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import Rating from '../components/Rating';
import ProductRail from '../components/ProductRail';
import SectionHeading from '../components/SectionHeading';
import RecentlyViewed from '../components/RecentlyViewed';
import Modal from '../components/Modal';
import { Input, Select, Textarea, RadioGroup, Checkbox } from '../components/Field';
import useForm, { rules } from '../hooks/useForm';
import { BagIcon, CompareIcon, HeartIcon, ShieldIcon, TruckIcon, RefreshIcon, StarIcon } from '../components/Icons';
import { categoryToSlug, deliveryEstimate, formatDate, formatINR } from '../utils/format';
import NotFound from './NotFound';

const VIEWS = [
  { label: 'Front', style: {} },
  { label: 'Detail', style: { transform: 'scale(1.6)', transformOrigin: '50% 40%' } },
  { label: 'Angle', style: { transform: 'scale(1.15) rotate(-8deg)' } },
  { label: 'Close-up', style: { transform: 'scale(2.2)', transformOrigin: '50% 70%' } },
];

/** Renders descriptions; [[word]] becomes a discreet inline link. */
function Description({ text, onSecret }) {
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return (
    <p className="leading-relaxed text-cocoa-600">
      {parts.map((part, i) => {
        const m = part.match(/^\[\[(.+)\]\]$/);
        return m ? (
          <Link key={i} to="/whispers" onClick={onSecret} className="text-inherit no-underline hover:text-champagne-700" data-hidden-link="true">{m[1]}</Link>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
}

function ReviewForm({ productId }) {
  const { addReview, notify, user } = useStore();
  const form = useForm(
    { name: user ? `${user.firstName} ${user.lastName}` : '', rating: '', title: '', text: '', recommend: true, purchaseDate: '' },
    { name: [rules.required], rating: [rules.required], title: [rules.required], text: [rules.required, rules.min(15)] },
  );
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) return notify('Please complete the highlighted fields', 'error');
    addReview(productId, { ...form.values, rating: Number(form.values.rating) });
    notify('Thank you! Your review has been published.');
    form.reset();
  };
  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-4 p-6" aria-label="Write a review">
      <h3 className="font-serif text-2xl">Write a Review</h3>
      <RadioGroup form={form} name="rating" label="Your rating" required options={['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: `${v} ★` }))} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input form={form} name="name" label="Your name" required />
        <Input form={form} name="purchaseDate" label="Date of purchase" type="date" max={new Date().toISOString().slice(0, 10)} />
      </div>
      <Input form={form} name="title" label="Review title" required placeholder="e.g. Exquisite craftsmanship" />
      <Textarea form={form} name="text" label="Your review" required placeholder="Tell us about the fit, finish and sparkle…" />
      <Checkbox form={form} name="recommend" label="I would recommend this piece to a friend" />
      <button className="btn-gold" type="submit">Submit Review</button>
    </form>
  );
}

function EnquiryForm({ product, onDone }) {
  const { submit, notify, user } = useStore();
  const form = useForm(
    { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email || '', phone: user?.phone || '', type: '', contactPref: 'Phone', appointment: '', message: `I would like to know more about ${product.name} (${product.id}).`, consent: false },
    { name: [rules.required], email: [rules.required, rules.email], phone: [rules.required, rules.phone], type: [rules.required], message: [rules.required], consent: [rules.required] },
  );
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) return notify('Please complete the highlighted fields', 'error');
    const entry = submit('enquiries', { ...form.values, productId: product.id, productName: product.name, subject: `${form.values.type}: ${product.name}` });
    notify(`Enquiry ${entry.id} received. Our concierge will contact you within 24 hours.`);
    onDone();
  };
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-label="Product enquiry">
      <div className="flex items-center gap-3 rounded-xl bg-cream-100 p-3">
        <img src={product.image} alt="" className="h-14 w-14 rounded-lg" />
        <div><p className="font-serif text-lg">{product.name}</p><p className="text-xs text-cocoa-400">{product.id} · {formatINR(product.price)}</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input form={form} name="name" label="Full name" required />
        <Input form={form} name="phone" label="Mobile" required type="tel" placeholder="98765 43210" />
      </div>
      <Input form={form} name="email" label="Email" required type="email" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select form={form} name="type" label="Enquiry type" required options={['Price & Availability', 'Customisation', 'Size Change', 'Store Appointment', 'Video Call Viewing', 'Gold Exchange']} />
        <Input form={form} name="appointment" label="Preferred date" type="date" min={new Date().toISOString().slice(0, 10)} />
      </div>
      <RadioGroup form={form} name="contactPref" label="Preferred contact" options={['Phone', 'WhatsApp', 'Email']} />
      <Textarea form={form} name="message" label="Message" required rows={3} />
      <Checkbox form={form} name="consent" label="I agree to be contacted by Modern Jewellers about this enquiry" required />
      <button className="btn-gold w-full" type="submit">Send Enquiry</button>
    </form>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getProduct, products, addToCart, toggleWishlist, wishlist, toggleCompare, compare, addRecent, reviews, discover, prefs, setPrefs } = useStore();
  const p = getProduct(id);
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [tab, setTab] = useState('description');
  const [pin, setPin] = useState(prefs.pincode || '');
  const [est, setEst] = useState(null);
  const [enquiry, setEnquiry] = useState(false);
  const [imageSecret, setImageSecret] = useState(false);
  const [bottomReveal, setBottomReveal] = useState(false);
  const imgClicks = useRef(0);

  useEffect(() => {
    if (p) addRecent(p.id);
    setView(0); setQty(1); setSize(''); imgClicks.current = 0; setBottomReveal(false);
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal a private button when the visitor reaches the very bottom of the Shubh Vivaah page.
  useEffect(() => {
    if (p?.id !== 'MJ-BS-7001') return;
    const on = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) setBottomReveal(true);
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [p?.id]);

  const recs = useMemo(() => {
    if (!p) return [];
    return products
      .filter((x) => x.id !== p.id)
      .map((x) => ({ x, score: (x.category === p.category ? 3 : 0) + (x.metalGroup === p.metalGroup ? 2 : 0) + x.collections.filter((c) => p.collections.includes(c)).length }))
      .sort((a, b) => b.score - a.score || b.x.popularity - a.x.popularity)
      .slice(0, 8)
      .map((r) => r.x);
  }, [p, products]);

  if (!p) return <NotFound />;

  const userReviews = reviews[p.id] || [];
  const sizes = p.category === 'Rings' ? ['8', '10', '12', '14', '16', '18', '20'] : p.category === 'Bangles' ? ['2.4', '2.6', '2.8'] : [];
  const wished = wishlist.includes(p.id);

  const onImageClick = () => {
    if (p.id !== 'MJ-GN-2001') return;
    imgClicks.current += 1;
    if (imgClicks.current >= 5) {
      imgClicks.current = 0;
      setImageSecret(true);
      discover('five-clicks');
    }
  };
  const add = (buyNow) => {
    if (sizes.length && !size) return document.getElementById('size-select')?.focus();
    addToCart(p.id, qty, size);
    if (buyNow) nav('/checkout');
  };
  const checkPin = (e) => {
    e.preventDefault();
    const r = deliveryEstimate(pin);
    setEst(r || 'invalid');
    if (r) setPrefs({ ...prefs, pincode: pin });
  };

  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Shop', to: '/shop' }, { label: p.category, to: `/shop/${categoryToSlug(p.category)}` }, { label: p.name }]} />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-cream-200 bg-cream-100 shadow-soft" onClick={onImageClick} data-testid="product-main-image">
            <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-700" style={VIEWS[view].style} />
            {p.id === 'MJ-DR-1004' && (
              <Link to="/vault/private-catalogue" onClick={() => discover('invisible-hotspot')} aria-label="Facet" id="solitaire-facet"
                className="absolute right-[6%] top-[6%] h-[14%] w-[14%] cursor-default opacity-0" />
            )}
            {p.hidden && <span className="absolute left-4 top-4 rounded-full bg-cocoa-700 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-champagne-300">Private Vault · Unlisted</span>}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {VIEWS.map((v, i) => (
              <button key={v.label} onClick={() => setView(i)} aria-label={`${v.label} view`} aria-pressed={view === i}
                className={`aspect-square overflow-hidden rounded-xl border-2 bg-cream-100 transition ${view === i ? 'border-champagne-500' : 'border-transparent hover:border-cream-300'}`}>
                <img src={p.image} alt="" className="h-full w-full object-cover" style={v.style} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">{p.category} · {p.metalGroup} Jewellery</p>
          <h1 className="mt-2 font-serif text-4xl font-medium md:text-5xl">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <Rating value={p.rating} count={p.reviewsCount + userReviews.length} />
            <span className="text-cocoa-300">|</span>
            <span className="text-cocoa-500">Product ID: <strong className="font-medium text-cocoa-700" data-testid="product-id">{p.id}</strong></span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-medium text-cocoa-800" data-testid="product-price">{formatINR(p.price)}</p>
            {p.mrp > p.price && (<><p className="text-lg text-cocoa-300 line-through">{formatINR(p.mrp)}</p><span className="chip !border-champagne-400 !bg-champagne-500 !text-white">{p.discountPercent}% OFF</span></>)}
          </div>
          <p className="mt-1 text-xs text-cocoa-400">Inclusive of all taxes · Price breakup available on request</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[['Material', p.material.split(' with ')[0]], ['Purity', p.purity], ['Weight', p.weight], ['Availability', p.availability]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-cream-200 bg-white p-3">
                <dt className="text-[0.65rem] uppercase tracking-widest text-cocoa-400">{k}</dt>
                <dd className={`mt-1 font-medium ${k === 'Availability' ? (p.stock === 0 ? 'text-rose-600' : p.stock <= 3 ? 'text-amber-600' : 'text-emerald-700') : 'text-cocoa-700'}`} data-testid={k === 'Availability' ? 'availability' : undefined}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-cocoa-400">{p.stock > 0 ? `${p.stock} in stock` : 'Currently unavailable — enquire for made-to-order'}</p>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            {sizes.length > 0 && (
              <div>
                <label htmlFor="size-select" className="label">{p.category === 'Rings' ? 'Ring size' : 'Bangle size'} <span className="text-rose-500">*</span></label>
                <select id="size-select" value={size} onChange={(e) => setSize(e.target.value)} className={`input !w-36 ${!size ? '' : ''}`}>
                  <option value="">Select size</option>
                  {sizes.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <span className="label">Quantity</span>
              <div className="flex items-center rounded-full border border-cream-300 bg-white">
                <button className="h-10 w-10 text-lg text-cocoa-500 hover:text-champagne-700" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center" data-testid="qty">{qty}</span>
                <button className="h-10 w-10 text-lg text-cocoa-500 hover:text-champagne-700" onClick={() => setQty(Math.min(Math.max(1, p.stock), qty + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>
          {sizes.length > 0 && !size && <p className="mt-2 text-xs text-cocoa-400">Please choose a size before adding to bag.</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-gold flex-1" onClick={() => add(false)} disabled={p.stock === 0} id="add-to-cart"><BagIcon width={18} /> Add to Bag</button>
            <button className="btn-outline flex-1" onClick={() => add(true)} disabled={p.stock === 0} id="buy-now">Buy Now</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className={`btn-ghost btn-sm border ${wished ? 'border-rose-200 text-rose-500' : 'border-cream-300'}`} onClick={() => toggleWishlist(p.id)} aria-pressed={wished}>
              <HeartIcon width={16} filled={wished} /> {wished ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <button className={`btn-ghost btn-sm border ${compare.includes(p.id) ? 'border-champagne-400 text-champagne-700' : 'border-cream-300'}`} onClick={() => toggleCompare(p.id)}>
              <CompareIcon width={16} /> {compare.includes(p.id) ? 'In Comparison' : 'Compare'}
            </button>
            <button className="btn-ghost btn-sm border border-cream-300" onClick={() => setEnquiry(true)} id="enquire-btn">Enquire About This Piece</button>
          </div>

          <form onSubmit={checkPin} className="mt-6 rounded-2xl border border-cream-200 bg-cream-100/60 p-4">
            <label htmlFor="pin-check" className="label">Check delivery</label>
            <div className="flex gap-2">
              <input id="pin-check" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit PIN code" className="input" inputMode="numeric" />
              <button className="btn-outline btn-sm" type="submit">Check</button>
            </div>
            {est === 'invalid' && <p className="field-error">Please enter a valid 6-digit PIN code.</p>}
            {est && est !== 'invalid' && (
              <p className="mt-2 text-sm text-emerald-700">✓ Delivery by <strong>{formatDate(est.date)}</strong>{est.metro ? ' · Express & same-day available' : ''} · Free insured shipping above ₹25,000</p>
            )}
          </form>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[0.65rem] uppercase tracking-widest text-cocoa-500">
            <div className="flex flex-col items-center gap-1"><ShieldIcon className="text-champagne-600" />Certified</div>
            <div className="flex flex-col items-center gap-1"><TruckIcon className="text-champagne-600" />Insured Delivery</div>
            <div className="flex flex-col items-center gap-1"><RefreshIcon className="text-champagne-600" />15-day Returns</div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <div className="flex gap-2 overflow-x-auto border-b border-cream-200" role="tablist">
          {[['description', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${p.reviewsCount + userReviews.length})`], ['shipping', 'Shipping & Returns']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-xs uppercase tracking-[0.2em] transition ${tab === k ? 'border-champagne-500 text-champagne-700' : 'border-transparent text-cocoa-400 hover:text-cocoa-600'}`}>{l}</button>
          ))}
        </div>
        <div className="py-8" role="tabpanel">
          {tab === 'description' && (
            <div className="max-w-3xl space-y-4">
              <Description text={p.description} onSecret={() => discover('description-link')} />
              <p className="text-sm text-cocoa-500">Each piece is accompanied by a certificate of authenticity, a velvet Modern Jewellers box and a lifetime maintenance card.</p>
            </div>
          )}
          {tab === 'specs' && (
            <table className="table-luxe max-w-3xl overflow-hidden rounded-xl border border-cream-200 bg-white" data-testid="specifications">
              <tbody>
                <tr><th className="w-1/3">Product ID</th><td>{p.id}</td></tr>
                <tr><th>Category</th><td>{p.category}</td></tr>
                <tr><th>Material</th><td>{p.material}</td></tr>
                {Object.entries(p.specifications).map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
                <tr><th>Collections</th><td className="capitalize">{p.collections.join(', ')}</td></tr>
                <tr><th>Occasion</th><td>{p.occasion}</td></tr>
              </tbody>
            </table>
          )}
          {tab === 'reviews' && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="card flex items-center gap-6 p-6">
                  <p className="font-serif text-6xl text-champagne-700">{p.rating.toFixed(1)}</p>
                  <div><Rating value={p.rating} size={18} /><p className="mt-1 text-sm text-cocoa-400">Based on {p.reviewsCount + userReviews.length} verified reviews</p></div>
                </div>
                {userReviews.map((r, i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-center justify-between"><Rating value={r.rating} /><span className="text-xs text-cocoa-300">{formatDate(r.date)}</span></div>
                    <p className="mt-2 font-medium text-cocoa-700">{r.title}</p>
                    <p className="mt-1 text-sm text-cocoa-500">{r.text}</p>
                    <p className="mt-2 text-xs text-cocoa-400">— {r.name}{r.recommend ? ' · Recommends this piece' : ''}</p>
                  </div>
                ))}
                {[['Sneha P.', 5, 'Absolutely stunning in person. The finish is flawless.'], ['Vikram S.', 4, 'Beautiful piece; delivery was quick and well-insured.']].map(([n, r, t]) => (
                  <div key={n} className="card p-5">
                    <div className="flex items-center gap-1 text-champagne-500">{Array.from({ length: r }).map((_, i) => <StarIcon key={i} />)}</div>
                    <p className="mt-2 text-sm text-cocoa-500">{t}</p>
                    <p className="mt-2 text-xs text-cocoa-400">— {n} · Verified Buyer</p>
                  </div>
                ))}
              </div>
              <ReviewForm productId={p.id} />
            </div>
          )}
          {tab === 'shipping' && (
            <ul className="max-w-3xl list-disc space-y-2 pl-5 text-cocoa-600">
              <li>Free fully-insured shipping on orders above ₹25,000; ₹499 below.</li>
              <li>Express delivery (+₹999) in 24–48 hours for metro PIN codes; same-day (+₹1,499) in select cities.</li>
              <li>15-day no-questions-asked returns on unworn jewellery. <Link to="/returns" className="text-champagne-700 underline">Request a return</Link>.</li>
              <li>Lifetime exchange at prevailing gold rate with BIS hallmark certificate.</li>
            </ul>
          )}
        </div>
      </section>

      {recs.length > 0 && (
        <section className="mt-12" data-section="recommendations">
          <SectionHeading eyebrow="Curated For You" title="You May Also Love" />
          <ProductRail products={recs} />
        </section>
      )}
      <RecentlyViewed exclude={p.id} />

      {p.id === 'MJ-BS-7001' && (
        <div className={`mt-16 flex justify-center transition-all duration-700 ${bottomReveal ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
          <Link to="/vault/downloads" onClick={() => discover('scroll-reveal')} className="btn-outline" id="private-viewing-btn" tabIndex={bottomReveal ? 0 : -1}>
            ✦ Request a Private Bridal Viewing
          </Link>
        </div>
      )}

      <Modal open={enquiry} onClose={() => setEnquiry(false)} title="Product Enquiry">
        <EnquiryForm product={p} onDone={() => setEnquiry(false)} />
      </Modal>
      <Modal open={imageSecret} onClose={() => setImageSecret(false)} title="✦ The Rani’s Whisper ✦">
        <div className="space-y-3 text-center">
          <p className="font-serif text-xl italic text-cocoa-600">“Touch the haar five times, and the queen shall speak.”</p>
          <p className="text-sm text-cocoa-500">
            This necklace was the very first temple piece our founder crafted. The management keeps its secrets behind a door whose key is our
            first craft and our first year, joined by an “at”.
          </p>
          <p className="rounded-xl bg-cream-100 p-3 font-mono text-sm tracking-wider text-champagne-700">Craft@Year</p>
          <p className="text-xs text-cocoa-400">Our story is told on the About Us page.</p>
        </div>
      </Modal>
    </div>
  );
}
