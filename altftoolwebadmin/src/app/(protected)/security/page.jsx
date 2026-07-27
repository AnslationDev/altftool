"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Clock,
  Crosshair,
  ExternalLink,
  Laptop,
  Loader2,
  LogOut,
  MapPin,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  DataState,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingState,
  PageHeader,
  SectionCard,
  StatGrid,
} from "@/ansets";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebaseAuth";

const TABS = [
  { key: "overview", label: "Overview", icon: ShieldCheck },
  { key: "sessions", label: "Sessions & Devices", icon: Laptop },
  { key: "audit", label: "Audit Logs", icon: ScrollText },
  { key: "events", label: "Security Events", icon: Activity },
  { key: "settings", label: "Settings", icon: Clock },
];

// One recipe for the small list rows this screen renders (sessions, events,
// info tiles). Page-level shells are SectionCard; these are items *inside* a
// card, which no anset covers.
const ROW_SHELL =
  "rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]";

/* --------------------- perf hooks: cache, debounce, paging --------------------- */

// Module-level cache: data survives tab switches within the SPA session, so
// re-opening a tab renders instantly instead of refetching. This is why the
// screen keeps its own fetch hooks instead of useAdminResource — that hook has
// no cross-mount cache, no cursor paging, and cannot POST.
const pageCache = new Map();
export function clearSecurityCache() {
  pageCache.clear();
}

