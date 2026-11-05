import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Modal from './Modal';
import { SECRET_NAMES, TOTAL_SECRETS } from '../data/secrets';

export default function ControlPanel() {
  const { controlPanelOpen, setControlPanelOpen, secrets, discover, unlockPrive, clearCart, adminReset, notify, setCompare } = useStore();

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setControlPanelOpen((o) => !o);
        discover('control-panel');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setControlPanelOpen, discover]);

  const close = () => setControlPanelOpen(false);
  const found = secrets.found.filter((k) => SECRET_NAMES[k]);
  const resetAll = () => {
    Object.keys(localStorage).filter((k) => k.startsWith('mj_')).forEach((k) => localStorage.removeItem(k));
    notify('All demo data has been reset. Reloading…', 'info');
    setTimeout(() => (window.location.hash ? (window.location.hash = '#/') : window.history.replaceState(null, '', '/'), window.location.reload()), 800);
  };

  return (
    <Modal open={controlPanelOpen} onClose={close} title="Master Control Panel" wide>
      <div data-testid="control-panel" className="space-y-6">
        <p className="text-sm text-cocoa-500">Restricted atelier console · Modern Jewellers build 2.6.1</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-4 text-center"><p className="text-3xl font-serif text-champagne-700">{Math.min(found.length, TOTAL_SECRETS)}/{TOTAL_SECRETS}</p><p className="text-xs uppercase tracking-widest text-cocoa-400">Secrets discovered</p></div>
          <div className="card p-4 text-center"><p className="text-3xl font-serif text-champagne-700">{secrets.priveNav ? 'Open' : 'Sealed'}</p><p className="text-xs uppercase tracking-widest text-cocoa-400">Privé door</p></div>
          <div className="card p-4 text-center"><p className="text-3xl font-serif text-champagne-700">LIVE</p><p className="text-xs uppercase tracking-widest text-cocoa-400">Store status</p></div>
        </div>
        <div>
          <p className="eyebrow mb-2">Restricted areas</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['/admin', 'Administration Dashboard'],
              ['/confidential/management-document', 'Confidential Management Document'],
              ['/vault/private-catalogue', 'Private Vault Catalogue'],
              ['/vault/downloads', 'Secret Document Vault'],
              ['/whispers', 'Hidden Messages'],
              ['/atelier-secret', 'Atelier Secret Information'],
            ].map(([to, l]) => (
              <Link key={to} to={to} onClick={close} className="rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-cocoa-600 transition hover:border-champagne-400 hover:text-champagne-700">{l} →</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Console actions</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline btn-sm" onClick={() => { unlockPrive(); notify('Privé navigation enabled'); }}>Enable Privé Nav</button>
            <button className="btn-outline btn-sm" onClick={() => { clearCart(); notify('Bag cleared', 'info'); }}>Clear Bag</button>
            <button className="btn-outline btn-sm" onClick={() => { setCompare([]); notify('Comparison cleared', 'info'); }}>Clear Compare</button>
            <button className="btn-outline btn-sm" onClick={() => { adminReset(); notify('Admin catalogue edits reverted', 'info'); }}>Revert Admin Edits</button>
            <button className="btn-sm btn border border-rose-300 text-rose-600 hover:bg-rose-50" onClick={resetAll}>Reset All Demo Data</button>
          </div>
        </div>
        {found.length > 0 && (
          <div>
            <p className="eyebrow mb-2">Your discoveries</p>
            <ul className="flex flex-wrap gap-2">{found.map((k) => <li key={k} className="chip">✦ {SECRET_NAMES[k]}</li>)}</ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
