export default function Loader({ label = 'Polishing your experience…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-cream-300 border-t-champagne-500" />
        <svg viewBox="0 0 40 40" className="absolute inset-3 animate-pulse"><path d="M20 4 L32 16 L20 36 L8 16Z" fill="#c9a24e" /></svg>
      </div>
      <p className="font-serif text-lg italic text-cocoa-400">{label}</p>
    </div>
  );
}
