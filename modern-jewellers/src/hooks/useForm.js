import { useState } from 'react';

export const rules = {
  required: (v) => (v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length) || v === false ? 'This field is required' : ''),
  email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : ''),
  phone: (v) => (v && !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, '')) ? 'Enter a valid 10-digit Indian mobile number' : ''),
  pincode: (v) => (v && !/^\d{6}$/.test(v) ? 'Enter a valid 6-digit PIN code' : ''),
  min: (n) => (v) => (v && v.length < n ? `Must be at least ${n} characters` : ''),
};

/** Minimal form state + validation. schema: { field: [ruleFn, ...] } */
export default function useForm(initial, schema = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const validateField = (name, value, all) => {
    for (const r of schema[name] || []) {
      const msg = r(value, all);
      if (msg) return msg;
    }
    return '';
  };
  const validate = () => {
    const e = {};
    Object.keys(schema).forEach((k) => {
      const m = validateField(k, values[k], values);
      if (m) e[k] = m;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const onChange = (e) => {
    const { name, type, value, checked, multiple, options } = e.target;
    let v = type === 'checkbox' ? checked : value;
    if (multiple) v = [...options].filter((o) => o.selected).map((o) => o.value);
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: validateField(name, v, { ...values, [name]: v }) }));
  };
  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }));
  const reset = () => { setValues(initial); setErrors({}); };
  return { values, errors, onChange, validate, set, reset, setErrors };
}
