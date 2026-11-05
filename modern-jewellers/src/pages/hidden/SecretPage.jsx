import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const LORE = [
  ['The Seven-Petal Lotus', 'Every Modern Jewellers clasp carries a microscopic seven-petal lotus — the founder’s private hallmark, engraved by hand since 1987.'],
  ['The Vault Beneath Kala Ghoda', 'Our Mumbai flagship hides a climate-controlled vault where unlisted heritage pieces rest. They are shown only by reference code.'],
  ['The Karigar’s Ledger', 'Master karigars sign each finished piece in a leather ledger. The first entry, dated 1987, reads simply: “Kundan — for my mother.”'],
  ['The Gold Room', 'A private salon for our oldest patrons. Its door is never marked; those who know the way simply walk in.'],
];

export default function SecretPage() {
  const { discover } = useStore();
  useEffect(() => discover('footer-ornament'), [discover]);
  return (
    <div className="page-enter">
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 to-cream-50 py-24 text-center">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#c9a24e 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="container-luxe relative">
          <p className="eyebrow">Unlisted · Atelier Archives</p>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl"><span className="gold-text">Secrets of the Atelier</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-cocoa-500">You found the little diamond. Few do. This page holds the stories we only tell to those who look closely.</p>
        </div>
      </section>
      <section className="container-luxe mt-12 grid gap-6 md:grid-cols-2">
        {LORE.map(([t, d]) => (
          <div key={t} className="card p-8">
            <p className="font-serif text-2xl text-champagne-700">✦ {t}</p>
            <p className="mt-3 text-cocoa-600">{d}</p>
          </div>
        ))}
      </section>
      <section className="container-luxe mt-12">
        <div className="card p-8 text-center">
          <p className="eyebrow">Classified Information</p>
          <p className="mt-3 font-serif text-2xl">Management keeps its own document — sealed with a key only the faithful remember.</p>
          <p className="mt-2 text-sm text-cocoa-500">“Look to where our story is told. The founder’s seal opens more than it shows.”</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/confidential/management-document" className="btn-gold">Confidential Document</Link>
            <Link to="/whispers" className="btn-outline">Hidden Messages</Link>
            <Link to="/vault/private-catalogue" className="btn-outline">Private Catalogue</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
