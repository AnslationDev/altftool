"use client";

import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { StatusDot } from "../ui/Badge";

export function TrackingSimulation({ fingerprintId, riskScore, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [animStep, setAnimStep] = useState(0);

  const score = riskScore?.score || 0;

  const simulatedSites = useMemo(
    () => [
      { name: "News Portal", domain: "news-daily.com", icon: "📰", tracked: true },
      { name: "Shopping Site", domain: "shop-online.com", icon: "🛒", tracked: true },
      { name: "Social Network", domain: "social-app.com", icon: "👥", tracked: score > 20 },
      { name: "Video Platform", domain: "watch-videos.com", icon: "🎬", tracked: score > 40 },
      { name: "Finance App", domain: "my-finance.com", icon: "💰", tracked: score > 60 },
      { name: "Travel Booking", domain: "travel-deals.com", icon: "✈️", tracked: score > 75 },
    ],
    [score]
  );

  const trackedCount = simulatedSites.filter((s) => s.tracked).length;
  const shortId = fingerprintId?.slice(0, 24) + "...";
  const handleToggle = () => {
    if (!isOpen) setAnimStep(0);
    setIsOpen((p) => !p);
  };

  // Animate rows only when open
  useEffect(() => {
    if (!isOpen || loading || !fingerprintId) return;
    const timer = setInterval(() => {
      setAnimStep((prev) => (prev < simulatedSites.length ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(timer);
  }, [isOpen, loading, fingerprintId, simulatedSites.length]);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] border-l-4
                    border-l-red-500 rounded-2xl shadow-sm
                    transition-all duration-300 ease-out">

      {/* ── Header — always visible ── */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none
                   hover:bg-[var(--muted)]/40 rounded-2xl transition-colors duration-200"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20
                         flex items-center justify-center text-lg shrink-0">
            👁️
          </div>

          <div>
            <p className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              Tracking Simulation
            </p>

            {/* Quick summary when collapsed */}
            {!isOpen && !loading && fingerprintId && (
              <p className="text-xs text-red-400 font-secondary font-medium mt-0.5">
                Identified on {trackedCount} websites
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-28 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Right: risk badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && riskScore && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-secondary
              ${score >= 70
                ? "text-red-400 bg-red-500/10 border-red-500/20"
                : score >= 30
                ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                : "text-green-400 bg-green-500/10 border-green-500/20"
              }`}>
              {score >= 70 ? "High Risk" : score >= 30 ? "Medium Risk" : "Low Risk"}
            </span>
          )}
          <ChevronDown
            className={`w-6 h-6 text-blue-600
                        transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>

      {/* ─ Expandable Content ─ */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-5">

          {/* Divider */}
          <div className="h-px bg-[var(--border)] mb-4" />

          {/* Loading skeleton */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-10 bg-[var(--muted)] rounded-lg animate-pulse" />
              ))}
            </div>

          ) : (
            <div>
              {/* Tracker headline */}
              <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl
                              bg-red-500/10 border border-red-500/20">
                <span className="text-base">🕵️</span>
                <p className="text-sm font-semibold text-red-400 font-secondary">
                  Tracker identified you on{" "}
                  <span className="text-red-300">{trackedCount} websites</span>
                </p>
              </div>

              {/* Website list */}
              <div className="space-y-1.5 mb-4">
                {simulatedSites.map((site, i) => (
                  <div
                    key={i}
                    className={[
                      "flex items-center justify-between px-3 py-2 rounded-xl",
                      "border transition-all duration-300",
                      i < animStep ? "opacity-100" : "opacity-30",
                      site.tracked
                        ? "bg-red-500/8 border-red-500/15"
                        : "bg-green-500/8 border-green-500/15",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{site.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-[var(--card-foreground)] font-secondary">
                          {site.name}
                        </p>
                        <p className="text-[9px] text-[var(--muted-foreground)] font-secondary">
                          {site.domain}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusDot available={!site.tracked} />
                      <span className={`text-[10px] font-medium font-secondary
                        ${site.tracked ? "text-red-400" : "text-green-400"}`}>
                        {site.tracked ? "Identified" : "Not tracked"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking ID */}
              <div className="p-3 rounded-xl bg-[var(--primary)]/8 border border-[var(--primary)]/15 mb-3">
                <p className="text-[9px] text-[var(--muted-foreground)] font-secondary mb-1.5">
                  🔑 Tracking ID used across all sites:
                </p>
                <p className="text-[10px] font-mono text-[var(--primary)] break-all leading-relaxed">
                  {shortId}
                </p>
              </div>

              {/* Note */}
              <div className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
                  🚫No cookies. No login. No consent. This fingerprint is
                  reconstructed fresh on every page load — and points back to you every time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
