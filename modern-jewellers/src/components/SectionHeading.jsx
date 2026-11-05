export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`mb-10 ${align === 'center' ? 'text-center' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title mt-2">{title}</h2>
      {align === 'center' && <div className="divider-gold" />}
      {subtitle && <p className={`mt-2 text-cocoa-500 ${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>{subtitle}</p>}
    </div>
  );
}
