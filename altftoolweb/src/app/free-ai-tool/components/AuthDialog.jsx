"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Loader2, Lock, X } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";

const COPY = {
  signin: { title: "Welcome back", description: "Sign in to open this free AI tool.", cta: "Sign In" },
  signup: { title: "Create your free account", description: "Sign up to open this free AI tool.", cta: "Create Account" },
};

/** One instance, mounted once — driven entirely by AuthProvider's requireAuth gate. */
export default function AuthDialog() {
  const { authPromptOpen, closeAuthPrompt, resolveAuthPrompt, signIn, signUp, signInWithGoogle, authConfigured } =
    useAuth();
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset the form when the dialog transitions to open — done during render
  // (React's own recommended "adjust state on prop/value change" pattern)
  // rather than in an effect, since this component never unmounts between
  // opens (AuthProvider just flips authPromptOpen).
  const [wasOpen, setWasOpen] = useState(authPromptOpen);
  if (authPromptOpen !== wasOpen) {
    setWasOpen(authPromptOpen);
    if (authPromptOpen) {
      setMode("signup");
      setEmail("");
      setPassword("");
      setError("");
    }
  }

  useEffect(() => {
    if (!authPromptOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeAuthPrompt();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [authPromptOpen, closeAuthPrompt]);

  if (!authPromptOpen || typeof document === "undefined") return null;

  const copy = COPY[mode];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      resolveAuthPrompt();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      resolveAuthPrompt();
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={closeAuthPrompt} />

      <div className="fat-card relative z-10 w-full max-w-sm rounded-3xl p-6 sm:p-7">
        <button
          type="button"
          onClick={closeAuthPrompt}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500">
          <Lock className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-center text-lg font-bold text-slate-900">{copy.title}</h2>
        <p className="mt-1 text-center text-sm text-slate-500">{copy.description}</p>

        {!authConfigured ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-center text-xs text-amber-700">
            Sign-in isn&apos;t configured yet — add <code>NEXT_PUBLIC_FIREBASE_*</code> keys to enable it.
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg py-1.5 text-sm font-semibold transition-colors ${
              mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg py-1.5 text-sm font-semibold transition-colors ${
              mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleSubmitting || submitting || !authConfigured}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {googleSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fat-auth-email" className="mb-1 block text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              id="fat-auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={!authConfigured}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="fat-auth-password" className="mb-1 block text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              id="fat-auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
              disabled={!authConfigured}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none disabled:opacity-50"
            />
          </div>

          {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || googleSubmitting || !authConfigured}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {copy.cta}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          By continuing you agree to our{" "}
          <Link href="/policypages/termsandconditions" className="font-medium text-slate-600 underline underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/policypages/privacy" className="font-medium text-slate-600 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>,
    document.body,
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}
