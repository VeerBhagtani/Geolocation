import { useStore } from '../context/StoreContext';
import { CheckIcon, CloseIcon } from './Icons';
const STYLES = { success: 'border-emerald-200 bg-white', error: 'border-rose-200 bg-rose-50', info: 'border-cream-300 bg-cream-50' };
export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[92%] max-w-sm -translate-x-1/2 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role={t.type === 'error' ? 'alert' : 'status'} data-toast-type={t.type}
          className={`page-enter pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-luxe ${STYLES[t.type]}`}>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${t.type === 'error' ? 'bg-rose-500' : t.type === 'info' ? 'bg-cocoa-400' : 'bg-champagne-500'} text-white`}>
            {t.type === 'error' ? '!' : <CheckIcon width={14} />}
          </span>
          <span className="flex-1 text-cocoa-700">{t.message}</span>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="text-cocoa-300 hover:text-cocoa-600"><CloseIcon width={16} /></button>
        </div>
      ))}
    </div>
  );
}
