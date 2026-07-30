export default function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Bitte wählen...'
}) {
  const selectId = id || (label ? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined)

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {required && <span className="text-red-600" aria-hidden="true"> *</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`input ${error ? 'input-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p id={`${selectId}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
