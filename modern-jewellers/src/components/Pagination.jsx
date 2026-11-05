import { ChevronLeft, ChevronRight } from './Icons';
export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button className="btn-ghost btn-sm !px-3" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft width={16} /></button>
      {nums.map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
          className={`h-9 w-9 rounded-full text-sm transition ${n === page ? 'bg-champagne-500 text-white shadow-soft' : 'text-cocoa-600 hover:bg-cream-200'}`}>
          {n}
        </button>
      ))}
      <button className="btn-ghost btn-sm !px-3" disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight width={16} /></button>
    </nav>
  );
}
