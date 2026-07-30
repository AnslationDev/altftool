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

// Tracks how many open modals currently rely on hiding a given sibling, so
// nested modals restore the exact prior state instead of clobbering it.
const hiddenSiblingState = new WeakMap();

function hideElementFromA11yTree(el) {
  const existing = hiddenSiblingState.get(el);
  if (existing) {
    existing.count += 1;
    return;
  }
  hiddenSiblingState.set(el, {
    count: 1,
    hadInert: "inert" in el ? el.inert : undefined,
    hadAriaHidden: el.getAttribute("aria-hidden"),
  });
  if ("inert" in el) {
    el.inert = true;
  } else {
    el.setAttribute("aria-hidden", "true");
  }
}

function restoreElementFromA11yTree(el) {
  const state = hiddenSiblingState.get(el);
  if (!state) return;
  if (state.count > 1) {
    state.count -= 1;
    return;
  }
  hiddenSiblingState.delete(el);
  if ("inert" in el) {
    el.inert = Boolean(state.hadInert);
  }
  if (state.hadAriaHidden === null) {
    el.removeAttribute("aria-hidden");
  } else {
    el.setAttribute("aria-hidden", state.hadAriaHidden);
  }
}

function hideOthersFromA11yTree(target) {
  if (!target) return () => {};
  const hidden = [];
  let node = target;
  while (node && node !== document.body) {
    const parent = node.parentElement;
    if (!parent) break;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === node) return;
      hideElementFromA11yTree(sibling);
      hidden.push(sibling);
    });
    node = parent;
  }
  return () => {
    hidden.forEach(restoreElementFromA11yTree);
  };
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
  const overlayRef = useRef(null);
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

    // Hide everything outside the modal from the accessibility tree so
    // screen-reader virtual-cursor browsing can't reach it while open.
    const restoreA11yTree = hideOthersFromA11yTree(overlayRef.current);

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(dialogRef.current);
      (focusable?.[0] || dialogRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      restoreA11yTree();
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [handleKey, open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
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
