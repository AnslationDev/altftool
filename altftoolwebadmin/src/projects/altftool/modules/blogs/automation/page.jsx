"use client";

// ALTF Engine — Content Automation hub (/altftool/blogs/automation).
// Tabs: Overview · Blog Queue · SEO Proposals · Trending · Settings.
// Review-first: blog drafts land in All Blogs as “In review”; SEO proposals
// apply only on approval through the audited SEO config path.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, LayoutDashboard, ListChecks, SearchCheck, Settings2, TrendingUp } from "lucide-react";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import {
  fetchAutomationSettings,
  fetchProposals,
  fetchRuns,
  fetchTopics,
} from "./services/automationService";
import OverviewPanel from "./components/OverviewPanel";
import TopicQueuePanel from "./components/TopicQueuePanel";
import ProposalsPanel from "./components/ProposalsPanel";
import TrendingPanel from "./components/TrendingPanel";
import SettingsPanel from "./components/SettingsPanel";
import { SETTINGS_DEFAULTS } from "./services/automationService";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "queue", label: "Blog Queue", icon: ListChecks },
  { key: "proposals", label: "SEO Proposals", icon: SearchCheck },
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "settings", label: "Settings", icon: Settings2 },
];

export default function AutomationPage() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(SETTINGS_DEFAULTS);
  const [topics, setTopics] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [runs, setRuns] = useState([]);

  const adminEmail = getAuth().currentUser?.email || "";

  const refresh = useCallback(async () => {
    try {
      const [nextSettings, nextTopics, nextProposals, nextRuns] = await Promise.all([
        fetchAutomationSettings(),
        fetchTopics(),
        fetchProposals(),
        fetchRuns(30),
      ]);
      setSettings(nextSettings);
      setTopics(nextTopics);
      setProposals(nextProposals);
      setRuns(nextRuns);
    } catch (error) {
      emitAlert({ type: "error", message: `Failed to load automation data: ${String(error?.message || error)}` });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = useMemo(
    () => ({
      pendingTopics: topics.filter((t) => t.status === "pending").length,
      suggested: topics.filter((t) => t.status === "suggested").length,
      pendingProposals: proposals.filter((p) => p.status === "pending").length,
    }),
    [topics, proposals],
  );

  const laneOff = !settings.blog.enabled && !settings.seo.enabled && !settings.trending.enabled;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-black text-foreground">Content Automation</h1>
            <p className="text-xs text-muted">AI blog drafts + SEO proposals — everything ships through your review.</p>
          </div>
        </div>
      </header>

      {laneOff && !loading ? (
        <div className="rounded-xl border border-warning bg-warning-soft px-4 py-3 text-sm text-warning" role="status">
          All lanes are currently disabled. Turn them on in Settings once the server flag and API keys are configured.
        </div>
      ) : null}

      {(() => {
        if (loading) return null;
        const dayAgo = Date.now() - 86_400_000;
        const recentIssues = runs.filter((r) => {
          const at = r.startedAt?.toDate?.()?.getTime() || 0;
          return at >= dayAgo && (r.status === "error" || (r.failedCount ?? r.failed?.length ?? 0) > 0);
        });
        if (!recentIssues.length) return null;
        const failures = recentIssues.reduce((sum, r) => sum + (r.failedCount ?? r.failed?.length ?? 0) + (r.status === "error" ? 1 : 0), 0);
        return (
          <div className="rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {failures} failure{failures === 1 ? "" : "s"} in the last 24h across {recentIssues.length} run
            {recentIssues.length === 1 ? "" : "s"} — details in Overview → Recent runs. Failed topics can be retried from the Blog Queue.
          </div>
        );
      })()}

      <nav className="flex flex-wrap gap-1.5" role="tablist" aria-label="Automation sections">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          const badge =
            key === "queue" ? counts.pendingTopics : key === "proposals" ? counts.pendingProposals : key === "trending" ? counts.suggested : 0;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-surface text-muted hover:border-primary hover:text-primary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge > 0 ? (
                <span className={`rounded-full px-1.5 text-[10px] font-black ${active ? "bg-primary-foreground/20" : "bg-primary-soft text-primary"}`}>
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading automation data">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-soft" />
          ))}
        </div>
      ) : (
        <>
          {tab === "overview" ? (
            <OverviewPanel
              runs={runs}
              settings={settings}
              pendingTopics={counts.pendingTopics}
              pendingProposals={counts.pendingProposals}
            />
          ) : null}
          {tab === "queue" ? <TopicQueuePanel topics={topics} onRefresh={refresh} adminEmail={adminEmail} /> : null}
          {tab === "proposals" ? <ProposalsPanel proposals={proposals} onRefresh={refresh} adminEmail={adminEmail} /> : null}
          {tab === "trending" ? <TrendingPanel topics={topics} onRefresh={refresh} /> : null}
          {tab === "settings" ? <SettingsPanel settings={settings} onSaved={refresh} /> : null}
        </>
      )}
    </div>
  );
}
