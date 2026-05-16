"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Link2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  ACTIONS,
  buildBlogAudit,
  getActionConfig,
  priorityTone,
  toneClasses,
} from "./blogQualityAudit";
import { buildQuickRefreshPayload } from "./blogRefreshKit";

const ACTION_ICONS = {
  seo: Sparkles,
  faq: SearchCheck,
  sources: BookOpenCheck,
  links: Link2,
  review: ShieldCheck,
};

function scoreTone(score = 0) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

function MiniScore({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</span>
        <span className="text-sm font-black text-gray-900">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${scoreTone(value)}`} style={{ width: `${Math.max(4, value)}%` }} />
      </div>
    </div>
  );
}

export default function BlogQuickFixPanel({
  formData = {},
  imageAlt = "",
  hasImage = false,
  requestedAction = "",
  onApplyQuickFix,
}) {
  const audit = useMemo(
    () =>
      buildBlogAudit({
        ...formData,
        image: hasImage ? formData.image || "selected-image" : formData.image,
        imageAlt,
      }),
    [formData, hasImage, imageAlt],
  );
  const preferredAction = getActionConfig(requestedAction || audit.recommendedAction);
  const PreferredIcon = ACTION_ICONS[preferredAction.key] || WandSparkles;

  const applyAction = (actionKey) => {
    const action = getActionConfig(actionKey);
    const payload = buildQuickRefreshPayload(action.key, formData);
    onApplyQuickFix?.(payload, action);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <WandSparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Quick Fix</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">Contextual fixes from the current SEO and schema audit.</p>
          </div>
        </div>
        <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${priorityTone(audit.refreshScore)}`}>
          {audit.refreshScore}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MiniScore label="Quality" value={audit.qualityScore} />
        <MiniScore label="Schema" value={audit.schemaScore} />
      </div>

      <button
        type="button"
        onClick={() => applyAction(preferredAction.key)}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700"
      >
        <PreferredIcon className="h-4 w-4" />
        Apply {preferredAction.label}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => {
          const Icon = ACTION_ICONS[action.key] || Sparkles;
          const active = preferredAction.key === action.key;
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => applyAction(action.key)}
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${toneClasses(action.tone, active)}`}
              title={action.label}
            >
              <Icon className="h-3.5 w-3.5" />
              {action.shortLabel}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Open gaps</p>
        {audit.gaps.length ? (
          audit.gaps.slice(0, 5).map((gap) => (
            <div key={gap.key} className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700">{gap.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-gray-500">{gap.detail}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            No blocking gaps found.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
        <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
        <p className="text-xs leading-5 text-blue-700">Blocks are duplicate-safe, so repeated fixes skip already-added FAQ, source, and refresh sections.</p>
      </div>
    </div>
  );
}
