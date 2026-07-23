import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { img } from "../data/site.js";
import clsx from "clsx";
import Icon from "./Icons.jsx";

/* Layout container */
export function Container({ className = "", children }) {
  return (
    <div className={clsx("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/* Scroll reveal wrapper */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={clsx(
        "transition-all duration-700 ease-out will-change-transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/* Small eyebrow label */
export function Eyebrow({ children, light = false, className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]",
        light ? "text-bronze-200" : "text-bronze-600",
        className
      )}
    >
      <span
        className={clsx(
          "h-px w-7",
          light ? "bg-bronze-300/60" : "bg-bronze-500/50"
        )}
      />
      {children}
    </span>
  );
}

/* Section heading block */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className = "",
}) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow light={light}>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      {title && (
        <Reveal delay={80}>
          <h2
            className={clsx(
              "mt-4 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-[2.7rem]",
              light ? "text-white" : "text-ink"
            )}
          >
            {title}
          </h2>
        </Reveal>
      )}
      {description && (
        <Reveal delay={160}>
          <p
            className={clsx(
              "mt-5 text-pretty text-base leading-relaxed sm:text-lg",
              light ? "text-stone-300" : "text-stone-600"
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}



export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function PostCard({ post }) {
  const slug = slugify(post.title);
  return (
    <RouterLink to={`/blog/${slug}`} className="group block">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10">
        <div className="relative h-52 overflow-hidden">
          <img
            src={img(post.image, 700)}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <span className="absolute left-4 top-4">
            <Pill className="border-white/30 bg-white/90 backdrop-blur-sm">{post.category}</Pill>
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" className="h-3.5 w-3.5 text-bronze-600" />
              {post.date}
            </span>
            <span className="h-1 w-1 rounded-full bg-stone-300" />
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5 text-bronze-600" />
              {post.readTime}
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-bronze-700">
            {post.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
            {post.excerpt}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="text-sm font-medium text-stone-700">{post.author}</span>
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-bronze-700 hover:text-bronze-800">Read <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
          </div>
        </div>
      </article>
    </RouterLink>
  );
}


/* Button — renders Link / anchor / button depending on props */
export function Button({
  to,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze-500/60 focus-visible:ring-offset-2";
  const variants = {
    primary:
      "bg-bronze-600 text-white shadow-lg shadow-bronze-700/20 hover:bg-bronze-700 hover:shadow-xl hover:shadow-bronze-700/30 hover:-translate-y-0.5",
    dark: "bg-ink text-cream hover:bg-stone-800 hover:-translate-y-0.5",
    light:
      "bg-white text-ink shadow-lg shadow-black/10 hover:bg-cream-100 hover:-translate-y-0.5",
    outline:
      "border border-stone-300 text-stone-800 hover:border-bronze-500 hover:text-bronze-700",
    outlineLight:
      "border border-white/40 text-white backdrop-blur-sm hover:bg-white hover:text-ink",
    ghost: "text-stone-700 hover:text-bronze-700",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const cls = clsx(base, variants[variant], sizes[size], className);
  if (to)
    return (
      <RouterLink to={to} className={cls} {...rest}>
        {children}
      </RouterLink>
    );
  if (href)
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* Star rating row */
export function Stars({ value = 5, className = "" }) {
  return (
    <div className={clsx("flex items-center gap-0.5 text-bronze-400", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          fill={i < value ? "currentColor" : "none"}
          strokeWidth={1.2}
          className="h-4 w-4"
        />
      ))}
    </div>
  );
}

/* Tag / pill */
export function Pill({ children, className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-bronze-200 bg-bronze-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-bronze-700",
        className
      )}
    >
      {children}
    </span>
  );
}
