"use client";

// The one new primitive control this redesign needed — @altftool/ui has no
// switch/toggle component. Built to match its token language (radius,
// shadow, color-mix) so it looks native next to Button/Badge/etc.
const Toggle = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  loading = false,
  id,
  icon: Icon,
}) => {
  const handleClick = () => {
    if (disabled || loading) return;
    onChange?.(!checked);
  };

  return (
    <div
      className={`support-toggle-row ${disabled ? "support-toggle-row-disabled" : ""}`}
    >
      <div className="support-toggle-row-main">
        {Icon && (
          <span className="support-toggle-icon" aria-hidden="true">
            <Icon className="h-4 w-4" />
          </span>
        )}
        {(label || description) && (
          <div className="support-toggle-copy">
            {label && (
              <label htmlFor={id} className="support-toggle-label">
                {label}
              </label>
            )}
            {description && (
              <p className="support-toggle-description">{description}</p>
            )}
          </div>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`
          support-toggle
          ${checked ? "support-toggle-on" : "support-toggle-off"}
          ${loading ? "support-toggle-loading" : ""}
        `}
      >
        <span className="support-toggle-thumb" />
      </button>
    </div>
  );
};

export default Toggle;
