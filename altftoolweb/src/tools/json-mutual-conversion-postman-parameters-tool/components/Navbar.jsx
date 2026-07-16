import { Braces, DatabaseZap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="pp-glass pp-neon mb-8 flex min-w-0 items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-500">
          <Braces className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-sm font-black">Postman Request Converter Studio</p>
          <p className="break-words text-xs text-(--muted-foreground)">JSON and parameters stay in your browser</p>
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-xs font-bold text-teal-400 sm:flex">
        <DatabaseZap className="h-3.5 w-3.5" />
        Live Parser
      </div>
    </nav>
  );
}
