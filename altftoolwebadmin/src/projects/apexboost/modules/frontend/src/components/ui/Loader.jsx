import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

export default function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDone(true), 1400); return () => clearTimeout(t); }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="fixed inset-0 z-[100] grid place-items-center bg-white dark:bg-ink">
          <div className="flex flex-col items-center gap-6">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}><Logo /></motion.div>
            <div className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand via-brand-purple to-brand-cyan" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }} />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">Loading growth…</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
