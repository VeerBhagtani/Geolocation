import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV } from '../data/navigation';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';
import SearchBar from './SearchBar';
import Modal from './Modal';
import { BagIcon, ChevronDown, ChevronRight, CloseIcon, CompareIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons';

function Dropdown({ item, open, onClose }) {
  const [sub, setSub] = useState(0);
  const nested = item.menu.some((m) => m.children);
  if (!open) return null;
  return (
    <div className="page-enter absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3" role="menu" data-dropdown={item.label}>
      <div className={`overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-luxe ${nested ? 'flex w-[560px]' : 'w-64'}`}>
        <ul className={`${nested ? 'w-60 border-r border-cream-100 bg-cream-50' : 'w-full'} py-3`}>
          {item.menu.map((m, i) => (
            <li key={m.label} onMouseEnter={() => setSub(i)}>
              <div className={`flex items-center justify-between px-5 py-2 text-sm ${nested && sub === i ? 'bg-white text-champagne-700' : 'text-cocoa-600'}`}>
                <Link to={m.to} onClick={onClose} role="menuitem" className="flex-1 hover:text-champagne-700">{m.label}</Link>
                {m.children && (
                  <button onClick={() => setSub(i)} aria-label={`Show ${m.label} sub-menu`} aria-expanded={sub === i} className="p-1 text-champagne-500">
                    <ChevronRight width={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {nested && item.menu[sub]?.children && (
          <div className="flex-1 p-5" data-submenu={item.menu[sub].label}>
            <p className="eyebrow mb-3">{item.menu[sub].label}</p>
            <ul className="space-y-2">
              {item.menu[sub].children.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} onClick={onClose} role="menuitem" className="block text-sm text-cocoa-600 transition hover:translate-x-1 hover:text-champagne-700">{c.label}</Link>
                </li>
              ))}
            </ul>
            <Link to={item.menu[sub].to} onClick={onClose} className="mt-5 inline-block text-xs uppercase tracking-widest text-champagne-600 underline underline-offset-4">
              View all {item.menu[sub].label}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(null);
  return (
    <li className="border-b border-cream-200">
      <div className="flex items-center justify-between py-3">
        <Link to={item.to} onClick={onClose} className="text-sm uppercase tracking-[0.2em] text-cocoa-700">{item.label}</Link>
        {item.menu && (
          <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Toggle ${item.label} menu`} className="p-2">
            <ChevronDown width={16} className={`transition ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      {open && item.menu && (
        <ul className="mb-3 space-y-1 pl-3">
          {item.menu.map((m, i) => (
            <li key={m.label}>
              <div className="flex items-center justify-between">
                <Link to={m.to} onClick={onClose} className="py-1.5 text-sm text-cocoa-600">{m.label}</Link>
                {m.children && (
                  <button onClick={() => setSub(sub === i ? null : i)} className="p-1.5" aria-label={`Toggle ${m.label}`}>
                    <ChevronDown width={14} className={`transition ${sub === i ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {sub === i && m.children && (
                <ul className="mb-2 space-y-1 border-l border-champagne-300 pl-3">
                  {m.children.map((c) => (
                    <li key={c.label}><Link to={c.to} onClick={onClose} className="block py-1 text-xs text-cocoa-500">{c.label}</Link></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Header() {
  const { cartCount, wishlist, compare, user, secrets, discover } = useStore();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoSecret, setLogoSecret] = useState(false);
  const clicks = useRef({ n: 0, t: 0 });
  const closeTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpenMenu(null);
    setMobile(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const onLogo = () => {
    const now = Date.now();
    clicks.current = now - clicks.current.t < 1500 ? { n: clicks.current.n + 1, t: now } : { n: 1, t: now };
    if (clicks.current.n >= 7) {
      clicks.current = { n: 0, t: 0 };
      setLogoSecret(true);
      discover('logo-seven');
    }
  };
  const enter = (label) => { clearTimeout(closeTimer.current); setOpenMenu(label); };
  const leave = () => { closeTimer.current = setTimeout(() => setOpenMenu(null), 180); };

  const navItems = secrets.priveNav ? [...NAV, { label: 'Privé', to: '/vault/private-catalogue', prive: true }] : NAV;

  return (
    <header className={`sticky top-0 z-40 border-b border-cream-200 bg-cream-50/90 backdrop-blur-md transition-shadow ${scrolled ? 'shadow-soft' : ''}`}>
      <div className="container-luxe flex h-20 items-center gap-4">
        <button className="rounded-full p-2 text-cocoa-600 hover:bg-cream-200 lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><MenuIcon /></button>
        <Link to="/" onClick={onLogo} aria-label="Modern Jewellers home" id="site-logo" className="shrink-0">
          <Logo />
        </Link>
        <div className="mx-6 hidden max-w-xl flex-1 md:block"><SearchBar /></div>
        <div className="ml-auto flex items-center gap-1">
          <button className="rounded-full p-2.5 text-cocoa-600 hover:bg-cream-200 md:hidden" onClick={() => setSearchOpen(true)} aria-label="Search"><SearchIcon /></button>
          <Link to={user ? '/account' : '/login'} className="hidden rounded-full p-2.5 text-cocoa-600 hover:bg-cream-200 sm:block" aria-label={user ? 'My account' : 'Sign in'} title={user ? `Hi, ${user.firstName}` : 'Sign in'}><UserIcon /></Link>
          <Link to="/compare" className="relative hidden rounded-full p-2.5 text-cocoa-600 hover:bg-cream-200 sm:block" aria-label="Compare products">
            <CompareIcon />
            {compare.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cocoa-500 px-1 text-[10px] text-white">{compare.length}</span>}
          </Link>
          <Link to="/wishlist" className="relative rounded-full p-2.5 text-cocoa-600 hover:bg-cream-200" aria-label="Wishlist">
            <HeartIcon />
            {wishlist.length > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-500 px-1 text-[10px] text-white" data-testid="wishlist-count">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="relative rounded-full p-2.5 text-cocoa-600 hover:bg-cream-200" aria-label="Shopping bag">
            <BagIcon />
            {cartCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-500 px-1 text-[10px] text-white" data-testid="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-cream-200 lg:block" aria-label="Main navigation">
        <ul className="container-luxe flex items-center justify-center gap-1">
          {navItems.map((item) => (
            <li key={item.label} className="relative" onMouseEnter={() => item.menu && enter(item.label)} onMouseLeave={() => item.menu && leave()}>
              <div className="flex items-center">
                <NavLink to={item.to} end={item.to === '/'}
                  className={({ isActive }) => `relative px-3 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.2em] transition xl:px-4 ${item.prive ? 'gold-text' : ''} ${isActive ? 'text-champagne-700' : 'text-cocoa-600 hover:text-champagne-700'}`}>
                  {item.label}
                </NavLink>
                {item.menu && (
                  <button onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)} aria-haspopup="true" aria-expanded={openMenu === item.label}
                    aria-label={`Toggle ${item.label} menu`} className="-ml-2 pr-2 text-cocoa-400 hover:text-champagne-600">
                    <ChevronDown width={14} className={`transition ${openMenu === item.label ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {item.menu && <Dropdown item={item} open={openMenu === item.label} onClose={() => setOpenMenu(null)} />}
            </li>
          ))}
        </ul>
      </nav>

      {mobile && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-label="Mobile menu">
          <div className="absolute inset-0 bg-cocoa-800/30" onClick={() => setMobile(false)} />
          <div className="page-enter absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-cream-50 p-6 shadow-luxe">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobile(false)} aria-label="Close menu" className="p-2"><CloseIcon /></button>
            </div>
            <SearchBar onDone={() => setMobile(false)} />
            <ul className="mt-6">
              {navItems.map((item) => <MobileItem key={item.label} item={item} onClose={() => setMobile(false)} />)}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Link to={user ? '/account' : '/login'} className="btn-outline btn-sm">{user ? 'My Account' : 'Sign In'}</Link>
              <Link to="/track-order" className="btn-outline btn-sm">Track Order</Link>
            </div>
          </div>
        </div>
      )}

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search Modern Jewellers">
        <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
        <div className="h-64" />
      </Modal>

      <Modal open={logoSecret} onClose={() => setLogoSecret(false)} title="✦ Seven Taps of Fortune ✦">
        <div className="space-y-3 text-center">
          <p className="font-serif text-xl italic text-cocoa-600">“Seven is the number of pheras — and of patience.”</p>
          <p className="text-sm text-cocoa-500">
            You have uncovered a message from our founder, Shri Harish Mehta. In 1987, he opened a tiny workshop in Zaveri Bazaar with a single
            karigar and a dream. Every piece we make still carries his mark: a tiny seven-petal lotus hidden on the clasp.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-champagne-600">Secret 1 of the Atelier · Code word: LOTUS-SEVEN</p>
          <Link to="/whispers" onClick={() => setLogoSecret(false)} className="btn-outline btn-sm mt-2">Read more whispers</Link>
        </div>
      </Modal>
    </header>
  );
}
