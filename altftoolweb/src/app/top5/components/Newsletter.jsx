"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, EASE } from "./motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    try {
      window.localStorage.setItem("top5:newsletter", email.trim());
    } catch {
      /* private mode — the success state still shows */
    }
    setSubscribed(true);
  };

  return (
    <section id="newsletter" className="w-full bg-white py-14 sm:py-20 md:py-24 scroll-mt-20 overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Reveal>
          <p className="text-xs font-semibold tracking-widest text-[#10b981]">
            THE TOP5 BRIEFING
          </p>
          <h2 className="mt-4 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0b1120]">
            Five excellent things, every Sunday.
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[#6b7280] leading-relaxed">
            A concise edit of remarkable people, products, places, and ideas.
            No noise, and no daily inbox clutter.
          </p>
        </Reveal>

        <AnimatePresence mode="wait" initial={false}>
          {subscribed ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-8 sm:mt-10 flex flex-col items-center gap-3 rounded-2xl bg-[#ecfdf5] px-6 py-8"
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10b981] text-white"
              >
                <Check size={22} strokeWidth={3} />
              </motion.span>
              <p className="text-lg font-bold text-[#0b1120]">You&apos;re on the list.</p>
              <p className="text-sm text-[#4b5563]">
                The next briefing lands in <span className="font-semibold">{email}</span> on Sunday.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              onSubmit={onSubmit}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl sm:rounded-full bg-[#f3f4f6] p-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="flex-1 min-w-0 bg-transparent rounded-full px-5 py-3 text-[#0b1120] placeholder:text-[#9ca3af] outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="shrink-0 rounded-full bg-[#0b1120] px-6 py-3 text-sm font-semibold text-white"
              >
                Join free
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
        <p className="mt-4 text-xs text-[#9ca3af]">
          Free forever. Unsubscribe whenever you like.
        </p>
      </div>
    </section>
  );
}
