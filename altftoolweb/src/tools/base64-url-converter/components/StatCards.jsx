import { FileText, FileCheck, ShieldCheck, Timer } from "lucide-react";
import { byteLength, formatBytes } from "../utils/base64url";

const STATUS_META = {
  ready: { value: "Ready", sub: "Waiting for input", tone: "text-slate-900 dark:text-white" },
  success: { value: "Ready", sub: "Cleanly converted", tone: "text-slate-900 dark:text-white" },
  error: { value: "Invalid", sub: "Check input format", tone: "text-rose-600 dark:text-rose-400" },
};

function Card({ icon: Icon, iconBgClass, iconTextClass, label, value, sub, valueClass = "text-slate-900 dark:text-white" }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
      <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBgClass} ${iconTextClass}`}>
        <Icon aria-hidden="true" size={20} className="stroke-[2.2]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`truncate text-lg font-bold tabular-nums leading-tight ${valueClass}`}>{value}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

export default function StatCards({ input, output, status, timeMs }) {
  const statusMeta = STATUS_META[status] || STATUS_META.ready;

  return (
    <section aria-label="Conversion stats" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        icon={FileText}
        iconBgClass="bg-blue-50 dark:bg-blue-950/50"
        iconTextClass="text-blue-600 dark:text-blue-400"
        label="Input Size"
        value={formatBytes(byteLength(input))}
        sub={`${input.length.toLocaleString()} characters`}
      />
      <Card
        icon={FileCheck}
        iconBgClass="bg-emerald-50 dark:bg-emerald-950/50"
        iconTextClass="text-emerald-600 dark:text-emerald-400"
        label="Output Size"
        value={formatBytes(byteLength(output))}
        sub={`${output.length.toLocaleString()} characters`}
      />
      <Card
        icon={ShieldCheck}
        iconBgClass="bg-purple-50 dark:bg-purple-950/50"
        iconTextClass="text-purple-600 dark:text-purple-400"
        label="Conversion Status"
        value={statusMeta.value}
        valueClass={statusMeta.tone}
        sub={statusMeta.sub}
      />
      <Card
        icon={Timer}
        iconBgClass="bg-amber-50 dark:bg-amber-950/50"
        iconTextClass="text-amber-600 dark:text-amber-400"
        label="Processing Time"
        value={`${timeMs} ms`}
        sub="Last run"
      />
    </section>
  );
}
