// Public renderers for every landing-page section type. Server components,
// semantic-token styled (light + dark), driven entirely by Firestore data —
// there is no hardcoded page content. The SECTIONS registry maps a section
// `type` to its renderer; unknown/hidden sections render nothing.

import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

const WIDTHS = { narrow: "max-w-2xl", normal: "max-w-4xl", wide: "max-w-6xl", full: "max-w-none" };
const RADII = { none: "0px", sm: "0.375rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" };

// CMS-authored HTML (TextBlock/RawHtml sections) comes straight out of Firestore
// with no editorial gate, so it is untrusted input. Sanitize with an explicit
// allow-list before it ever reaches dangerouslySetInnerHTML — strips
// <script>/<iframe>/<style>/on*-handlers/javascript: URLs while keeping the
// basic formatting markup these sections are meant to carry.
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "a", "p", "br", "hr", "span", "div",
    "strong", "b", "em", "i", "u", "s", "sub", "sup",
    "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "code", "pre",
    "img",
    "table", "thead", "tbody", "tr", "td", "th",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "width", "height"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input", "svg"],
  FORBID_ATTR: ["style"],
};

function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

function Container({ width = "normal", className = "", children }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 ${WIDTHS[width] || WIDTHS.normal} ${className}`}>{children}</div>;
}

// A brand-tinted button that respects the page's theme brand colour.
function CtaButton({ href, children, variant = "primary" }) {
  if (!href || !children) return null;
  const base = "inline-flex h-11 items-center justify-center rounded-[var(--lander-radius)] px-5 text-sm font-bold transition";
  const styles =
    variant === "primary"
      ? "bg-[var(--lander-brand)] text-white hover:brightness-95"
      : "border border-(--border) text-(--foreground) hover:border-[var(--lander-brand)] hover:text-[var(--lander-brand)]";
  const external = /^https?:\/\//.test(href);
  const cls = `${base} ${styles}`;
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
    : <Link href={href} className={cls}>{children}</Link>;
}

function Heading({ children, sub }) {
  if (!children) return null;
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-black tracking-tight text-(--foreground) sm:text-3xl">{children}</h2>
      {sub ? <p className="mx-auto mt-2 max-w-2xl text-sm text-(--muted-foreground) sm:text-base">{sub}</p> : null}
    </div>
  );
}

/* --------------------------------- sections -------------------------------- */

function Hero({ props, width }) {
  const align = props.align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Container width={width} className="py-14 sm:py-20">
      <div className={`grid gap-10 ${props.image ? "lg:grid-cols-2 lg:items-center" : ""}`}>
        <div className={`flex flex-col ${align} ${props.image ? "" : "mx-auto max-w-3xl"} ${props.align === "center" && !props.image ? "items-center text-center" : ""}`}>
          {props.badge ? (
            <span className="mb-4 inline-flex items-center rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs font-bold text-[var(--lander-brand)]">{props.badge}</span>
          ) : null}
          {props.heading ? <h1 className="text-3xl font-black leading-tight tracking-tight text-(--foreground) sm:text-5xl">{props.heading}</h1> : null}
          {props.subheading ? <p className="mt-3 text-lg font-semibold text-[var(--lander-brand)]">{props.subheading}</p> : null}
          {props.description ? <p className="mt-4 max-w-xl text-base text-(--muted-foreground)">{props.description}</p> : null}
          {(props.primaryLabel || props.secondaryLabel) ? (
            <div className={`mt-7 flex flex-wrap gap-3 ${props.align === "center" ? "justify-center" : ""}`}>
              <CtaButton href={props.primaryUrl} variant="primary">{props.primaryLabel}</CtaButton>
              <CtaButton href={props.secondaryUrl} variant="secondary">{props.secondaryLabel}</CtaButton>
            </div>
          ) : null}
        </div>
        {props.image ? (
          <div className="aspect-[4/3] overflow-hidden rounded-[var(--lander-radius)] border border-(--border) bg-(--card) shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={props.image}
              alt={props.heading || ""}
              className="h-full w-full object-cover"
              decoding="async"
              fetchPriority="low"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    </Container>
  );
}

function Banner({ props, width }) {
  const tone = props.tone || "info";
  const toneVar = tone === "primary" ? "var(--lander-brand)" : `var(--${tone}, var(--lander-brand))`;
  return (
    <Container width={width} className="py-4">
      <div className="flex flex-col items-center justify-between gap-3 rounded-[var(--lander-radius)] border border-(--border) px-5 py-4 sm:flex-row"
        style={{ background: `color-mix(in srgb, ${toneVar} 10%, transparent)` }}>
        <div className="text-center sm:text-left">
          {props.heading ? <p className="text-sm font-black text-(--foreground)">{props.heading}</p> : null}
          {props.text ? <p className="text-sm text-(--muted-foreground)">{props.text}</p> : null}
        </div>
        <CtaButton href={props.ctaUrl} variant="primary">{props.ctaLabel}</CtaButton>
      </div>
    </Container>
  );
}

function Intro({ props, width }) {
  return (
    <Container width="narrow" className="py-10">
      {props.heading ? <h2 className="mb-3 text-2xl font-black tracking-tight text-(--foreground)">{props.heading}</h2> : null}
      {props.body ? <p className="whitespace-pre-line text-base leading-relaxed text-(--muted-foreground)">{props.body}</p> : null}
    </Container>
  );
}

function Features({ props, width }) {
  const items = props.items || [];
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12 sm:py-16">
      <Heading>{props.heading}</Heading>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-[var(--lander-radius)] border border-(--border) bg-(--card) p-6">
            <h3 className="text-base font-bold text-(--foreground)">{it.title}</h3>
            {it.description ? <p className="mt-2 text-sm text-(--muted-foreground)">{it.description}</p> : null}
          </div>
        ))}
      </div>
    </Container>
  );
}

function Stats({ props, width }) {
  const items = props.items || [];
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12">
      <Heading>{props.heading}</Heading>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-[var(--lander-radius)] border border-(--border) bg-(--card) p-6 text-center">
            <div className="text-3xl font-black text-[var(--lander-brand)]">{it.value}</div>
            {it.label ? <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">{it.label}</div> : null}
          </div>
        ))}
      </div>
    </Container>
  );
}

function Benefits({ props, width }) {
  const items = props.items || [];
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12 sm:py-16">
      <Heading>{props.heading}</Heading>
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-4 rounded-[var(--lander-radius)] border border-(--border) bg-(--card) p-5">
            <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--lander-brand)] text-xs font-black text-white">✓</span>
            <div>
              <h3 className="text-base font-bold text-(--foreground)">{it.title}</h3>
              {it.description ? <p className="mt-1 text-sm text-(--muted-foreground)">{it.description}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

function Steps({ props, width }) {
  const items = props.items || [];
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12 sm:py-16">
      <Heading>{props.heading}</Heading>
      <ol className="grid gap-5 sm:grid-cols-3">
        {items.map((it, i) => (
          <li key={i} className="rounded-[var(--lander-radius)] border border-(--border) bg-(--card) p-6">
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--lander-brand)] text-sm font-black text-white">{i + 1}</div>
            <h3 className="text-base font-bold text-(--foreground)">{it.title}</h3>
            {it.description ? <p className="mt-1 text-sm text-(--muted-foreground)">{it.description}</p> : null}
          </li>
        ))}
      </ol>
    </Container>
  );
}

function Gallery({ props, width }) {
  const items = (props.items || []).filter((it) => it.image);
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12 sm:py-16">
      <Heading>{props.heading}</Heading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <figure key={i} className="overflow-hidden rounded-[var(--lander-radius)] border border-(--border) bg-(--card)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.image}
              alt={it.caption || ""}
              className="h-48 w-full object-cover"
              decoding="async"
              loading="lazy"
            />
            {it.caption ? <figcaption className="px-3 py-2 text-xs text-(--muted-foreground)">{it.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </Container>
  );
}

function toEmbedUrl(url = "") {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function Video({ props, width }) {
  if (!props.url) return null;
  const embed = toEmbedUrl(props.url);
  return (
    <Container width="narrow" className="py-12">
      <div className="overflow-hidden rounded-[var(--lander-radius)] border border-(--border) bg-black shadow-lg">
        {embed ? (
          <div className="relative aspect-video">
            <iframe src={embed} title="Video" className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
          </div>
        ) : (
          <video
            src={props.url}
            poster={props.poster || undefined}
            controls
            preload="none"
            className="aspect-video w-full"
          />
        )}
      </div>
    </Container>
  );
}

function Testimonials({ props, width }) {
  const items = props.items || [];
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12 sm:py-16">
      <Heading>{props.heading}</Heading>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <blockquote key={i} className="flex flex-col rounded-[var(--lander-radius)] border border-(--border) bg-(--card) p-6">
            <p className="flex-1 text-sm leading-relaxed text-(--foreground)">“{it.quote}”</p>
            <footer className="mt-4 flex items-center gap-3">
              {it.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.avatar}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                  decoding="async"
                  loading="lazy"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--lander-brand)] text-xs font-black text-white">{(it.author || "?").charAt(0)}</span>
              )}
              <div>
                <div className="text-sm font-bold text-(--foreground)">{it.author}</div>
                {it.role ? <div className="text-xs text-(--muted-foreground)">{it.role}</div> : null}
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </Container>
  );
}

function Faq({ props, width }) {
  const items = props.items || [];
  if (!items.length) return null;
  return (
    <Container width="narrow" className="py-12 sm:py-16">
      <Heading>{props.heading || "Frequently asked questions"}</Heading>
      <div className="divide-y divide-(--border) overflow-hidden rounded-[var(--lander-radius)] border border-(--border) bg-(--card)">
        {items.map((it, i) => (
          <details key={i} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-(--foreground)">
              {it.question}
              <span className="text-(--muted-foreground) transition group-open:rotate-45">+</span>
            </summary>
            {it.answer ? <p className="mt-3 text-sm leading-relaxed text-(--muted-foreground)">{it.answer}</p> : null}
          </details>
        ))}
      </div>
    </Container>
  );
}

function Cta({ props, width }) {
  if (!props.heading && !props.buttonLabel) return null;
  return (
    <Container width={width} className="py-14">
      <div className="rounded-[var(--lander-radius)] border border-(--border) px-6 py-12 text-center"
        style={{ background: "color-mix(in srgb, var(--lander-brand) 8%, transparent)" }}>
        {props.heading ? <h2 className="text-2xl font-black tracking-tight text-(--foreground) sm:text-3xl">{props.heading}</h2> : null}
        {props.description ? <p className="mx-auto mt-3 max-w-xl text-sm text-(--muted-foreground) sm:text-base">{props.description}</p> : null}
        <div className="mt-7 flex justify-center">
          <CtaButton href={props.buttonUrl} variant="primary">{props.buttonLabel}</CtaButton>
        </div>
      </div>
    </Container>
  );
}

function LinkList({ props, width }) {
  const items = (props.items || []).filter((it) => it.title && it.url);
  if (!items.length) return null;
  return (
    <Container width={width} className="py-12">
      <Heading>{props.heading}</Heading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => {
          const external = /^https?:\/\//.test(it.url || "");
          const Cmp = external ? "a" : Link;
          const extra = external ? { href: it.url, target: "_blank", rel: "noopener noreferrer" } : { href: it.url || "#" };
          return (
            <Cmp key={i} {...extra} className="block rounded-[var(--lander-radius)] border border-(--border) bg-(--card) p-5 transition hover:border-[var(--lander-brand)]">
              <h3 className="text-base font-bold text-(--foreground)">{it.title}</h3>
              {it.description ? <p className="mt-1 text-sm text-(--muted-foreground)">{it.description}</p> : null}
            </Cmp>
          );
        })}
      </div>
    </Container>
  );
}

function TextBlock({ props, width }) {
  if (!props.html) return null;
  return (
    <Container width="narrow" className="py-8">
      <div className="prose prose-neutral max-w-none text-(--foreground) dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.html) }} />
    </Container>
  );
}

function ImageBlock({ props, width }) {
  if (!props.url) return null;
  return (
    <Container width={width} className="py-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.url}
        alt={props.alt || ""}
        className="mx-auto rounded-[var(--lander-radius)] border border-(--border)"
        decoding="async"
        loading="lazy"
      />
    </Container>
  );
}

function RawHtml({ props, width }) {
  if (!props.html) return null;
  return (
    <Container width={width} className="py-8">
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.html) }} />
    </Container>
  );
}

function AdSlot({ props }) {
  // Placeholder marker — the Ads module wires real creatives in a later pass.
  if (!props.placement) return null;
  return <div data-lander-ad={props.placement} className="mx-auto my-6 w-full max-w-4xl px-4" />;
}

const SECTIONS = {
  hero: Hero,
  banner: Banner,
  intro: Intro,
  features: Features,
  stats: Stats,
  benefits: Benefits,
  steps: Steps,
  gallery: Gallery,
  video: Video,
  testimonials: Testimonials,
  faq: Faq,
  cta: Cta,
  relatedTools: LinkList,
  blogRecommend: LinkList,
  text: TextBlock,
  image: ImageBlock,
  customHtml: RawHtml,
  embed: RawHtml,
  ads: AdSlot,
};

export default function LanderSections({ sections = [], theme = {} }) {
  const list = (Array.isArray(sections) ? sections : []).filter((s) => s && !s.hidden && SECTIONS[s.type]);
  const width = theme.containerWidth || "normal";

  const style = {
    "--lander-brand": theme.brandColor || "var(--primary)",
    "--lander-accent": theme.accent || "var(--secondary)",
    "--lander-radius": RADII[theme.radius] || RADII.lg,
  };
  const modeClass = theme.mode === "dark" ? "dark" : "";

  return (
    <div className={modeClass} style={style}>
      {list.map((section) => {
        const Cmp = SECTIONS[section.type];
        return <Cmp key={section.id} props={section.props || {}} width={width} />;
      })}
    </div>
  );
}
