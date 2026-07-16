"use client";

import { motion } from 'framer-motion';

export default function ErrorCard({ message, onRetry, type = 'error' }) {
  const config = {
    error: { icon: '⚠️', bg: 'var(--anslation-ds-danger-soft)', border: 'var(--anslation-ds-danger)', text: 'var(--anslation-ds-danger)' },
    warning: { icon: '⚡', bg: 'var(--anslation-ds-warning-soft)', border: 'var(--anslation-ds-warning)', text: 'var(--anslation-ds-warning)' },
    info: { icon: 'ℹ️', bg: 'var(--anslation-ds-info-soft)', border: 'var(--anslation-ds-info)', text: 'var(--anslation-ds-info)' },
  };
  const c = config[type] || config.error;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border p-6 text-center space-y-3"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <span className="text-3xl">{c.icon}</span>
      <p className="text-sm font-medium" style={{ color: c.text }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[var(--primary)] hover:brightness-110 transition-all shadow-md">
          Try Again
        </button>
      )}
    </motion.div>
  );
}
