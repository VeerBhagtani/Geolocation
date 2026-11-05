import { useEffect, useState } from 'react';
import { ArrowUp } from './Icons';
export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" id="back-to-top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-champagne-400 to-champagne-600 text-white shadow-luxe transition-all duration-500 hover:-translate-y-1 ${show ? 'opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
      <ArrowUp />
    </button>
  );
}
