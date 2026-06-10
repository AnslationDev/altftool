"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckSquare,
  CheckCircle2,
  Download,
  ExternalLink,
  Filter,
  Loader2,
  PanelRightOpen,
  MousePointerClick,
  PauseCircle,
  Search,
  Save,
  ShieldAlert,
  ShieldCheck,
  Square,
  Store,
  ThumbsDown,
  ThumbsUp,
  TicketPercent,
  X,
} from "lucide-react";
import {
  getBuySmartQualitySummary,
  getBuySmartStorePath,
  getPrimarySavingsText,
  isExternalMerchantUrl,
  normalizeBuySmartCategory,
  slugifyBuySmartBrand,
  summarizeBuySmartQuality,
} from "@altftool/core/buysmart";
import { logAuditEvent } from "@/lib/auditClient";
import { firebaseBuySmartCategoriesSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartCategories";
import { firebaseBuySmartStoreSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartStore";

const numberFormatter = new Intl.NumberFormat("en");
const DATE_FILTERS = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];
const EVENT_FILTERS = [
  { label: "All events", value: "all" },
  { label: "Reveals", value: "reveal" },
  { label: "Copies", value: "copy" },
  { label: "Visits", value: "outbound" },
  { label: "Worked", value: "worked" },
  { label: "Failed", value: "failed" },
];
const QUALITY_KIND_FILTERS = [
  { label: "All rows", value: "all" },
  { label: "Offers", value: "offer" },
  { label: "Stores", value: "store" },
];
const QUALITY_STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Fix", value: "fix" },
  { label: "Review", value: "review" },
  { label: "Ready", value: "ready" },
];
const QUALITY_ISSUE_FILTERS = [
  { label: "All issues", value: "all" },
  { label: "Missing title", value: "missing-title" },
  { label: "Missing link", value: "missing-link" },
  { label: "Missing saving", value: "missing-saving" },
  { label: "Missing image", value: "missing-image" },
  { label: "Expired", value: "expired" },
  { label: "Expires soon", value: "expires-soon" },
  { label: "Needs verification", value: "needs-verification" },
  { label: "Low success", value: "low-success" },
  { label: "Failed votes", value: "failed-votes" },
  { label: "Duplicate store", value: "duplicate-store" },
  { label: "Paused", value: "paused" },
];

function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

function getDateThreshold(value) {
  const day = 24 * 60 * 60 * 1000;
  if (value === "today") return new Date().setHours(0, 0, 0, 0);
  if (value === "7d") return Date.now() - day * 7;
  if (value === "30d") return Date.now() - day * 30;
  return 0;
}