// Operator-facing copy for a failed request. Raw transport strings like
// "Request failed (401)" tell a super admin nothing actionable.
function describeRequestError(status, serverMessage) {
  if (status === 401)
    return "Your session has expired or is no longer authorized. Sign in again, then retry.";
  if (status === 403)
    return "You do not have permission to view this security data. Super Admin access is required.";
  if (status === 404) return "This security endpoint is unavailable. Please try again.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status >= 500)
    return "The security service is temporarily unavailable. Please try again.";
  return serverMessage || "Couldn't complete the request. Please try again.";
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Single-shot cached fetch (settings / sessions / overview).
function useCached(key, fetcher) {
  const [data, setData] = useState(() => pageCache.get(key));
  const [loading, setLoading] = useState(() => !pageCache.has(key));
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await fetcher();
      pageCache.set(key, d);
      setData(d);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [key, fetcher]);
  useEffect(() => {
    if (!pageCache.has(key)) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { data, loading, error, refresh, setData };
}

// Cursor-paginated, cached list (audit / events).
function usePaged(key, fetchPage) {
  const cached = pageCache.get(key);
  const [items, setItems] = useState(() => cached?.items || []);
  const [cursor, setCursor] = useState(() => cached?.cursor ?? null);
  const [hasMore, setHasMore] = useState(() => cached?.hasMore ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loadedRef = useRef(Boolean(cached?.loaded));

  const load = useCallback(
    async (reset) => {
      setLoading(true);
      setError("");
      try {
        const cur = reset ? null : cursor;
        const { items: fresh, nextCursor } = await fetchPage(cur);
        const merged = reset ? fresh : [...items, ...fresh];
        setItems(merged);
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
        pageCache.set(key, { items: merged, cursor: nextCursor, hasMore: Boolean(nextCursor), loaded: true });
        loadedRef.current = true;
      } catch (e) {
        setError(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [cursor, items, fetchPage, key],
  );

  useEffect(() => {
    if (!loadedRef.current) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, hasMore, loading, error, loadMore: () => load(false), reload: () => load(true) };
}

export default function SecurityPage() {
  const { isSuperAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The section lives in the URL rather than in component state, so a super
  // admin can bookmark or share "Sessions & Devices", the back button steps
  // between sections, and the sidebar can list them as child items. An unknown
  // or missing ?tab= falls back to the first section.
  const requestedTab = searchParams.get("tab");
  const tab = TABS.some((t) => t.key === requestedTab) ? requestedTab : "overview";

  const setTab = useCallback(
    (nextTab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      // replace, not push: flipping between sections should not bury the page
      // the operator arrived from under five history entries.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Stable: reads the token from the firebase auth singleton, so it does NOT
  // change identity on token refresh / context re-render (which previously made
  // every data effect re-fire in a loop).
  const authFetch = useCallback(async (url, options = {}) => {
    const u = auth.currentUser;
    const token = u ? await u.getIdToken() : "local-dev-admin-token";
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(describeRequestError(res.status, data?.error));
      err.status = res.status;
      throw err;
    }
    return data;
  }, []);

  if (loading) {
    return (
      <PageShell>
        <LoadingState variant="detail" />
      </PageShell>
    );
  }
  if (!isSuperAdmin) {
    return (
      <PageShell>
        <ErrorState
          title="Super Admin only"
          message="Security, audit logs, and device management are restricted to Super Admins."
        />
      </PageShell>
    );
  }

  // The sections are deep-linkable and listed as sidebar children, so every one
  // except the landing section gets a trail back to it.
  const current = TABS.find((t) => t.key === tab);
  const breadcrumbs =
    tab === "overview"
      ? undefined
      : [{ label: "Security", href: "/security" }, { label: current.label }];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Platform Security"
        icon={ShieldCheck}
        title="Security & Audit"
        description="Track every login, device, session, and admin action. Enforce device limits, idle timeouts, and forced logout across the platform."
        breadcrumbs={breadcrumbs}
      >
        <nav
          aria-label="Security sections"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-150 ${FOCUS_RING} ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    active ? "bg-white/15" : "bg-[var(--surface-soft)]"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="block truncate text-sm font-semibold">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </PageHeader>

      {/* AdminLayout already owns the page's <main>; this is just the section
          body, remounted per tab so the entry animation replays. */}
      <div key={tab} className="animate-slide-in space-y-4">
        {tab === "overview" && <OverviewTab authFetch={authFetch} />}
        {tab === "sessions" && <SessionsTab authFetch={authFetch} />}
        {tab === "audit" && <AuditTab authFetch={authFetch} />}
        {tab === "events" && <EventsTab authFetch={authFetch} />}
        {tab === "settings" && <SettingsTab authFetch={authFetch} />}
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--page)]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */

function OverviewTab({ authFetch }) {
  const fetcher = useCallback(async () => {
    const [s, e, cfg] = await Promise.all([
      authFetch("/api/security/sessions"),
      authFetch("/api/security/events?limit=50"),
      authFetch("/api/security/settings"),
    ]);
    const sessions = s.sessions || [];
    const events = e.events || [];
    return {
      activeSessions: sessions.filter((x) => x.status === "active").length,
      totalSessions: sessions.length,
      suspicious: events.filter((x) => x.riskLevel === "high" || x.riskLevel === "medium").length,
      failed: events.filter((x) => x.type === "login.failed" || x.type === "login.rate_limited").length,
      settings: cfg,
    };
  }, [authFetch]);
  const { data, loading, error, refresh } = useCached("overview", fetcher);

  // StatGrid keys each tile off `label`, so no `key` field is passed here — it
  // would end up spread onto StatTile and React 19 warns about that.
  const stats = data
    ? [
        {
          label: "Active Sessions",
          value: data.activeSessions,
          icon: Laptop,
          tone: "primary",
        },
        {
          label: "Suspicious Logins",
          value: data.suspicious,
          icon: AlertTriangle,
          tone: data.suspicious ? "warning" : "default",
        },
        {
          label: "Failed / Blocked",
          value: data.failed,
          icon: LogOut,
          tone: data.failed ? "danger" : "default",
        },
        {
          label: "Device Limit",
          value: data.settings?.deviceLimit ?? "—",
          icon: Smartphone,
        },
        {
          label: "Idle Timeout",
          value:
            data.settings?.idleTimeoutMinutes != null
              ? `${data.settings.idleTimeoutMinutes}m`
              : "—",
          icon: Clock,
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <MyLocationCard authFetch={authFetch} />

      <DataState
        loading={loading && !data}
        error={error}
        isEmpty={!data}
        onRetry={refresh}
        loadingVariant="stats"
        empty={
          <EmptyState
            icon={ShieldCheck}
            title="No security overview yet"
            description="Session, login and policy figures appear here once the security service has recorded activity."
          />
        }
      >
        <div className="space-y-4">
          <StatGrid items={stats} columns={4} />

          <SectionCard title="Privacy & Security policy">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Active policy version{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {data?.settings?.policyVersion}
              </span>
              . Admins consent to security data collection on first login and re-consent after any
              policy update.
            </p>
          </SectionCard>
        </div>
      </DataState>
    </div>
  );
}

/* ----------------------- My session & live location ----------------------- */

function MyLocationCard({ authFetch }) {
  const [session, setSession] = useState(null);
  const [live, setLive] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | locating | done | error
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const [sessionError, setSessionError] = useState(null);

  const loadSession = useCallback(() => {
    setSessionError(null);
    authFetch("/api/security/session/current")
      .then((d) => setSession(d.session))
      .catch(() => {
        // Swallowing this rendered "This device: —", "Session risk: —" with no
        // explanation, so a 401/500 looked like "we have no data about you"
        // rather than "we could not ask".
        setSession(null);
        setSessionError("Couldn't load this device's session.");
      });
  }, [authFetch]);

  useEffect(() => loadSession(), [loadSession]);

  const applyResult = useCallback(
    async (result) => {
      setLive(result);
      setStatus("done");
      // Fire-and-forget record; do NOT re-fetch the session afterwards (that
      // created a current<->location request cycle).
      try {
        if (session?.id) {
          await authFetch("/api/security/session/location", {
            method: "POST",
            body: JSON.stringify({ sessionId: session.id, ...result }),
          });
        }
      } catch {
        /* recording is best-effort */
      }
    },
    [authFetch, session],
  );

  // Network/IP-based location — works even on localhost (the lookup uses your
  // real public IP, not the ::1 the server sees) and when GPS is blocked.
  const ipLocate = useCallback(
    async (infoNote) => {
      try {
        let j = null;
        try {
          j = await (await fetch("https://ipwho.is/")).json();
        } catch {
          j = null;
        }
        if (!j || j.success === false || j.latitude == null) {
          j = await (await fetch("https://ipapi.co/json/")).json();
        }
        const latitude = j.latitude;
        const longitude = j.longitude;
        const city = j.city || "";
        const region = j.region || j.region_code || "";
        const country = j.country || j.country_name || "";
        const place = [city, region, country].filter(Boolean).join(", ");
        if (latitude == null) throw new Error("no-coords");
        setNote(infoNote || "Approximate location from your network (IP).");
        await applyResult({ latitude, longitude, accuracy: null, place, city, region, country, source: "ip" });
      } catch {
        setError("Could not determine location — GPS was blocked and the network lookup failed.");
        setStatus("error");
      }
    },
    [applyResult],
  );

  const detect = () => {
    setError("");
    setNote("");
    setStatus("locating");

    const insecure = typeof window !== "undefined" && !window.isSecureContext;
    if (typeof navigator === "undefined" || !navigator.geolocation || insecure) {
      ipLocate(insecure ? "Precise GPS needs HTTPS — using network location." : "Browser GPS unavailable — using network location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        let place = "";
        let city = "";
        let region = "";
        let country = "";
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en" } },
          );
          const j = await r.json();
          const a = j.address || {};
          place = j.display_name || "";
          city = a.city || a.town || a.village || a.suburb || a.county || "";
          region = a.state || a.region || "";
          country = a.country || "";
        } catch {
          /* fall back to coordinates only */
        }
        await applyResult({ latitude, longitude, accuracy, place, city, region, country, source: "gps" });
      },
      (err) => {
        // GPS blocked/unavailable → fall back to IP so it still works.
        const why =
          err.code === 1
            ? "GPS permission is blocked (check the site lock icon, Brave Shields, and Windows location settings). Showing network location instead."
            : "Couldn't read GPS — showing network location instead.";
        ipLocate(why);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  };

  const place =
    live?.place ||
    [session?.livePlace, [session?.liveCity, session?.liveRegion, session?.liveCountry].filter(Boolean).join(", ")]
      .filter(Boolean)[0];
  const lat = live?.latitude ?? session?.liveLat;
  const lng = live?.longitude ?? session?.liveLng;
  const approx = [session?.city, session?.region, session?.country].filter(Boolean).join(", ");

  return (
    <SectionCard
      title="My session & live location"
      actions={
        <button
          type="button"
          onClick={detect}
          disabled={status === "locating"}
          className={`inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:opacity-60 ${FOCUS_RING}`}
        >
          {status === "locating" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Detect my live location
        </button>
      }
    >
      {sessionError ? (
        <p
          role="alert"
          className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--danger-text)]"
        >
          {sessionError}
          <button
            type="button"
            onClick={loadSession}
            className="rounded-sm font-semibold text-[var(--primary-text)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            Try again
          </button>
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile icon={Laptop} label="This device" value={session ? session.deviceLabel : "—"} sub={session ? `${session.browser} • ${session.os}` : ""} />
        <InfoTile icon={MapPin} label="Masked IP / approx location" value={session?.ipMasked || "—"} sub={approx || "Approx. location appears when deployed behind a CDN"} />
        <InfoTile
          icon={MapPin}
          label="Live location"
          value={place || (lat != null ? `${lat}, ${lng}` : status === "locating" ? "Locating…" : "Not detected yet")}
          sub={
            live?.source === "ip"
              ? "From your network (IP-based)"
              : live?.accuracy != null
                ? `GPS • ±${Math.round(live.accuracy)} m accuracy`
                : session?.liveAccuracy != null
                  ? `±${session.liveAccuracy} m • updated ${fmtTime(session.locationUpdatedAtMs)}`
                  : "Tap “Detect my live location” to verify tracking"
          }
          tone={place || lat != null ? "primary" : "muted"}
        />
        <InfoTile
          icon={Activity}
          label="Session risk"
          value={session ? `${session.riskLevel} (${session.riskScore})` : "—"}
          sub={session ? `Started ${fmtTime(session.createdAtMs)}` : ""}
          tone={session?.riskLevel === "low" ? "muted" : "warning"}
        />
      </div>
      {(lat != null && lng != null) && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 inline-flex items-center gap-1.5 rounded-sm text-xs font-semibold text-[var(--primary)] hover:underline ${FOCUS_RING}`}
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View on map
        </a>
      )}
      {note && <p className="mt-2 text-xs text-[var(--muted)]">{note}</p>}
      {error && (
        <p role="alert" className="mt-2 text-xs text-[var(--danger-text)]">
          {error}
        </p>
      )}
    </SectionCard>
  );
}

function InfoTile({ icon: Icon, label, value, sub, tone = "muted" }) {
  const toneClass =
    tone === "primary"
      ? "text-[var(--primary)]"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : "text-[var(--muted)]";
  return (
    <div className={ROW_SHELL}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${toneClass}`} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</span>
      </div>
      <p className="mt-1.5 break-words text-sm font-semibold text-[var(--foreground)]">{value}</p>
      {sub && <p className="text-xs text-[var(--muted)]">{sub}</p>}
    </div>
  );
}

/* ----------------------------- Sessions ----------------------------- */

function SessionsTab({ authFetch }) {
  const fetcher = useCallback(async () => {
    const d = await authFetch("/api/security/sessions");
    return d.sessions || [];
  }, [authFetch]);
  const { data: sessions, loading, error, refresh } = useCached("sessions", fetcher);
  const [busy, setBusy] = useState("");
  const [revokeErr, setRevokeErr] = useState("");
  const [failedRevokeId, setFailedRevokeId] = useState("");

  const revoke = async (id) => {
    setBusy(id);
    setRevokeErr("");
    try {
      await authFetch("/api/security/sessions/revoke", {
        method: "POST",
        body: JSON.stringify({ sessionId: id, reason: "forced_logout" }),
      });
      setFailedRevokeId("");
      await refresh();
    } catch (e) {
      setRevokeErr(e.message);
      setFailedRevokeId(id);
    } finally {
      setBusy("");
    }
  };

  const list = sessions || [];
  const active = list.filter((s) => s.status === "active");
  const rest = list.filter((s) => s.status !== "active").slice(0, 30);

  return (
    <div className="space-y-4">
      <SectionCard
        title={sessions && !error ? `Active sessions (${active.length})` : "Active sessions"}
        actions={<RefreshButton onClick={refresh} />}
      >
        {revokeErr ? (
          <InlineError
            message={revokeErr}
            onRetry={failedRevokeId ? () => revoke(failedRevokeId) : undefined}
            retryLabel="Retry logout"
            className="mb-3"
          />
        ) : null}

        <DataState
          loading={loading && !sessions}
          error={error}
          isEmpty={active.length === 0}
          onRetry={refresh}
          rows={3}
          empty={
            <EmptyState
              icon={Laptop}
              title="No active sessions"
              description="Nobody is currently signed in to the admin console."
            />
          }
        >
          <div className="space-y-2">
            {active.map((s) => (
              <SessionRow key={s.id} s={s} onRevoke={() => revoke(s.id)} busy={busy === s.id} />
            ))}
          </div>
        </DataState>
      </SectionCard>

      {/* Hidden while the fetch is failing, so a stale list can never sit next
          to an error as if it were current — the old screen hid everything. */}
      {!error && rest.length > 0 && (
        <SectionCard title="Recent ended sessions">
          <div className="space-y-2">
            {rest.map((s) => (
              <SessionRow key={s.id} s={s} ended />
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function SessionRow({ s, onRevoke, busy, ended }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${ROW_SHELL}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[var(--muted)]">
          {s.deviceType === "mobile" ? (
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Laptop className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            {s.deviceLabel || `${s.browser} on ${s.os}`}
            {s.email ? <span className="ml-2 text-xs font-normal text-[var(--muted)]">{s.email}</span> : null}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">
            {[s.ipMasked, [s.city, s.country].filter(Boolean).join(", ")].filter(Boolean).join(" • ") || "Unknown origin"}
          </p>
          {(s.livePlace || s.liveCity || s.liveLat != null) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-[var(--primary)]">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {s.livePlace ||
                [s.liveCity, s.liveRegion, s.liveCountry].filter(Boolean).join(", ") ||
                `${s.liveLat}, ${s.liveLng}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RiskBadge level={s.riskLevel} />
        {!ended && (
          <button
            type="button"
            onClick={onRevoke}
            disabled={busy}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-2.5 py-1.5 text-xs font-semibold text-[var(--danger-text)] transition hover:opacity-90 disabled:opacity-50 ${FOCUS_RING}`}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Force logout
          </button>
        )}
        {ended && <span className="text-xs text-[var(--muted)]">{s.revokedReason || s.status}</span>}
      </div>
    </div>
  );
}

/* ----------------------------- Audit ----------------------------- */

const AUDIT_COLUMNS = [
  {
    key: "action",
    header: "Action",
    render: (l) => (
      <div className="min-w-0">
        <span className="font-medium text-[var(--foreground)]">{l.action}</span>
        {l.module ? <span className="ml-2 text-xs text-[var(--muted)]">{l.module}</span> : null}
        {l.summary ? <p className="text-xs text-[var(--muted)]">{l.summary}</p> : null}
      </div>
    ),
  },
  {
    key: "actor",
    header: "Admin",
    render: (l) => (
      <span className="text-[var(--muted)]">{l.actorEmail || l.actorUid || "—"}</span>
    ),
  },
  {
    key: "origin",
    header: "Device / Location",
    render: (l) => (
      <span className="text-[var(--muted)]">
        {[l.browser && `${l.browser}/${l.os}`, l.ipMasked, [l.region, l.country].filter(Boolean).join(", ")]
          .filter(Boolean)
          .join(" • ") || "—"}
      </span>
    ),
  },
  {
    key: "when",
    header: "When",
    render: (l) => (
      <span className="whitespace-nowrap text-[var(--muted)]">{fmtTime(l.createdAtMs)}</span>
    ),
  },
];

function AuditTab({ authFetch }) {
  const fetchPage = useCallback(
    async (cursor) => {
      const d = await authFetch(`/api/security/audit?limit=30${cursor ? `&cursor=${cursor}` : ""}`);
      return { items: d.logs || [], nextCursor: d.nextCursor ?? null };
    },
    [authFetch],
  );
  const { items: logs, hasMore, loading, error, loadMore, reload } = usePaged("audit", fetchPage);

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((l) =>
      [l.action, l.module, l.actorEmail, l.summary, l.country].filter(Boolean).some((v) =>
        String(v).toLowerCase().includes(term),
      ),
    );
  }, [logs, debouncedQ]);

  const initialLoading = loading && logs.length === 0;

  return (
    <div className="space-y-4">
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search action, admin, location…"
        count={debouncedQ ? `${filtered.length} of ${logs.length} shown` : `${logs.length} shown`}
        actions={<RefreshButton onClick={reload} />}
      />

      {/* A failed "load more" must not wipe the entries already on screen, so
          the banner sits above the table while the table keeps its rows. With
          nothing loaded the error goes to the table itself, where DataState
          renders it as an error — never as "no audit entries". */}
      {error && logs.length > 0 ? (
        <InlineError message={error} onRetry={reload} />
      ) : null}

      <DataTable
        columns={AUDIT_COLUMNS}
        rows={filtered}
        getRowKey={(l) => l.id}
        loading={initialLoading}
        error={logs.length === 0 ? error : null}
        onRetry={reload}
        caption="Admin audit log entries"
        empty={
          <EmptyState
            icon={ScrollText}
            title={debouncedQ ? "No matching entries" : "No audit entries"}
            description={
              debouncedQ
                ? "No audit entry matches that search. Clear the search to see everything."
                : "Admin actions are recorded here as they happen."
            }
          />
        }
      />

      {hasMore && !debouncedQ ? (
        <div className="flex justify-center">
          <LoadMoreButton loading={loading} onClick={loadMore} />
        </div>
      ) : null}
    </div>
  );
}

/* ----------------------------- Events ----------------------------- */

function EventsTab({ authFetch }) {
  const fetchPage = useCallback(
    async (cursor) => {
      const d = await authFetch(`/api/security/events?limit=30${cursor ? `&cursor=${cursor}` : ""}`);
      return { items: d.events || [], nextCursor: d.nextCursor ?? null };
    },
    [authFetch],
  );
  const { items: events, hasMore, loading, error, loadMore, reload } = usePaged("events", fetchPage);
  const initialLoading = loading && events.length === 0;

  return (
    <SectionCard
      title="Security events"
      actions={<RefreshButton onClick={reload} />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--muted)]">{events.length} shown</span>
          {hasMore ? <LoadMoreButton loading={loading} onClick={loadMore} /> : null}
        </div>
      }
    >
      {error && events.length > 0 ? (
        <InlineError message={error} onRetry={reload} className="mb-3" />
      ) : null}

      <DataState
        loading={initialLoading}
        error={events.length === 0 ? error : null}
        isEmpty={events.length === 0}
        onRetry={reload}
        rows={4}
        empty={
          <EmptyState
            icon={Activity}
            title="No security events yet"
            description="Sign-ins, blocked attempts and risky sessions show up here as they are detected."
          />
        }
      >
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className={`flex items-center justify-between gap-3 ${ROW_SHELL}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {e.type}
                  {e.actorEmail ? (
                    <span className="ml-2 text-xs font-normal text-[var(--muted)]">{e.actorEmail}</span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {[e.summary, e.ipMasked, e.country].filter(Boolean).join(" • ") || fmtTime(e.createdAtMs)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={e.severity} />
                <span className="hidden text-xs text-[var(--muted)] sm:inline">{fmtTime(e.createdAtMs)}</span>
              </div>
            </div>
          ))}
        </div>
      </DataState>
    </SectionCard>
  );
}

/* ----------------------------- Settings ----------------------------- */

function SettingsTab({ authFetch }) {
  const fetcher = useCallback(async () => authFetch("/api/security/settings"), [authFetch]);
  const { data, loading, error: loadError, refresh } = useCached("settings", fetcher);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const next = await authFetch("/api/security/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setForm(next);
      pageCache.set("settings", next);
      pageCache.delete("overview"); // overview shows settings-derived counts
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // The form is the source of truth once it exists, so these two branches guard
  // the fields below rather than going through DataState — a DataState child is
  // still constructed while it is hidden, and `form.deviceLimit` would throw.
  if ((loadError || error) && !form) {
    return <ErrorState message={loadError || error} onRetry={refresh} />;
  }
  if (!form) return <LoadingState variant="detail" />;

  const num = (key, val) => setForm((f) => ({ ...f, [key]: Number(val) }));
  const rl = form.loginRateLimit || {};

  return (
    <SectionCard
      title="Security settings"
      description="These limits apply to every admin session across the platform."
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] disabled:opacity-60 ${FOCUS_RING}`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            Save settings
          </button>
          {saved && (
            <span role="status" className="text-sm text-[var(--success)]">
              Saved
            </span>
          )}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Max devices per admin" value={form.deviceLimit} onChange={(v) => num("deviceLimit", v)} min={1} max={25} />
        <NumberField label="Idle timeout (minutes)" value={form.idleTimeoutMinutes} onChange={(v) => num("idleTimeoutMinutes", v)} min={1} max={480} />
        <NumberField label="Absolute session cap (hours)" value={form.sessionAbsoluteHours} onChange={(v) => num("sessionAbsoluteHours", v)} min={1} max={168} />
        <NumberField
          label="Login attempts before block"
          value={rl.maxAttempts}
          onChange={(v) => setForm((f) => ({ ...f, loginRateLimit: { ...f.loginRateLimit, maxAttempts: Number(v) } }))}
          min={1}
          max={100}
        />
        <NumberField
          label="Login window (minutes)"
          value={rl.windowMinutes}
          onChange={(v) => setForm((f) => ({ ...f, loginRateLimit: { ...f.loginRateLimit, windowMinutes: Number(v) } }))}
          min={1}
          max={120}
        />
        <NumberField label="Policy version" value={form.policyVersion} disabled textValue />
      </div>

      <div className="mt-4 space-y-2">
        <ToggleRow
          label="Suspicious login detection"
          checked={form.suspiciousLoginDetection}
          onChange={(v) => setForm((f) => ({ ...f, suspiciousLoginDetection: v }))}
        />
        <ToggleRow
          label="Require Privacy & Security consent"
          checked={form.forceConsent}
          onChange={(v) => setForm((f) => ({ ...f, forceConsent: v }))}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--danger-text)]">
          {error}
        </p>
      ) : null}
    </SectionCard>
  );
}

/* ----------------------------- shared UI ----------------------------- */

function NumberField({ label, value, onChange, min, max, disabled, textValue }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">{label}</span>
      <input
        type={textValue ? "text" : "number"}
        value={value ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] transition focus:border-[var(--primary)] focus:outline-none disabled:opacity-60 ${FOCUS_RING}`}
      />
    </label>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-left ${FOCUS_RING}`}
    >
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]"
        }`}
      >
        {/* Knob colour is theme-aware: `bg-white` is remapped to --surface by the
            admin compat layer, which made it invisible on the dark track. */}
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
            checked ? "bg-[var(--surface)] left-[18px]" : "bg-[var(--muted)] left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function RiskBadge({ level }) {
  if (!level || level === "low") return null;
  const cls =
    level === "high"
      ? "bg-[var(--danger-soft)] text-[var(--danger-text)]"
      : "bg-[var(--warning-soft)] text-[var(--warning)]";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${cls}`}>{level} risk</span>;
}

function SeverityBadge({ severity }) {
  const map = {
    critical: "bg-[var(--danger-soft)] text-[var(--danger-text)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    info: "bg-[var(--surface)] text-[var(--muted)]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${map[severity] || map.info}`}>
      {severity || "info"}
    </span>
  );
}

function RefreshButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] ${FOCUS_RING}`}
    >
      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Refresh
    </button>
  );
}

function LoadMoreButton({ loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] disabled:opacity-50 ${FOCUS_RING}`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : null}
      Load more
    </button>
  );
}

/**
 * Inline failure banner for an action or a partial failure — the cases where a
 * full-width ErrorState would be wrong because the screen still has content to
 * show. Whole-view failures go through DataState / DataTable instead.
 */
function InlineError({ message, onRetry, retryLabel = "Try again", className = "" }) {
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-start gap-3 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)] ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] ${FOCUS_RING}`}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

function fmtTime(ms) {
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
}
