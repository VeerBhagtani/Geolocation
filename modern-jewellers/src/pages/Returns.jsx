import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import useForm, { rules } from '../hooks/useForm';
import { Input, Select, Textarea, RadioGroup, Checkbox, MultiSelect } from '../components/Field';

export default function Returns() {
  const { submit, notify, user } = useStore();
  const form = useForm(
    { orderId: '', email: user?.email || '', name: user ? `${user.firstName} ${user.lastName}` : '', productId: '', purchaseDate: '', reason: '', type: 'Refund', condition: [], pickupDate: '', details: '', confirm: false },
    {
      orderId: [rules.required, (v) => (v && !/^MJ-ORD-\d{6}$/i.test(v) ? 'Format: MJ-ORD-123456' : '')], email: [rules.required, rules.email], name: [rules.required],
      productId: [rules.required], purchaseDate: [rules.required, (v) => (v && (Date.now() - new Date(v)) / 864e5 > 15 ? 'Returns are accepted within 15 days of delivery' : '')],
      reason: [rules.required], condition: [rules.required], pickupDate: [rules.required], confirm: [rules.required],
    },
  );
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) return notify('Please correct the highlighted fields', 'error');
    const r = submit('returns', form.values);
    notify(`Return request ${r.id} submitted. Pickup scheduled for ${form.values.pickupDate}.`);
    form.reset();
  };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Returns & Exchange' }]} />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Hassle-free</p>
          <h1 className="section-title mt-2">Returns & Exchange</h1>
          <ul className="mt-6 space-y-3 text-sm text-cocoa-600">
            <li>✦ 15-day no-questions-asked returns on unworn jewellery.</li>
            <li>✦ Free insured doorstep pickup across India.</li>
            <li>✦ Refunds processed within 7 working days of quality check.</li>
            <li>✦ Lifetime exchange at prevailing gold rate.</li>
            <li>✦ Customised and engraved pieces are exchange-only.</li>
          </ul>
        </div>
        <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 md:p-8" aria-label="Return request">
          <h2 className="font-serif text-2xl">Request a Return</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input form={form} name="orderId" label="Order number" required placeholder="MJ-ORD-240117" />
            <Input form={form} name="email" label="Email" type="email" required />
            <Input form={form} name="name" label="Full name" required />
            <Input form={form} name="productId" label="Product ID" required placeholder="MJ-GR-1001" />
            <Input form={form} name="purchaseDate" label="Delivery date" type="date" required max={today} />
            <Select form={form} name="reason" label="Reason" required options={['Size does not fit', 'Not as expected', 'Received damaged', 'Wrong item delivered', 'Changed my mind', 'Other']} />
          </div>
          <RadioGroup form={form} name="type" label="I would like" options={['Refund', 'Exchange', 'Store Credit']} />
          <MultiSelect form={form} name="condition" label="Item condition (select all that apply)" required options={['Unworn', 'Original box', 'Certificate included', 'Tags intact', 'Invoice available']} />
          <Input form={form} name="pickupDate" label="Preferred pickup date" type="date" required min={today} />
          <Textarea form={form} name="details" label="Additional details" rows={3} />
          <Checkbox form={form} name="confirm" label="I confirm the item is unworn and in its original condition" required />
          <button className="btn-gold" type="submit">Submit Return Request</button>
        </form>
      </div>
    </div>
  );
}
