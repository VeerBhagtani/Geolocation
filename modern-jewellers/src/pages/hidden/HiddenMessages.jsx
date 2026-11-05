import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { formatDate } from '../../utils/format';

const MESSAGES = [
  { from: 'The Founder', text: 'Every heirloom begins as a whisper between a karigar and the gold.' },
  { from: 'Master Karigar Arvind', text: 'Polki is honest. It does not hide its flaws — it wears them like a crown.' },
  { from: 'The Vault Keeper', text: 'Three pieces sleep in the vault. Their names are known only by code: they begin with MJ-VX.' },
  { from: 'An Old Patron', text: 'I asked the search for the great diamond of legend — and it answered.' },
];
const CODES = {
  'LOTUS-SEVEN': { key: 'logo-seven', text: 'The seven petals stand for the seven pheras. Every clasp you wear is a vow.' },
  'KARIGAR-1987': { key: 'source-whisper', text: 'You read what was written beneath the page itself. The atelier salutes your curiosity — the Gold Room privilege is GOLDROOM25.' },
};

export default function HiddenMessages() {
  const { discover, notify } = useStore();
  const [notes, setNotes] = useLocalStorage('mj_whispers', []);
  const [code, setCode] = useState('');
  const [revealed, setRevealed] = useState(null);
  const [form, setForm] = useState({ name: '', message: '' });
  const [err, setErr] = useState('');

  const speak = (e) => {
    e.preventDefault();
    const c = CODES[code.trim().toUpperCase()];
    if (!c) { setRevealed(null); return notify('The whispers stay silent…', 'error'); }
    setRevealed(c.text);
    discover(c.key);
  };
  const leave = (e) => {
    e.preventDefault();
    if (!form.message.trim()) return setErr('Please write a message');
    setNotes([{ ...form, name: form.name || 'Anonymous', date: new Date().toISOString() }, ...notes]);
    setForm({ name: '', message: '' });
    setErr('');
    notify('Your whisper has been left in the atelier');
  };

  return (
    <div className="container-luxe page-enter py-12">
      <div className="text-center">
        <p className="eyebrow">Hidden Messages</p>
        <h1 className="section-title mt-2">Whispers of the Atelier</h1>
        <div className="divider-gold" />
      </div>
      <div className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
        {MESSAGES.map((m) => (
          <blockquote key={m.from} className="card p-6">
            <p className="font-serif text-xl italic text-cocoa-600">“{m.text}”</p>
            <footer className="mt-3 text-xs uppercase tracking-widest text-champagne-700">— {m.from}</footer>
          </blockquote>
        ))}
      </div>
      <form onSubmit={speak} className="card mx-auto mt-10 max-w-xl p-6 text-center" aria-label="Speak a code word">
        <p className="font-serif text-2xl">Speak a code word</p>
        <div className="mt-4 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} className="input uppercase" placeholder="Code word" aria-label="Code word" />
          <button className="btn-gold btn-sm" type="submit">Speak</button>
        </div>
        {revealed && <p className="page-enter mt-4 rounded-xl bg-cream-100 p-4 text-cocoa-700" data-testid="whisper-revealed">{revealed}</p>}
      </form>
      <div className="mx-auto mt-10 max-w-xl">
        <form onSubmit={leave} noValidate className="card space-y-3 p-6" aria-label="Leave a whisper">
          <p className="font-serif text-2xl">Leave a whisper</p>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name (optional)" aria-label="Your name" />
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`input ${err ? 'input-error' : ''}`} rows={3} placeholder="A secret for the atelier…" aria-label="Message" />
          {err && <p className="field-error">{err}</p>}
          <button className="btn-outline btn-sm" type="submit">Leave Whisper</button>
        </form>
        <ul className="mt-6 space-y-3">
          {notes.map((n, i) => <li key={i} className="rounded-xl border border-cream-200 bg-white p-4 text-sm"><p className="text-cocoa-700">{n.message}</p><p className="mt-1 text-xs text-cocoa-400">— {n.name}, {formatDate(n.date)}</p></li>)}
        </ul>
        <p className="mt-8 text-center text-sm"><Link to="/atelier-secret" className="text-cocoa-400 underline">More atelier secrets</Link></p>
      </div>
    </div>
  );
}
