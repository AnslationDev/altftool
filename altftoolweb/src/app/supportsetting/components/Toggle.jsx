"use client";

import { Toggle as SharedToggle } from "@altftool/ui";

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

      <SharedToggle
        id={id}
        checked={checked}
        label={label}
        onCheckedChange={onChange}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
      />
    </div>
  );
};

export default Toggle;
