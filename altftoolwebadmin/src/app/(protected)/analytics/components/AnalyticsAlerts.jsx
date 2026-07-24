import { AlertTriangle, Info, Siren, TriangleAlert } from "lucide-react";

function AlertCard({ tone, title, message }) {
  const toneMap = {
    danger: {
      icon: Siren,
      wrapper: "border-[var(--danger)]/30 bg-[var(--danger-soft)]",
      iconWrap: "bg-[var(--danger)]/15 text-[var(--danger)]",
      text: "text-[var(--foreground)]",
      subtext: "text-[var(--danger)]",
    },
    warning: {
      icon: TriangleAlert,
      wrapper: "border-[var(--warning)]/30 bg-[var(--warning-soft)]",
      iconWrap: "bg-[var(--warning)]/15 text-[var(--warning)]",
      text: "text-[var(--foreground)]",
      subtext: "text-[var(--warning)]",
    },
    info: {
      icon: Info,
      wrapper: "border-[var(--info)]/30 bg-[var(--info-soft)]",
      iconWrap: "bg-[var(--info)]/15 text-[var(--info)]",
      text: "text-[var(--foreground)]",
      subtext: "text-[var(--info)]",
    },
  };

  const meta = toneMap[tone] ?? toneMap.info;
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border p-4 ${meta.wrapper}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-2 ${meta.iconWrap}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className={`text-sm font-semibold ${meta.text}`}>{title}</p>
          <p className={`mt-1 text-sm leading-6 ${meta.subtext}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsAlerts({ alerts, staleDaysThreshold }) {
  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm rounded-md">
        <div className="flex items-center gap-3">
          <div className="border border-[var(--border)] bg-[var(--surface-soft)] p-2 text-[var(--muted)]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Attention center</h2>
            <p className="text-sm text-[var(--muted)]">
              Modules with no detectable update in the last {staleDaysThreshold} days are surfaced here first.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                tone={alert.severity}
                title={alert.title}
                message={alert.message}
              />
            ))
          ) : (
            <div className="border border-[var(--success)]/30 bg-[var(--success-soft)] p-4 text-sm text-[var(--success)]">
              All tracked modules have recorded activity within the freshness window.
            </div>
          )}
        </div>
    </section>
  );
}
