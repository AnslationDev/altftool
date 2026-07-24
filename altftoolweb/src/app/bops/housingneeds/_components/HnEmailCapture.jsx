"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Email capture for the Housing Needs funnel.
 *
 * Client-only for now: submission validates, then shows the success state.
 * When a real endpoint exists, POST { email, source } inside handleSubmit —
 * the component's states (idle → error → done) already model the round trip.
 *
 * `source` identifies the placement for future attribution (e.g. "hub-benefits",
 * "vertical-roofing"). `compact` renders the single-row variant for CTA bands.
 */
export default function HnEmailCapture({
  source = "housingneeds",
  compact = false,
  heading = "Get the free 12-month home maintenance calendar",
  subtext = "Seasonal checklists, cost guides and exclusive quote offers. No spam — unsubscribe anytime.",
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
    setState("done");
  }

  if (state === "done") {
    return (
      <div className={`hn-email ${compact ? "hn-email--compact" : ""} hn-email--done`}>
        <CheckCircle2 size={22} strokeWidth={2.2} aria-hidden="true" />
        <div>
          <p className="hn-email-done-title">You&rsquo;re on the list!</p>
          <p className="hn-email-done-text">
            Watch your inbox — your maintenance calendar is on its way.
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
          <span className="hn-email-icon" aria-hidden="true">
            <Mail size={20} strokeWidth={2.1} />
          </span>
          <p className="hn-email-heading">{heading}</p>
          <p className="hn-email-subtext">{subtext}</p>
        </>
      )}

      <div className="hn-email-row">
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
          {compact ? "Sign up" : "Send it to me"}
        </button>
      </div>

      {state === "error" && (
        <p className="hn-email-error" id={`hn-email-err-${source}`} role="alert">
          Please enter a valid email address.
        </p>
      )}

      {compact && (
        <p className="hn-email-subtext">{subtext}</p>
      )}
    </form>
  );
}
