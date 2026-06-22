"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
const links = [
  { to: "/prank-socialmedia", label: "Home" },
  { to: "/templates", label: "Templates" },
  { to: "/prank-socialmedia#features", label: "Features" },
  { to: "/prank-socialmedia#how", label: "How It Works" },
  { to: "/prank-socialmedia#faq", label: "FAQ" }
];
function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 w-full">
    <div className="mx-auto max-w-7xl px-4 pt-4">
      <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 shadow-soft">
        <Link href="/prank-socialmedia" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">Socila Media Prank<span className="gradient-text">.</span></span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => <Link key={l.to} href={l.to} className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            {l.label}
          </Link>)}
        </div>
        <div className="hidden md:block">
          <Button asChild className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
            <Link href="/templates">Start Creating</Link>
          </Button>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 md:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
        {links.map((l) => <Link key={l.to} href={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-secondary">{l.label}</Link>)}
        <Button asChild className="mt-1 rounded-xl bg-gradient-primary text-primary-foreground">
          <Link href="/templates" onClick={() => setOpen(false)}>Start Creating</Link>
        </Button>
      </div>}
    </div>
  </header>;
}
export {
  Navbar
};
