import { photo } from '../data/photos';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from './Modal';
import NewsletterForm from './NewsletterForm';
import { readLS } from '../hooks/useLocalStorage';

export default function PromoPopup() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  useEffect(() => {
    if (readLS('mj_popup_dismissed', false) || sessionStorage.getItem('mj_popup_seen')) return;
    const t = setTimeout(() => {
      if (!['/checkout', '/cart'].includes(pathRef.current)) {
        setOpen(true);
        sessionStorage.setItem('mj_popup_seen', '1');
      }
    }, 9000);
    return () => clearTimeout(t);
  }, [pathname]);
  const close = (forever) => {
    setOpen(false);
    if (forever) localStorage.setItem('mj_popup_dismissed', 'true');
  };
  return (
    <Modal open={open} onClose={() => close(false)} title="">
      <div className="text-center" data-testid="promo-popup">
        <img src={photo('/images/products/tara-diamond-pendant-necklace.svg')} alt="Tara Diamond Pendant" className="mx-auto -mt-6 h-40 w-40 rounded-full object-cover shadow-soft" />
        <p className="eyebrow mt-4">A Welcome Gift</p>
        <h3 className="mt-2 font-serif text-4xl">Enjoy <span className="gold-text font-semibold">10% Off</span></h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-cocoa-500">Subscribe for your first-order privilege. Or simply use code <strong className="text-champagne-700">WELCOME10</strong> at checkout.</p>
        <div className="mt-5 text-left"><NewsletterForm compact onSuccess={() => close(true)} /></div>
        <button onClick={() => close(true)} className="mt-4 text-xs uppercase tracking-widest text-cocoa-400 underline">No thanks, don't show again</button>
      </div>
    </Modal>
  );
}
