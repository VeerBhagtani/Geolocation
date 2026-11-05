import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import Modal from '../components/Modal';
import useForm, { rules } from '../hooks/useForm';
import { Input, Select, Textarea } from '../components/Field';
import { PhoneIcon, MailIcon, WhatsappIcon, TruckIcon, RefreshIcon, GemIcon, ShieldIcon, ClockIcon } from '../components/Icons';

export default function Support() {
  const { submit, notify } = useStore();
  const [callback, setCallback] = useState(false);
  const form = useForm({ name: '', phone: '', slot: '', topic: '', note: '' }, { name: [rules.required], phone: [rules.required, rules.phone], slot: [rules.required], topic: [rules.required] });
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    submit('contact', { ...form.values, subject: `Callback: ${form.values.topic}`, email: '', message: form.values.note || 'Callback request' });
    notify(`Callback booked for ${form.values.slot}. Our concierge will call you.`);
    form.reset();
    setCallback(false);
  };
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Customer Support' }]} />
      <div className="text-center">
        <p className="eyebrow">We’re here for you</p>
        <h1 className="section-title mt-2">Customer Support</h1>
        <div className="divider-gold" />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <a href="tel:+912240001987" className="card p-8 text-center transition hover:shadow-luxe"><PhoneIcon className="mx-auto text-champagne-600" width={32} height={32} /><p className="mt-3 font-serif text-2xl">Call Us</p><p className="text-sm text-cocoa-500">+91 22 4000 1987 · 9 AM–9 PM</p></a>
        <a href="https://wa.me/912240001987" target="_blank" rel="noreferrer" className="card p-8 text-center transition hover:shadow-luxe"><WhatsappIcon className="mx-auto text-champagne-600" width={32} height={32} /><p className="mt-3 font-serif text-2xl">WhatsApp</p><p className="text-sm text-cocoa-500">Chat with a jewellery expert</p></a>
        <a href="mailto:care@modernjewellers.example" className="card p-8 text-center transition hover:shadow-luxe"><MailIcon className="mx-auto text-champagne-600" width={32} height={32} /><p className="mt-3 font-serif text-2xl">Email</p><p className="text-sm text-cocoa-500">Response within 24 hours</p></a>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[[TruckIcon, 'Track an Order', '/track-order'], [RefreshIcon, 'Returns & Exchange', '/returns'], [GemIcon, 'Jewellery Care Guide', '/faq'], [ShieldIcon, 'Certification & Hallmark', '/faq'], [ClockIcon, 'Store Hours', '/stores'], [MailIcon, 'Write to Us', '/contact'], [GemIcon, 'Download Catalogue', '/downloads'], [ShieldIcon, 'Order Help (FAQ)', '/faq']].map(([I, l, to]) => (
          <Link key={l} to={to} className="flex items-center gap-3 rounded-2xl border border-cream-200 bg-white p-5 transition hover:border-champagne-400"><I className="text-champagne-600" /> <span className="text-sm text-cocoa-700">{l}</span></Link>
        ))}
      </div>
      <div className="mt-10 rounded-3xl bg-gradient-to-r from-cream-100 to-cream-200 p-10 text-center">
        <p className="font-serif text-3xl">Prefer we call you?</p>
        <p className="mt-2 text-cocoa-500">Book a callback at a time that suits you.</p>
        <button className="btn-gold mt-6" onClick={() => setCallback(true)}>Request a Callback</button>
      </div>
      <Modal open={callback} onClose={() => setCallback(false)} title="Request a Callback">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Input form={form} name="name" label="Name" required />
          <Input form={form} name="phone" label="Mobile" type="tel" required />
          <Select form={form} name="slot" label="Preferred time" required options={['Today, 11 AM – 1 PM', 'Today, 3 PM – 5 PM', 'Tomorrow, 10 AM – 12 PM', 'Tomorrow, 4 PM – 6 PM']} />
          <Select form={form} name="topic" label="Topic" required options={['Order status', 'Product advice', 'Bridal consultation', 'Returns', 'Other']} />
          <Textarea form={form} name="note" label="Note" rows={2} />
          <button className="btn-gold w-full" type="submit">Book Callback</button>
        </form>
      </Modal>
    </div>
  );
}
