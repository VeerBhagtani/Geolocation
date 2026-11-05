import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import useForm, { rules } from '../hooks/useForm';
import { Input, Select, RadioGroup, Checkbox, MultiSelect } from '../components/Field';
import { STATES } from './Checkout';

export default function Register() {
  const { register, notify } = useStore();
  const nav = useNavigate();
  const form = useForm(
    { title: '', firstName: '', lastName: '', email: '', phone: '', dob: '', anniversary: '', gender: '', state: '', interests: [], password: '', confirm: '', newsletter: true, terms: false },
    {
      firstName: [rules.required], lastName: [rules.required], email: [rules.required, rules.email], phone: [rules.required, rules.phone],
      gender: [rules.required], state: [rules.required], interests: [rules.required],
      password: [rules.required, rules.min(8), (v) => (v && !/\d/.test(v) ? 'Include at least one number' : '')],
      confirm: [rules.required, (v, a) => (v !== a.password ? 'Passwords do not match' : '')],
      terms: [rules.required],
    },
  );
  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.validate()) return notify('Please correct the highlighted fields', 'error');
    const { confirm, terms, ...data } = form.values;
    if (register(data)) nav('/account');
  };
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Register' }]} />
      <form onSubmit={onSubmit} noValidate className="card mx-auto max-w-3xl space-y-5 p-8 md:p-12" aria-label="Customer registration">
        <p className="eyebrow">Join the family</p>
        <h1 className="font-serif text-4xl">Create Your Account</h1>
        <p className="text-sm text-cocoa-500">Enjoy faster checkout, order tracking, birthday & anniversary privileges.</p>
        <div className="grid gap-5 sm:grid-cols-[120px_1fr_1fr]">
          <Select form={form} name="title" label="Title" options={['Ms.', 'Mrs.', 'Mr.', 'Dr.']} placeholder="—" />
          <Input form={form} name="firstName" label="First name" required />
          <Input form={form} name="lastName" label="Last name" required />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input form={form} name="email" label="Email" type="email" required />
          <Input form={form} name="phone" label="Mobile" type="tel" required placeholder="98765 43210" />
          <Input form={form} name="dob" label="Date of birth" type="date" max={new Date().toISOString().slice(0, 10)} />
          <Input form={form} name="anniversary" label="Anniversary" type="date" hint="We’ll send a surprise" />
          <Select form={form} name="state" label="State" required options={STATES} />
        </div>
        <RadioGroup form={form} name="gender" label="Gender" required options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} />
        <MultiSelect form={form} name="interests" label="Jewellery interests" required options={['Gold', 'Diamond', 'Silver', 'Bridal', 'Daily Wear', 'Men’s', 'Gifting']} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input form={form} name="password" label="Password" type="password" required hint="Min 8 characters with a number" autoComplete="new-password" />
          <Input form={form} name="confirm" label="Confirm password" type="password" required autoComplete="new-password" />
        </div>
        <Checkbox form={form} name="newsletter" label="Send me new-collection previews and offers" />
        <Checkbox form={form} name="terms" label="I accept the Terms & Conditions and Privacy Policy" required />
        <button type="submit" className="btn-gold w-full sm:w-auto">Create Account</button>
        <p className="text-sm text-cocoa-500">Already registered? <Link to="/login" className="text-champagne-700 underline">Sign in</Link></p>
      </form>
    </div>
  );
}
