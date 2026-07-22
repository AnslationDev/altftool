"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Spinner } from "@altftool/ui";
import { LogOut, Heart, Wrench, Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const QUICK_LINKS = [
  { href: "/tools/all", label: "Browse tools", icon: Wrench },
  { href: "/games", label: "Play games", icon: Gamepad2 },
  { href: "/tools/all?view=favorites", label: "Saved tools", icon: Heart },
];

function initialsOf(user) {
  const source = user.displayName || user.email || "?";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function AccountClient() {
  const router = useRouter();
  const { user, loading, signOutUser } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account/login?next=/account");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace("/");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary"
          >
            {initialsOf(user)}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-(--foreground)">
              {user.displayName || "Your account"}
            </h1>
            <p className="truncate text-sm text-(--muted-foreground)">{user.email}</p>
          </div>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? <Spinner size="sm" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
            Sign out
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-(--foreground)">Quick links</h2>
        <p className="mt-1 text-sm text-(--muted-foreground)">
          Favorites and recent tools are saved on this device and stay available
          while you&apos;re signed in.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border border-border bg-(--card) p-4 text-sm font-medium text-(--foreground) transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
