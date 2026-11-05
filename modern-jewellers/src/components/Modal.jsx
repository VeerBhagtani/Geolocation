import { useEffect } from 'react';
import { CloseIcon } from './Icons';
export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-cocoa-800/40 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`page-enter max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-cream-200 bg-cream-50 p-6 shadow-luxe sm:p-8 ${wide ? 'max-w-3xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h3 className="font-serif text-2xl">{title}</h3>}
          <button onClick={onClose} className="rounded-full p-1.5 text-cocoa-400 hover:bg-cream-200" aria-label="Close dialog"><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
