import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CloseIcon } from './Icons';
export default function CompareBar() {
  const { compare, getProduct, toggleCompare, setCompare } = useStore();
  if (compare.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-4 z-40 hidden max-w-md items-center gap-3 rounded-2xl border border-cream-200 bg-white/95 p-3 shadow-luxe backdrop-blur md:flex" data-testid="compare-bar">
      {compare.map((id) => {
        const p = getProduct(id);
        return p ? (
          <div key={id} className="relative">
            <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
            <button onClick={() => toggleCompare(id)} aria-label={`Remove ${p.name} from comparison`} className="absolute -right-1.5 -top-1.5 rounded-full bg-cocoa-500 p-0.5 text-white"><CloseIcon width={12} height={12} /></button>
          </div>
        ) : null;
      })}
      <Link to="/compare" className="btn-gold btn-sm">Compare ({compare.length})</Link>
      <button onClick={() => setCompare([])} className="text-xs text-cocoa-400 underline">Clear</button>
    </div>
  );
}
