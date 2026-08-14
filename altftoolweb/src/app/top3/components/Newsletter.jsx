"use client";

import { motion } from "framer-motion";
import { Container, Reveal, Kicker } from "./ui";

export function Newsletter() {
  return (
    <section id="newsletter" className="relative overflow-hidden py-24 md:py-32">
      <Container>
        <div className="relative grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Left — editorial statement */}
          <div className="md:col-span-6">
            <Reveal>
              <Kicker>The Top3 Letter · Every Sunday, 08:00</Kicker>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display mt-5 text-[clamp(36px,5vw,68px)] font-light leading-[1.02] tracking-[-0.02em]">
                One email a week.
                <br />
                <em className="italic">Three things worth your time.</em>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-ink-soft">
                New rankings, a single product recommendation, and one editorial note
                from the team. No tracking pixels. No sponsored blurbs. Unsubscribe in
                one click.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 flex items-center gap-6 text-[11px] font-mono uppercase tracking-[0.16em] text-ink-mute">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  38,412 subscribers
                </div>
                <div>62% open rate</div>
              </div>
            </Reveal>
          </div>

          {/* Right — form */}
          <div className="md:col-span-6 md:pl-10 md:border-l md:border-ink/15">
            <Reveal delay={1}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
              >
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">Your email</span>
                  <input
                    type="email"
                    required
                    placeholder="reader@example.com"
                    className="mt-2 w-full border-b border-ink/30 bg-transparent py-3 text-lg placeholder:text-ink-mute/60 focus:border-ink focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">Your name (optional)</span>
                  <input
                    type="text"
                    placeholder="First name"
                    className="mt-2 w-full border-b border-ink/30 bg-transparent py-3 text-lg placeholder:text-ink-mute/60 focus:border-ink focus:outline-none"
                  />
                </label>

                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">Categories of interest</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Technology", "Travel", "Home", "Finance", "Food"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="rounded-full border border-ink/20 px-3 py-1 text-[12px] transition hover:border-ink hover:bg-ink hover:text-paper"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="group mt-4 inline-flex w-full items-center justify-between rounded-full bg-ink px-6 py-4 text-[14px] font-medium text-paper transition-colors hover:bg-accent sm:w-auto"
                >
                  Subscribe to the letter
                  <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-paper text-ink">→</span>
                </motion.button>

                <p className="text-[11px] text-ink-mute">
                  By subscribing you agree to receive one email per week. No third parties, ever.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* Big decorative digit behind */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none hidden md:block">
        <div className="display text-[40vw] font-light italic leading-none text-ink/[0.04]">
          3
        </div>
      </div>
    </section>
  );
}
