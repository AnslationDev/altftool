"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/shared/ui/AlertProvider";

function initialsOf(user) {
  const source = user.displayName || user.email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Compact header account entry: icon-only sign-in link when signed out,
 * avatar dropdown (Account / Sign out) when signed in.
 */
export function AccountMenu() {
  const { user, loading, signOutUser } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/account/login"
        aria-label="Sign in"
        aria-busy={loading || undefined}
        title="Sign in"
        className="inline-flex h-[var(--anslation-ds-control-md)] w-[var(--anslation-ds-control-md)] shrink-0 items-center justify-center rounded-md border border-border bg-(--card) text-(--foreground) transition hover:bg-(--muted) active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none"
      >
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[var(--anslation-ds-control-md)] w-[var(--anslation-ds-control-md)] items-center justify-center rounded-full border border-border bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none"
      >
        {initialsOf(user)}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-[80] w-56 origin-top-right animate-[altft-menu-in_150ms_ease-out] overflow-hidden rounded-lg border border-border bg-(--card) shadow-lg motion-reduce:animate-none"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-(--foreground)">
              {user.displayName || "Account"}
            </p>
            <p className="truncate text-xs text-(--muted-foreground)">{user.email}</p>
          </div>
          <Link
            role="menuitem"
            href="/account"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
          >
            <UserRound className="h-4 w-4 text-(--muted-foreground)" aria-hidden="true" />
            My account
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              setOpen(false);
              try {
                await signOutUser();
                router.push("/");
              } catch (err) {
                console.error(err);
                showAlert("Sign out failed. Please try again.", "error");
              }
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-(--foreground) transition hover:bg-(--muted)"
          >
            <LogOut className="h-4 w-4 text-(--muted-foreground)" aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default AccountMenu;
