// Animal Hub card family — a composable card, not a monolith.
//
// Cards are assembled from parts so every listing (animals, categories,
// related content, future compare entries) reuses the same frame:
//
//   <AhCard>
//     <AhCardMedia><AhImage … /></AhCardMedia>
//     <AhCardBody>
//       <AhBadge tone="brand">Mammals</AhBadge>
//       <AhCardTitle href="/animalhub/mammals/lion">Lion</AhCardTitle>
//       <AhCardText>…</AhCardText>
//       <AhCardMeta>…</AhCardMeta>
//     </AhCardBody>
//   </AhCard>
//
// Accessibility: the whole card is clickable via the title's stretched link
// (its ::after covers the card), so the accessible name stays the title —
// never the full card text. Extra links inside AhCardMeta sit above the
// stretched link and remain independently clickable.

import Link from "next/link";
import clsx from "clsx";

export function AhCard({ as: Tag = "article", className, children, ...rest }) {
  return (
    <Tag className={clsx("ah-card", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function AhCardMedia({ className, children }) {
  return <div className={clsx("ah-card__media", className)}>{children}</div>;
}

export function AhCardBody({ className, children }) {
  return <div className={clsx("ah-card__body", className)}>{children}</div>;
}

/**
 * Card heading. With `href`, the anchor stretches over the whole card,
 * making it the card's single click target.
 */
export function AhCardTitle({ href, as: Tag = "h3", className, children }) {
  return (
    <Tag className={clsx("ah-card__title", className)}>
      {href ? (
        <Link href={href} className="ah-card__link">
          {children}
        </Link>
      ) : (
        children
      )}
    </Tag>
  );
}

/**
 * Supporting copy, clamped to `lines` (default 2) so card heights stay even
 * in a grid without truncating data upstream.
 */
export function AhCardText({ lines, className, children }) {
  return (
    <p
      className={clsx("ah-card__text", className)}
      style={lines ? { "--ah-card-lines": lines } : undefined}
    >
      {children}
    </p>
  );
}

/**
 * Bottom meta row (pinned to the card's baseline): left/right facts, tags or
 * secondary links. Links placed here stay clickable above the stretched
 * title link.
 */
export function AhCardMeta({ className, children }) {
  return <div className={clsx("ah-card__meta", className)}>{children}</div>;
}
