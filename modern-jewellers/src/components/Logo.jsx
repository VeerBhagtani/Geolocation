export default function Logo({ compact = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dc9a" />
            <stop offset=".5" stopColor="#c9a24e" />
            <stop offset="1" stopColor="#8c6a2a" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="19" fill="none" stroke="url(#logo-g)" strokeWidth="1.2" />
        <path d="M20 7 L30 17 L20 33 L10 17Z" fill="url(#logo-g)" />
        <path d="M10 17H30M16 17L20 33L24 17M15 11L16 17M25 11L24 17" stroke="#fff" strokeWidth=".9" fill="none" opacity=".75" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-semibold tracking-wide text-cocoa-800">Modern Jewellers</span>
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.42em] text-champagne-600">Since 1987 · Mumbai</span>
        </span>
      )}
    </span>
  );
}
