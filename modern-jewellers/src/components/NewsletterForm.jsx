import { useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function NewsletterForm({ compact = false, onSuccess }) {
  const { submit, notify, submissions } = useStore();
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('All');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address');
    if (!consent) return setError('Please agree to receive emails');
    if (submissions.newsletter?.some((s) => s.email === email.toLowerCase())) {
      setError('');
      notify('You are already subscribed — thank you!', 'info');
      return;
    }
    submit('newsletter', { email: email.toLowerCase(), interest });
    setError('');
    setEmail('');
    notify('Subscribed! Use WELCOME10 for 10% off your first order.');
    onSuccess?.();
  };
  return (
    <form onSubmit={onSubmit} noValidate className="w-full" aria-label="Newsletter subscription">
      <div className={`flex flex-col gap-3 ${compact ? '' : 'sm:flex-row'}`}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email address"
          className={`input flex-1 !rounded-full ${error ? 'input-error' : ''}`} required />
        {!compact && (
          <select value={interest} onChange={(e) => setInterest(e.target.value)} className="input !w-auto !rounded-full" aria-label="Interest">
            <option>All</option><option>Gold</option><option>Diamond</option><option>Silver</option><option>Bridal</option>
          </select>
        )}
        <button className="btn-gold" type="submit">Subscribe</button>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-cocoa-500">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-champagne-500" />
        I agree to receive exclusive offers and new-collection previews.
      </label>
      {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  );
}
