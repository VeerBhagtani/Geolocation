import { Link } from 'react-router-dom';
import Logo from './Logo';
import NewsletterForm from './NewsletterForm';
import { FacebookIcon, InstagramIcon, PinterestIcon, WhatsappIcon, YoutubeIcon, PhoneIcon, MailIcon, ShieldIcon, TruckIcon, RefreshIcon, GemIcon } from './Icons';

const COLS = [
  { title: 'Shop', links: [['Rings', '/shop/rings'], ['Necklaces', '/shop/necklaces'], ['Earrings', '/shop/earrings'], ['Bangles', '/shop/bangles'], ['Mangalsutra', '/shop/mangalsutra'], ['Bridal Sets', '/shop/bridal-sets']] },
  { title: 'Collections', links: [['Royal', '/collections/royal'], ['Bridal', '/collections/bridal'], ['Everyday', '/collections/everyday'], ['Festival', '/collections/festival'], ['Limited Edition', '/collections/limited'], ['Offers', '/offers']] },
  { title: 'Customer Care', links: [['Track Order', '/track-order'], ['Returns & Exchange', '/returns'], ['FAQs', '/faq'], ['Support', '/support'], ['Store Locator', '/stores'], ['Contact Us', '/contact']] },
  { title: 'Company', links: [['About Us', '/about'], ['Downloads', '/downloads'], ['My Account', '/account'], ['Wishlist', '/wishlist'], ['Compare', '/compare'], ['Register', '/register']] },
];
const SOCIAL = [
  [InstagramIcon, 'Instagram', 'https://www.instagram.com/'],
  [FacebookIcon, 'Facebook', 'https://www.facebook.com/'],
  [PinterestIcon, 'Pinterest', 'https://www.pinterest.com/'],
  [YoutubeIcon, 'YouTube', 'https://www.youtube.com/'],
  [WhatsappIcon, 'WhatsApp', 'https://wa.me/912240001987'],
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-200 bg-gradient-to-b from-cream-100 to-cream-200" data-section="footer">
      <div className="border-b border-cream-300/60">
        <div className="container-luxe grid grid-cols-2 gap-6 py-8 text-center text-xs uppercase tracking-widest text-cocoa-500 md:grid-cols-4">
          {[[ShieldIcon, 'BIS Hallmarked Gold'], [GemIcon, 'IGI Certified Diamonds'], [TruckIcon, 'Free Insured Shipping'], [RefreshIcon, 'Lifetime Exchange']].map(([I, t]) => (
            <div key={t} className="flex flex-col items-center gap-2"><I className="text-champagne-600" width={26} height={26} />{t}</div>
          ))}
        </div>
      </div>
      <div className="container-luxe grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cocoa-500">
            Crafting hallmarked gold, certified diamonds and sterling silver heirlooms for Indian families since 1987.
          </p>
          <div className="mt-5 space-y-2 text-sm text-cocoa-500">
            <a href="tel:+912240001987" className="flex items-center gap-2 hover:text-champagne-700"><PhoneIcon width={16} /> +91 22 4000 1987</a>
            <a href="mailto:care@modernjewellers.example" className="flex items-center gap-2 hover:text-champagne-700"><MailIcon width={16} /> care@modernjewellers.example</a>
          </div>
          <div className="mt-5 flex gap-2">
            {SOCIAL.map(([I, label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-400 text-champagne-700 transition hover:bg-champagne-500 hover:text-white">
                <I width={16} height={16} />
              </a>
            ))}
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-cocoa-700">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(([l, to]) => <li key={l}><Link to={to} className="text-sm text-cocoa-500 transition hover:text-champagne-700">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-luxe pb-10">
        <div className="card flex flex-col items-center gap-4 p-6 md:flex-row">
          <div className="md:w-1/3">
            <p className="font-serif text-2xl">Join the Inner Circle</p>
            <p className="text-sm text-cocoa-400">Early access to collections & private sale invites.</p>
          </div>
          <div className="w-full md:w-2/3"><NewsletterForm /></div>
        </div>
      </div>
      <div className="border-t border-cream-300/60">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-5 text-xs text-cocoa-400 md:flex-row">
          <p>
            © 2026 Modern Jewellers Pvt. Ltd. All rights reserved
            <Link to="/atelier-secret" aria-label="Atelier" className="mx-1 inline-block text-cream-200 transition-colors hover:text-champagne-500" id="footer-ornament">◆</Link>
            A fictional brand for demonstration.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/faq" className="hover:text-champagne-700">Privacy Policy</Link>
            <Link to="/returns" className="hover:text-champagne-700">Terms & Returns</Link>
            <Link to="/admin" className="text-cocoa-300 opacity-60 hover:opacity-100" title="Build" id="build-version">v2.6.1</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
