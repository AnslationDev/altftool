"use client";

export const Switch = ({ checked, onCheckedChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        ${checked ? "bg-[var(--primary)]" : "bg-[var(--muted)]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? "translate-x-4" : "translate-x-1"}
        `}
      />
    </button>
  );
};
