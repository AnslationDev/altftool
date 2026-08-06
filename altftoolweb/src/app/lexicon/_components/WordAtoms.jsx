import Link from "next/link";
import { COMMONNESS, POS_BY_KEY, normalizePos } from "@altftool/core/lexicon";

/*
 * The small parts every AltF Lexicon surface is built from.
 *
 * All server components with zero client JS — a browse page renders sixty word
 * cards, and sixty islands of hydration for a coloured chip and five static
 * bars is not a trade worth making.
 */

/* ---------------- Part of speech ---------------- */

export function PosChip({ pos, abbreviated = false, className = "" }) {
  const meta = POS_BY_KEY[normalizePos(pos)];
  if (!meta) return null;

  return (
    <span className={`afl-pos afl-pos--${meta.label} ${className}`}>
      {abbreviated ? meta.abbr : meta.label}
    </span>
  );
}

export function PosChips({ parts = [], abbreviated = false }) {
  if (parts.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {parts.map((pos) => (
        <PosChip key={pos} pos={pos} abbreviated={abbreviated} />
      ))}
    </span>
  );
}

/* ---------------- The syllable line ---------------- */

/**
 * `ser · en · DIP · i · ty`
 *
 * The product's signature device. The stressed syllable is inked, uppercased
 * and raised a hair, which is what makes stress readable at a glance rather
 * than something you decode from a diacritic you half remember.
 */
export function SyllableLine({ parts = [], stress = 0, size = "md" }) {
  if (parts.length === 0) return null;

  const sizes = {
    sm: "text-[0.9375rem]",
    md: "text-lg",
    lg: "text-[clamp(1.125rem,2vw,1.5rem)]",
  };

  return (
    <span className={`afl-syllables ${sizes[size] || sizes.md}`}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="contents">
          {index > 0 ? (
            <span className="afl-syllables__dot" aria-hidden="true">
              ·
            </span>
          ) : null}
          <span
            className={`afl-syllables__part${
              index === stress && parts.length > 1 ? " afl-syllables__part--stress" : ""
            }`}
          >
            {part}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ---------------- Commonness ---------------- */

/**
 * Five segments, filled to the word's band.
 *
 * The label is always rendered alongside, because a meter with no legend asks
 * the reader to infer a scale that only we know.
 */
export function CommonnessMeter({ band = 1, showLabel = true, className = "" }) {
  const meta = COMMONNESS.find((entry) => entry.band === band) || COMMONNESS[0];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="afl-meter"
        style={{ "--afl-meter-ink": `var(--afl-rank-${band})` }}
        role="img"
        aria-label={`Commonness: ${meta.label}, ${band} of 5`}
      >
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={`afl-meter__seg${step <= band ? " afl-meter__seg--on" : ""}`}
          />
        ))}
      </span>
      {showLabel ? (
        <span className="font-mono text-xs text-muted-foreground">{meta.label}</span>
      ) : null}
    </span>
  );
}

/* ---------------- Letter tiles ---------------- */

/**
 * The A–Z grid, as Scrabble-style tiles carrying their own entry counts.
 *
 * The count is what turns navigation into information — you can see the shape
 * of the language in it, and that S is nearly four times the size of X.
 */
