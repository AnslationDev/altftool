import { Code2 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="pp-glass pp-neon mb-8 flex items-center justify-between rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-500">
          <Code2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-black">Jump Code Generator</p>
          <p className="text-xs text-(--muted-foreground)">Navigation snippets, generated locally</p>
        </div>
      </div>
      <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-xs font-bold text-teal-400">
        Live preview
      </span>
    </nav>
  );
}
