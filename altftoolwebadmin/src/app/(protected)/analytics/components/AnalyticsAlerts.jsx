import { AlertTriangle, Info, Siren, TriangleAlert } from "lucide-react";

function AlertCard({ tone, title, message }) {
  const toneMap = {
    danger: {
      icon: Siren,
      wrapper: "border-rose-200 bg-rose-50/70",
      iconWrap: "bg-rose-100 text-rose-600",
      text: "text-rose-900",
      subtext: "text-rose-700",
    },
    warning: {
      icon: TriangleAlert,
      wrapper: "border-amber-200 bg-amber-50/70",
      iconWrap: "bg-amber-100 text-amber-700",
      text: "text-amber-900",
      subtext: "text-amber-700",
    },
    info: {
      icon: Info,
      wrapper: "border-blue-200 bg-blue-50/70",
      iconWrap: "bg-blue-100 text-blue-700",
      text: "text-blue-900",
      subtext: "text-blue-700",
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
    <section className="border border-gray-200 bg-white p-6 shadow-sm rounded-md">
        <div className="flex items-center gap-3">
          <div className="border border-gray-200 bg-gray-100 p-2 text-gray-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Attention center</h2>
            <p className="text-sm text-gray-500">
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
            <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              All tracked modules have recorded activity within the freshness window.
            </div>
          )}
        </div>
    </section>
  );
}
