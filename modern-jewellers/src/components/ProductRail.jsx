import { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from './Icons';
export default function ProductRail({ products, id }) {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  if (!products.length) return null;
  return (
    <div className="relative" id={id}>
      <div ref={ref} className="no-scrollbar flex snap-x gap-5 overflow-x-auto pb-4">
        {products.map((p) => <div key={p.id} className="w-[70%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[23.5%]"><ProductCard p={p} /></div>)}
      </div>
      <button onClick={() => scroll(-1)} aria-label="Scroll left" className="absolute -left-3 top-1/3 hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-luxe hover:text-champagne-600 md:flex"><ChevronLeft /></button>
      <button onClick={() => scroll(1)} aria-label="Scroll right" className="absolute -right-3 top-1/3 hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-luxe hover:text-champagne-600 md:flex"><ChevronRight /></button>
    </div>
  );
}
