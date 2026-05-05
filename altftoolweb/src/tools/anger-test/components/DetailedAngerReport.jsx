import { ScrollText } from "lucide-react";

export default function DetailedAngerReport({ report }) {

  return (
    <div className="bg-[var(--card)] rounded-2xl p-6 mb-6 border-2 border-[var(--border)]">

      <h3 className="subheading flex items-start gap-2 mb-4 leading-tight">
        <ScrollText size={22} className="text-(--primary) mt-0.5 shrink-0" />
        Detailed Anger Report
      </h3>

      {/* Triggers */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">
          Anger Triggers
        </h4>

        <div className="space-y-3">
          {report.triggers.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>

              <div className="w-full bg-(--border) rounded-full h-2">
                <div
                  className="bg-[var(--primary)] h-2 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control */}
      <div>
        <h4 className="text-lg font-semibold mb-3">
          Anger Control
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          {report.control.map((item, i) => (
            <div
              key={i}
              className="bg-[var(--background)] p-4 rounded-xl border text-center"
            >
              <p className="text-sm text-gray-500">
                {item.label}
              </p>

              <p className="text-lg font-semibold">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}