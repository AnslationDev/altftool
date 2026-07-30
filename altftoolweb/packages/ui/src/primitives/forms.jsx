"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "../lib/cn.js";

export const Input = React.forwardRef(function Input(
  { className, invalid = false, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      suppressHydrationWarning
      className={cn(
        "alt-ui-input",
        invalid && "alt-ui-input--invalid",
        className,
      )}
      {...props}
    />
  );
});

export const Label = React.forwardRef(function Label(
  { className, required = false, children, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn("alt-ui-label", className)} {...props}>
      {children}
      {required ? (
        <span className="alt-ui-label__required" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
});

export function Field({
  label,
  children,
  className,
  description,
  error,
  helpText,
  htmlFor,
  required = false,
}) {
  const generatedFieldId = useId();
  const generatedHelpId = useId();
  const supportingText = error || description || helpText;
  const fieldId = htmlFor || generatedFieldId;

  let content = children;
  if (React.isValidElement(children) && React.Children.count(children) === 1) {
    const childProps = {};
    if (children.props.id === undefined) {
      childProps.id = fieldId;
    }
    if (supportingText) {
      childProps["aria-describedby"] = children.props["aria-describedby"]
        ? `${children.props["aria-describedby"]} ${generatedHelpId}`
        : generatedHelpId;
    }
    if (Object.keys(childProps).length > 0) {
      content = React.cloneElement(children, childProps);
    }
  }

  return (
    <div
      className={cn(
        "alt-ui-field",
        error && "alt-ui-field--invalid",
        className,
      )}
    >
      {label ? (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      ) : null}
      {content}
      {supportingText ? (
        <p
          id={generatedHelpId}
          className={cn("alt-ui-help", error && "alt-ui-help--error")}
        >
          {supportingText}
        </p>
      ) : null}
    </div>
  );
}

export const Select = React.forwardRef(function Select(
  { className, children, invalid = false, ...props },
  ref,
) {
  return (
    <span className={cn("alt-ui-select-wrap", className)}>
      <select
        ref={ref}
        suppressHydrationWarning
        aria-invalid={invalid || undefined}
        className={cn(
          "alt-ui-input",
          "alt-ui-select",
          invalid && "alt-ui-input--invalid",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="alt-ui-select__chevron" aria-hidden="true" />
    </span>
  );
});

export const Textarea = React.forwardRef(function Textarea(
  { className, invalid = false, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      suppressHydrationWarning
      aria-invalid={invalid || undefined}
      className={cn(
        "alt-ui-input",
        "alt-ui-textarea",
        invalid && "alt-ui-input--invalid",
        className,
      )}
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
      <Search className="alt-ui-search__icon" aria-hidden="true" />
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
          <X aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
});

export const Toggle = React.forwardRef(function Toggle(
  {
    checked,
    className,
    defaultChecked = false,
    disabled = false,
    label,
    onCheckedChange,
    onClick,
    size = "md",
    ...props
  },
  ref,
) {
  const warnedMissingLabel = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || warnedMissingLabel.current) {
      return;
    }
    warnedMissingLabel.current = true;
    if (!label && !props["aria-label"] && !props["aria-labelledby"]) {
      console.warn(
        "[@altftool/ui] Toggle rendered without a `label`, `aria-label`, or `aria-labelledby` prop — the switch has no accessible name.",
      );
    }
    // Intentionally checked once on mount only, matching a dev-time lint
    // rather than a live prop watcher.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const active = controlled ? checked : internalChecked;

  const handleClick = (event) => {
    if (!controlled) setInternalChecked((current) => !current);
    onCheckedChange?.(!active);
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "alt-ui-toggle",
        `alt-ui-toggle--${size}`,
        active && "alt-ui-toggle--checked",
        className,
      )}
      {...props}
    >
      <span className="alt-ui-toggle__thumb" aria-hidden="true">
        {active ? <Check /> : null}
      </span>
    </button>
  );
});
