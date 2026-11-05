import { useStore } from '../context/StoreContext';
import ProductRail from './ProductRail';
import SectionHeading from './SectionHeading';
export default function RecentlyViewed({ exclude }) {
  const { recent, getProduct } = useStore();
  const items = recent.filter((id) => id !== exclude).map(getProduct).filter((p) => p && !p.hidden);
  if (!items.length) return null;
  return (
    <section className="container-luxe mt-20" data-section="recently-viewed">
      <SectionHeading eyebrow="Your Journey" title="Recently Viewed" />
      <ProductRail products={items} />
    </section>
  );
}
