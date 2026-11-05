import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';

const TIMELINE = [
  ['1987', 'A single workbench', 'Shri Harish Mehta opens a kundan workshop in Zaveri Bazaar, Mumbai. Kundan was our very first craft.'],
  ['1996', 'First showroom', 'Our Kala Ghoda flagship opens its doors, introducing hallmarked 22K gold to Mumbai families.'],
  ['2004', 'Diamonds arrive', 'The Diamond Studio launches with IGI-certified solitaires and an in-house setting atelier.'],
  ['2015', 'Across India', 'Stores open in Delhi, Bengaluru, Hyderabad and Jaipur. The Jaipur atelier revives polki craftsmanship.'],
  ['2022', 'Online boutique', 'Modern Jewellers goes online with insured doorstep delivery across 19,000 PIN codes.'],
  ['2026', 'The next chapter', 'Eight stores, 120+ master karigars and 2.4 lakh families who call us their family jeweller.'],
];
const VALUES = [
  ['Purity', 'BIS hallmarked gold with HUID on every piece.'],
  ['Provenance', 'Conflict-free diamonds, certified by IGI and SGL.'],
  ['Patience', 'Up to 18 months of handwork in a single bridal set.'],
  ['People', 'Fair wages and healthcare for every karigar family.'],
];
const TEAM = [
  ['Harish Mehta', 'Founder & Chairman'],
  ['Radhika Mehta', 'Managing Director'],
  ['Arvind Soni', 'Master Karigar, Jaipur Atelier'],
  ['Nandini Rao', 'Head of Design'],
];

export default function About() {
  const { discover } = useStore();
  const [note, setNote] = useState(false);
  const openNote = () => {
    setNote((n) => !n);
    discover('founder-note');
  };
  return (
    <div className="page-enter">
      <div className="bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="container-luxe">
          <Breadcrumbs items={[{ label: 'About Us' }]} />
          <div className="grid items-center gap-10 py-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">About Modern Jewellers</p>
              <h1 className="mt-3 font-serif text-5xl md:text-6xl">Thirty-nine years of trust, crafted by hand.</h1>
              <p className="mt-6 leading-relaxed text-cocoa-500">
                Modern Jewellers was born in 1987 from a simple belief: that every Indian family deserves jewellery of uncompromising purity, made
                with the patience of a master and the honesty of a friend. Our founder began with kundan — setting uncut stones in pure gold foil
                by hand — and that spirit of craft still guides every piece we create.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <button onClick={openNote} aria-expanded={note} aria-controls="founders-note" id="founder-seal"
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-2 border-champagne-400 bg-white text-champagne-700 shadow-soft transition hover:rotate-12">
                  <span className="text-[0.55rem] uppercase tracking-widest">Est.</span>
                  <span className="font-serif text-xl">1987</span>
                </button>
                <p className="font-serif text-lg italic text-cocoa-500">“Purity is not a promise. It is a practice.” — Harish Mehta</p>
              </div>
            </div>
            <img src="/images/banners/hero-royal.svg" alt="Royal temple necklace crafted at our atelier" className="rounded-3xl shadow-luxe" />
          </div>
        </div>
      </div>

      {note && (
        <section id="founders-note" className="container-luxe page-enter mt-6" data-section="founders-note">
          <div className="rounded-3xl border border-dashed border-champagne-400 bg-white p-8 shadow-luxe md:p-12">
            <p className="eyebrow">Private · From the Founder’s Desk</p>
            <h2 className="mt-2 font-serif text-3xl">A Note Not Meant for the Showroom</h2>
            <div className="mt-4 space-y-3 text-cocoa-600">
              <p>To my family at Modern Jewellers — the management archive holds our most sensitive figures: inventory, sales and the codes of pieces we never put on display.</p>
              <p>I sealed it with the two things I will never forget: the craft I began with, and the year I began it. Written the way a karigar signs a ledger — craft, then “@”, then year.</p>
              <p className="rounded-xl bg-cream-100 p-4 text-center font-mono text-lg tracking-[0.2em] text-champagne-700" data-testid="founder-key">Kundan@1987</p>
              <p className="text-sm text-cocoa-400">— H.M., Zaveri Bazaar, Mumbai</p>
            </div>
            <Link to="/confidential/management-document" className="btn-outline btn-sm mt-6">Open the archive</Link>
          </div>
        </section>
      )}

      <Reveal as="section" className="container-luxe mt-20">
        <SectionHeading eyebrow="Our Journey" title="From Zaveri Bazaar to Eight Cities" />
        <ol className="relative mx-auto max-w-3xl border-l border-champagne-300 pl-8">
          {TIMELINE.map(([y, t, d]) => (
            <li key={y} className="mb-10">
              <span className="absolute -left-2.5 mt-1.5 h-5 w-5 rounded-full border-4 border-cream-50 bg-champagne-500" />
              <p className="font-serif text-2xl text-champagne-700">{y}</p>
              <p className="font-medium text-cocoa-700">{t}</p>
              <p className="text-sm text-cocoa-500">{d}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section" className="mt-16 bg-cream-100 py-16">
        <div className="container-luxe">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" />
          <div className="grid gap-6 md:grid-cols-4">
            {VALUES.map(([t, d]) => <div key={t} className="card p-6 text-center"><p className="font-serif text-2xl text-champagne-700">{t}</p><p className="mt-2 text-sm text-cocoa-500">{d}</p></div>)}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="container-luxe mt-16">
        <SectionHeading eyebrow="The People" title="Leadership & Master Craftsmen" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {TEAM.map(([n, r]) => (
            <div key={n} className="card p-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-champagne-300 to-cocoa-300 font-serif text-3xl text-white">{n.split(' ').map((x) => x[0]).join('')}</div>
              <p className="mt-4 font-serif text-xl">{n}</p><p className="text-xs uppercase tracking-widest text-cocoa-400">{r}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link to="/stores" className="btn-gold">Visit a Store</Link>
          <Link to="/downloads" className="btn-outline">Download Company Profile</Link>
        </div>
      </Reveal>
    </div>
  );
}
