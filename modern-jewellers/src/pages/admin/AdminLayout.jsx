import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import Logo from '../../components/Logo';
import { MenuIcon, CloseIcon } from '../../components/Icons';

const LINKS = [
  ['/admin', 'Dashboard', true],
  ['/admin/products', 'Product Management'],
  ['/admin/inventory', 'Inventory Management'],
  ['/admin/orders', 'Order Management'],
  ['/admin/customers', 'Customer Management'],
  ['/admin/reports', 'Sales Reports'],
];

export default function AdminLayout() {
  const { discover } = useStore();
  const [open, setOpen] = useState(false);
  useEffect(() => discover('admin-door'), [discover]);
  const nav = (
    <nav className="space-y-1" aria-label="Admin navigation">
      {LINKS.map(([to, l, end]) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
          className={({ isActive }) => `block rounded-xl px-4 py-2.5 text-sm transition ${isActive ? 'bg-champagne-500 text-white shadow-soft' : 'text-cocoa-600 hover:bg-cream-200'}`}>
          {l}
        </NavLink>
      ))}
      <div className="my-4 h-px bg-cream-300" />
      <Link to="/" className="block rounded-xl px-4 py-2.5 text-sm text-cocoa-500 hover:bg-cream-200">← Back to storefront</Link>
    </nav>
  );
  return (
    <div className="flex min-h-screen bg-cream-100" data-area="admin">
      <aside className="hidden w-64 shrink-0 border-r border-cream-200 bg-cream-50 p-5 lg:block">
        <Logo />
        <p className="mb-6 mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-cocoa-400">Back Office · Simulated</p>
        {nav}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-cocoa-800/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-cream-50 p-5">
            <button onClick={() => setOpen(false)} className="mb-4" aria-label="Close admin menu"><CloseIcon /></button>
            {nav}
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-cream-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open admin menu"><MenuIcon /></button>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">Demo admin · fictional data</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-cocoa-500">
            <span className="hidden sm:inline">Leela Fernandes · Operations</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-champagne-300 to-champagne-600 text-xs text-white">LF</span>
          </div>
        </header>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
