import { AlertTriangle, CheckCircle2, Info, Siren, TriangleAlert } from "lucide-react";
import { EmptyState, SectionCard } from "@/ansets";

/**
 * Tone -> tint. The message copy stays on --danger-text / --foreground rather
 * than the raw status hue: --warning and --info on their own soft background
 * are ~1.9:1 and ~2.5:1, which fails AA for body text. The hue keeps carrying
 * the meaning through the icon, border and background.
 */
const TONE_MAP = {
  danger: {
    icon: Siren,
    wrapper: "border-[var(--danger)]/40 bg-[var(--danger-soft)]",
    iconWrap: "bg-[var(--danger)]/15 text-[var(--danger)]",
    message: "text-[var(--danger-text)]",
  },
  warning: {
    icon: TriangleAlert,
    wrapper: "border-[var(--warning)]/40 bg-[var(--warning-soft)]",
    iconWrap: "bg-[var(--warning)]/15 text-[var(--warning)]",
    message: "text-[var(--foreground)]",
  },
  info: {
    icon: Info,
    wrapper: "border-[var(--info)]/40 bg-[var(--info-soft)]",
    iconWrap: "bg-[var(--info)]/15 text-[var(--info)]",
    message: "text-[var(--foreground)]",
  },
};

function AlertCard({ tone, title, message }) {
  const meta = TONE_MAP[tone] ?? TONE_MAP.info;
  const Icon = meta.icon;

  return (
    <div className={`rounded-xl border p-4 ${meta.wrapper}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${meta.iconWrap}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
          <p className={`mt-1 text-sm leading-6 ${meta.message}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsAlerts({ alerts, staleDaysThreshold }) {
  return (
    <SectionCard
      icon={AlertTriangle}
      title="Attention center"
      description={`Modules with no detectable update in the last ${staleDaysThreshold} days are surfaced here first.`}
    >
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              tone={alert.severity}
              title={alert.title}
              message={alert.message}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing needs attention"
          description="All tracked modules have recorded activity within the freshness window."
        />
      )}
    </SectionCard>
  );
}
