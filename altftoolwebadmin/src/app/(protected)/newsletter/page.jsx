"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query as fsQuery } from "firebase/firestore";
import {
  CalendarDays,
  Download,
  Inbox,
  Loader2,
  Mail,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { db } from "@/lib/firebaseFirestore";

const DAY_MS = 24 * 60 * 60 * 1000;

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

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            {label}
          </p>
          <p className="text-xl font-black text-[var(--foreground)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
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
  }, []);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter(
      (sub) =>
        String(sub.email || "").toLowerCase().includes(q) ||
        String(sub.source || "").toLowerCase().includes(q),
    );
  }, [subscribers, search]);

  function exportCsv() {
    const rows = [
      ["email", "source", "subscribed_at"],
      ...filtered.map((sub) => [
        sub.email || "",
        sub.source || "",
        toDate(sub.createdAt)?.toISOString() || "",
      ]),
    ];
    const csv = rows
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

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">
                Super Admin Console
              </p>
              <h1 className="mt-2 text-2xl font-black">Newsletter Subscribers</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">
                Everyone who opted in through the site newsletter dialog. Live
                from Firestore — export any filtered view as CSV for your email
                platform.
              </p>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV ({filtered.length})
            </button>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total subscribers" value={stats.total} icon={Mail} />
          <Metric label="Last 7 days" value={stats.last7} icon={TrendingUp} />
          <Metric label="Last 30 days" value={stats.last30} icon={CalendarDays} />
          <Metric label="Top source" value={stats.topSource} icon={Inbox} />
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] p-4">
            <label className="relative block" htmlFor="newsletter-search">
              <span className="sr-only">Search subscribers</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                id="newsletter-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email or source…"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-9 pr-9 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
          </div>

          {loading ? (
            <div className="grid min-h-[180px] place-items-center">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
            </div>
          ) : loadError ? (
            <div className="grid min-h-[180px] place-items-center p-8 text-center">
              <div>
                <p className="font-bold">Couldn&apos;t load subscribers</p>
                <p className="mt-1 max-w-md text-sm text-[var(--muted)]">{loadError}</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-[180px] place-items-center p-8 text-center">
              <div>
                <Inbox className="mx-auto h-8 w-8 text-[var(--muted)]" />
                <p className="mt-3 font-bold">
                  {subscribers.length === 0 ? "No subscribers yet" : "No matches"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {subscribers.length === 0
                    ? "Signups from the site newsletter dialog will appear here in real time."
                    : "Try a different search term."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Source</th>
                    <th scope="col" className="px-4 py-3">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-soft)]"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                        {sub.email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-[var(--surface-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--muted)]">
                          {sub.source || "unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {formatDate(sub.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
