import { Laptop, Server, CircleSlash } from "lucide-react";
import {
  ACCESS_LEVELS,
  RUNTIMES,
  STATUSES,
} from "@altftool/core/atlas/taxonomy";

const ACCESS_BY_ID = Object.fromEntries(
  ACCESS_LEVELS.map((level) => [level.id, level]),
);
const RUNTIME_BY_ID = Object.fromEntries(
  RUNTIMES.map((runtime) => [runtime.id, runtime]),
);
const STATUS_BY_ID = Object.fromEntries(
  STATUSES.map((status) => [status.id, status]),
);

const ACCESS_INK = {
  open: "var(--afa-open)",
  account: "var(--afa-account)",
  freemium: "var(--afa-freemium)",
};

const ACCESS_SOFT = {
  open: "var(--afa-open-soft)",
  account: "var(--afa-account-soft)",
  freemium: "var(--afa-freemium-soft)",
};

/**
 * The access pill is the most-repeated element in the product, so it carries
 * a `title` rather than visible helper text — the colour plus two words is
 * enough once you have seen the legend on the home page, and the tooltip is
 * there for the first encounter.
 */
export function AccessPill({ access, className = "" }) {
  const level = ACCESS_BY_ID[access];
  if (!level) return null;

  return (
    <span
      className={`afa-pill afa-pill--solid ${className}`}
      style={{
        "--afa-pill-ink": ACCESS_INK[access],
        "--afa-pill-soft": ACCESS_SOFT[access],
      }}
      title={level.blurb}
    >
      <span className="afa-pill__dot" aria-hidden="true" />
      {level.short}
    </span>
  );
}

/**
 * Only rendered for `local`. "Runs on their server" is the unremarkable
 * default, and a badge on every second card would train people to ignore the
 * badge that actually matters.
 */
export function RuntimePill({ runtime, className = "" }) {
  if (runtime !== "local") return null;
  const meta = RUNTIME_BY_ID.local;

  return (
    <span
      className={`afa-pill afa-pill--outline ${className}`}
      style={{ "--afa-pill-ink": "var(--afa-local)" }}
      title={meta.blurb}
    >
      <Laptop className="h-3 w-3" aria-hidden="true" />
      On device
    </span>
  );
}

/** Full runtime statement — used on detail pages where there is room to be explicit. */
export function RuntimeLine({ runtime }) {
  const meta = RUNTIME_BY_ID[runtime];
  if (!meta) return null;
  const Icon = runtime === "local" ? Laptop : Server;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{
        color:
          runtime === "local" ? "var(--afa-local)" : "var(--muted-foreground)",
      }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Only rendered for `retired` — "live" is the default and needs no badge. */
export function StatusPill({ status, className = "" }) {
  if (status !== "retired") return null;
  const meta = STATUS_BY_ID.retired;

  return (
    <span
      className={`afa-pill afa-pill--solid ${className}`}
      style={{
        "--afa-pill-ink": "var(--afa-retired)",
        "--afa-pill-soft": "var(--afa-retired-soft)",
      }}
      title={meta.blurb}
    >
      <CircleSlash className="h-3 w-3" aria-hidden="true" />
      Retired
    </span>
  );
}

export function LegacyPill({ legacy, className = "" }) {
  if (!legacy) return null;

  return (
    <span
      className={`afa-pill afa-pill--outline ${className}`}
      title="Appeared on the classic 2008–2014 'useful websites' lists."
      style={{ "--afa-pill-ink": "var(--muted-foreground)" }}
    >
      Classic
    </span>
  );
}

export { ACCESS_BY_ID, ACCESS_INK, ACCESS_SOFT };
