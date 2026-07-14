import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "ab-cookie-accepted";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => { const a = window.localStorage.getItem(KEY); if (!a) { const t = setTimeout(() => setShow(true), 1500); return () => clearTimeout(t); } }, []);
  const accept = () => { window.localStorage.setItem(KEY, "true"); setShow(false); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-2xl sm:left-1/2 sm:-translate-x-1/2">
          <div className="glass flex flex-col items-center gap-4 rounded-2xl p-5 shadow-2xl sm:flex-row">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Cookie size={22} /></div>
            <p className="flex-1 text-center text-sm text-slate-600 dark:text-slate-300 sm:text-left">We use cookies to personalize content, analyze our marketing campaigns and improve your experience.</p>
            <button onClick={accept} className="btn btn-p shrink-0">Accept</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
