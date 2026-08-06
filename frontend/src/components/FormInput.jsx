export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  endAdornment,
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
      <div className="relative">
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`input ${endAdornment ? 'pr-11' : ''} ${error ? 'input-error' : ''}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>
        )}
      </div>
      {error && <p id={`${inputId}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
