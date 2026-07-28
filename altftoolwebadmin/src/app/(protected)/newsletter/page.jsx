"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query as fsQuery } from "firebase/firestore";
import { CalendarDays, Download, Inbox, Mail, TrendingUp } from "lucide-react";
import { Button } from "@altftool/ui";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseFirestore";
import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageHeader,
  StatGrid,
  useTableControls,
} from "@/ansets";

const DAY_MS = 24 * 60 * 60 * 1000;

// Hoisted so useTableControls' memo isn't invalidated by a fresh array literal
// on every render.
const SEARCH_FIELDS = ["email", "source"];

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// `createdAtMs` is derived onto each row purely so the "Subscribed" column can
// sort numerically — a Firestore Timestamp object sorts as "[object Object]".
const COLUMNS = [
  {
    key: "email",
    header: "Email",
    sortable: true,
    render: (row) => (
      <span className="font-semibold text-[var(--foreground)]">{row.email || "—"}</span>
    ),
  },
  {
    key: "source",
    header: "Source",
    sortable: true,
    render: (row) => (
      <span className="rounded-md bg-[var(--surface-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--muted)]">
        {row.source || "unknown"}
      </span>
    ),
  },
  {
    key: "createdAtMs",
    header: "Subscribed",
    sortable: true,
    render: (row) => <span className="text-[var(--muted)]">{formatDate(row.createdAt)}</span>,
  },
];

export default function NewsletterSubscribersPage() {
  // This route is nav-gated as superadminOnly (config/adminRoutes.js), but the
  // Firestore rule for newsletter_subscribers only requires isActiveAdmin() —
  // any active admin who lands here directly bypasses the nav gate entirely.
  // Check the role in-component instead of trusting nav placement + rules alone.
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // Bumped by the error state's "Try again": onSnapshot detaches its listener
  // when it errors, so recovering means re-subscribing, not just re-rendering.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Skip subscribing entirely for a non-superadmin — they'll hit the
    // access-denied render below, so there's no reason to pull subscriber
    // data over the wire just to discard it.
    if (!isSuperAdmin) return undefined;
    const unsubscribe = onSnapshot(
      fsQuery(collection(db, "newsletter_subscribers"), orderBy("createdAt", "desc")),
      (snapshot) => {
        setSubscribers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoadError("");
        setLoading(false);
      },
      (error) => {
        setLoadError(error?.message || "Could not load subscribers.");
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [reloadKey, isSuperAdmin]);

  const stats = useMemo(() => {
    const now = Date.now();
    let last7 = 0;
    let last30 = 0;
    const sources = new Map();
    for (const sub of subscribers) {
      const created = toDate(sub.createdAt)?.getTime();
      if (created) {
        if (now - created <= 7 * DAY_MS) last7 += 1;
        if (now - created <= 30 * DAY_MS) last30 += 1;
      }
      const source = sub.source || "unknown";
      sources.set(source, (sources.get(source) || 0) + 1);
    }
    const topSource =
      [...sources.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total: subscribers.length, last7, last30, topSource };
  }, [subscribers]);

  const rows = useMemo(
    () =>
      subscribers.map((sub) => ({
        ...sub,
        createdAtMs: toDate(sub.createdAt)?.getTime() ?? null,
      })),
    [subscribers],
  );

  const { search, onSearchChange, sort, setSort, rows: visibleRows, matched, total } =
    useTableControls(rows, { searchFields: SEARCH_FIELDS });

  function exportCsv() {
    const csvRows = [
      ["email", "source", "subscribed_at"],
      ...visibleRows.map((sub) => [
        sub.email || "",
        sub.source || "",
        toDate(sub.createdAt)?.toISOString() || "",
      ]),
    ];
    const csv = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <ErrorState
          title="Super Admin only"
          message="Newsletter subscribers are restricted to Super Admins."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <PageHeader
        eyebrow="Super Admin Console"
        icon={Mail}
        title="Newsletter Subscribers"
        description="Everyone who opted in through the site newsletter dialog. Live from Firestore — export any filtered view as CSV for your email platform."
        actions={
          <Button onClick={exportCsv} disabled={visibleRows.length === 0}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV ({visibleRows.length})
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        {/* A failed listener leaves `subscribers` empty, so the KPI row would
            have reported a confident "0 total subscribers" above the error the
            table is showing. Suppress both strips while the load is broken —
            the DataTable below owns the error state and the retry. */}
        {loadError ? null : (
          <>
            {loading ? (
              <LoadingState variant="stats" />
            ) : (
              <StatGrid
                columns={4}
                items={[
                  { key: "total", label: "Total subscribers", value: stats.total, icon: Mail },
                  { key: "last7", label: "Last 7 days", value: stats.last7, icon: TrendingUp },
                  { key: "last30", label: "Last 30 days", value: stats.last30, icon: CalendarDays },
                  { key: "topSource", label: "Top source", value: stats.topSource, icon: Inbox },
                ]}
              />
            )}

            <FilterBar
              search={search}
              onSearchChange={onSearchChange}
              searchPlaceholder="Search by email or source…"
              count={
                loading ? null : `${matched} of ${total} subscriber${total === 1 ? "" : "s"}`
              }
            />
          </>
        )}

        <DataTable
          caption="Newsletter subscribers"
          columns={COLUMNS}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
          loading={loading}
          error={loadError || null}
          onRetry={retry}
          empty={
            <EmptyState
              icon={Inbox}
              title={subscribers.length === 0 ? "No subscribers yet" : "No matches"}
              description={
                subscribers.length === 0
                  ? "Signups from the site newsletter dialog will appear here in real time."
                  : "Try a different search term."
              }
            />
          }
        />
      </div>
    </div>
  );
}
