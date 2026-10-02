/** Shared muted switch for environment and exercise mode preferences. */
export default function OptionSwitch({ options, value, onChange, label, className = '' }) {
  return (
    <div className={`option-switch ${className}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={value === option.value}
          className={value === option.value ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
