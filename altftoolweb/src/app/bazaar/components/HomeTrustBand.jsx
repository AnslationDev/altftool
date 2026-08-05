import Link from "next/link";
import { BadgeCheck, Flag, MessagesSquare, ShieldCheck } from "lucide-react";

import { SectionHead } from "./primitives";
import { T } from "../i18n/T";

/**
 * Trust band.
 *
 * Classifieds live on stranger-to-stranger trust, so the four things a nervous
 * first-time user wants to know are stated on the home page rather than buried
 * in a help centre. Each one is a real link into the safety guide — a trust
 * claim that cannot be checked is worse than no claim.
 *
 * `id` keys the catalogue (`trust.<id>.title` / `trust.<id>.body`); the English
 * strings stay here as source of truth and fallback.
 */
const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    id: "verified",
    title: "Verified sellers",
    body: "Phone and email checks, with the badge shown on the ad and the seller profile.",
    href: "/bazaar/safety#verification",
  },
  {
    icon: MessagesSquare,
    id: "chat",
    title: "Chat in-platform",
    body: "Agree the details in Bazaar chat. Nobody needs your number before you decide to meet.",
    href: "/bazaar/safety#chat",
  },
  {
    icon: ShieldCheck,
    id: "meeting",
    title: "Meet-up safety tips",
    body: "Public place, daylight, inspect before you pay, and never send an advance.",
    href: "/bazaar/safety#meeting",
  },
  {
    icon: Flag,
    id: "report",
    title: "Report an ad",
    body: "One tap on any listing flags it for review — no account or explanation needed.",
    href: "/bazaar/safety#reporting",
  },
];

export default function HomeTrustBand() {
  return (
    <section className="bzr-section" aria-label="Buying and selling safely">
      <div className="section-container">
        <SectionHead
          title={<T id="trust.title" fallback="Safer by default" />}
          href="/bazaar/safety"
          linkLabel={<T id="trust.link" fallback="Read the safety guide" />}
        />

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, id, title, body, href }) => (
            <li key={id}>
              <Link
                href={href}
                className="bzr-panel flex h-full items-start gap-3 no-underline transition-colors hover:border-(--primary)"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-(--bzr-soft) text-(--primary-text)">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-(--foreground)">
                    <T id={`trust.${id}.title`} fallback={title} />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-(--muted-foreground)">
                    <T id={`trust.${id}.body`} fallback={body} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
