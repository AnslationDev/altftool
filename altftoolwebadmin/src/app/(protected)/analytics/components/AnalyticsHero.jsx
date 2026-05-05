import {
  ActivitySquare,
  AlertTriangle,
  Clock3,
  Database,
  FolderKanban,
  Layers3,
  ShieldAlert,
} from "lucide-react";
import {
  formatDateTime,
  formatNumber,
} from "@/lib/analytics/analytics.utils";

const CARDS = [
  {
    key: "totalRecords",
    label: "Tracked records",
    icon: Database,
    hint: "Total analyzable records across modules",
  },
  {
    key: "recentAdditions7d",
    label: "Added in 7 days",
    icon: Clock3,
    hint: "Fresh records added this week",
  },
  {
    key: "totalModules",
    label: "Modules in view",
    icon: Layers3,
    hint: "Tracked modules inside the selected scope",
  },
  {
    key: "staleModules",
    label: "Needs attention",
    icon: AlertTriangle,
    hint: "Modules with no update in the last 5 days",
  },
  {
    key: "activeModules24h",
    label: "Active in 24h",
    icon: ActivitySquare,
    hint: "Modules with activity in the last 24 hours",
  },
];

export default function AnalyticsHero({ summary, generatedAt, title, description }) {
  return (
    <section className="overflow-hidden border border-gray-200 bg-white shadow-sm rounded-md">
      <div className="bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
              <FolderKanban className="h-3.5 w-3.5" />
              Global analytics
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-gray-500">
                {description}
              </p>
            </div>
          </div>

          <div className="border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 rounded-md">
            <div className="flex items-center gap-2 font-medium text-gray-800">
              <ShieldAlert className="h-4 w-4" />
              Last refreshed
            </div>
            <p className="mt-1 text-sm text-gray-500">{formatDateTime(generatedAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="border border-gray-200 bg-gray-50 p-4  rounded-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {card.label}
                  </span>
                  <div className="border border-gray-200 bg-white p-2 text-gray-500">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
                  {formatNumber(summary?.[card.key] ?? 0)}
                </p>
                <p className="mt-2 text-sm text-gray-500">{card.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
