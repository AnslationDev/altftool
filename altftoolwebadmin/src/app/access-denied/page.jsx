"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function AccessDeniedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleReRequest = async () => {
    try {
      setLoading(true);

      const token = await user.getIdToken(true);

      const res = await fetch("/api/admin/request-access", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "new" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit request");
        return;
      }

      router.replace("/access-requested");
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <div
      className="h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm">
        <div className="card p-8" style={{ boxShadow: "var(--shadow-md)" }}>
          
          {/* ── Status Indicator ── */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#fee2e2", border: "1px solid #fecaca" }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  border: "1.5px solid #dc2626",
                  opacity: 0.35,
                  animationDuration: "2s",
                }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "#dc2626" }}
              />
            </div>
          </div>

          {/* ── Heading ── */}
          <div className="text-center mb-6">
            <h1
              className="text-xl font-semibold tracking-tight mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Access denied
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Your access request was declined by a super admin.
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--muted-soft)" }}>
              You can submit a new request if needed.
            </p>
          </div>

          {/* ── Email pill ── */}
          {user?.email && (
            <div className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs"
                style={{
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--muted-soft)" }}
                />
                {user.email}
              </span>
            </div>
          )}

          {/* ── Info Box ── */}
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            If you believe this was a mistake, you can request access again or contact a super admin.
          </div>

          {/* ── Actions ── */}
          <div className="space-y-3">
            <button
              onClick={handleReRequest}
              disabled={loading}
              className="w-full btn btn-primary py-2.5 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Request Access Again"}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full btn btn-outline flex items-center justify-center gap-2 py-2.5 text-sm"
              style={{ color: "var(--muted)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out and return to login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}