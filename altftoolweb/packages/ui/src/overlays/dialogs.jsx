"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn.js";
import { Button, IconButton } from "../primitives/actions.jsx";

function getFocusableElements(container) {
  return container?.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  closeLabel = "Close dialog",
  showClose = true,
  className,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleKey = useCallback(
    (event) => {
      if (event.key === "Escape" && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(dialogRef.current);
      if (!focusable?.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(dialogRef.current);
      (focusable?.[0] || dialogRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [handleKey, open]);

  if (!open) return null;

  return (
    <div
      className="alt-ui-modal-overlay"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget &&
          onClose
        ) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "alt-ui-modal-dialog",
          `alt-ui-modal-dialog--${size}`,
          className,
        )}
      >
        {title || description || (showClose && onClose) ? (
          <header className="alt-ui-modal-header">
            <div className="alt-ui-modal-heading">
              {title ? (
                <h3 id={titleId} className="alt-ui-modal-title">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p id={descriptionId} className="alt-ui-modal-description">
                  {description}
                </p>
              ) : null}
            </div>
            {showClose && onClose ? (
              <IconButton
                type="button"
                variant="ghost"
                size="sm-icon"
                aria-label={closeLabel}
                onClick={onClose}
                className="alt-ui-modal-close"
              >
                <X aria-hidden="true" />
              </IconButton>
            ) : null}
          </header>
        ) : null}
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
      {message ? <p className="alt-ui-modal-message">{message}</p> : null}
    </Modal>
  );
}
