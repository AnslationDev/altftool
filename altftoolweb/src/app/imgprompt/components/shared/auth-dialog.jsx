"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../../providers/auth-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const COPY = {
  signin: { title: "Welcome back", description: "Sign in to your Imaginnex account.", cta: "Sign In", switchLabel: "Don't have an account?", switchCta: "Sign up" },
  signup: { title: "Create your account", description: "Join Imaginnex to save and generate prompts.", cta: "Create Account", switchLabel: "Already have an account?", switchCta: "Sign in" },
};

export function AuthDialog({ open, onOpenChange, defaultMode = "signin", redirectTo, onSuccess }) {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, authConfigured } = useAuth();
  const [mode, setMode] = React.useState(defaultMode);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [googleSubmitting, setGoogleSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setError("");
      setPassword("");
    }
  }, [open, defaultMode]);

  const copy = COPY[mode];

  const resetFields = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  // Manual dismissal (Escape, backdrop, X button) — no auth happened, so
  // any pending post-auth action (e.g. GlobalAuthDialog's requireAuth
  // callback) must be discarded, not run. onOpenChange(false) is exactly
  // what does that for the global instance (closeAuthPrompt).
  const dismiss = () => {
    resetFields();
    onOpenChange(false);
  };

  // Successful auth — close via onSuccess when provided (GlobalAuthDialog
  // wires this to resolveAuthPrompt, which runs the stashed action THEN
  // closes) rather than onOpenChange(false), which would discard that
  // pending action before it ever ran. Local dialogs (Hero/CtaBand/
  // categories) don't pass onSuccess, so they just close normally.
  const succeed = () => {
    resetFields();
    if (onSuccess) onSuccess();
    else onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(name.trim(), email.trim(), password);
        toast.success("Account created — welcome to Imaginnex!");
      } else {
        await signIn(email.trim(), password);
        toast.success("Signed in successfully");
      }
      succeed();
      if (redirectTo) router.push(redirectTo);
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
      toast.success("Signed in with Google");
      succeed();
      if (redirectTo) router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : dismiss())}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-1 grid h-10 w-10 place-items-center rounded-full bg-brand-gradient">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <DialogTitle className="text-center">{copy.title}</DialogTitle>
          <DialogDescription className="text-center">{copy.description}</DialogDescription>
        </DialogHeader>

        {!authConfigured && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-2.5 text-center text-xs text-amber-500">
            Auth isn&apos;t configured yet — add <code>NEXT_PUBLIC_FIREBASE_*</code> keys to <code>.env.local</code>.
          </p>
        )}

        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-foreground/[0.02] p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${mode === "signin" ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${mode === "signup" ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={googleSubmitting || submitting}>
          {googleSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="ip-name">Name</Label>
              <Input id="ip-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="ip-email">Email</Label>
            <Input id="ip-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ip-password">Password</Label>
            <Input
              id="ip-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting || googleSubmitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {copy.cta}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {copy.switchLabel}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {copy.switchCta}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}
