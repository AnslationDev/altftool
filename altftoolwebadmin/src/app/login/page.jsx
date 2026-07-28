"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import { getFirstAllowedRoute } from "@/lib/permissionUtils";
import { usePathname } from "next/navigation";
import { BrandLogo, Button, Card, Input, Spinner } from "@altftool/ui";

const googleProvider = new GoogleAuthProvider();
// Always show the Google account chooser so the user can pick the right
// account. Without this, the popup silently reuses the browser's single
// signed-in Google session (e.g. vercel@anslation.com) instead of letting the
// user choose their own account.
googleProvider.setCustomParameters({ prompt: "select_account" });

export default function Login() {
  const router = useRouter();
  const {
    user,
    adminData,
    loading,
    isPendingUser,
    isInactive,
    localAdminLoginEnabled,
    signInLocalAdmin,
    syncFailed,
    refreshAuth,
    logout,
  } = useAuth();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState(false);
  // Set when the profile resolves but grants access to nothing. Without it the
  // redirect effect returned early and the page spun on "Opening your admin
  // workspace…" forever, with only a toast to explain why.
  const [noModules, setNoModules] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    document.title = "Sign in · AltFTools Admin";
  }, []);

  /* ── Redirect once auth state is resolved ── */
  useEffect(() => {
    if (loading) return;
    // Fail closed. googleError means /api/admin/google-login explicitly REJECTED
    // this identity, so we must not route it anywhere — not even if a stale
    // /api/admin/me profile is still in state. The "stranded session" case this
    // used to guard against (signOut throwing after a rejection) is handled the
    // right way instead: the latch keeps the form visible, and every
    // user-initiated sign-in entry point below clears it before retrying.
    if (googleError) return;
    if (isPendingUser && pathname !== "/access-requested") {
      router.replace("/access-requested");
      return;
    }
    if (isInactive && pathname !== "/account-inactive") {
      router.replace("/account-inactive");
      return;
    }
    if (!user || !adminData) return;

    const destination = getFirstAllowedRoute(adminData);
    if (!destination) {
      setNoModules(true);
      emitAlert({
        type: "warning",
        message: "No modules assigned. Contact your super admin.",
      });
      return;
    }

    setNoModules(false);
    emitAlert({
      type: "success",
      message: user.isLocalAdmin
        ? "Welcome, Local Super Admin"
        : adminData.roleType === "superadmin"
          ? "Welcome, Super Admin"
          : "Login successful",
    });
    router.replace(destination);
  }, [user, adminData, loading, isPendingUser, isInactive, googleError, pathname, router]);

  /* ── Email / Password login ── */
  const login = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Clear any latched Google failure — otherwise a successful email/password
      // sign-in is stuck behind the `!googleError` guards on the redirect effect
      // and both post-auth render branches, leaving the form up while signed in.
      setGoogleError(false);
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      emitAlert({ type: "error", message: "Invalid email or password" });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Shared: exchange the Google credential for an admin session ── */
  const finishGoogleLogin = async (currentUser) => {
    const token = await currentUser.getIdToken();

    const res = await fetch("/api/admin/google-login", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));

    if (data.status === "inactive") {
      // Deactivated account — keep the session alive so AuthContext's own
      // /api/admin/me sync resolves `isInactive` and the account-inactive
      // screen can explain what happened, instead of signing out with only a
      // toast (and no way to know who to contact) to show for it.
      router.replace("/account-inactive");
      return;
    }

    if (!res.ok) {
      setGoogleError(true);
      emitAlert({
        type: "error",
        message: data.error ?? "Google login failed",
      });
      await auth.signOut();
      return;
    }

    if (data.status === "pending") {
      router.replace("/access-requested");
      return;
    }
    // status === "admin" → AuthContext (onAuthStateChanged) routes to dashboard.
  };

  /* ── Google login (popup). COOP is same-origin-allow-popups, and the provider
        forces an account chooser so the user can pick the correct account. ── */
  const loginWithGoogle = async () => {
    setGoogleLoading(true);
    // Reset the latch so retrying with a different account can succeed; it is
    // re-set by finishGoogleLogin if this attempt is rejected too.
    setGoogleError(false);
    try {
      // signInWithPopup must be the first async call — any await before it
      // (e.g. signOut) drops the user-activation and the popup gets blocked.
      const result = await signInWithPopup(auth, googleProvider);
      await finishGoogleLogin(result.user);
    } catch (err) {
      const code = err?.code;
      // A lingering session can make Firebase treat the popup as a re-link of an
      // already-linked provider; the account is valid, so continue with it.
      if (code === "auth/provider-already-linked" && auth.currentUser) {
        try {
          await finishGoogleLogin(auth.currentUser);
          return;
        } catch {
          /* fall through to the generic handler */
        }
      }
      // User dismissed the popup — not worth surfacing.
      if (
        code !== "auth/popup-closed-by-user" &&
        code !== "auth/cancelled-popup-request"
      ) {
        emitAlert({
          type: "error",
          message: "Google sign-in failed. Please try again.",
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const loginWithLocalAdmin = () => {
    // Same latch reset as the other sign-in entry points: this one also sets
    // `user`, so a stale googleError would strand the session on the form.
    setGoogleError(false);
    const started = signInLocalAdmin?.();
    if (!started) {
      emitAlert({
        type: "error",
        message: "Local admin access is only available on localhost.",
      });
      return;
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setNoModules(false);
    try {
      await refreshAuth();
    } finally {
      setRetrying(false);
    }
  };

  // A signed-in session that cannot resolve a usable admin profile is a
  // terminal state, not a loading one. Always give the user a way out —
  // previously both of these rendered an endless spinner.
  if (user && !googleError && (syncFailed || noModules)) {
    return (
      <main
        className="h-screen flex items-center justify-center px-4"
        style={{ background: "var(--background)" }}
      >
        <Card className="p-8 w-full max-w-md text-center">
          <h1
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            {noModules
              ? "No modules assigned"
              : "We couldn’t load your admin profile"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
            {noModules
              ? "You’re signed in, but no modules are assigned to your account yet. Ask your super admin to grant access."
              : "You’re still signed in, but your permissions couldn’t be fetched. This is usually temporary."}
          </p>
          <div className="flex flex-col gap-2.5">
            {!noModules ? (
              <Button
                type="button"
                onClick={handleRetry}
                loading={retrying}
                disabled={retrying}
                className="w-full"
              >
                {retrying ? "Retrying…" : "Try again"}
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={logout}
              variant="secondary"
              disabled={retrying}
              className="w-full"
            >
              Sign out
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // Show a neutral spinner — never the sign-in form — while the session is
  // resolving OR when an admin is already authenticated. Without this, if the
  // app ever momentarily routes to /login with a valid session (a back-button,
  // a route prefetch, or a transient guard evaluation while navigating between
  // the Super Admin console and a project panel), the full login form + Google
  // button rendered for a frame before the redirect effect fired — which looked
  // like an unexpected "logout + login popup" mid-navigation. `googleError`
  // still lets the form show after a failed Google sign-in (the user is signed
  // out there and needs to retry).
  if (loading || (user && !googleError)) {
    return (
      <main
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
        aria-busy="true"
      >
        <Card
          className="px-5 py-3 flex items-center gap-2.5 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <Spinner size="sm" />
          {loading
            ? "Checking your admin session…"
            : "Opening your admin workspace…"}
        </Card>
      </main>
    );
  }

  const busy = submitting || googleLoading;

  return (
    <main
      className="h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        {/* ── Brand header ── */}
        <div className="text-center mb-8">
          <BrandLogo size="md" className="mb-5" />
          <h1
            className="text-2xl font-semibold tracking-tight mb-1.5"
            style={{ color: "var(--foreground)" }}
          >
            Welcome to AltFTool Admin
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* ── Card ── */}
        <Card className="p-8" style={{ boxShadow: "var(--shadow-md)" }}>
          {/* ── Google (primary) ── */}
          <Button
            type="button"
            onClick={loginWithGoogle}
            disabled={busy}
            loading={googleLoading}
            variant="secondary"
            className="w-full"
          >
            {!googleLoading ? (
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.015 17.64 11.707 17.64 9.2z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
            ) : null}
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </Button>

          {localAdminLoginEnabled ? (
            <Button
              type="button"
              data-testid="local-admin-login"
              onClick={loginWithLocalAdmin}
              disabled={busy}
              variant="secondary"
              className="mt-3 w-full"
            >
              Continue as Local Admin
            </Button>
          ) : null}

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
            <span className="text-xs" style={{ color: "var(--muted-soft)" }}>
              or continue with email
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
          </div>

          {/* ── Email / Password ── */}
          <form onSubmit={login} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={googleLoading}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: "var(--muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="pr-14"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={googleLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1 text-(--muted) hover:text-(--foreground) focus:text-(--foreground) bg-transparent border-0 cursor-pointer transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              loading={submitting}
              className="w-full mt-1"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p
          className="text-center text-xs mt-5"
          style={{ color: "var(--muted-soft)" }}
        >
          Having trouble? Contact your super admin for help.
        </p>
      </div>
    </main>
  );
}
