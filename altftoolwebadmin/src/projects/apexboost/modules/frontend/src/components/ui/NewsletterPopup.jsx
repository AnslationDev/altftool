import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Send } from "lucide-react";
import { toast } from "react-toastify";

const KEY = "ab-newsletter-closed";

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => { const c = window.localStorage.getItem(KEY); if (!c) { const t = setTimeout(() => setOpen(true), 12000); return () => clearTimeout(t); } }, []);
  const close = () => { window.localStorage.setItem(KEY, "true"); setOpen(false); };
  const submit = (e) => { e.preventDefault(); if (!email.trim()) return; toast.success("🎁 Check your inbox — your free growth guide is on its way!"); close(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={close}>
          <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <button onClick={close} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"><X size={18} /></button>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-purple text-white"><Gift size={26} /></div>
            <h3 className="mt-5 text-2xl font-bold">Get our free growth guide</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The exact Digital, Affiliate &amp; Advertising playbook we use to scale brands — delivered free to your inbox.</p>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your best email" className="fld" />
              <button type="submit" className="btn btn-p w-full">Send me the guide <Send size={15} /></button>
            </form>
            <button onClick={close} className="mt-3 w-full text-center text-xs text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200">No thanks, maybe later</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
