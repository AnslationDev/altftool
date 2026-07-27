import React from "react";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "../lib/cn.js";

const TOAST_ICONS = {
  success: CheckCircle2,
  danger: CircleAlert,
  warning: TriangleAlert,
  info: Info,
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
  const DefaultIcon = TOAST_ICONS[tone];
  const resolvedIcon = icon ?? (DefaultIcon ? <DefaultIcon /> : null);

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
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
        {message ? (
          <div className="alt-ui-toast__message">{message}</div>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          className="alt-ui-toast__close"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function ToastHost({ position = "top-right", children, className }) {
  return (
    <div
      className={cn(
        "alt-ui-toast-host",
        `alt-ui-toast-host--${position}`,
        className,
      )}
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  icon,
  action,
  className,
  ...props
}) {
  const DefaultIcon = TOAST_ICONS[tone] || Info;
  const resolvedIcon = icon === false ? null : icon || <DefaultIcon />;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("alt-ui-alert", `alt-ui-alert--${tone}`, className)}
      {...props}
    >
      {resolvedIcon ? (
        <span className="alt-ui-alert__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : null}
      <div className="alt-ui-alert__body">
        {title ? <p className="alt-ui-alert__title">{title}</p> : null}
        {children ? (
          <div className="alt-ui-alert__message">{children}</div>
        ) : null}
      </div>
      {action ? <div className="alt-ui-alert__action">{action}</div> : null}
    </div>
  );
}
