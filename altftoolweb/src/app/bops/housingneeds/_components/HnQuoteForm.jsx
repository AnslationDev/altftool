"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Lock,
  Users,
} from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Mini quote-request form for CTA bands: pick a service, leave an email.
 *
 * Client-only for now — validates, then shows the success state. When the
 * leads endpoint exists, POST { email, service, source, ts } inside
 * handleSubmit (same contract as HnEmailCapture).
 *
 * `services` is [{ slug, name }] passed from the server so this client
 * component never imports the registry.
 */
export default function HnQuoteForm({ services = [], source = "hub-cta" }) {
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null); // null | "service" | "email"
  const [done, setDone] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!service) {
      setError("service");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("email");
      return;
    }
    // TODO(leads-endpoint): POST { email, service, source, ts } to /api/leads
    // once the capture backend exists. Client-only success until then.
    void source;
    setDone(true);
  }

  if (done) {
    const picked = services.find((s) => s.slug === service)?.name ?? "your project";
    return (
      <div className="hn-quoteform hn-quoteform--done" role="status">
        <CheckCircle2 size={26} strokeWidth={2.2} aria-hidden="true" />
        <div>
          <p className="hn-quoteform-done-title">Request received!</p>
          <p className="hn-quoteform-done-text">
            We&rsquo;ll email you free, no-obligation {picked.toLowerCase()} quotes
            from licensed pros near you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="hn-quoteform" onSubmit={handleSubmit} noValidate>
      <p className="hn-quoteform-benefit">
        Compare quotes from up to <strong>4 vetted local pros</strong> — free,
        with zero obligation to hire.
      </p>

      <div className="hn-quoteform-row">
        <span className="hn-quoteform-select">
          <label className="hn-sr-only" htmlFor={`hn-qf-service-${source}`}>
            Service
          </label>
          <select
            id={`hn-qf-service-${source}`}
            value={service}
            onChange={(event) => {
              setService(event.target.value);
              if (error === "service") setError(null);
            }}
            aria-invalid={error === "service"}
          >
            <option value="" disabled>
              What does your home need?
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" />
        </span>

        <label className="hn-sr-only" htmlFor={`hn-qf-email-${source}`}>
          Email address
        </label>
        <input
          id={`hn-qf-email-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error === "email") setError(null);
          }}
          aria-invalid={error === "email"}
        />

        <button type="submit" className="hn-btn hn-btn--primary hn-btn--lg">
          Get My Free Quote
          <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p className="hn-quoteform-error" role="alert">
          {error === "service"
            ? "Please choose a service first."
            : "Please enter a valid email address."}
        </p>
      )}

      <ul className="hn-quoteform-trust" aria-label="Your request is safe">
        <li>
          <Lock size={14} strokeWidth={2.3} aria-hidden="true" />
          Secure &amp; private
        </li>
        <li>
          <BadgeCheck size={14} strokeWidth={2.3} aria-hidden="true" />
          Licensed &amp; insured pros
        </li>
        <li>
          <Users size={14} strokeWidth={2.3} aria-hidden="true" />
          14,000+ homeowners served
        </li>
      </ul>
    </form>
  );
}
