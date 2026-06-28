"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
  ImageIcon,
  Link2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Tags,
  WandSparkles,
} from "lucide-react";
import { evaluateBlogContent } from "@altftool/core/blogContentHealth";
import { emitAlert } from "@/lib/alertBus";
import { parseBlogTags } from "./BlogSeoChecklist";
import { parseSourcesText } from "./BlogSourceEditor";
import { buildQuickRefreshPayload } from "./blogRefreshKit";

const ISSUE_ICONS = {
  slug: Link2,
  heading: FileText,
  body: FileText,
  seoDescription: SearchCheck,
  image: ImageIcon,
  taxonomy: Tags,
  trust: ShieldCheck,
  freshness: RefreshCw,
  sources: BookOpenCheck,
  faq: HelpCircle,
  links: Link2,
};

const ISSUE_ACTIONS = {
  body: "seo",
  seoDescription: "seo",
  taxonomy: "seo",
  trust: "review",
  freshness: "review",
  sources: "sources",
  faq: "faq",
  links: "links",
};

const ISSUE_HINTS = {
  slug: "Slug is generated from the heading when the post is saved.",
  heading: "Write a descriptive heading before running the rest of the checks.",
  body: "Add useful depth, a conclusion, and practical next steps.",
  seoDescription: "Fill a clean 120-160 character search summary.",
  image: "Upload a featured image and write short alt text.",
  taxonomy: "Choose a category and add at least two useful tags.",
  trust: "Add author role, reviewer, or an editorial note.",
  freshness: "Mark the post reviewed with today's date.",
  sources: "Add one cited source and a short source note.",
  faq: "Insert a schema-ready FAQ block.",
  links: "Add contextual AltFTool tool or blog links.",
};

const ACTION_LABELS = {
  seo: "Apply SEO pack",
  review: "Fill review fields",
  sources: "Prepare sources",
  faq: "Insert FAQ",
  links: "Add link block",
};

function scoreTone(score = 0) {
  if (score >= 86) return "border-success bg-success-soft text-success";
  if (score >= 72) return "border-warning bg-warning-soft text-warning";
  return "border-danger bg-danger-soft text-danger";
}

function normalizeBlogForHealth({ formData = {}, hasImage = false, imageAlt = "" } = {}) {
  const sources = parseSourcesText(formData.sourcesText || formData.sources || "");
  return {
    ...formData,
    heading: formData.heading || formData.title || "",
    title: formData.heading || formData.title || "",
    description: formData.description || formData.content || formData.body || "",
    image: hasImage ? formData.image || "selected-image" : formData.image || "",
    imageAlt: imageAlt || formData.imageAlt || "",
    sources,
    tags: parseBlogTags(formData.tags || ""),
  };
}

function HealthRow({ check, onApplyAction, onJumpToIssue }) {
  const Icon = ISSUE_ICONS[check.key] || AlertTriangle;
  const actionKey = ISSUE_ACTIONS[check.key];

  return (
    <div className="rounded-xl border border-border bg-surface-soft px-3 py-3">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            check.done ? "bg-success-soft text-success" : check.severity === "critical" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"
          }`}
        >
          {check.done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-black text-foreground">{check.label}</p>
            {!check.done ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onJumpToIssue?.(check.key)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[11px] font-bold text-muted transition hover:bg-surface-soft"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Jump
                </button>
                {actionKey ? (
                  <button
                    type="button"
                    onClick={() => onApplyAction(actionKey)}
                    className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-primary bg-surface px-2.5 text-[11px] font-bold text-primary transition hover:bg-primary-soft"
                  >
                    <WandSparkles className="h-3.5 w-3.5" />
                    {ACTION_LABELS[actionKey]}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">{check.detail}</p>
          {!check.done ? <p className="mt-1 text-[11px] leading-4 text-muted">{ISSUE_HINTS[check.key]}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function BlogEditorHealthPanel({
  formData = {},
  hasImage = false,
  imageAlt = "",
  onApplyQuickFix,
  onJumpToIssue,
}) {
  const snapshot = useMemo(
    () => evaluateBlogContent(normalizeBlogForHealth({ formData, hasImage, imageAlt })),
    [formData, hasImage, imageAlt],
  );

  const missingChecks = snapshot.checks.filter((check) => !check.done);
  const visibleChecks = missingChecks.length ? missingChecks : snapshot.checks.slice(0, 4);
  const topAction = missingChecks.map((check) => ISSUE_ACTIONS[check.key]).find(Boolean);

  const applyAction = (actionKey) => {
    const payload = buildQuickRefreshPayload(actionKey, formData);
    if (!payload.hasWork) {
      emitAlert({ type: "info", message: "This content-health action has no changes to apply." });
      return;
    }
    onApplyQuickFix?.(payload, { key: actionKey, label: ACTION_LABELS[actionKey] || payload.label });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-muted">Content Health</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">
            Field-level gaps for schema, SEO, trust, sources, FAQ, and internal links.
          </p>
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${scoreTone(snapshot.score)}`}>
          {snapshot.score}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-soft px-2 py-2">
          <p className="text-sm font-black text-foreground">{snapshot.words}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Words</p>
        </div>
        <div className="rounded-xl bg-surface-soft px-2 py-2">
          <p className="text-sm font-black text-foreground">{snapshot.sourceCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Sources</p>
        </div>
        <div className="rounded-xl bg-surface-soft px-2 py-2">
          <p className="text-sm font-black text-foreground">{missingChecks.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Gaps</p>
        </div>
      </div>

      {topAction ? (
        <button
          type="button"
          onClick={() => applyAction(topAction)}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary"
        >
          <WandSparkles className="h-4 w-4" />
          {ACTION_LABELS[topAction]}
        </button>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-3 text-sm font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" />
          Content health looks ready.
        </div>
      )}

      <div className="mt-4 space-y-2">
        {visibleChecks.slice(0, 6).map((check) => (
          <HealthRow key={check.key} check={check} onApplyAction={applyAction} onJumpToIssue={onJumpToIssue} />
        ))}
      </div>
    </div>
  );
}
