/**
 * Google Auth & Email Login Modal — Real Firebase Auth
 * Location: src/app/altflinking/components/common/AuthLoginModal.jsx
 */

"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Mail, Lock, LogIn, User, AlertCircle } from "lucide-react";
import { loginWithGoogle, signUpWithEmail, signInWithEmail } from "../../services/firebaseService";

// Human-readable Firebase auth error messages
function parseAuthError(code) {
  const map = {
    "auth/popup-closed-by-user":        "Google sign-in was cancelled. Please try again.",
    "auth/popup-blocked":               "Popup was blocked by your browser. Allow popups for this site.",
    "auth/cancelled-popup-request":     "Another sign-in is in progress. Please wait.",
    "auth/network-request-failed":      "Network error. Check your internet connection.",
    "auth/user-not-found":              "No account found for this email. Please sign up.",
    "auth/wrong-password":              "Incorrect password. Please try again.",
    "auth/invalid-email":               "Invalid email address.",
    "auth/email-already-in-use":        "This email is already registered. Try signing in.",
    "auth/weak-password":               "Password must be at least 6 characters.",
    "auth/too-many-requests":           "Too many failed attempts. Try again later.",
    "auth/invalid-credential":          "Incorrect email or password.",
    "auth/api-key-not-valid":           "Firebase not configured. Add your API keys to .env.local",
    "auth/configuration-not-found":     "Firebase not configured. Add your API keys to .env.local",
  };
  return map[code] || `Authentication error: ${code}`;
}

export default function AuthLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [role,        setRole]        = useState("BUYER");
  const [isLoading,   setIsLoading]   = useState(false);
  const [authMode,    setAuthMode]    = useState("signin"); // "signin" | "signup"
  const [errorMsg,    setErrorMsg]    = useState("");

  if (!isOpen) return null;

  const clearError = () => setErrorMsg("");

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    clearError();
    setIsLoading(true);
    try {
      const session = await loginWithGoogle(role);
      onLoginSuccess(session);
      onClose();
    } catch (err) {
      setErrorMsg(parseAuthError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email Auth (Sign In / Sign Up) ────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      let session;
      if (authMode === "signup") {
        session = await signUpWithEmail(email, password, role);
      } else {
        session = await signInWithEmail(email, password);
      }
      onLoginSuccess(session);
      onClose();
    } catch (err) {
      setErrorMsg(parseAuthError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="altf-drawer-overlay flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              ALTFTool Account Login
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Sign in to manage your backlinks, websites &amp; orders.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">I want to login as:</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-slate-200">
            {[
              { id: "BUYER",     label: "Buyer / Agency" },
              { id: "PUBLISHER", label: "Website Publisher" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                  role === id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <div className="h-[1px] flex-1 bg-slate-100" />
          <span>OR EMAIL LOGIN</span>
          <div className="h-[1px] flex-1 bg-slate-100" />
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex gap-1 p-0.5 bg-white rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => { setAuthMode("signin"); clearError(); }}
            className={`flex-1 py-1.5 rounded-md font-bold transition ${
              authMode === "signin" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("signup"); clearError(); }}
            className={`flex-1 py-1.5 rounded-md font-bold transition ${
              authMode === "signup" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                placeholder="name@agency.com"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="altf-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                placeholder={authMode === "signup" ? "Min. 6 characters" : "••••••••"}
                required
                minLength={authMode === "signup" ? 6 : 1}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                className="altf-input pl-9 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="altf-btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin mx-auto" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>{authMode === "signup" ? "Create Account & Continue" : "Sign In to Dashboard"}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