export function LetterTiles({ counts = {}, basePath = "/lexicon/browse", active, includeDigits = true }) {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const all = includeDigits && counts["0"] ? [...letters, "0"] : letters;

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2 sm:gap-2.5">
      {all.map((letter) => {
        const count = counts[letter] || 0;
        const isActive = active === letter;
        return (
          <li key={letter}>
            <Link
              href={`${basePath}/${letter}`}
              aria-current={isActive ? "page" : undefined}
              className="afl-tile text-xl sm:text-2xl"
              style={
                isActive
                  ? { boxShadow: "inset 0 0 0 2px var(--primary)", color: "var(--primary)" }
                  : undefined
              }
            >
              {letter === "0" ? "#" : letter}
              {count > 0 ? (
                <span className="afl-tile__count">{count.toLocaleString("en-US")}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Word card ---------------- */

/**
 * One compact row: headword, syllables, parts of speech, first definition.
 *
 * Used on browse, collection and search pages. `row` is a compact index row,
 * not a full entry — full records are 6× the size and none of the extra
 * survives to the screen here.
 */
export function WordCard({ row, showGloss = true }) {
  return (
    <li>
      <Link
        href={`/lexicon/word/${row.s}`}
        className="afl-card group flex h-full flex-col rounded-lg border border-border bg-surface p-4 no-underline"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="afl-headword text-xl text-foreground group-hover:text-primary">
            {row.w}
          </span>
          <PosChips parts={(row.p || "").split("")} abbreviated />
        </span>

        {showGloss && row.g ? (
          <span className="mt-2 line-clamp-3 text-[0.875rem] leading-relaxed text-muted-foreground">
            {row.g}
          </span>
        ) : null}

        <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 font-mono text-[0.6875rem] text-muted-foreground">
          <CommonnessMeter band={row.c} showLabel={false} />
          {row.y ? <span>{row.y} syl</span> : null}
          {row.n > 1 ? <span>{row.n} senses</span> : null}
          {row.ph ? <span className="text-[--afl-phrase]">phrase</span> : null}
        </span>
      </Link>
    </li>
  );
}

export function WordCardGrid({ rows = [], showGloss = true, className = "" }) {
  if (rows.length === 0) return null;
  return (
    <ul
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      style={{ listStyle: "none" }}
    >
      {rows.map((row) => (
        <WordCard key={row.s} row={row} showGloss={showGloss} />
      ))}
    </ul>
  );
}

/* ---------------- Word grid (chips) ---------------- */

/**
 * The dense form, for pattern pages.
 *
 * "Five letter words starting with T" is a scanning task, not a reading task —
 * a wall of definitions actively gets in the way, so these rows carry the word
 * and nothing else.
 */
export function WordChipGrid({ rows = [], className = "" }) {
  if (rows.length === 0) return null;
  return (
    <ul
      className={`grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-1.5 ${className}`}
      style={{ listStyle: "none" }}
    >
      {rows.map((row) => (
        <li key={row.s}>
          <Link
            href={`/lexicon/word/${row.s}`}
            className="flex items-center justify-between gap-2 rounded-sm border border-border bg-surface-soft px-2.5 py-1.5 text-[0.875rem] text-foreground no-underline transition hover:border-border-strong hover:bg-surface hover:text-primary"
          >
            <span className="truncate">{row.w}</span>
            <span
              className="afl-meter shrink-0"
              style={{ "--afl-meter-ink": `var(--afl-rank-${row.c})` }}
              aria-label={`Commonness ${row.c} of 5`}
            >
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={`afl-meter__seg${step <= Math.ceil(row.c * 0.6) ? " afl-meter__seg--on" : ""}`}
                  style={{ width: "0.25rem", height: "0.25rem" }}
                />
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Chips + rails ---------------- */

export function WordChips({ words = [], limit = 24, prefix = "/lexicon/word/" }) {
  const shown = words.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <span className="flex flex-wrap gap-1.5">
      {shown.map((word) => {
        const label = typeof word === "string" ? word : word.label;
        const slug = typeof word === "string" ? slugFor(word) : word.slug;
        return (
          <Link
            key={label}
            href={`${prefix}${slug}`}
            className="rounded-sm border border-border bg-surface-soft px-2 py-0.5 font-mono text-xs text-muted-foreground no-underline transition hover:border-border-strong hover:text-foreground"
          >
            {label}
          </Link>
        );
      })}
    </span>
  );
}

/* Local slugifier for relation names, which arrive as display text ("good
   luck") rather than as slugs. Must match slugifyWord in @altftool/core. */
const slugFor = (value) =>
  String(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ---------------- Page furniture ---------------- */

export function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground"
    >
      {items.map((crumb, index) => (
        <span key={crumb.name} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
          ) : null}
          {crumb.path ? (
            <Link href={crumb.path} className="no-underline hover:text-primary">
              {crumb.name}
            </Link>
          ) : (
            <span className="text-foreground">{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Pagination({ page = 1, total = 0, perPage = 60, basePath, query = "" }) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  if (lastPage <= 1) return null;

  const href = (target) =>
    target === 1 ? `${basePath}${query}` : `${basePath}${query ? `${query}&` : "?"}page=${target}`;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4 border-t border-border py-6"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="text-sm text-primary no-underline hover:underline">
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="font-mono text-xs text-muted-foreground">
        Page {page.toLocaleString("en-US")} of {lastPage.toLocaleString("en-US")}
      </span>
      {page < lastPage ? (
        <Link href={href(page + 1)} className="text-sm text-primary no-underline hover:underline">
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/**
 * The answer-first block.
 *
 * Deliberately the first prose on every page, because it is the chunk search
 * and answer engines lift. One paragraph, states the fact, no throat-clearing.
 */
export function AnswerFirst({ children }) {
  return (
    <div className="afl-answer mt-6 rounded-lg border border-border bg-surface-soft p-5">
      <p className="text-[0.9375rem] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

export function StatStrip({ stats = [] }) {
  if (stats.length === 0) return null;
  return (
    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="font-mono text-xl font-semibold tabular-nums text-foreground">
            {stat.value}
          </dd>
          <dt className="mt-0.5 text-xs text-muted-foreground">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        {eyebrow ? (
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-2 text-[clamp(1.25rem,2.2vw,1.625rem)] font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
