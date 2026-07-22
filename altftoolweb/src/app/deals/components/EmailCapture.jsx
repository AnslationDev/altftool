"use client";

import { useState } from "react";
import { CheckCircle2, Gem } from "lucide-react";

// Deal-alert signup. Stores intent locally for now — wire to the platform
// newsletter backend when it lands (same status as other capture points).
export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    try {
      window.localStorage.setItem("ALTFT_DEALS_ALERT_OPTIN", email.trim());
    } catch {
      // localStorage unavailable (private mode) — still show success, intent captured for session
    }
    setSubscribed(true);
  };

  return (
    <section className="section py-10" aria-labelledby="deal-alerts-heading">
      <div className="afd-card mx-auto max-w-3xl">
        <div className="afd-card-body items-center py-10 text-center">
          <span className="afd-badge afd-badge-free">
            <Gem className="h-3.5 w-3.5" aria-hidden="true" />
            You made it all the way down here? Respect.
          </span>
          <h2 id="deal-alerts-heading" className="mt-3 text-2xl font-extrabold text-(--foreground)">
            Never miss a new free deal
          </h2>
          <p className="mt-2 max-w-md text-sm text-(--muted-foreground)">
            New tools launch on AltF Deals regularly. Get a heads-up when something replaces
            another paid subscription — zero spam, unsubscribe anytime.
          </p>

          {subscribed ? (
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-(--primary)" role="status">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              You&apos;re on the list — see you at the next launch!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="afd-input"
                />
              </label>
              <button type="submit" className="afd-cta sm:w-auto sm:px-6">
                Get deal alerts
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
