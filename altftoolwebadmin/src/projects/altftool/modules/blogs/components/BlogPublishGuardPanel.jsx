"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Image,
  Link2,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function addUniqueIssue(list, issue) {
  if (!issue?.key || list.some((item) => item.key === issue.key)) return;
  list.push(issue);
}

function getQualityCheck(blog = {}, label = "") {
  return (blog.qualityChecks || []).find((check) => cleanText(check.label).toLowerCase() === label.toLowerCase());
}

function getIssueKey(label = "") {
  return cleanText(label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildGuardRow(blog = {}, linkNode = null) {
  const blockers = [];
  const warnings = [];
  const schemaHealth = blog.schemaHealth || {};
  const flags = schemaHealth.flags || {};
  const brokenLinks = linkNode?.audit?.brokenLinks || [];
  const linkWarnings = (linkNode?.audit?.warnings || []).filter((issue) =>
    ["weak-anchor", "self-link", "redirect"].includes(issue.type),
  );
  const titleLength = cleanText(blog.title || blog.heading).length;
  const slugLength = cleanText(blog.slug).length;
  const searchTitle = getQualityCheck(blog, "Search title");
  const metaDescription = getQualityCheck(blog, "Meta description");

  if (titleLength < 8) {
    addUniqueIssue(blockers, {
      action: "seo",
      detail: titleLength ? `${titleLength} characters` : "Missing title",
      key: "title",
      label: "Title",
    });
  }

  if (slugLength < 3 || slugLength > 90) {
    addUniqueIssue(blockers, {
      action: "seo",
      detail: slugLength ? `${slugLength} characters` : "Missing slug",
      key: "slug",
      label: "Canonical slug",
    });
  }

  if (searchTitle && !searchTitle.done) {
    addUniqueIssue(blockers, {
      action: "seo",
      detail: searchTitle.detail,
      key: "search-title",
      label: "Search title",
    });
  }

  if (metaDescription && !metaDescription.done) {
    addUniqueIssue(blockers, {
      action: "seo",
      detail: metaDescription.detail,
      key: "meta-description",
      label: "Meta description",
    });
  }

  (schemaHealth.issues || [])
    .filter((issue) => issue.required)
    .forEach((issue) => {
      addUniqueIssue(blockers, {
        action: issue.key === "image" ? "review" : issue.key === "author" ? "sources" : "seo",
        detail: issue.detail,
        key: getIssueKey(issue.key || issue.label),
        label: issue.label,
      });
    });

  if (brokenLinks.length > 0) {
    addUniqueIssue(blockers, {
      action: "links",
      detail: `${brokenLinks.length} broken link${brokenLinks.length === 1 ? "" : "s"}`,
      key: "broken-links",
      label: "Broken links",
    });
  }

  if (blog.status !== "published") {
    addUniqueIssue(warnings, {
      action: "review",
      detail: "Draft status",
      key: "draft-status",
      label: "Status",
    });
  }

  if ((blog.qualityScore || 0) < 80) {
    addUniqueIssue(warnings, {
      action: "seo",
      detail: `${blog.qualityScore || 0}% quality`,
      key: "quality-score",
      label: "SEO quality",
    });
  }

  if (!flags.hasFaq) {
    addUniqueIssue(warnings, {
      action: "faq",
      detail: "FAQ source missing",
      key: "faq",
      label: "FAQ rich result",
    });
  }

  if ((flags.sourceCount || 0) < 1) {
    addUniqueIssue(warnings, {
      action: "sources",
      detail: "No cited source",
      key: "sources",
      label: "Sources",
    });
  }

  if (!flags.hasInternalLink || (linkNode?.outboundCount || 0) === 0) {
    addUniqueIssue(warnings, {
      action: "links",
      detail: `${linkNode?.outboundCount || 0} outbound blog links`,
      key: "internal-links",
      label: "Internal links",
    });
  }

  if (!flags.hasHeroImage || !flags.hasHeroAlt) {
    addUniqueIssue(warnings, {
      action: "review",
      detail: flags.hasHeroImage ? "Alt text needs review" : "Featured image missing",
      key: "image",
      label: "Image",
    });
  }

  if (blog.daysSinceUpdate !== null && blog.daysSinceUpdate >= 90) {
    addUniqueIssue(warnings, {
      action: "review",
      detail: `${blog.daysSinceUpdate} days since review`,
      key: "freshness",
      label: "Freshness",
    });
  }

  if (linkWarnings.length > 0) {
    addUniqueIssue(warnings, {
      action: "links",
      detail: `${linkWarnings.length} cleanup suggestion${linkWarnings.length === 1 ? "" : "s"}`,
      key: "link-warnings",
      label: "Link warnings",
    });
  }

  const status = blockers.length ? "blocked" : warnings.length ? "review" : "ready";
  const score = Math.max(0, Math.min(100, 100 - blockers.length * 18 - warnings.length * 6));

  return {
    blog,
    blockers,
    score,
    status,
    warnings,
  };
}

export function buildBlogPublishGuardReport(auditedBlogs = [], linkGraph = null) {
  const queue = auditedBlogs
    .map((blog) => buildGuardRow(blog, linkGraph?.nodeMap?.get(blog.id) || linkGraph?.slugMap?.get(blog.slug)))
    .sort((a, b) => {
      const statusRank = { blocked: 0, review: 1, ready: 2 };
      return (
        statusRank[a.status] - statusRank[b.status] ||
        b.blockers.length - a.blockers.length ||
        b.warnings.length - a.warnings.length ||
        a.blog.title.localeCompare(b.blog.title)
      );
    });

  return {
    queue,
    summary: {
      blocked: queue.filter((item) => item.status === "blocked").length,
      blockerCount: queue.reduce((total, item) => total + item.blockers.length, 0),
      ready: queue.filter((item) => item.status === "ready").length,
      review: queue.filter((item) => item.status === "review").length,
      total: queue.length,
      warningCount: queue.reduce((total, item) => total + item.warnings.length, 0),
    },
  };
}

function statusTone(status = "ready") {
  if (status === "blocked") return "border-red-100 bg-red-50 text-red-600";
  if (status === "review") return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-green-100 bg-green-50 text-green-700";
}

function GuardStat({ label, value, tone }) {
  return (
    <div className={`rounded-xl px-2 py-2 text-center ${tone}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function GuardRow({ item, onEdit }) {
  const issues = item.blockers.length ? item.blockers : item.warnings;
  const firstIssue = issues[0];
  const Icon = item.status === "blocked" ? AlertTriangle : item.status === "review" ? Sparkles : CheckCircle2;

  return (
    <article className={`rounded-xl border px-3 py-3 ${statusTone(item.status)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5">{item.blog.title}</p>
          <p className="mt-1 text-[11px] font-semibold opacity-80">
            {item.blockers.length} blocker{item.blockers.length === 1 ? "" : "s"} - {item.warnings.length} warning
            {item.warnings.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      {issues.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {issues.slice(0, 3).map((issue) => (
            <span key={`${item.blog.id}-${issue.key}`} className="rounded-lg bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
              {issue.label}
            </span>
          ))}
          {issues.length > 3 ? (
            <span className="rounded-lg bg-white/70 px-2 py-1 text-[10px] font-black">+{issues.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onEdit?.(item.blog, firstIssue?.action || item.blog.recommendedAction || "seo")}
        className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white transition hover:bg-gray-700"
      >
        <WandSparkles className="h-3.5 w-3.5" />
        Fix guard
      </button>
    </article>
  );
}

export default function BlogPublishGuardPanel({ onEdit, onFilterIssue, report }) {
  const summary = report?.summary || {};
  const queue = report?.queue || [];
  const activeQueue = queue.filter((item) => item.status !== "ready").slice(0, 4);
  const avgScore = queue.length ? Math.round(queue.reduce((total, item) => total + item.score, 0) / queue.length) : 100;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Publish guard</p>
          <h2 className="mt-1 text-xl font-black text-gray-900">{summary.ready || 0}/{summary.total || 0} ready</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Required publish checks, SEO blockers, image readiness, and broken-link risk in one queue.
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${avgScore >= 85 ? "border-green-100 bg-green-50 text-green-700" : avgScore >= 65 ? "border-amber-100 bg-amber-50 text-amber-700" : "border-red-100 bg-red-50 text-red-600"}`}>
          {avgScore}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <GuardStat label="Blocked" value={summary.blocked || 0} tone={summary.blocked ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"} />
        <GuardStat label="Review" value={summary.review || 0} tone={summary.review ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"} />
        <GuardStat label="Ready" value={summary.ready || 0} tone="bg-green-50 text-green-700" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onFilterIssue?.("quality")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
        >
          <SearchCheck className="h-3.5 w-3.5" />
          Meta
        </button>
        <button
          type="button"
          onClick={() => onFilterIssue?.("internal-links")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <Link2 className="h-3.5 w-3.5" />
          Links
        </button>
        <button
          type="button"
          onClick={() => onFilterIssue?.("image")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-cyan-100 bg-cyan-50 px-2 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100"
        >
          <Image className="h-3.5 w-3.5" />
          Image
        </button>
        <button
          type="button"
          onClick={() => onFilterIssue?.("trust")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Trust
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Guard queue</p>
          <span className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-black text-gray-500">
            {(summary.blockerCount || 0) + (summary.warningCount || 0)}
          </span>
        </div>
        {activeQueue.length ? (
          activeQueue.map((item) => <GuardRow key={`publish-guard-${item.blog.id}`} item={item} onEdit={onEdit} />)
        ) : (
          <div className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            Publish guard is clear for the current blog set.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3 text-xs font-semibold leading-5 text-gray-600">
        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
        Editor publish gate still performs the final per-post check before saving.
      </div>
    </section>
  );
}
