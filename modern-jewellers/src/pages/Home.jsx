import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import collections from '../data/collections.json';
import testimonials from '../data/testimonials.json';
import SectionHeading from '../components/SectionHeading';
import ProductRail from '../components/ProductRail';
import ProductGrid from '../components/ProductGrid';
import Reveal from '../components/Reveal';
import Rating from '../components/Rating';
import NewsletterForm from '../components/NewsletterForm';
import RecentlyViewed from '../components/RecentlyViewed';
import { ChevronLeft, ChevronRight } from '../components/Icons';

const SLIDES = [
  { img: '/images/banners/hero-royal.svg', eyebrow: 'The Royal Collection', title: 'Heirlooms, Handcrafted in Gold', text: 'Temple gold, polki and kundan masterpieces by fourth-generation karigars.', cta: '/collections/royal' },
  { img: '/images/banners/hero-diamond.svg', eyebrow: 'Certified Brilliance', title: 'Diamonds that Hold the Light', text: 'IGI-certified solitaires and rivières — crafted in 18K white and rose gold.', cta: '/diamond-jewellery' },
  { img: '/images/banners/hero-bridal.svg', eyebrow: 'Shaadi Season 2026', title: 'For the Bride Who Is Timeless', text: 'Complete bridal trousseaus, from maang tikka to payal.', cta: '/collections/bridal' },
];

const CATS = [
  ['Rings', '/shop/rings', '/images/products/celestia-solitaire-diamond-ring.svg'],
  ['Necklaces', '/shop/necklaces', '/images/products/rani-haar-temple-necklace.svg'],
  ['Earrings', '/shop/earrings', '/images/products/rajwadi-gold-jhumkas.svg'],
  ['Bracelets', '/shop/bracelets', '/images/products/lumi-re-diamond-tennis-bracelet.svg'],
  ['Bangles', '/shop/bangles', '/images/products/maharani-carved-gold-bangles-pair.svg'],
  ['Mangalsutra', '/shop/mangalsutra', '/images/products/saubhagya-diamond-mangalsutra.svg'],
  ['Bridal Sets', '/shop/bridal-sets', '/images/products/shubh-vivaah-polki-bridal-set.svg'],
  ['Accessories', '/shop/accessories', '/images/products/sitara-kundan-maang-tikka.svg'],
];

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="relative overflow-hidden bg-cream-100" aria-label="Featured collections" data-section="hero">
      {SLIDES.map((s, idx) => (
        <div key={s.title} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={idx !== i}>
          <img src={s.img} alt="" className="h-full w-full object-cover object-right" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/80 to-transparent" />
      <div className="container-luxe relative flex min-h-[560px] items-center py-20 md:min-h-[640px]">
        <div key={i} className="page-enter max-w-xl">
          <p className="eyebrow">{SLIDES[i].eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl font-medium leading-[1.05] text-cocoa-800 md:text-7xl">{SLIDES[i].title}</h1>
          <p className="mt-6 max-w-md text-lg text-cocoa-500">{SLIDES[i].text}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-gold !px-10 !py-4 text-base" id="shop-now">Shop Now</Link>
            <Link to={SLIDES[i].cta} className="btn-outline !py-4">Explore Collection</Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button onClick={() => setI((i - 1 + SLIDES.length) % SLIDES.length)} aria-label="Previous slide" className="rounded-full bg-white/80 p-2 shadow-soft hover:text-champagne-600"><ChevronLeft width={16} /></button>
        {SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`} className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-champagne-500' : 'w-2 bg-cocoa-300'}`} />
        ))}
        <button onClick={() => setI((i + 1) % SLIDES.length)} aria-label="Next slide" className="rounded-full bg-white/80 p-2 shadow-soft hover:text-champagne-600"><ChevronRight width={16} /></button>
      </div>
    </section>
  );
}

