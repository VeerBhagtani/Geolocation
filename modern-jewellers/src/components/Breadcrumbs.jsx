import { Link } from 'react-router-dom';
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="py-4 text-xs uppercase tracking-wider text-cocoa-400">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link to="/" className="hover:text-champagne-600">Home</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-champagne-400">/</span>
            {it.to && i < items.length - 1 ? (
              <Link to={it.to} className="hover:text-champagne-600">{it.label}</Link>
            ) : (
              <span className="text-cocoa-600" aria-current="page">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
