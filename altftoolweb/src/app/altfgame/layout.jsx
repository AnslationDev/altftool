import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export default function GamesLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/altfgame"
            className="inline-flex items-center gap-2 font-semibold text-[var(--foreground)]"
          >
            <Gamepad2 className="h-5 w-5 text-[var(--primary)]" />
            AltF Games
          </Link>
          <Link
            href="/tools/all"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All tools
          </Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
