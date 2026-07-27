/**
 * Standardized Loading, Empty, and Error UI States for Marketplace Components
 * Location: src/app/altflinking/components/common/UIStateComponents.jsx
 */

"use client";

import React from "react";
import { Loader2, AlertTriangle, Inbox, RefreshCw } from "lucide-react";

export function LoadingState({ title = "Loading Marketplace Data...", message = "Connecting to backend database..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[300px]">
      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "No Listings Found",
  message = "No approved marketplace listings match your current filters.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="altf-card p-12 text-center space-y-4 flex flex-col items-center justify-center border-dashed border-slate-200">
      <div className="p-4 rounded-full bg-white border border-slate-200 text-slate-500">
        <Inbox className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 max-w-md">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="altf-btn-primary py-2 px-4 text-xs font-bold mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Failed to Load Data",
  error = "A network error occurred while reaching the marketplace server.",
  onRetry,
}) {
  return (
    <div className="altf-card p-8 text-center space-y-4 border border-rose-200 bg-rose-50 max-w-lg mx-auto my-6">
      <div className="p-3 rounded-full bg-rose-100 text-rose-600 w-fit mx-auto border border-rose-200">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-rose-700 font-mono leading-relaxed">{typeof error === "string" ? error : error?.message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="altf-btn-secondary py-2 px-4 text-xs font-bold inline-flex items-center gap-2 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
