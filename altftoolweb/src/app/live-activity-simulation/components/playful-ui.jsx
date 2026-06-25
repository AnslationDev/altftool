"use client";

import { cn } from "../utils/cn";

const toneMap = {
  accent: "sticker-shadow-violet",
  secondary: "sticker-shadow-pink",
  tertiary: "sticker-shadow-yellow",
  quaternary: "sticker-shadow-mint",
  white: "sticker-shadow-soft",
};

const tiltMap = {
  none: "rotate-0",
  left: "-rotate-1",
  right: "rotate-1",
};

export function SectionEyebrow({ children, className }) {
  return <div className={cn("eyebrow-chip", className)}>{children}</div>;
}

export function SectionTitle({ title, description, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function StickerCard({
  tone = "white",
  tilt = "none",
  floatingIcon,
  eyebrow,
  title,
  description,
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "sticker-card pop-in",
        toneMap[tone],
        tiltMap[tilt],
        floatingIcon && "pt-8",
        className,
      )}
      {...props}
    >
      {floatingIcon ? <div className="sticker-floating-icon">{floatingIcon}</div> : null}
      {eyebrow || title || description ? (
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="font-heading text-2xl font-extrabold tracking-tight text-slate-800">
              {title}
            </h3>
          ) : null}
          {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function CandyButton({ variant = "primary", icon, className, children, ...props }) {
  const variantClass = {
    primary: "candy-button-primary",
    secondary: "candy-button-secondary",
    tertiary: "candy-button-tertiary",
    ghost: "candy-button-ghost",
  }[variant];

  return (
    <button className={cn("candy-button", variantClass, className)} {...props}>
      <span>{children}</span>
      {icon ? <span className="button-icon-chip">{icon}</span> : null}
    </button>
  );
}

export function IconBubble({ children, tone = "accent", className }) {
  const bubbleClass = {
    accent: "icon-bubble-violet",
    secondary: "icon-bubble-pink",
    tertiary: "icon-bubble-yellow",
    quaternary: "icon-bubble-mint",
    white: "icon-bubble-white",
  }[tone];

  return <div className={cn("icon-bubble h-12 w-12", bubbleClass, className)}>{children}</div>;
}

export function PatternStrip({ items }) {
  return (
    <div className="marquee-shell" aria-hidden="true">
      <div className="marquee-track">
        {[...items, ...items].map((item, index) => (
          <div key={`${item}-${index}`} className="marquee-item">
            <span className="marquee-dot" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
