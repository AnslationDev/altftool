import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Zap } from "lucide-react";

export default function Header({ total, strength }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-5 text-(--foreground) shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />
      <div className="flex min-w-0 flex-col items-center gap-5 text-center">
        <div className="min-w-0 max-w-4xl overflow-hidden">
          <div className="mb-3 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-(--border) bg-(--background) px-3 py-1 text-xs font-bold text-(--muted-foreground)">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="min-w-0 truncate">Browser crypto randomness</span>
          </div>
          <h1 className="heading text-gradient-hero mx-auto break-words">Generate Random String</h1>
          <p className="description mx-auto mt-2 max-w-3xl">A secure random string studio for live previews, batch output, patterns, QR codes, history, copy, and exports.</p>
        </div>
        <div className="grid w-full max-w-2xl min-w-0 grid-cols-1 gap-2 text-left text-sm sm:grid-cols-3">
          <Stat icon={KeyRound} label="Strings" value={total} />
          <Stat icon={Zap} label="Strength" value={strength} />
          <Stat icon={ShieldCheck} label="Engine" value="Crypto" />
        </div>
      </div>
    </motion.header>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-(--border) bg-(--background) px-3 py-2">
      <div className="flex min-w-0 items-center gap-2 text-(--muted-foreground)">
        <Icon className="h-4 w-4 shrink-0 text-cyan-500" />
        <span className="min-w-0 truncate text-xs font-semibold">{label}</span>
      </div>
      <div className="mt-1 truncate text-lg font-black text-(--foreground)">{value}</div>
    </div>
  );
}
