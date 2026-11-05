export default function Field({ label, name, error, required, children, hint, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-cocoa-300">{hint}</p>}
      {error && <p className="field-error" role="alert" id={`${name}-error`}>{error}</p>}
    </div>
  );
}

export function Input({ form, name, label, required, type = 'text', hint, className, ...rest }) {
  return (
    <Field label={label} name={name} error={form.errors[name]} required={required} hint={hint} className={className}>
      <input id={name} name={name} type={type} value={form.values[name] ?? ''} onChange={form.onChange} required={required}
        aria-invalid={!!form.errors[name]} className={`input ${form.errors[name] ? 'input-error' : ''}`} {...rest} />
    </Field>
  );
}

export function Select({ form, name, label, required, options, placeholder = 'Select…', className, ...rest }) {
  return (
    <Field label={label} name={name} error={form.errors[name]} required={required} className={className}>
      <select id={name} name={name} value={form.values[name] ?? ''} onChange={form.onChange} required={required}
        aria-invalid={!!form.errors[name]} className={`input ${form.errors[name] ? 'input-error' : ''}`} {...rest}>
        {placeholder && !rest.multiple && <option value="">{placeholder}</option>}
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </Field>
  );
}

export function Textarea({ form, name, label, required, rows = 4, className, ...rest }) {
  return (
    <Field label={label} name={name} error={form.errors[name]} required={required} className={className}>
      <textarea id={name} name={name} rows={rows} value={form.values[name] ?? ''} onChange={form.onChange} required={required}
        aria-invalid={!!form.errors[name]} className={`input ${form.errors[name] ? 'input-error' : ''}`} {...rest} />
    </Field>
  );
}

export function RadioGroup({ form, name, label, options, required, inline = true }) {
  return (
    <Field label={label} name={name} error={form.errors[name]} required={required}>
      <div className={`flex ${inline ? 'flex-wrap gap-4' : 'flex-col gap-2'}`} role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-cocoa-600">
              <input type="radio" name={name} value={v} checked={form.values[name] === v} onChange={form.onChange} className="accent-champagne-500" />
              {l}
            </label>
          );
        })}
      </div>
    </Field>
  );
}

export function Checkbox({ form, name, label, required }) {
  return (
    <Field name={name} error={form.errors[name]}>
      <label className="flex cursor-pointer items-start gap-2 text-sm text-cocoa-600">
        <input id={name} type="checkbox" name={name} checked={!!form.values[name]} onChange={form.onChange} className="mt-0.5 accent-champagne-500" />
        <span>{label} {required && <span className="text-rose-500">*</span>}</span>
      </label>
    </Field>
  );
}

/** Checkbox-pill multi-select (values stored as array). */
export function MultiSelect({ form, name, label, options, required }) {
  const value = form.values[name] || [];
  const toggle = (o) => form.onChange({ target: { name, value: value.includes(o) ? value.filter((x) => x !== o) : [...value, o] } });
  return (
    <Field label={label} name={name} error={form.errors[name]} required={required}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => (
          <button type="button" key={o} onClick={() => toggle(o)} aria-pressed={value.includes(o)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${value.includes(o) ? 'border-champagne-500 bg-champagne-500 text-white' : 'border-cream-300 bg-white text-cocoa-600 hover:border-champagne-400'}`}>
            {value.includes(o) ? '✓ ' : ''}{o}
          </button>
        ))}
      </div>
    </Field>
  );
}
