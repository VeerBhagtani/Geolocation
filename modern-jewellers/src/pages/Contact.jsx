import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import useForm, { rules } from '../hooks/useForm';
import { Input, Select, Textarea, RadioGroup, Checkbox, MultiSelect } from '../components/Field';
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../components/Icons';
import stores from '../data/stores.json';

const INITIAL = { name: '', email: '', phone: '', subject: '', store: '', interests: [], contactPref: 'Email', visitDate: '', message: '', consent: false };

export default function Contact() {
  const { submit, notify } = useStore();
  const form = useForm(INITIAL, {
    name: [rules.required], email: [rules.required, rules.email], phone: [rules.phone], subject: [rules.required],
    interests: [rules.required], message: [rules.required, rules.min(10)], consent: [rules.required],
  });
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) return notify('Please correct the highlighted fields', 'error');
    const entry = submit('contact', form.values);
    notify(`Thank you, ${form.values.name.split(' ')[0]}! Your message (${entry.id}) has been received.`);
    form.reset();
  };
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <div className="mb-10 text-center">
        <p className="eyebrow">We’d love to hear from you</p>
        <h1 className="section-title mt-2">Contact Modern Jewellers</h1>
        <div className="divider-gold" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          {[[PhoneIcon, 'Call our concierge', '+91 22 4000 1987', 'tel:+912240001987'], [MailIcon, 'Write to us', 'care@modernjewellers.example', 'mailto:care@modernjewellers.example'], [PinIcon, 'Flagship store', '14, Rampart Row, Kala Ghoda, Mumbai 400001', '/stores'], [ClockIcon, 'Hours', 'Mon–Sun · 10:30 AM – 9:00 PM', '/stores']].map(([I, t, v, href]) => (
            <a key={t} href={href} className="card flex items-start gap-4 p-5 transition hover:shadow-luxe">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-100 text-champagne-600"><I /></span>
              <span><span className="block text-xs uppercase tracking-widest text-cocoa-400">{t}</span><span className="text-cocoa-700">{v}</span></span>
            </a>
          ))}
          <div className="card p-5 text-sm text-cocoa-500">
            Looking for something specific? Visit our <Link to="/faq" className="text-champagne-700 underline">FAQs</Link>, <Link to="/track-order" className="text-champagne-700 underline">track an order</Link> or <Link to="/returns" className="text-champagne-700 underline">request a return</Link>.
          </div>
        </div>
        <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 md:p-8" aria-label="Contact form">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input form={form} name="name" label="Full name" required placeholder="Priya Sharma" />
            <Input form={form} name="email" label="Email" type="email" required placeholder="priya@example.in" />
            <Input form={form} name="phone" label="Mobile" type="tel" placeholder="98765 43210" />
            <Select form={form} name="subject" label="Subject" required options={['General Enquiry', 'Order Support', 'Custom Design', 'Bridal Appointment', 'Gold Exchange', 'Corporate Gifting', 'Feedback']} />
            <Select form={form} name="store" label="Preferred store" options={stores.map((s) => ({ value: s.id, label: `${s.city} — ${s.name.split('— ')[1]}` }))} placeholder="Online / No preference" />
            <Input form={form} name="visitDate" label="Preferred visit date" type="date" min={new Date().toISOString().slice(0, 10)} />
          </div>
          <MultiSelect form={form} name="interests" label="I’m interested in" required options={['Gold', 'Diamond', 'Silver', 'Bridal', 'Daily Wear', 'Custom Design']} />
          <RadioGroup form={form} name="contactPref" label="Preferred contact method" options={['Email', 'Phone', 'WhatsApp']} />
          <Textarea form={form} name="message" label="Message" required placeholder="How may we help you?" />
          <Checkbox form={form} name="consent" label="I agree to the privacy policy and consent to be contacted." required />
          <button type="submit" className="btn-gold w-full sm:w-auto">Send Message</button>
        </form>
      </div>
    </div>
  );
}
