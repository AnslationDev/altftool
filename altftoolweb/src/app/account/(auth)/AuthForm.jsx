"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Field, Input, Spinner } from "@altftool/ui";
import { loadFirebaseAuth, useAuth } from "@/contexts/AuthContext";

const FRIENDLY_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/missing-password": "Please enter your password.",
  "auth/network-request-failed": "Network error — check your connection and try again.",
  "auth/popup-closed-by-user": "Sign-in window was closed before finishing.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/wrong-password": "Incorrect email or password. Please try again.",
};

function friendlyError(error) {
  return (
    FRIENDLY_ERRORS[error?.code] ||
    "Something went wrong. Please try again."
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1-.8 2.6-2.4 3.7l3.8 2.9c2.3-2.1 3.6-5.2 3.6-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24Z" />
      <path fill="#FBBC05" d="M5.2 14.4a7.2 7.2 0 0 1 0-4.7l-4-3a12 12 0 0 0 0 10.7l4-3Z" />
      <path fill="#EA4335" d="M12 4.7c2.2 0 3.7.9 4.6 1.7l3.4-3.3C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.7l3.9 3c1-2.9 3.7-5 6.8-5Z" />
    </svg>
  );
}

/**
 * Shared auth form for login / signup / reset. `mode` picks the flow.
 * Successful auth returns the user to `?next=` (same-origin paths only)
 * or /account.
 */
export function AuthForm({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const nextParam = searchParams.get("next") || "";
  const nextPath =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/account";

  const finishSignIn = () => {
    router.replace(nextPath);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const { auth, api } = await loadFirebaseAuth();

      if (mode === "signup") {
        const credential = await api.createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        const name = displayName.trim();
        if (name) await api.updateProfile(credential.user, { displayName: name });
        finishSignIn();
      } else if (mode === "login") {
        await api.signInWithEmailAndPassword(auth, email.trim(), password);
        finishSignIn();
      } else {
        await api.sendPasswordResetEmail(auth, email.trim());
        setNotice("Password reset email sent — check your inbox.");
      }
    } catch (authError) {
      setError(friendlyError(authError));
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const { auth, api } = await loadFirebaseAuth();
      const provider = new api.GoogleAuthProvider();
      await api.signInWithPopup(auth, provider);
      finishSignIn();
    } catch (authError) {
      if (authError?.code !== "auth/cancelled-popup-request") {
        setError(friendlyError(authError));
      }
    } finally {
      setBusy(false);
    }
  };

  const entranceStyles = (
    <style>{`
      @keyframes auth-card-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      .auth-card-enter { animation: auth-card-enter 0.4s ease-out both; }
      @media (prefers-reduced-motion: reduce) { .auth-card-enter { animation: none; } }
    `}</style>
  );

  // Already signed in? Offer the account page instead of a dead form.
  if (user && mode !== "reset") {
    return (
      <Card className="auth-card-enter mx-auto w-full max-w-md p-6 text-center">
        {entranceStyles}
        <p className="text-sm text-(--muted-foreground)">
          You&apos;re already signed in as{" "}
          <span className="font-semibold text-(--foreground)">
            {user.displayName || user.email}
          </span>
          .
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={() => router.push("/account")}>Go to account</Button>
        </div>
      </Card>
    );
  }

  const titles = {
    login: "Welcome back",
    signup: "Create your account",
    reset: "Reset your password",
  };
  const subtitles = {
    login: "Sign in to sync your favorite tools and preferences.",
    signup: "Join AltFTool — save favorites and pick up where you left off.",
    reset: "Enter your account email and we'll send a reset link.",
  };

  return (
    <Card className="auth-card-enter mx-auto w-full max-w-md p-6 sm:p-8">
      {entranceStyles}
      <h1 className="text-2xl font-bold text-(--foreground)">{titles[mode]}</h1>
      <p className="mt-1 text-sm text-(--muted-foreground)">{subtitles[mode]}</p>

      {mode !== "reset" ? (
        <>
          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full gap-2"
            onClick={signInWithGoogle}
            disabled={busy}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-(--border)" />
            <span className="text-xs font-medium uppercase tracking-wide text-(--muted-foreground)">
              or
            </span>
            <span className="h-px flex-1 bg-(--border)" />
          </div>
        </>
      ) : (
        <div className="mt-4" />
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === "signup" ? (
          <Field label="Name">
            <Input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
            />
          </Field>
        ) : null}

        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        {mode !== "reset" ? (
          <Field label="Password">
            <Input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm font-medium text-[var(--anslation-ds-danger)]">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="text-sm font-medium text-[var(--anslation-ds-success)]">
            {notice}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Spinner size="sm" className="mr-2" /> : null}
          {mode === "login" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "reset" && "Send reset link"}
        </Button>
      </form>

      <div className="mt-5 space-y-1 text-center text-sm text-(--muted-foreground)">
        {mode === "login" ? (
          <>
            <p>
              <Link href="/account/forgot-password" className="rounded-sm font-medium text-primary transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35">
                Forgot password?
              </Link>
            </p>
            <p>
              New here?{" "}
              <Link href="/account/signup" className="rounded-sm font-medium text-primary transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35">
                Create an account
              </Link>
            </p>
          </>
        ) : null}
        {mode === "signup" ? (
          <p>
            Already have an account?{" "}
            <Link href="/account/login" className="rounded-sm font-medium text-primary transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35">
              Sign in
            </Link>
          </p>
        ) : null}
        {mode === "reset" ? (
          <p>
            Remembered it?{" "}
            <Link href="/account/login" className="rounded-sm font-medium text-primary transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35">
              Back to sign in
            </Link>
          </p>
        ) : null}
      </div>
    </Card>
  );
}
