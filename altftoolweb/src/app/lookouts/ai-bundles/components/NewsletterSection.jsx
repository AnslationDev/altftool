"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CircleCheck, Mail } from "lucide-react";
import { TOTAL_TOOLS } from "../data/tools";
import Reveal from "./Reveal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const QUICK_LINKS = [
  { href: "#trending", label: "Trending" },
  { href: "#explore", label: "Categories" },
  { href: "#deals", label: "Free Deals" },
  { href: "#collections", label: "Collections" },
  { href: "#community", label: "Community" },
  { href: "#resources", label: "Resources" },
];

/** Section 8 — newsletter capture plus in-page quick navigation. */
export default function NewsletterSection({ onExplore }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return setError("Enter your email to get weekly picks.");
    if (!EMAIL_PATTERN.test(email)) return setError("Enter a valid email address.");
    setError("");
    setSuccess(true);
  };

  return (
    <section id="newsletter" aria-label="Newsletter and quick navigation" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-5xl">
        <div className="aib-card relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-14">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 max-w-3xl rounded-full opacity-40 blur-3xl"
            style={{ backgroundImage: "radial-gradient(closest-side, #c4b5fd, transparent)" }}
            animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Never miss a free AI tool or deal</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Get new free tools, verified offers, and trending picks in your inbox, weekly. No spam, unsubscribe anytime.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <div
                className={`flex h-12 flex-1 items-center gap-2 rounded-xl border bg-white px-4 transition-colors ${
                  error ? "border-red-400" : success ? "border-emerald-400" : "border-slate-200 focus-within:border-teal-400"
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
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="aib-sheen h-12 shrink-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 text-sm font-semibold text-white"
              >
                Subscribe
              </motion.button>
            </form>

            <div className="mt-2 min-h-[1.25rem] text-sm">
              {error ? <p className="text-red-500">{error}</p> : null}
              {success ? (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 text-emerald-600"
                >
                  <CircleCheck className="h-4 w-4" aria-hidden="true" />
                  Thanks — you&apos;re on the list.
                </motion.p>
              ) : null}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">quick navigation</span>
              <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
            </div>

            <nav aria-label="Section quick links" className="mt-5 flex flex-wrap justify-center gap-2">
              {QUICK_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-teal-300 hover:text-teal-600"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.button
              type="button"
              onClick={onExplore}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group mx-auto mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-300 hover:text-slate-900"
            >
              Browse all {TOTAL_TOOLS}+ tools now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
