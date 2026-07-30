"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, Mail } from "lucide-react";
import { TOTAL_TOOLS } from "../data/tools";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterCtaSection({ onExplore }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return setError("Enter your email to get weekly picks.");
    if (!EMAIL_PATTERN.test(email)) return setError("Enter a valid email address.");
    setError("");
    // No newsletter delivery backend exists yet — persist locally instead of
    // discarding the signup.
    try {
      window.localStorage.setItem("ALTFT_FREE_AI_TOOL_NEWSLETTER_OPTIN", email.trim());
    } catch {
      // localStorage can be unavailable in private browsing; UI still succeeds.
    }
    setSuccess(true);
  };

  return (
    <section id="newsletter" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="fat-card relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] p-8 text-center sm:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 max-w-3xl rounded-full opacity-40 blur-3xl"
          style={{ backgroundImage: "radial-gradient(closest-side, #c4b5fd, transparent)" }}
        />
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Never miss a free AI tool
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Get the best new free AI tools in your inbox, weekly. No spam, unsubscribe anytime.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
            <div
              className={`flex h-12 flex-1 items-center gap-2 rounded-xl border bg-white px-4 transition-colors ${
                error ? "border-red-400" : success ? "border-emerald-400" : "border-slate-200 focus-within:border-violet-400"
              }`}
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setSuccess(false);
                }}
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              Subscribe
            </button>
          </form>

          <div className="mt-2 min-h-[1.25rem] text-sm">
            {error ? <p className="text-red-500">{error}</p> : null}
            {success ? (
              <p className="flex items-center justify-center gap-1.5 text-emerald-600">
                <CircleCheck className="h-4 w-4" aria-hidden="true" />
                Thanks — you&apos;re on the list.
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
            <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="group mx-auto mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-900"
          >
            Browse all {TOTAL_TOOLS}+ tools now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
