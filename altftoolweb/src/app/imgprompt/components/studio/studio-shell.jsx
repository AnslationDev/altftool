"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight, Home } from "lucide-react";
import { NAV_ITEMS_BY_SLUG } from "../../data/navigation";
import { useAuth } from "../../providers/auth-provider";
import { useRedirectConfig } from "../../store/redirect-config";
import { StudioSidebar } from "./studio-sidebar";
import { Logo } from "../shared/logo";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function StudioShell({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const destinationUrl = useRedirectConfig((s) => s.redirectUrl);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const slug = pathname === "/imgprompt/studio" ? "dashboard" : pathname.split("/")[3];
  const current = NAV_ITEMS_BY_SLUG[slug];

  return (
    <div className="lg:grid lg:grid-cols-[268px_1fr]">
      {/* desktop sidebar */}
      <aside className="hidden border-r border-border lg:block">
        <StudioSidebar />
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
              <StudioSidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-col">
        {/* studio top bar */}
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-foreground hover:bg-foreground/5 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden"><Logo showText={false} /></div>
            <div className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Link href="/imgprompt/studio" className="hover:text-foreground">Studio</Link>
              {current && current.slug !== "dashboard" && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="truncate text-foreground">{current.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/imgprompt"><Home className="h-4 w-4" /> Home</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
                OpenArt <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[10px]">
                {user ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("") : "IX"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
