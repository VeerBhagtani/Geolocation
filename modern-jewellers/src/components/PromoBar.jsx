import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const MESSAGES = [
  { text: 'Festive Edit: Flat 15% off above ₹50,000 with code FESTIVE15', to: '/offers' },
  { text: 'Free insured shipping on orders above ₹25,000', to: '/faq' },
  { text: 'BIS Hallmarked Gold · IGI Certified Diamonds · Lifetime Exchange', to: '/about' },
  { text: 'Book a Bridal Lounge appointment at any of our 8 stores', to: '/stores' },
];

export default function PromoBar() {
  const [i, setI] = useState(0);
  const { unlockPrive, secrets, notify } = useStore();
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);
  const m = MESSAGES[i];
  const onDouble = () => {
    if (!secrets.priveNav) {
      unlockPrive();
      notify('✦ A private door has opened in the navigation…');
    }
  };
  return (
    <div className="bg-gradient-to-r from-cocoa-600 via-cocoa-500 to-cocoa-600 text-cream-100" onDoubleClick={onDouble} data-section="promo-bar">
      <div className="container-luxe flex h-9 items-center justify-center text-[0.7rem] uppercase tracking-[0.25em] sm:text-xs">
        <Link key={i} to={m.to} className="page-enter truncate hover:text-champagne-300">{m.text}</Link>
      </div>
    </div>
  );
}
