import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
export default function NotFound() {
  return (
    <div className="container-luxe page-enter py-16 text-center" data-page="404">
      <p className="font-serif text-[8rem] leading-none md:text-[12rem]"><span className="gold-text">404</span></p>
      <h1 className="mt-2 font-serif text-4xl">This jewel seems to have slipped away</h1>
      <p className="mx-auto mt-3 max-w-md text-cocoa-500">The page you’re looking for doesn’t exist or has moved. Let us help you find something beautiful.</p>
      <div className="mx-auto mt-8 max-w-lg"><SearchBar /></div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-gold">Return Home</Link>
        <Link to="/shop" className="btn-outline">Shop Jewellery</Link>
        <Link to="/contact" className="btn-ghost">Contact Us</Link>
      </div>
    </div>
  );
}
