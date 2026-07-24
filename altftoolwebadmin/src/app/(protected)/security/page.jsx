"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebaseAuth";

const TABS = [
  { key: "overview", label: "Overview", icon: ShieldCheck },
  { key: "sessions", label: "Sessions & Devices", icon: Laptop },
  { key: "audit", label: "Audit Logs", icon: ScrollText },
  { key: "events", label: "Security Events", icon: Activity },
  { key: "settings", label: "Settings", icon: Clock },
];

/* --------------------- perf hooks: cache, debounce, paging --------------------- */

// Module-level cache: data survives tab switches within the SPA session, so
// re-opening a tab renders instantly instead of refetching.
const pageCache = new Map();
export function clearSecurityCache() {
  pageCache.clear();
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
  const { user, isSuperAdmin, loading } = useAuth();
  const [tab, setTab] = useState("overview");

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
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    return data;
  }, []);

  if (loading) {
    return <CenterState icon={Loader2} spin title="Loading security console" />;
  }
  if (!isSuperAdmin) {
    return (
      <CenterState
        icon={AlertTriangle}
        title="Super Admin only"
        message="Security, audit logs, and device management are restricted to Super Admins."
      />
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <header className="border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Platform Security
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <ShieldCheck className="h-6 w-6 text-primary" /> Security &amp; Audit
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Track every login, device, session, and admin action. Enforce device
            limits, idle timeouts, and forced logout across the platform.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-150 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-surface text-foreground hover:bg-surface-soft"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    active ? "bg-white/15" : "bg-surface-soft"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="block truncate text-sm font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>

        <main key={tab} className="animate-slide-in space-y-4">
          {tab === "overview" && <OverviewTab authFetch={authFetch} />}
          {tab === "sessions" && <SessionsTab authFetch={authFetch} />}
          {tab === "audit" && <AuditTab authFetch={authFetch} />}
          {tab === "events" && <EventsTab authFetch={authFetch} />}
          {tab === "settings" && <SettingsTab authFetch={authFetch} />}
        </main>
      </div>
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
  const { data, loading, error } = useCached("overview", fetcher);

  const cards = data
    ? [
        { label: "Active Sessions", value: data.activeSessions, icon: Laptop, tone: "primary" },
        { label: "Suspicious Logins", value: data.suspicious, icon: AlertTriangle, tone: data.suspicious ? "warning" : "muted" },
        { label: "Failed / Blocked", value: data.failed, icon: LogOut, tone: data.failed ? "danger" : "muted" },
        { label: "Device Limit", value: data.settings.deviceLimit, icon: Smartphone, tone: "muted" },
        { label: "Idle Timeout", value: `${data.settings.idleTimeoutMinutes}m`, icon: Clock, tone: "muted" },
      ]
    : [];

  return (
    <div className="space-y-4">
      <MyLocationCard authFetch={authFetch} />
      {error ? (
        <Panel><ErrorRow message={error} /></Panel>
      ) : !data ? (
        loading ? <Panel><Loading /></Panel> : null
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>
          <Panel title="Privacy & Security policy">
            <p className="text-sm text-muted">
              Active policy version{" "}
              <span className="font-semibold text-foreground">{data.settings.policyVersion}</span>. Admins
              consent to security data collection on first login and re-consent after any policy update.
            </p>
          </Panel>
        </>
      )}
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

  const loadSession = useCallback(() => {
    authFetch("/api/security/session/current")
      .then((d) => setSession(d.session))
      .catch(() => setSession(null));
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
    <Panel
      title="My session & live location"
      action={
        <button
          type="button"
          onClick={detect}
          disabled={status === "locating"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "locating" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
          Detect my live location
        </button>
      }
    >
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
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View on map
        </a>
      )}
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </Panel>
  );
}

function InfoTile({ icon: Icon, label, value, sub, tone = "muted" }) {
  const toneClass = tone === "primary" ? "text-primary" : tone === "warning" ? "text-warning" : "text-muted";
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${toneClass}`} />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      </div>
      <p className="mt-1.5 break-words text-sm font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
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

  const revoke = async (id) => {
    setBusy(id);
    setRevokeErr("");
    try {
      await authFetch("/api/security/sessions/revoke", {
        method: "POST",
        body: JSON.stringify({ sessionId: id, reason: "forced_logout" }),
      });
      await refresh();
    } catch (e) {
      setRevokeErr(e.message);
    } finally {
      setBusy("");
    }
  };

  if (error) return <Panel><ErrorRow message={error} /></Panel>;
  if (!sessions) return <Panel>{loading ? <Loading /> : null}</Panel>;

  const active = sessions.filter((s) => s.status === "active");
  const rest = sessions.filter((s) => s.status !== "active").slice(0, 30);

  return (
    <Panel
      title={`Active sessions (${active.length})`}
      action={<RefreshButton onClick={refresh} />}
    >
      {revokeErr && <ErrorRow message={revokeErr} />}
      {active.length === 0 ? (
        <EmptyRow message="No active sessions." />
      ) : (
        <div className="space-y-2">
          {active.map((s) => (
            <SessionRow key={s.id} s={s} onRevoke={() => revoke(s.id)} busy={busy === s.id} />
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Recent ended sessions
          </p>
          <div className="space-y-2">
            {rest.map((s) => (
              <SessionRow key={s.id} s={s} ended />
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

function SessionRow({ s, onRevoke, busy, ended }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-soft px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-muted">
          {s.deviceType === "mobile" ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {s.deviceLabel || `${s.browser} on ${s.os}`}
            {s.email ? <span className="ml-2 text-xs font-normal text-muted">{s.email}</span> : null}
          </p>
          <p className="truncate text-xs text-muted">
            {[s.ipMasked, [s.city, s.country].filter(Boolean).join(", ")].filter(Boolean).join(" • ") || "Unknown origin"}
          </p>
          {(s.livePlace || s.liveCity || s.liveLat != null) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-medium text-primary">
              <MapPin className="h-3 w-3 shrink-0" />
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-2.5 py-1.5 text-xs font-semibold text-danger transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            Force logout
          </button>
        )}
        {ended && <span className="text-xs text-muted">{s.revokedReason || s.status}</span>}
      </div>
    </div>
  );
}

/* ----------------------------- Audit ----------------------------- */

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
    <Panel
      title="Audit logs"
      action={
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search action, admin, location…"
            className="h-9 w-56 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <RefreshButton onClick={reload} />
        </div>
      }
    >
      {error && <ErrorRow message={error} />}
      {initialLoading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyRow message={debouncedQ ? "No matching entries." : "No audit entries."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-semibold">Action</th>
                <th className="py-2 pr-4 font-semibold">Admin</th>
                <th className="py-2 pr-4 font-semibold">Device / Location</th>
                <th className="py-2 pr-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">
                    <span className="font-medium text-foreground">{l.action}</span>
                    <span className="ml-2 text-xs text-muted">{l.module}</span>
                    {l.summary && <p className="text-xs text-muted">{l.summary}</p>}
                  </td>
                  <td className="py-2 pr-4 text-muted">{l.actorEmail || l.actorUid || "—"}</td>
                  <td className="py-2 pr-4 text-muted">
                    {[l.browser && `${l.browser}/${l.os}`, l.ipMasked, [l.region, l.country].filter(Boolean).join(", ")]
                      .filter(Boolean)
                      .join(" • ") || "—"}
                  </td>
                  <td className="py-2 pr-4 text-muted">{fmtTime(l.createdAtMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <LoadMoreBar count={filtered.length} hasMore={hasMore && !debouncedQ} loading={loading} onClick={loadMore} />
    </Panel>
  );
}

function LoadMoreBar({ count, hasMore, loading, onClick }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs text-muted">{count} shown</span>
      {hasMore && (
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-soft disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Load more
        </button>
      )}
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
    <Panel title="Security events" action={<RefreshButton onClick={reload} />}>
      {error && <ErrorRow message={error} />}
      {initialLoading ? (
        <Loading />
      ) : events.length === 0 ? (
        <EmptyRow message="No security events yet." />
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-soft px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {e.type}
                  {e.actorEmail ? <span className="ml-2 text-xs font-normal text-muted">{e.actorEmail}</span> : null}
                </p>
                <p className="truncate text-xs text-muted">
                  {[e.summary, e.ipMasked, e.country].filter(Boolean).join(" • ") || fmtTime(e.createdAtMs)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={e.severity} />
                <span className="hidden text-xs text-muted sm:inline">{fmtTime(e.createdAtMs)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <LoadMoreBar count={events.length} hasMore={hasMore} loading={loading} onClick={loadMore} />
    </Panel>
  );
}

/* ----------------------------- Settings ----------------------------- */

function SettingsTab({ authFetch }) {
  const fetcher = useCallback(async () => authFetch("/api/security/settings"), [authFetch]);
  const { data, loading, error: loadError } = useCached("settings", fetcher);
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

  if ((loadError || error) && !form) return <Panel><ErrorRow message={loadError || error} /></Panel>;
  if (!form) return <Panel>{loading ? <Loading /> : null}</Panel>;

  const num = (key, val) => setForm((f) => ({ ...f, [key]: Number(val) }));
  const rl = form.loginRateLimit || {};

  return (
    <Panel title="Security settings">
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
        <NumberField label="" value={form.policyVersion} disabled labelNode="Policy version" textValue />
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

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Save settings
        </button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </Panel>
  );
}

/* ----------------------------- shared UI ----------------------------- */

function Panel({ title, action, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-bold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function StatCard({ label, value, icon: Icon, tone = "muted" }) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-muted";
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function NumberField({ label, labelNode, value, onChange, min, max, disabled, textValue }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{labelNode || label}</span>
      <input
        type={textValue ? "text" : "number"}
        value={value ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
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
      className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-soft px-3 py-2.5 text-left"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border-strong"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

function RiskBadge({ level }) {
  if (!level || level === "low") return null;
  const cls = level === "high" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${cls}`}>{level} risk</span>;
}

function SeverityBadge({ severity }) {
  const map = {
    critical: "bg-danger-soft text-danger",
    warning: "bg-warning-soft text-warning",
    info: "bg-surface text-muted",
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-soft"
    >
      <RefreshCw className="h-3.5 w-3.5" /> Refresh
    </button>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}

function EmptyRow({ message }) {
  return <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">{message}</p>;
}

function ErrorRow({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function CenterState({ icon: Icon, title, message, spin }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-page p-6">
      <div className="max-w-sm rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <Icon className={`mx-auto h-7 w-7 text-primary ${spin ? "animate-spin" : ""}`} />
        <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
        {message && <p className="mt-1 text-sm text-muted">{message}</p>}
      </div>
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
