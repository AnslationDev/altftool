import Link from 'next/link';
import { padRank, rankDelta, groupedNumber, compactNumber } from '../lib/format.js';

/* ── Band ────────────────────────────────────────────────────────────────── */

/**
 * A full-bleed section. The surface change between consecutive bands is the
 * section divider — there are deliberately no borders between them.
 */
export function Band({
  tone = 'canvas',
  size,
  id,
  as: Tag = 'section',
  className = '',
  wrap = 'default',
  children,
  ...rest
}) {
  const toneClass =
    tone === 'canvas' ? '' : ` t49-band--${tone}`;
  const sizeClass = size ? ` t49-band--${size}` : '';
  const wrapClass =
    wrap === 'narrow'
      ? 't49-wrap t49-wrap--narrow'
      : wrap === 'prose'
        ? 't49-wrap t49-wrap--prose'
        : 't49-wrap';

  return (
    <Tag id={id} className={`t49-band${toneClass}${sizeClass} ${className}`.trim()} {...rest}>
      {wrap === 'none' ? children : <div className={wrapClass}>{children}</div>}
    </Tag>
  );
}

/* ── Section head ────────────────────────────────────────────────────────── */

export function SectionHead({ eyebrow, title, lead, action, id }) {
  return (
    <header className="t49-head">
      <div className="t49-head__text">
        {eyebrow ? <p className="t49-eyebrow">{eyebrow}</p> : null}
        {title ? (
          <h2 id={id} className="t49-display">
            {title}
          </h2>
        ) : null}
        {lead ? <p className="t49-lead">{lead}</p> : null}
      </div>
      {action || null}
    </header>
  );
}

/* ── Rank badge ──────────────────────────────────────────────────────────── */

export function RankBadge({ rank, size, glass = false, className = '' }) {
  const medal = rank <= 3 ? ` t49-rank--${rank}` : '';
  return (
    <span
      className={`t49-rank${glass && rank > 3 ? ' t49-rank--glass' : medal}${size === 'lg' ? ' t49-rank--lg' : ''} ${className}`.trim()}
    >
      <span className="t49-sr">Rank </span>
      {padRank(rank)}
    </span>
  );
}

/* ── Score ───────────────────────────────────────────────────────────────── */

export function Score({ value, size, className = '' }) {
  return (
    <span className={`t49-score${size === 'lg' ? ' t49-score--lg' : ''} ${className}`.trim()}>
      <span className="t49-score__value">{Number(value).toFixed(1)}</span>
      <span className="t49-score__max">/100</span>
      <span className="t49-sr"> Top 49 score</span>
    </span>
  );
}

export function Meter({ value, max = 100, label }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / max) * 100));
  return (
    <span
      className="t49-meter"
      role="meter"
      aria-valuenow={Number(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <span className="t49-meter__fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

/* ── Trend ───────────────────────────────────────────────────────────────── */

export function TrendBadge({ rank, previousRank }) {
  const delta = rankDelta(rank, previousRank);
  const tone =
    delta.kind === 'up'
      ? 't49-badge--up'
      : delta.kind === 'down'
        ? 't49-badge--down'
        : delta.kind === 'new'
          ? 't49-badge--soft'
          : 't49-badge--flat';
  const glyph =
    delta.kind === 'up' ? '▲' : delta.kind === 'down' ? '▼' : delta.kind === 'new' ? '★' : '–';
  return (
    <span className={`t49-badge ${tone}`} title={delta.label}>
      <span aria-hidden="true">{glyph}</span>
      {delta.kind === 'new' ? 'New' : delta.kind === 'flat' ? '—' : delta.amount}
      <span className="t49-sr">{delta.label}</span>
    </span>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────────────────────────── */

export function Breadcrumbs({ trail = [] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="t49-crumbs">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.href || crumb.label}>
              {last || !crumb.href ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <>
                  <Link href={crumb.href}>{crumb.label}</Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Stat ────────────────────────────────────────────────────────────────── */

export function Stat({ value, label, compact = false }) {
  const display =
    typeof value === 'number'
      ? compact
        ? compactNumber(value)
        : groupedNumber(value)
      : value;
  return (
    <div className="t49-stat">
      <span className="t49-stat__value">{display}</span>
      <span className="t49-stat__label">{label}</span>
    </div>
  );
}

/* ── States ──────────────────────────────────────────────────────────────── */

export function EmptyState({ icon = '◍', title, body, actions }) {
  return (
    <div className="t49-state">
      <span className="t49-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="t49-display-sm">{title}</h3>
      {body ? <p className="t49-body t49-muted" style={{ maxWidth: '46ch' }}>{body}</p> : null}
      {actions ? <div className="t49-state__actions">{actions}</div> : null}
    </div>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────────── */

export function Faq({ items = [] }) {
  if (!items.length) return null;
  return (
    <div>
      {items.map((faq) => (
        <details key={faq.question} className="t49-details">
          <summary>{faq.question}</summary>
          <div className="t49-details__body">
            <p className="t49-body">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

/* ── Tag row ─────────────────────────────────────────────────────────────── */

export function TagRow({ tags = [], limit = 3 }) {
  if (!tags.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tags.slice(0, limit).map((tag) => (
        <span key={tag} className="t49-badge t49-badge--flat">
          {tag}
        </span>
      ))}
    </div>
  );
}
