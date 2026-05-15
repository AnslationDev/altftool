import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="pp-topbar mb-5 flex min-w-0 flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-(--foreground)">Privacy Policy Generator</p>
          <p className="text-xs text-(--muted-foreground)">GDPR/CCPA-ready policies, generated locally</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="pp-status-pill">Live preview</span>
        <span className="pp-status-pill pp-status-pill-blue">Export ready</span>
      </div>
    </nav>
  );
}
