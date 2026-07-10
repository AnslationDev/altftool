"use client";

import { AlertTriangle, ImageOff, X } from "lucide-react";
import { UploadArt, SuccessArt } from "../illustrations/Spots";
import { motion, useReducedMotion } from "../../lib/motion";

export function Spinner({ label, sublabel }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="relative">
        <div className="ali-spinner" />
      </div>
      {label && <p className="text-sm font-semibold">{label}</p>}
      {sublabel && <p className="text-xs" style={{ color: "var(--ali-muted)" }}>{sublabel}</p>}
    </div>
  );
}

export function EmptyState({ illustration = true, icon: Icon = ImageOff, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-12 text-center px-6"
      style={{ borderColor: "var(--ali-border-strong)" }}>
      {illustration ? <UploadArt size={108} /> : <div className="ali-tool-icon" style={{ "--ali-accent": "var(--primary, #14B8A6)" }}><Icon size={24} /></div>}
      <p className="mt-1 font-semibold">{title || "Nothing here yet"}</p>
      {subtitle && <p className="max-w-sm text-sm" style={{ color: "var(--ali-muted)" }}>{subtitle}</p>}
    </div>
  );
}

export function SuccessState({ title = "All done!", subtitle, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3 py-8 text-center"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SuccessArt size={96} />
      <p className="text-lg font-bold">{title}</p>
      {subtitle && <p className="max-w-sm text-sm" style={{ color: "var(--ali-muted)" }}>{subtitle}</p>}
      {children}
    </motion.div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  const reduce = useReducedMotion();
  if (!message) return null;
  return (
    <motion.div
      className="flex items-start gap-3 rounded-xl p-3.5 text-sm"
      style={{
        background: "var(--anslation-ds-danger-soft, #fde2dd)",
        color: "var(--anslation-ds-danger, #c93d2e)",
        border: "1px solid color-mix(in srgb, var(--anslation-ds-danger, #c93d2e) 30%, transparent)",
      }}
      role="alert"
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100"><X size={16} /></button>
      )}
    </motion.div>
  );
}

export function ProgressBar({ value = 0, label }) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex justify-between text-xs font-medium" style={{ color: "var(--ali-muted)" }}>
          <span>{label}</span>
          <span className="tabular-nums" style={{ color: "var(--ali-blue)" }}>{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--ali-soft)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--ali-grad)" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
