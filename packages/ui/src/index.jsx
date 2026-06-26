import React, { useEffect, useCallback } from "react";

export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export const Spinner = ({ className, size = "md" }) => (
  <span
    aria-hidden="true"
    className={cn("alt-ui-spinner", `alt-ui-spinner--${size}`, className)}
  />
);

export const Button = React.forwardRef(function Button(
  {
    children,
    className,
    variant = "primary",
    size = "md",
    type = "button",
    loading = false,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      // Browser autofill/password-manager extensions inject attributes
      // (e.g. fdprocessedid) onto buttons before hydration; ignore those.
      suppressHydrationWarning
      className={cn(
        "alt-ui-button",
        `alt-ui-button--${variant}`,
        `alt-ui-button--${size}`,
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
});

export const IconButton = React.forwardRef(function IconButton(
  { className, variant = "secondary", size = "icon", children, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("alt-ui-icon-button", className)}
      {...props}
    >
      {children}
    </Button>
  );
});

export const Input = React.forwardRef(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      // Autofill extensions inject attributes (fdprocessedid) before hydration.
      suppressHydrationWarning
      className={cn("alt-ui-input", className)}
      {...props}
    />
  );
});

export const Label = React.forwardRef(function Label(
  { className, ...props },
  ref,
) {
  return <label ref={ref} className={cn("alt-ui-label", className)} {...props} />;
});

export function Field({ label, children, className, helpText }) {
  return (
    <div className={cn("alt-ui-field", className)}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {helpText ? <p className="alt-ui-help">{helpText}</p> : null}
    </div>
  );
}

export const Card = React.forwardRef(function Card(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("alt-ui-card", className)} {...props} />;
});

export function Badge({ className, tone = "neutral", ...props }) {
  return (
    <span
      className={cn("alt-ui-badge", `alt-ui-badge--${tone}`, className)}
      {...props}
    />
  );
}

export function StatusBadge({ tone = "neutral", className, children, ...props }) {
  return (
    <Badge tone={tone} className={className} {...props}>
      {children}
    </Badge>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  className,
}) {
  const handleKey = useCallback(
    (event) => {
      if (event.key === "Escape" && onClose) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleKey]);

  if (!open) return null;

  const widthByCss = {
    sm: { maxWidth: "360px" },
    md: { maxWidth: "480px" },
    lg: { maxWidth: "640px" },
    xl: { maxWidth: "880px" },
  };

  return (
    <div
      className="alt-ui-modal-overlay"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget && onClose) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "alt-ui-modal-title" : undefined}
        aria-describedby={description ? "alt-ui-modal-desc" : undefined}
        className={cn("alt-ui-modal-dialog", className)}
        style={widthByCss[size] ?? widthByCss.md}
      >
        {(title || description) && (
          <header className="alt-ui-modal-header">
            {title ? (
              <h3 id="alt-ui-modal-title" className="alt-ui-modal-title">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p id="alt-ui-modal-desc" className="alt-ui-modal-description">
                {description}
              </p>
            ) : null}
          </header>
        )}
        {children ? <div className="alt-ui-modal-body">{children}</div> : null}
        {footer ? <div className="alt-ui-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onCancel,
  onConfirm,
  title = "Confirm",
  description,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {message ? <p style={{ margin: 0 }}>{message}</p> : null}
    </Modal>
  );
}

const TOAST_ICONS = {
  success: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 10.5l3.2 3.2L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 4l8 14H2L10 4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="15.2" r="0.9" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 9v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="6.6" r="0.9" fill="currentColor" />
    </svg>
  ),
  neutral: null,
};

export function Toast({
  tone = "info",
  title,
  message,
  onClose,
  leaving = false,
  icon,
  className,
}) {
  const resolvedIcon = icon ?? TOAST_ICONS[tone];
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "alt-ui-toast",
        `alt-ui-toast--${tone}`,
        leaving && "alt-ui-toast--leaving",
        className,
      )}
    >
      <span className="alt-ui-toast__accent" aria-hidden="true" />
      {resolvedIcon ? (
        <span className="alt-ui-toast__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="alt-ui-toast__body">
        {title ? <p className="alt-ui-toast__title">{title}</p> : null}
        {message ? <div className="alt-ui-toast__message">{message}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          className="alt-ui-toast__close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

export function ToastHost({ position = "top-right", children, className }) {
  return (
    <div
      className={cn("alt-ui-toast-host", `alt-ui-toast-host--${position}`, className)}
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function BulkActionBar({
  count,
  countLabel = "selected",
  actions = [],
  onCancel,
  cancelLabel = "Cancel",
  className,
}) {
  if (!count) return null;
  return (
    <div className={cn("alt-ui-bulkbar", className)} role="region" aria-label="Bulk actions">
      <span className="alt-ui-bulkbar__count">
        <span className="alt-ui-bulkbar__count-pill">{count}</span>
        <span>{countLabel}</span>
      </span>
      {actions.length > 0 ? <span className="alt-ui-bulkbar__divider" aria-hidden="true" /> : null}
      {actions.map((action) => (
        <button
          key={action.key ?? action.label}
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "alt-ui-bulkbar__btn",
            action.tone === "danger" && "alt-ui-bulkbar__btn--danger",
          )}
        >
          {action.label}
        </button>
      ))}
      {onCancel ? (
        <>
          <span className="alt-ui-bulkbar__divider" aria-hidden="true" />
          <button type="button" onClick={onCancel} className="alt-ui-bulkbar__btn">
            {cancelLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
