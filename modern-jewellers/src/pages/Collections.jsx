import { photo } from '../data/photos';
import { Link } from 'react-router-dom';
import collections from '../data/collections.json';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';

export default function Collections() {
  const { products } = useStore();
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Collections' }]} />
      <SectionHeading eyebrow="Curated Worlds" title="Our Collections" subtitle="Five stories in gold, diamond and silver — each with its own soul." />
      <div className="space-y-10">
        {collections.map((c, i) => {
          const count = products.filter((p) => p.collections.includes(c.slug)).length;
          return (
            <Reveal key={c.slug} className={`grid items-center gap-8 overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-soft md:grid-cols-2 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
              <Link to={`/collections/${c.slug}`} className="group block aspect-[16/10] overflow-hidden">
                <img src={photo(c.banner)} alt={c.name} className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
              </Link>
              <div className="p-8 md:p-12">
                <p className="eyebrow">{c.tagline}</p>
                <h2 className="mt-2 font-serif text-4xl">{c.name}</h2>
                <p className="mt-4 text-cocoa-500">{c.description}</p>
                <p className="mt-4 text-sm text-cocoa-400">{count} pieces</p>
                <Link to={`/collections/${c.slug}`} className="btn-gold mt-6">Explore {c.name}</Link>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
