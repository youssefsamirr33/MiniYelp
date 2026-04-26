export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  error = "",
  helper = "",
  ...inputProps
}) {
  return (
    <label className={`form-field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...inputProps}
      />
      {error ? <small className="form-error-text">{error}</small> : null}
      {!error && helper ? <small className="form-helper-text">{helper}</small> : null}
    </label>
  );
}
