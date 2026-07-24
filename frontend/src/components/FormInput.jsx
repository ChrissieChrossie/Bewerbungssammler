export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) {
  const inputId = id || (label ? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined)

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="text-red-600" aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
