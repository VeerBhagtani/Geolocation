import ProductCard from './ProductCard';
export function SkeletonGrid({ n = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
          <div className="skeleton aspect-square !rounded-none" />
          <div className="space-y-2 p-4"><div className="skeleton h-3 w-1/2" /><div className="skeleton h-5 w-4/5" /><div className="skeleton h-4 w-1/3" /></div>
        </div>
      ))}
    </div>
  );
}
export default function ProductGrid({ products, cols = 4 }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 ${cols === 4 ? 'xl:grid-cols-4' : ''}`}>
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