export default function Home() {
  const { products, discover } = useStore();
  const bestsellers = products.filter((p) => p.tags.includes('bestseller')).sort((a, b) => b.popularity - a.popularity);
  const newArrivals = [...products].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 10);
  const offers = products.filter((p) => p.discountPercent > 0).sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 4);
  const [tIndex, setTIndex] = useState(0);

  return (
    <div className="page-enter">
      <Hero />

      <section className="container-luxe mt-20" data-section="collection-highlights">
        <SectionHeading eyebrow="Shop by Category" title="Jewellery for Every Moment" />
        <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
          {CATS.map(([l, to, img]) => (
            <Link key={l} to={to} className="group flex flex-col items-center gap-3 text-center">
              <span className="block aspect-square w-full overflow-hidden rounded-full border-2 border-cream-200 shadow-soft transition group-hover:border-champagne-400">
                <img src={img} alt={l} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </span>
              <span className="text-xs uppercase tracking-widest text-cocoa-600 group-hover:text-champagne-700">{l}</span>
            </Link>
          ))}
        </div>
      </section>

      <Reveal as="section" className="container-luxe mt-24" data-section="bestsellers">
        <SectionHeading eyebrow="Most Loved" title="Bestselling Jewellery" subtitle="The pieces our patrons return to, again and again." />
        <ProductRail products={bestsellers} id="bestsellers-rail" />
        <div className="mt-6 text-center"><Link to="/shop?sort=popular" className="btn-outline">View All Bestsellers</Link></div>
      </Reveal>

      <Reveal as="section" className="mt-24" data-section="special-offers">
        <div className="container-luxe">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-champagne-300 via-cream-200 to-cocoa-300/40 p-8 shadow-luxe md:p-14">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/30 blur-2xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="eyebrow !text-cocoa-600">Special Offers · Limited Time</p>
                <h2 className="mt-3 font-serif text-4xl md:text-5xl">The Festive Edit</h2>
                <p className="mt-4 text-cocoa-600">Flat <strong>15% off</strong> on orders above ₹50,000 with code <strong>FESTIVE15</strong>, plus 0% making charges on select gold coins.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/offers" className="btn-gold">Shop Offers</Link>
                  <span className="chip !bg-white/70 !py-2 font-medium tracking-widest">CODE: FESTIVE15</span>
                </div>
              </div>
              <ProductGrid products={offers} />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="container-luxe mt-24" data-section="new-arrivals">
        <SectionHeading eyebrow="Just Arrived" title="New Arrivals" subtitle="Fresh from our Mumbai atelier — autumn/winter 2026." />
        <ProductRail products={newArrivals} id="new-arrivals-rail" />
      </Reveal>

      <Reveal as="section" className="container-luxe mt-24" data-section="featured-collections">
        <SectionHeading eyebrow="Curated Worlds" title="Featured Collections" />
        <div className="grid gap-5 md:grid-cols-6">
          {collections.map((c, i) => (
            <Link key={c.slug} to={`/collections/${c.slug}`}
              className={`group relative overflow-hidden rounded-3xl shadow-soft ${i < 2 ? 'md:col-span-3 aspect-[16/10]' : 'md:col-span-2 aspect-[4/3]'}`}>
              <img src={c.banner} alt={c.name} className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa-800/55 via-cocoa-800/10 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-champagne-300">{c.tagline}</p>
                <h3 className="mt-1 font-serif text-3xl !text-white">{c.name}</h3>
                <span className="mt-2 inline-block text-xs uppercase tracking-widest underline underline-offset-4 opacity-0 transition group-hover:opacity-100">Discover</span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mt-24 bg-cream-100 py-20" data-section="brand-introduction">
        <div className="container-luxe group/brand relative grid items-center gap-12 lg:grid-cols-2" id="brand-intro">
          <div className="relative">
            <img src="/images/banners/collection-royal.svg" alt="Modern Jewellers atelier craftsmanship" className="rounded-3xl shadow-luxe" />
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-white p-6 shadow-luxe md:block">
              <p className="font-serif text-5xl text-champagne-600">39</p>
              <p className="text-xs uppercase tracking-widest text-cocoa-500">Years of craft</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 className="section-title mt-3">Crafted in Mumbai. Cherished Across India.</h2>
            <p className="mt-6 leading-relaxed text-cocoa-500">
              What began in 1987 as a single workbench in Zaveri Bazaar is today one of India’s most trusted names in fine jewellery. Every Modern
              Jewellers piece is BIS hallmarked, ethically sourced and finished by hand — a promise of purity passed from one generation to the next.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[['8', 'Flagship stores'], ['2.4L+', 'Happy families'], ['120+', 'Master karigars']].map(([n, l]) => (
                <div key={l} className="rounded-2xl border border-cream-300 bg-white p-4"><p className="font-serif text-3xl text-champagne-700">{n}</p><p className="text-[0.65rem] uppercase tracking-widest text-cocoa-400">{l}</p></div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/about" className="btn-outline">Discover Our Heritage</Link>
              <Link to="/the-gold-room" onClick={() => discover('hover-reveal')} id="heritage-archive-btn"
                className="btn-ghost pointer-events-none translate-y-2 border border-dashed border-champagne-400 opacity-0 transition-all duration-500 group-hover/brand:pointer-events-auto group-hover/brand:translate-y-0 group-hover/brand:opacity-100">
                ✦ Enter the Heritage Archive
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="container-luxe mt-24" data-section="testimonials">
        <SectionHeading eyebrow="Kind Words" title="What Our Patrons Say" />
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((k) => {
            const t = testimonials[(tIndex + k) % testimonials.length];
            return (
              <figure key={t.name} className="card page-enter flex flex-col p-8">
                <span className="font-serif text-6xl leading-none text-champagne-400">“</span>
                <blockquote className="-mt-4 flex-1 font-serif text-xl italic leading-relaxed text-cocoa-600">{t.text}</blockquote>
                <figcaption className="mt-6 border-t border-cream-200 pt-4">
                  <Rating value={t.rating} />
                  <p className="mt-1 font-medium text-cocoa-700">{t.name}</p>
                  <p className="text-xs text-cocoa-400">{t.city} · {t.product}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-ghost btn-sm" onClick={() => setTIndex((tIndex - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonials"><ChevronLeft width={16} /> Prev</button>
          <button className="btn-ghost btn-sm" onClick={() => setTIndex((tIndex + 1) % testimonials.length)} aria-label="Next testimonials">Next <ChevronRight width={16} /></button>
        </div>
      </Reveal>

      <RecentlyViewed />

      <Reveal as="section" className="container-luxe mt-24" data-section="newsletter">
        <div className="rounded-3xl border border-champagne-300 bg-gradient-to-br from-white to-cream-200 p-10 text-center shadow-soft md:p-16">
          <p className="eyebrow">The Inner Circle</p>
          <h2 className="section-title mt-3">Be the First to See What’s Next</h2>
          <p className="mx-auto mt-3 max-w-xl text-cocoa-500">Subscribe for collection previews, festive privileges and 10% off your first order.</p>
          <div className="mx-auto mt-8 max-w-2xl text-left"><NewsletterForm /></div>
        </div>
      </Reveal>
    </div>
  );
}
