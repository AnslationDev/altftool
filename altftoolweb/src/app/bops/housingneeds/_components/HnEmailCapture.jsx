"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2, Lock, Mail, ShieldCheck, Zap } from "lucide-react";
import { markSubscribed } from "../_lib/leadState";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DEFAULT_PERKS = [
  "Free quotes from licensed, insured pros near you",
  "Real cost ranges — so you never overpay a contractor",
  "First dibs on limited-time local-pro deals & offers",
];

// Small reassurance chips shown under the field, at the point of action.
const TRUST_BADGES = [
  { Icon: ShieldCheck, label: "Secure & encrypted" },
  { Icon: BadgeCheck, label: "No spam, ever" },
];

/**
 * Email capture for the Housing Needs funnel — built to convert.
 *
 * Leads with the reward (a free maintenance-calendar PDF), stacks the
 * concrete perks, then reassures on privacy — so the reader feels a clear
 * benefit and a safe ask before typing their email.
 *
 * Client-only for now: submission validates, then shows the success state.
 * When a real endpoint exists, POST { email, source } inside handleSubmit —
 * the idle → error → done states already model the round trip.
 *
 * `compact` renders the lean single-row variant for CTA bands.
 */
export default function HnEmailCapture({
  source = "housingneeds",
  compact = false,
  heading = "Free quotes + your home savings kit — today",
  subtext = "Enter your email to unlock free quotes from vetted local pros, our 12-month maintenance calendar, and exclusive limited-time offers.",
  perks = DEFAULT_PERKS,
  onDone,
  // Whether a successful submit broadcasts the subscribe event to the rest of
  // the page. The mid-page band passes announce={false} so firing it doesn't
  // yank away its own success message.
  announce = true,
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | error | done

  function handleSubmit(event) {
    event.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setState("error");
      return;
    }
    // TODO(leads-endpoint): POST { email, source, ts } to /api/leads once the
    // capture backend exists. Client-only success until then.
    void source;
    markSubscribed(announce);
    setState("done");
    onDone?.(email);
  }

  if (state === "done") {
    return (
      <div className={`hn-email ${compact ? "hn-email--compact" : ""} hn-email--done`}>
        <CheckCircle2 size={26} strokeWidth={2.2} aria-hidden="true" />
        <div>
          <p className="hn-email-done-title">Saved on this device</p>
          <p className="hn-email-done-text">
            We&rsquo;ve saved your email locally so this offer won&rsquo;t show
            again here — no email or maintenance calendar has actually been
            sent, since that isn&rsquo;t connected yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      className={`hn-email ${compact ? "hn-email--compact" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {!compact && (
        <>
          <span className="hn-email-tag">
            <Zap size={13} strokeWidth={2.4} aria-hidden="true" />
            Limited-time &middot; 100% free
          </span>
          <p className="hn-email-heading">{heading}</p>
          <p className="hn-email-subtext">{subtext}</p>

          {perks.length > 0 && (
            <ul className="hn-email-perks">
              {perks.map((perk) => (
                <li key={perk}>
                  <CheckCircle2 size={15} strokeWidth={2.4} aria-hidden="true" />
                  {perk}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="hn-email-row">
        <span className="hn-email-field" aria-hidden="true">
          <Mail size={16} strokeWidth={2.1} />
        </span>
        <label className="hn-sr-only" htmlFor={`hn-email-${source}`}>
          Email address
        </label>
        <input
          id={`hn-email-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? `hn-email-err-${source}` : undefined}
        />
        <button type="submit" className="hn-btn hn-btn--primary">
          {compact ? "Get it free" : "Get Instant Access"}
        </button>
      </div>

      {state === "error" && (
        <p className="hn-email-error" id={`hn-email-err-${source}`} role="alert">
          Please enter a valid email address.
        </p>
      )}

      <ul className="hn-email-badges" aria-label="Our guarantees">
        {TRUST_BADGES.map(({ Icon, label }) => (
          <li key={label}>
            <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      <p className="hn-email-trust">
        <Lock size={13} strokeWidth={2.4} aria-hidden="true" />
        We never sell your email. Unsubscribe in one click.
      </p>

    </form>
  );
}
