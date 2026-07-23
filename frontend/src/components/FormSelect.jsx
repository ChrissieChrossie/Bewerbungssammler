export default function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Bitte wählen...'
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`input ${error ? 'input-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
