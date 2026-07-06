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

/* ─── Layout & data-display primitives ────────────────────────────────── */

const CHEVRON_DOWN = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SEARCH_GLYPH = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M13.2 13.2L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CLEAR_GLYPH = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tabs,
  meta,
  className,
  children,
}) {
  return (
    <header className={cn("alt-ui-page-header", className)}>
      <div className="alt-ui-page-header__row">
        <div className="alt-ui-page-header__copy">
          {eyebrow ? <p className="alt-ui-page-header__eyebrow">{eyebrow}</p> : null}
          <div className="alt-ui-page-header__title-row">
            <h1 className="alt-ui-page-header__title">{title}</h1>
            {meta}
          </div>
          {description ? (
            <p className="alt-ui-page-header__description">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="alt-ui-page-header__actions">{actions}</div> : null}
      </div>
      {children}
      {tabs ? <div className="alt-ui-page-header__tabs">{tabs}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  hint,
  icon,
  loading = false,
  className,
  ...props
}) {
  return (
    <div className={cn("alt-ui-card", "alt-ui-stat", className)} {...props}>
      <div className="alt-ui-stat__top">
        <p className="alt-ui-stat__label">{label}</p>
        {icon ? (
          <span className="alt-ui-stat__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <Skeleton style={{ height: 28, width: "60%" }} />
      ) : (
        <div className="alt-ui-stat__value-row">
          <p className="alt-ui-stat__value">{value}</p>
          {delta != null ? (
            <span className={cn("alt-ui-stat__delta", `alt-ui-stat__delta--${deltaTone}`)}>
              {delta}
            </span>
          ) : null}
        </div>
      )}
      {hint ? <p className="alt-ui-stat__hint">{hint}</p> : null}
    </div>
  );
}

export function TableContainer({ className, children, ...props }) {
  return (
    <div className={cn("alt-ui-card", "alt-ui-table-wrap", className)} {...props}>
      {children}
    </div>
  );
}

export function Table({ className, sticky = false, ...props }) {
  return (
    <table
      className={cn("alt-ui-table", sticky && "alt-ui-table--sticky", className)}
      {...props}
    />
  );
}

export function TableHead(props) {
  return <thead {...props} />;
}

export function TableBody(props) {
  return <tbody {...props} />;
}

export function TableRow({ className, interactive = false, ...props }) {
  return (
    <tr
      className={cn(interactive && "alt-ui-table__row--interactive", className)}
      {...props}
    />
  );
}

export function Th({ className, align, ...props }) {
  return (
    <th
      className={cn("alt-ui-table__th", className)}
      style={align ? { textAlign: align } : undefined}
      scope="col"
      {...props}
    />
  );
}

export function Td({ className, align, ...props }) {
  return (
    <td
      className={cn("alt-ui-table__td", className)}
      style={align ? { textAlign: align } : undefined}
      {...props}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  compact = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "alt-ui-empty",
        variant === "dashed" && "alt-ui-empty--dashed",
        compact && "alt-ui-empty--compact",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="alt-ui-empty__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p className="alt-ui-empty__title">{title}</p>
      {description ? <p className="alt-ui-empty__description">{description}</p> : null}
      {action ? <div className="alt-ui-empty__action">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return <span aria-hidden="true" className={cn("alt-ui-skeleton", className)} {...props} />;
}

export function SkeletonText({ lines = 3, className, ...props }) {
  return (
    <span aria-hidden="true" className={cn("alt-ui-skeleton-text", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          style={{ width: index === lines - 1 ? "62%" : "100%", height: 12 }}
        />
      ))}
    </span>
  );
}

export function Tabs({ items = [], value, onChange, ariaLabel, className }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("alt-ui-tabs", className)}>
      {items.map((item) => {
        const isActive = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(item.key)}
            className={cn("alt-ui-tab", isActive && "alt-ui-tab--active")}
          >
            {item.icon ? (
              <span className="alt-ui-tab__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span>{item.label}</span>
            {item.count != null ? (
              <span className="alt-ui-tab__count">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export const Select = React.forwardRef(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <span className={cn("alt-ui-select-wrap", className)}>
      <select ref={ref} suppressHydrationWarning className="alt-ui-input alt-ui-select" {...props}>
        {children}
      </select>
      <span className="alt-ui-select__chevron" aria-hidden="true">
        {CHEVRON_DOWN}
      </span>
    </span>
  );
});

export const Textarea = React.forwardRef(function Textarea(
  { className, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      suppressHydrationWarning
      className={cn("alt-ui-input", "alt-ui-textarea", className)}
      {...props}
    />
  );
});

export const SearchInput = React.forwardRef(function SearchInput(
  { className, wrapClassName, value, onClear, ...props },
  ref,
) {
  return (
    <span className={cn("alt-ui-search", wrapClassName)}>
      <span className="alt-ui-search__icon" aria-hidden="true">
        {SEARCH_GLYPH}
      </span>
      <Input
        ref={ref}
        value={value}
        className={cn("alt-ui-search__input", className)}
        {...props}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          className="alt-ui-search__clear"
          aria-label="Clear search"
        >
          {CLEAR_GLYPH}
        </button>
      ) : null}
    </span>
  );
});

export function SectionHeader({ title, description, actions, className, ...props }) {
  return (
    <div className={cn("alt-ui-section-header", className)} {...props}>
      <div className="alt-ui-section-header__copy">
        <h2 className="alt-ui-section-header__title">{title}</h2>
        {description ? (
          <p className="alt-ui-section-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="alt-ui-section-header__actions">{actions}</div> : null}
    </div>
  );
}

export function Alert({ tone = "info", title, children, icon, action, className, ...props }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("alt-ui-alert", `alt-ui-alert--${tone}`, className)}
      {...props}
    >
      {icon ? (
        <span className="alt-ui-alert__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="alt-ui-alert__body">
        {title ? <p className="alt-ui-alert__title">{title}</p> : null}
        {children ? <div className="alt-ui-alert__message">{children}</div> : null}
      </div>
      {action ? <div className="alt-ui-alert__action">{action}</div> : null}
    </div>
  );
}

export function Kbd({ className, ...props }) {
  return <kbd className={cn("alt-ui-kbd", className)} {...props} />;
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
