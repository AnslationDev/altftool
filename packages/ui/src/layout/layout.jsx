import React from "react";
import { cn } from "../lib/cn.js";

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
          {eyebrow ? (
            <p className="alt-ui-page-header__eyebrow">{eyebrow}</p>
          ) : null}
          <div className="alt-ui-page-header__title-row">
            <h1 className="alt-ui-page-header__title">{title}</h1>
            {meta}
          </div>
          {description ? (
            <p className="alt-ui-page-header__description">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="alt-ui-page-header__actions">{actions}</div>
        ) : null}
      </div>
      {children}
      {tabs ? <div className="alt-ui-page-header__tabs">{tabs}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
  ...props
}) {
  return (
    <div className={cn("alt-ui-section-header", className)} {...props}>
      <div className="alt-ui-section-header__copy">
        <h2 className="alt-ui-section-header__title">{title}</h2>
        {description ? (
          <p className="alt-ui-section-header__description">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="alt-ui-section-header__actions">{actions}</div>
      ) : null}
    </div>
  );
}

export function PageShell({ as: Element = "div", className, ...props }) {
  return <Element className={cn("alt-ui-page-shell", className)} {...props} />;
}

export function Stack({
  as: Element = "div",
  className,
  gap = "md",
  ...props
}) {
  return (
    <Element
      className={cn("alt-ui-stack", `alt-ui-stack--${gap}`, className)}
      {...props}
    />
  );
}

export function Cluster({
  as: Element = "div",
  className,
  gap = "md",
  ...props
}) {
  return (
    <Element
      className={cn("alt-ui-cluster", `alt-ui-cluster--${gap}`, className)}
      {...props}
    />
  );
}
