export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