function getEventTime(event = {}) {
  const value = Number(event.ts || event.createdAt || event.timestamp || 0);
  if (Number.isFinite(value) && value > 0) return value;
  const parsed = new Date(event.ts || event.createdAt || event.timestamp || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function eventMatchesSearch(event = {}, search = "") {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    event.brandTitle,
    event.brandSlug,
    event.category,
    event.eventType,
    event.offerType,
    event.saving,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function exportCsv(filename, rows = []) {
  if (typeof window === "undefined" || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function reportDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function getSectionItems(section) {
  if (Array.isArray(section)) return section;
  if (Array.isArray(section?.banner)) return section.banner;
  if (Array.isArray(section?.features)) return section.features;
  return [];
}

function getStoreSlug(store = {}) {
  return slugifyBuySmartBrand(store.slug || store.title || store.name || store.link || store.url);
}

function normalizeStoreAsOffer(store = {}, index = 0) {
  return normalizeBuySmartCategory({
    audience: "All shoppers",
    category: store.category || store.tag || "Store",
    discount: store.highlight || (store.offers ? `${store.offers} live offers` : "View store"),
    image: store.image || store.logo,
    link: store.link || store.url || "#",
    offerType: "deal",
    priority: Number(store.offers) || Math.max(0, 30 - index),
    slug: store.slug,
    status: store.status || "active",
    title: store.title || store.name,
    verified: store.status === "active",
    workingVotes: Number(store.offers) || 0,
  });
}

function normalizeCounter(counter = {}) {
  return {
    copy: Number(counter.copy) || 0,
    failed: Number(counter.failed) || 0,
    outbound: Number(counter.outbound) || 0,
    reveal: Number(counter.reveal) || 0,
    worked: Number(counter.worked) || 0,
  };
}

function getStoreQuality(store = {}, stores = []) {
  const issues = [];
  const duplicateCount = stores.filter((item) => getStoreSlug(item) === getStoreSlug(store)).length;

  if (!store.title && !store.name) issues.push({ key: "missing-title", label: "Missing title", severity: "critical" });
  if (!isExternalMerchantUrl(store.link || store.url)) issues.push({ key: "missing-link", label: "Missing merchant URL", severity: "critical" });
  if (!store.image && !store.logo) issues.push({ key: "missing-image", label: "Missing image", severity: "warning" });
  if (store.status !== "active") issues.push({ key: "paused", label: "Paused", severity: "warning" });
  if (duplicateCount > 1) issues.push({ key: "duplicate-store", label: "Duplicate store", severity: "warning" });

  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    criticalCount,
    issues,
    score: Math.max(0, 100 - criticalCount * 35 - warningCount * 18),
    status: criticalCount ? "fix" : warningCount ? "review" : "ready",
    warningCount,
  };
}

function buildInsights(data = {}) {
  const categories = getSectionItems(data.categories);
  const stores = getSectionItems(data.store);
  const analytics = data.analytics || {};
  const counters = analytics.counters && typeof analytics.counters === "object" ? analytics.counters : {};
  const events = Array.isArray(analytics.events) ? analytics.events : [];

  const catalog = [
    ...categories.map((item) => normalizeBuySmartCategory(item)),
    ...stores.map(normalizeStoreAsOffer),
  ];
  const catalogBySlug = new Map(catalog.map((item) => [item.storeSlug, item]));

  const rows = Object.entries(counters)
    .map(([slug, counter]) => {
      const normalizedCounter = normalizeCounter(counter);
      const item = catalogBySlug.get(slug);
      const reveal = normalizedCounter.reveal;
      const highIntent = normalizedCounter.copy + normalizedCounter.outbound + normalizedCounter.worked;
      const voteTotal = normalizedCounter.worked + normalizedCounter.failed;

      return {
        counter: normalizedCounter,
        highIntent,
        item,
        slug,
        title: item?.title || slug.replace(/-/g, " "),
        trustRate: voteTotal ? (normalizedCounter.worked / voteTotal) * 100 : 0,
        visitRate: reveal ? (normalizedCounter.outbound / reveal) * 100 : 0,
      };
    })
    .sort((a, b) => b.highIntent + b.counter.reveal - (a.highIntent + a.counter.reveal));

  const totals = rows.reduce(
    (acc, row) => {
      acc.copy += row.counter.copy;
      acc.failed += row.counter.failed;
      acc.outbound += row.counter.outbound;
      acc.reveal += row.counter.reveal;
      acc.worked += row.counter.worked;
      acc.highIntent += row.highIntent;
      return acc;
    },
    { copy: 0, failed: 0, highIntent: 0, outbound: 0, reveal: 0, worked: 0 },
  );

  const voteTotal = totals.worked + totals.failed;

  return {
    categories,
    events,
    rows,
    stores,
    totals,
    trustRate: voteTotal ? (totals.worked / voteTotal) * 100 : 0,
    visitRate: totals.reveal ? (totals.outbound / totals.reveal) * 100 : 0,
  };
}

function rowsFromCounters(counters = {}, catalogBySlug = new Map()) {
  return Object.entries(counters)
    .map(([slug, counter]) => {
      const normalizedCounter = normalizeCounter(counter);
      const item = catalogBySlug.get(slug);
      const reveal = normalizedCounter.reveal;
      const highIntent = normalizedCounter.copy + normalizedCounter.outbound + normalizedCounter.worked;
      const voteTotal = normalizedCounter.worked + normalizedCounter.failed;

      return {
        counter: normalizedCounter,
        highIntent,
        item,
        slug,
        title: item?.title || slug.replace(/-/g, " "),
        trustRate: voteTotal ? (normalizedCounter.worked / voteTotal) * 100 : 0,
        visitRate: reveal ? (normalizedCounter.outbound / reveal) * 100 : 0,
      };
    })
    .sort((a, b) => b.highIntent + b.counter.reveal - (a.highIntent + a.counter.reveal));
}

function countersFromEvents(events = []) {
  return events.reduce((acc, event) => {
    const slug = slugifyBuySmartBrand(event.brandSlug || event.brandTitle || "unknown");
    const eventType = event.eventType || "reveal";

    acc[slug] ||= normalizeCounter();
    if (eventType in acc[slug]) {
      acc[slug][eventType] += 1;
    }

    return acc;
  }, {});
}

function filterInsights(insights, filters) {
  const threshold = getDateThreshold(filters.dateRange);
  const events = insights.events.filter((event) => {
    if (threshold && getEventTime(event) < threshold) return false;
    if (filters.eventType !== "all" && event.eventType !== filters.eventType) return false;
    return eventMatchesSearch(event, filters.search);
  });
  const countersFromFilteredEvents = countersFromEvents(events);
  const useEventCounters = filters.dateRange !== "all" || filters.eventType !== "all";
  const counters = useEventCounters ? countersFromFilteredEvents : Object.fromEntries(
    insights.rows.map((row) => [row.slug, row.counter]),
  );
  const catalogBySlug = new Map(
    [...insights.categories.map(normalizeBuySmartCategory), ...insights.stores.map(normalizeStoreAsOffer)]
      .map((item) => [item.storeSlug, item]),
  );
  const search = filters.search.trim().toLowerCase();
  let rows = rowsFromCounters(counters, catalogBySlug).filter((row) => {
    if (!search) return true;
    return [row.title, row.slug, row.item?.category, row.item?.offerType]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  if (filters.lowTrustOnly) {
    rows = rows.filter((row) => {
      const votes = row.counter.worked + row.counter.failed;
      return row.counter.failed > row.counter.worked || (votes > 0 && row.trustRate < 70);
    });
  }

  const totals = rows.reduce(
    (acc, row) => {
      acc.copy += row.counter.copy;
      acc.failed += row.counter.failed;
      acc.outbound += row.counter.outbound;
      acc.reveal += row.counter.reveal;
      acc.worked += row.counter.worked;
      acc.highIntent += row.highIntent;
      return acc;
    },
    { copy: 0, failed: 0, highIntent: 0, outbound: 0, reveal: 0, worked: 0 },
  );
  const voteTotal = totals.worked + totals.failed;

  return {
    ...insights,
    events,
    rows,
    totals,
    trustRate: voteTotal ? (totals.worked / voteTotal) * 100 : 0,
    visitRate: totals.reveal ? (totals.outbound / totals.reveal) * 100 : 0,
  };
}

function buildQualityQueue(data = {}) {
  const categories = getSectionItems(data.categories);
  const stores = getSectionItems(data.store);
  const offerSummary = summarizeBuySmartQuality(categories);

  const offerRows = categories.map((item) => {
    const normalized = normalizeBuySmartCategory(item);
    const quality = getBuySmartQualitySummary(item, categories);

    return {
      id: item.id,
      issueText: quality.issues.map((issue) => issue.label).join(", "),
      kind: "offer",
      label: normalized.title,
      link: normalized.link,
      path: getBuySmartStorePath(normalized),
      quality,
      saving: normalized.code || getPrimarySavingsText(normalized),
      status: normalized.status,
      source: item,
      subtitle: normalized.category,
    };
  });

  const storeRows = stores.map((item, index) => {
    const normalized = normalizeStoreAsOffer(item, index);
    const quality = getStoreQuality(item, stores);

    return {
      id: item.id,
      issueText: quality.issues.map((issue) => issue.label).join(", "),
      kind: "store",
      label: item.title || item.name || normalized.title,
      link: item.link || item.url || "",
      path: getBuySmartStorePath(normalized),
      quality,
      saving: item.highlight || (item.offers ? `${item.offers} offers` : "Store card"),
      status: item.status || "active",
      source: item,
      subtitle: item.country || "Store banner",
    };
  });

  const queue = [...offerRows, ...storeRows]
    .filter((row) => row.quality.issues.length > 0)
    .sort((a, b) => {
      const statusRank = { fix: 0, review: 1, ready: 2 };
      if (statusRank[a.quality.status] !== statusRank[b.quality.status]) {
        return statusRank[a.quality.status] - statusRank[b.quality.status];
      }
      return a.quality.score - b.quality.score;
    });

  const storeStats = storeRows.reduce(
    (acc, row) => {
      acc[row.quality.status] += 1;
      return acc;
    },
    { fix: 0, ready: 0, review: 0 },
  );

  return {
    offerSummary,
    queue,
    storeStats,
    storesTotal: stores.length,
  };
}

function analyticsRowsForCsv(rows = []) {
  return rows.map((row) => ({
    store: row.title,
    slug: row.slug,
    reveals: row.counter.reveal,
    copies: row.counter.copy,
    visits: row.counter.outbound,
    worked: row.counter.worked,
    failed: row.counter.failed,
    highIntent: row.highIntent,
    visitRate: formatPercent(row.visitRate),
    trustRate: formatPercent(row.trustRate),
  }));
}

function eventsForCsv(events = []) {
  return events.map((event) => ({
    brand: event.brandTitle || event.brandSlug || "",
    slug: event.brandSlug || "",
    eventType: event.eventType || "",
    category: event.category || "",
    offerType: event.offerType || "",
    saving: event.saving || "",
    href: event.href || "",
    timestamp: event.ts ? new Date(event.ts).toISOString() : "",
  }));
}

function qualityRowsForCsv(rows = []) {
  return rows.map((row) => ({
    type: row.kind,
    title: row.label,
    status: row.status,
    score: row.quality.score,
    qualityStatus: row.quality.status,
    issues: row.issueText,
    saving: row.saving,
    category: row.subtitle,
    link: row.link,
    preview: row.path,
  }));
}

function getQueueRowKey(row = {}) {
  return `${row.kind}-${row.id || row.label}`;
}

function getQuickFixValues(row = {}) {
  const source = row.source || {};

  return {
    category: source.category || row.subtitle || "",
    code: source.couponCode || source.code || "",
    expiresAt: source.expiresAt || "",
    image: source.image || source.img || source.logo || "",
    link: source.link || source.url || row.link || "",
    saving: source.discount || source.highlight || row.saving || "",
    status: source.status || row.status || "active",
    title: source.title || source.name || row.label || "",
    verificationStatus: source.verificationStatus || (source.verified ? "verified" : "pending"),
  };
}

function quickFixPatch(row = {}, values = {}) {
  const patch = {
    image: values.image.trim(),
    link: values.link.trim(),
    status: values.status,
    title: values.title.trim(),
  };

  if (row.kind === "offer") {
    return {
      ...patch,
      category: values.category.trim(),
      code: values.code.trim(),
      couponCode: values.code.trim(),
      discount: values.saving.trim(),
      expiresAt: values.expiresAt.trim(),
      img: values.image.trim(),
      verificationStatus: values.verificationStatus,
      verified: values.verificationStatus === "verified",
    };
  }

  return {
    ...patch,
    country: values.category.trim(),
    highlight: values.saving.trim(),
  };
}

function getQualityActionPatch(row = {}, action = "") {
  if (row.kind === "offer") {
    if (action === "verify") {
      return {
        lastVerifiedAt: new Date().toISOString(),
        reviewNote: row.source.reviewNote || "Marked verified from BuySmart quality queue.",
        status: "active",
        successRate: Number(row.source.successRate) || 100,
        verificationStatus: "verified",
        verified: true,
      };
    }

    if (action === "pause") return { status: "paused" };
    if (action === "activate") return { status: "active" };
  }

  if (row.kind === "store" && ["activate", "pause"].includes(action)) {
    return { status: action === "pause" ? "paused" : "active" };
  }

  return {};
}

async function applyQualityPatch(row, values) {
  if (!row?.id) return;

  const patch = quickFixPatch(row, values);

  if (row.kind === "offer") {
    await firebaseBuySmartCategoriesSource.update(row.id, patch);
    return;
  }

  await firebaseBuySmartStoreSource.update(row.id, patch);
}

function getAuditSnapshot(row = {}, patch = {}) {
  const values = getQuickFixValues(row);
  const source = row.source || {};
  const snapshot = {
    category: values.category,
    code: values.code,
    expiresAt: values.expiresAt,
    image: values.image,
    link: values.link,
    saving: values.saving,
    status: values.status,
    title: values.title,
    verificationStatus: values.verificationStatus,
    verified: Boolean(source.verified),
    successRate: Number(source.successRate) || 0,
    lastVerifiedAt: source.lastVerifiedAt || "",
    reviewNote: source.reviewNote || "",
  };

  if (!patch || !Object.keys(patch).length) return snapshot;

  return Object.fromEntries(
    Object.keys(patch).map((key) => [key, snapshot[key] ?? source[key] ?? ""]),
  );
}

function getAuditAfter(row = {}, patch = {}) {
  return {
    ...getAuditSnapshot(row, patch),
    ...patch,
  };
}

function actionSummary(row = {}, action = "") {
  const labels = {
    activate: "activated",
    pause: "paused",
    "quick-fix": "quick-fixed",
    verify: "verified",
  };

  return `${row.kind === "store" ? "Store" : "Offer"} ${labels[action] || action}: ${row.label}`;
}

async function logBuySmartQualityAudit(row, action, patch, metadata = {}) {
  if (!row?.id) return;

  await logAuditEvent({
    action: `buysmart.${action}`,
    changes: {
      after: getAuditAfter(row, patch),
      before: getAuditSnapshot(row, patch),
    },
    entityId: row.id,
    entityType: `buysmart-${row.kind}`,
    metadata: {
      label: row.label,
      path: row.path,
      qualityScore: row.quality?.score ?? null,
      qualityStatus: row.quality?.status ?? null,
      sourceStatus: row.status || null,
      ...metadata,
    },
    module: "buysmart",
    route: "/altftool/buysmart",
    summary: actionSummary(row, action),
  });
}

function rowMatchesQualitySearch(row = {}, search = "") {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  return [
    row.label,
    row.subtitle,
    row.saving,
    row.status,
    row.kind,
    row.link,
    row.path,
    row.issueText,
    ...((row.quality?.issues || []).map((issue) => `${issue.key} ${issue.label} ${issue.severity}`)),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function filterQualityRows(rows = [], filters = {}) {
  return rows.filter((row) => {
    if (filters.kind !== "all" && row.kind !== filters.kind) return false;
    if (filters.status !== "all" && row.quality.status !== filters.status) return false;
    if (filters.issue !== "all" && !row.quality.issues.some((issue) => issue.key === filters.issue)) return false;
    return rowMatchesQualitySearch(row, filters.search);
  });
}

function StatCard({ caption, icon: Icon, label, tone = "slate", value }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-gray-200 bg-white text-gray-800",
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${tones[tone] || tones.slate}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      {caption ? <p className="mt-1 text-xs opacity-80">{caption}</p> : null}
    </div>
  );
}

function AnalyticsDashboard({ data }) {
  const baseInsights = useMemo(() => buildInsights(data), [data]);
  const [dateRange, setDateRange] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [search, setSearch] = useState("");
  const [lowTrustOnly, setLowTrustOnly] = useState(false);
  const insights = useMemo(
    () => filterInsights(baseInsights, { dateRange, eventType, lowTrustOnly, search }),
    [baseInsights, dateRange, eventType, lowTrustOnly, search],
  );
  const failedRows = useMemo(
    () => insights.rows.filter((row) => row.counter.failed > 0 || row.trustRate < 70),
    [insights.rows],
  );
  const hasFilters = dateRange !== "all" || eventType !== "all" || search.trim() || lowTrustOnly;

  function resetFilters() {
    setDateRange("all");
    setEventType("all");
    setSearch("");
    setLowTrustOnly(false);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Analytics filters
              </p>
            </div>
            <h3 className="mt-1 text-base font-semibold text-gray-950">
              Slice BuySmart events by date, event, or store
            </h3>
          </div>

          <div className="grid gap-2 md:grid-cols-[150px_150px_minmax(220px,1fr)_auto] xl:min-w-[760px]">
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400"
              aria-label="Analytics date range"
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400"
              aria-label="Analytics event type"
            >
              {EVENT_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search store, slug, category..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-800 outline-none focus:border-gray-400"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear analytics search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setLowTrustOnly((value) => !value)}
              aria-pressed={lowTrustOnly}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                lowTrustOnly
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              Low trust
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            Showing {formatNumber(insights.rows.length)} stores and {formatNumber(insights.events.length)} events.
          </p>
          <div className="flex flex-wrap gap-2">
            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => exportCsv(`buysmart-analytics-${reportDateStamp()}.csv`, analyticsRowsForCsv(insights.rows))}
              disabled={!insights.rows.length}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export analytics
            </button>
            <button
              type="button"
              onClick={() => exportCsv(`buysmart-events-${reportDateStamp()}.csv`, eventsForCsv(insights.events))}
              disabled={!insights.events.length}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export events
            </button>
            <button
              type="button"
              onClick={() => exportCsv(`buysmart-low-trust-${reportDateStamp()}.csv`, analyticsRowsForCsv(failedRows))}
              disabled={!failedRows.length}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export low trust
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={MousePointerClick} label="Reveals" value={formatNumber(insights.totals.reveal)} caption={`${formatNumber(insights.events.length)} recent events`} tone="blue" />
        <StatCard icon={TicketPercent} label="Copies" value={formatNumber(insights.totals.copy)} caption="Coupon copy intent" tone="green" />
        <StatCard icon={ExternalLink} label="Store Visits" value={formatNumber(insights.totals.outbound)} caption={`${formatPercent(insights.visitRate)} visit rate`} tone="slate" />
        <StatCard icon={ThumbsUp} label="Worked" value={formatNumber(insights.totals.worked)} caption={`${formatPercent(insights.trustRate)} trust rate`} tone="green" />
        <StatCard icon={ThumbsDown} label="Failed" value={formatNumber(insights.totals.failed)} caption="Needs review signals" tone={insights.totals.failed ? "amber" : "slate"} />
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              <div>
                <h3 className="text-base font-semibold text-gray-950">Top BuySmart intent</h3>
                <p className="text-sm text-gray-500">Sorted by reveal, copy, visit, and worked feedback.</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {insights.rows.length ? (
              insights.rows.slice(0, 8).map((row) => (
                <div key={row.slug} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-bold capitalize text-gray-950">{row.title}</h4>
                      {row.counter.failed > row.counter.worked && row.counter.failed > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Review
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatNumber(row.highIntent)} high-intent actions - {formatPercent(row.visitRate)} visit rate
                    </p>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {[
                      ["Reveal", row.counter.reveal],
                      ["Copy", row.counter.copy],
                      ["Visit", row.counter.outbound],
                      ["Worked", row.counter.worked],
                      ["Failed", row.counter.failed],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-gray-50 px-2 py-2">
                        <p className="font-bold text-gray-950">{formatNumber(value)}</p>
                        <p className="mt-0.5 text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-gray-500">
                No BuySmart analytics yet. Reveal, copy, store visit, worked, and failed events will appear here.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-700" />
            <div>
              <h3 className="text-base font-semibold text-gray-950">Recent activity</h3>
              <p className="text-sm text-gray-500">Last tracked BuySmart events.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {insights.events.length ? (
              insights.events.slice(-8).reverse().map((event) => (
                <div key={event.id || `${event.brandSlug}-${event.ts}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold capitalize text-gray-900">
                      {event.brandTitle || event.brandSlug}
                    </p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold capitalize text-gray-600">
                      {event.eventType}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {event.ts ? new Date(event.ts).toLocaleString() : "Timestamp unavailable"}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                No recent events yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function QualityPill({ status, score }) {
  const style =
    status === "ready"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "fix"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${style}`}>
      {status === "ready" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
      {score}/100
    </span>
  );
}

async function applyQualityAction(row, action) {
  if (!row?.id) return;

  const patch = getQualityActionPatch(row, action);
  if (!Object.keys(patch).length) return;

  if (row.kind === "store") {
    await firebaseBuySmartStoreSource.update(row.id, patch);
    return patch;
  }

  await firebaseBuySmartCategoriesSource.update(row.id, patch);
  return patch;
}

function QualityIssueDrawer({ busyAction, onAction, onClose, onSave, row }) {
  const initialValues = useMemo(() => getQuickFixValues(row), [row]);
  const [form, setForm] = useState(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  if (!row) return null;

  const pauseKey = `${row.kind}:${row.id}:pause`;
  const activateKey = `${row.kind}:${row.id}:activate`;
  const verifyKey = `${row.kind}:${row.id}:verify`;
  const saveKey = `${row.kind}:${row.id}:save`;
  const dirty = JSON.stringify(form) !== JSON.stringify(initialValues);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close quality issue drawer"
        className="absolute inset-0 bg-gray-950/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl">
        <div className="border-b border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <QualityPill status={row.quality.status} score={row.quality.score} />
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase text-gray-600">
                  {row.kind}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-950">{row.label}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {row.subtitle} - {row.saving} - {row.status}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Issue details</p>
            <div className="mt-3 space-y-2">
              {row.quality.issues.length ? (
                row.quality.issues.map((issue) => (
                  <div key={issue.key} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 ${issue.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{issue.label}</p>
                      <p className="mt-1 text-xs capitalize text-gray-500">{issue.severity} issue</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-500">
                  No blocking issues found for this row.
                </p>
              )}
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Quick fix</p>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm font-semibold text-gray-700">
                Title
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-gray-700">
                Merchant URL
                <input
                  value={form.link}
                  onChange={(event) => updateField("link", event.target.value)}
                  className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-gray-700">
                Image URL
                <input
                  value={form.image}
                  onChange={(event) => updateField("image", event.target.value)}
                  className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold text-gray-700">
                  {row.kind === "offer" ? "Category" : "Country"}
                  <input
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                  />
                </label>

                <label className="grid gap-1 text-sm font-semibold text-gray-700">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold text-gray-700">
                  {row.kind === "offer" ? "Saving copy" : "Highlight"}
                  <input
                    value={form.saving}
                    onChange={(event) => updateField("saving", event.target.value)}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                  />
                </label>

                {row.kind === "offer" ? (
                  <label className="grid gap-1 text-sm font-semibold text-gray-700">
                    Code
                    <input
                      value={form.code}
                      onChange={(event) => updateField("code", event.target.value)}
                      className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                    />
                  </label>
                ) : null}
              </div>

              {row.kind === "offer" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-gray-700">
                    Expires
                    <input
                      value={form.expiresAt}
                      onChange={(event) => updateField("expiresAt", event.target.value)}
                      className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-gray-700">
                    Verification
                    <select
                      value={form.verificationStatus}
                      onChange={(event) => updateField("verificationStatus", event.target.value)}
                      className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal text-gray-900 outline-none focus:border-gray-400"
                    >
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Publishing signals</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <dt className="text-xs font-bold uppercase text-gray-500">Status</dt>
                <dd className="mt-1 font-semibold capitalize text-gray-900">{row.status || "unknown"}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <dt className="text-xs font-bold uppercase text-gray-500">Score</dt>
                <dd className="mt-1 font-semibold text-gray-900">{row.quality.score}/100</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <dt className="text-xs font-bold uppercase text-gray-500">Saving</dt>
                <dd className="mt-1 truncate font-semibold text-gray-900">{row.saving || "Not set"}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <dt className="text-xs font-bold uppercase text-gray-500">Link</dt>
                <dd className="mt-1 truncate font-semibold text-gray-900">{row.link || "Missing"}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {dirty ? "Unsaved quick fix changes" : "Quick fix synced"}
            </p>
            <button
              type="button"
              disabled={!row.id || !dirty || busyAction === saveKey}
              onClick={() => onSave(row, form)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {busyAction === saveKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {row.kind === "offer" ? (
              <button
                type="button"
                disabled={!row.id || busyAction === verifyKey}
                onClick={() => onAction(row, "verify")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-bold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === verifyKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify offer
              </button>
            ) : null}
            <button
              type="button"
              disabled={!row.id || busyAction === activateKey}
              onClick={() => onAction(row, "activate")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === activateKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Activate
            </button>
            <button
              type="button"
              disabled={!row.id || busyAction === pauseKey}
              onClick={() => onAction(row, "pause")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === pauseKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
              Pause
            </button>
            <a
              href={row.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Preview
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function QualityQueue({ data }) {
  const quality = useMemo(() => buildQualityQueue(data), [data]);
  const [busyAction, setBusyAction] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [detailRowKey, setDetailRowKey] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [queueSearch, setQueueSearch] = useState("");
  const filteredQueue = useMemo(
    () => filterQualityRows(quality.queue, {
      issue: issueFilter,
      kind: kindFilter,
      search: queueSearch,
      status: statusFilter,
    }),
    [issueFilter, kindFilter, quality.queue, queueSearch, statusFilter],
  );
  const selectedRows = useMemo(
    () => quality.queue.filter((row) => selectedKeys.includes(getQueueRowKey(row))),
    [quality.queue, selectedKeys],
  );
  const selectedVisibleRows = useMemo(
    () => filteredQueue.filter((row) => selectedKeys.includes(getQueueRowKey(row))),
    [filteredQueue, selectedKeys],
  );
  const detailRow = useMemo(
    () => quality.queue.find((row) => getQueueRowKey(row) === detailRowKey),
    [detailRowKey, quality.queue],
  );
  const allVisibleSelected = filteredQueue.length > 0 && selectedVisibleRows.length === filteredQueue.length;
  const bulkBusy = busyAction.startsWith("bulk:");
  const hasQueueFilters = kindFilter !== "all" || statusFilter !== "all" || issueFilter !== "all" || queueSearch.trim();

  function toggleRow(row) {
    const rowKey = getQueueRowKey(row);
    setActionError("");
    setActionSuccess("");
    setSelectedKeys((current) => (
      current.includes(rowKey)
        ? current.filter((key) => key !== rowKey)
        : [...current, rowKey]
    ));
  }

  function selectRows(rows) {
    setActionError("");
    setActionSuccess("");
    setSelectedKeys(rows.map(getQueueRowKey));
  }

  function toggleVisibleRows() {
    setActionError("");
    setActionSuccess("");
    setSelectedKeys(allVisibleSelected ? [] : filteredQueue.map(getQueueRowKey));
  }

  function resetQueueFilters() {
    setKindFilter("all");
    setStatusFilter("all");
    setIssueFilter("all");
    setQueueSearch("");
  }

  async function runAction(row, action) {
    if (!row.id) return;

    const key = `${row.kind}:${row.id}:${action}`;
    setBusyAction(key);
    setActionError("");
    setActionSuccess("");

    try {
      const patch = await applyQualityAction(row, action);
      await logBuySmartQualityAudit(row, action, patch);
      setSelectedKeys((current) => current.filter((selectedKey) => selectedKey !== getQueueRowKey(row)));
      setActionSuccess(`${row.label} updated.`);
    } catch (error) {
      console.error("BuySmart quality action failed", error);
      setActionError("Action failed. Firebase did not accept the update, please retry.");
    } finally {
      setBusyAction("");
    }
  }

  async function saveQuickFix(row, values) {
    if (!row.id) return;

    const key = `${row.kind}:${row.id}:save`;
    setBusyAction(key);
    setActionError("");
    setActionSuccess("");

    try {
      const patch = quickFixPatch(row, values);
      await applyQualityPatch(row, values);
      await logBuySmartQualityAudit(row, "quick-fix", patch);
      setActionSuccess(`${row.label} quick fix saved.`);
    } catch (error) {
      console.error("BuySmart quick fix failed", error);
      setActionError("Quick fix failed. Firebase did not accept the update, please retry.");
    } finally {
      setBusyAction("");
    }
  }

  async function runBulkAction(action) {
    const rowsToUpdate = selectedRows.filter((row) => row.id);
    if (!rowsToUpdate.length || bulkBusy) return;

    setBusyAction(`bulk:${action}`);
    setActionError("");
    setActionSuccess("");

    try {
      const updates = await Promise.all(
        rowsToUpdate.map(async (row) => ({
          patch: await applyQualityAction(row, action),
          row,
        })),
      );
      await Promise.all(
        updates.map(({ patch, row }) => logBuySmartQualityAudit(row, action, patch, {
          bulkAction: true,
          bulkSize: rowsToUpdate.length,
        })),
      );
      setSelectedKeys([]);
      setActionSuccess(`${rowsToUpdate.length} selected row${rowsToUpdate.length > 1 ? "s" : ""} updated.`);
    } catch (error) {
      console.error("BuySmart bulk quality action failed", error);
      setActionError("Bulk action failed. Try a smaller selection or check Firebase permissions.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={TicketPercent} label="Offer Rows" value={formatNumber(quality.offerSummary.total)} caption={`${quality.offerSummary.ready} ready`} tone="blue" />
        <StatCard icon={ShieldCheck} label="Offer Ready" value={formatNumber(quality.offerSummary.ready)} caption="No blocking issues" tone="green" />
        <StatCard icon={ShieldAlert} label="Offer Review" value={formatNumber(quality.offerSummary.review)} caption="Needs editorial check" tone="amber" />
        <StatCard icon={AlertTriangle} label="Offer Fix" value={formatNumber(quality.offerSummary.fix)} caption="Blocking issue" tone={quality.offerSummary.fix ? "red" : "slate"} />
        <StatCard icon={Store} label="Store Fix" value={formatNumber(quality.storeStats.fix)} caption={`${quality.storesTotal} store rows`} tone={quality.storeStats.fix ? "red" : "slate"} />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-950">Auto quality queue</h3>
            <p className="text-sm text-gray-500">Rows with missing links, expired offers, duplicates, low trust, or paused status appear first.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
              {filteredQueue.length}/{quality.queue.length} visible
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Audit trail on
            </span>
            <button
              type="button"
              onClick={() => exportCsv(`buysmart-quality-queue-${reportDateStamp()}.csv`, qualityRowsForCsv(filteredQueue))}
              disabled={!filteredQueue.length}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export visible
            </button>
          </div>
        </div>

        {quality.queue.length ? (
          <div className="border-b border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Queue filters</p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-[150px_150px_190px_minmax(240px,1fr)_auto]">
              <select
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400"
                aria-label="Quality row type"
              >
                {QUALITY_KIND_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400"
                aria-label="Quality status"
              >
                {QUALITY_STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              <select
                value={issueFilter}
                onChange={(event) => setIssueFilter(event.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400"
                aria-label="Quality issue"
              >
                {QUALITY_ISSUE_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={queueSearch}
                  onChange={(event) => setQueueSearch(event.target.value)}
                  placeholder="Search title, issue, status, link..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-800 outline-none focus:border-gray-400"
                />
                {queueSearch ? (
                  <button
                    type="button"
                    onClick={() => setQueueSearch("")}
                    className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Clear queue search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {hasQueueFilters ? (
                <button
                  type="button"
                  onClick={resetQueueFilters}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {quality.queue.length ? (
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVisibleRows}
                  disabled={!filteredQueue.length}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  {allVisibleSelected ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5" />}
                  {allVisibleSelected ? "Clear visible" : "Select visible"}
                </button>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700">
                  {selectedRows.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => selectRows(filteredQueue.filter((row) => row.quality.status === "fix"))}
                  disabled={!filteredQueue.some((row) => row.quality.status === "fix")}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 bg-white px-3 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Select fix only
                </button>
                <button
                  type="button"
                  onClick={() => selectRows(filteredQueue.filter((row) => row.kind === "offer"))}
                  disabled={!filteredQueue.some((row) => row.kind === "offer")}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Select offers
                </button>
                <button
                  type="button"
                  onClick={() => selectRows(filteredQueue.filter((row) => row.kind === "store"))}
                  disabled={!filteredQueue.some((row) => row.kind === "store")}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Select stores
                </button>
                {selectedRows.length ? (
                  <button
                    type="button"
                    onClick={() => setSelectedKeys([])}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                  >
                    Clear selected
                  </button>
                ) : null}
                {actionSuccess ? (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    {actionSuccess}
                  </span>
                ) : null}
                {actionError ? (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                    {actionError}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => runBulkAction("verify")}
                  disabled={!selectedRows.length || bulkBusy}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-bold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === "bulk:verify" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Verify selected
                </button>
                <button
                  type="button"
                  onClick={() => runBulkAction("activate")}
                  disabled={!selectedRows.length || bulkBusy}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === "bulk:activate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Activate selected
                </button>
                <button
                  type="button"
                  onClick={() => runBulkAction("pause")}
                  disabled={!selectedRows.length || bulkBusy}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === "bulk:pause" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PauseCircle className="h-3.5 w-3.5" />}
                  Pause selected
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="divide-y divide-gray-100">
          {filteredQueue.length ? (
            filteredQueue.map((row) => {
              const rowKey = getQueueRowKey(row);
              const selected = selectedKeys.includes(rowKey);
              const pauseKey = `${row.kind}:${row.id}:pause`;
              const activateKey = `${row.kind}:${row.id}:activate`;
              const verifyKey = `${row.kind}:${row.id}:verify`;

              return (
                <article key={rowKey} className={`grid gap-4 p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center ${selected ? "bg-blue-50/60" : ""}`}>
                  <button
                    type="button"
                    onClick={() => toggleRow(row)}
                    aria-label={selected ? `Deselect ${row.label}` : `Select ${row.label}`}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    {selected ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <QualityPill status={row.quality.status} score={row.quality.score} />
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold uppercase text-gray-600">
                        {row.kind}
                      </span>
                      <h4 className="truncate text-sm font-bold text-gray-950">{row.label}</h4>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{row.issueText || "Ready"}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {row.subtitle} - {row.saving} - {row.status}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailRowKey(rowKey)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <PanelRightOpen className="h-3.5 w-3.5" />
                      Details
                    </button>

                    {row.kind === "offer" ? (
                      <button
                        type="button"
                        disabled={!row.id || busyAction === verifyKey}
                        onClick={() => runAction(row, "verify")}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyAction === verifyKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        Verify
                      </button>
                    ) : null}

                    {row.status === "active" ? (
                      <button
                        type="button"
                        disabled={!row.id || busyAction === pauseKey}
                        onClick={() => runAction(row, "pause")}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyAction === pauseKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PauseCircle className="h-3.5 w-3.5" />}
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!row.id || busyAction === activateKey}
                        onClick={() => runAction(row, "activate")}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyAction === activateKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Activate
                      </button>
                    )}

                    <a
                      href={row.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      Preview
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-6 text-sm text-gray-500">
              {quality.queue.length
                ? "No queue rows match the current filters."
                : "No queue items. BuySmart content is clean enough for publishing."}
            </div>
          )}
        </div>
      </section>

      <QualityIssueDrawer
        busyAction={busyAction}
        onAction={runAction}
        onClose={() => setDetailRowKey("")}
        onSave={saveQuickFix}
        row={detailRow}
      />
    </div>
  );
}

export default function BuySmartInsights({ data, mode = "analytics" }) {
  if (mode === "quality") return <QualityQueue data={data} />;
  return <AnalyticsDashboard data={data} />;
}
