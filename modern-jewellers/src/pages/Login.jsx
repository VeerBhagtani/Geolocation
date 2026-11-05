import { photo } from '../data/photos';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import Breadcrumbs from '../components/Breadcrumbs';
import useForm, { rules } from '../hooks/useForm';
import { Input, Checkbox } from '../components/Field';

export default function Login() {
  const { login, notify, user } = useStore();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [error, setError] = useState('');
  const form = useForm({ email: '', password: '', remember: true }, { email: [rules.required, rules.email], password: [rules.required] });
  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.validate()) return;
    if (login(form.values.email, form.values.password)) nav(sp.get('redirect') || '/account');
    else setError('The email or password you entered is incorrect.');
  };
  return (
    <div className="container-luxe page-enter">
      <Breadcrumbs items={[{ label: 'Sign In' }]} />
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-luxe md:grid-cols-2">
        <div className="hidden bg-cream-100 md:block"><img src={photo('/images/banners/collection-everyday.svg')} alt="" className="h-full w-full object-cover" /></div>
        <form onSubmit={onSubmit} noValidate className="space-y-5 p-8 md:p-12" aria-label="Customer login">
          <p className="eyebrow">Welcome back</p>
          <h1 className="font-serif text-4xl">Sign In</h1>
          {user && <p className="rounded-lg bg-cream-100 p-3 text-sm">You are signed in as {user.email}. <Link to="/account" className="underline">Go to account</Link></p>}
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}
          <Input form={form} name="email" label="Email" type="email" required autoComplete="email" />
          <Input form={form} name="password" label="Password" type="password" required autoComplete="current-password" />
          <div className="flex items-center justify-between">
            <Checkbox form={form} name="remember" label="Remember me" />
            <button type="button" className="text-xs text-champagne-700 underline" onClick={() => notify('Password reset link sent (simulated) if the email is registered.', 'info')}>Forgot password?</button>
          </div>
          <button type="submit" className="btn-gold w-full">Sign In</button>
          <p className="text-center text-sm text-cocoa-500">New to Modern Jewellers? <Link to="/register" className="text-champagne-700 underline">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}
