import { cn } from "@altftool/ui";

/**
 * The standard admin surface: a titled panel holding a chunk of a screen.
 *
 * Replaces ~20 hand-rolled `rounded-xl ring-1 …` / `rounded-2xl border …`
 * shells that had drifted apart on radius, border vs ring, and padding.
 * Radius is 12px (rounded-xl) per master.md's card scale.
 *
 * @param {string}    [title]       Section heading.
 * @param {import("react").ElementType} [icon] Lucide icon rendered beside the
 *   title, matching PageHeader's icon slot — several screens carried a local
 *   36px icon chip beside their heading before this existed.
 * @param {string}    [description] Supporting line under the heading.
 * @param {ReactNode} [actions]     Controls pinned to the right of the heading.
 * @param {ReactNode} [footer]      Optional footer strip, separated by a rule.
 * @param {boolean}   [flush]       Drop the body padding (for tables that own their own).
 * @param {"h2"|"h3"} [headingLevel] Defaults to h2. Set "h3" when nesting a
 *   SectionCard inside another SectionCard's body — two h2s in a row flattens
 *   the document outline that an h2 > h3 nesting would otherwise give you.
 */
export function SectionCard({
  title,
  icon: Icon,
  description,
  actions,
  footer,
  flush = false,
  headingLevel = "h2",
  className,
  bodyClassName,
  children,
  ...props
}) {
  const hasHeading = Boolean(title || description || actions);
  const Heading = headingLevel;

  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm",
        className,
      )}
      {...props}
    >
      {hasHeading ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="flex min-w-0 items-start gap-2.5">
            {Icon ? (
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
                aria-hidden="true"
              />
            ) : null}
            <div className="min-w-0">
              {title ? (
                <Heading className="text-sm font-semibold text-[var(--foreground)]">
                  {title}
                </Heading>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}

      <div className={cn(!flush && "p-5", bodyClassName)}>{children}</div>

      {footer ? (
        <div className="border-t border-[var(--border)] px-5 py-3">{footer}</div>
      ) : null}
    </section>
  );
}

export default SectionCard;
