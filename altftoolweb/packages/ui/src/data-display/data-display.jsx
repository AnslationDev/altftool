"use client";

import React from "react";
import { cn } from "../lib/cn.js";
import { Card } from "../primitives/surfaces.jsx";

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
    <Card className={cn("alt-ui-stat", className)} {...props}>
      <div className="alt-ui-stat__top">
        <p className="alt-ui-stat__label">{label}</p>
        {icon ? (
          <span className="alt-ui-stat__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <Skeleton className="alt-ui-stat__skeleton" />
      ) : (
        <div className="alt-ui-stat__value-row">
          <p className="alt-ui-stat__value">{value}</p>
          {delta != null ? (
            <span
              className={cn(
                "alt-ui-stat__delta",
                `alt-ui-stat__delta--${deltaTone}`,
              )}
            >
              {delta}
            </span>
          ) : null}
        </div>
      )}
      {hint ? <p className="alt-ui-stat__hint">{hint}</p> : null}
    </Card>
  );
}

export function TableContainer({ className, children, ...props }) {
  return (
    <Card className={cn("alt-ui-table-wrap", className)} {...props}>
      {children}
    </Card>
  );
}

export function Table({ className, sticky = false, ...props }) {
  return (
    <table
      className={cn(
        "alt-ui-table",
        sticky && "alt-ui-table--sticky",
        className,
      )}
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
      className={cn(
        "alt-ui-table__th",
        align && `alt-ui-align--${align}`,
        className,
      )}
      scope="col"
      {...props}
    />
  );
}

export function Td({ className, align, ...props }) {
  return (
    <td
      className={cn(
        "alt-ui-table__td",
        align && `alt-ui-align--${align}`,
        className,
      )}
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
      {description ? (
        <p className="alt-ui-empty__description">{description}</p>
      ) : null}
      {action ? <div className="alt-ui-empty__action">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={cn("alt-ui-skeleton", className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={cn("alt-ui-skeleton-text", className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "alt-ui-skeleton-text__line",
            index === lines - 1 && "alt-ui-skeleton-text__line--last",
          )}
        />
      ))}
    </span>
  );
}

export function Tabs({ items = [], value, onChange, ariaLabel, className }) {
  const handleKeyDown = (event, currentIndex) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "ArrowRight")
      nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    const nextItem = items[nextIndex];
    if (!nextItem) return;
    onChange?.(nextItem.key);
    event.currentTarget.parentElement
      ?.querySelectorAll('[role="tab"]')
      [nextIndex]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("alt-ui-tabs", className)}
    >
      {items.map((item, index) => {
        const isActive = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(item.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
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
    <div
      className={cn("alt-ui-bulkbar", className)}
      role="region"
      aria-label="Bulk actions"
    >
      <span className="alt-ui-bulkbar__count">
        <span className="alt-ui-bulkbar__count-pill">{count}</span>
        <span>{countLabel}</span>
      </span>
      {actions.length > 0 ? (
        <span className="alt-ui-bulkbar__divider" aria-hidden="true" />
      ) : null}
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
          <button
            type="button"
            onClick={onCancel}
            className="alt-ui-bulkbar__btn"
          >
            {cancelLabel}
          </button>
        </>
      ) : null}
    </div>
  );
}
