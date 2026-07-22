import { User } from "lucide-react";

export default function PersonForm({ data, onChange }) {
  const handle = (field) => (e) => onChange({ ...data, [field]: e.target.value });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3.5 bg-rose-500/5">
        <User className="h-4 w-4 text-rose-600" />
        <h3 className="text-sm font-bold text-[var(--foreground)]">Your Birth Details</h3>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Name</label>
          <input type="text" value={data.name || ""} onChange={handle("name")}
            placeholder="Your name" maxLength={50}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Day</label>
            <input type="number" min={1} max={31} value={data.day}
              onChange={(e) => onChange({ ...data, day: Math.max(1, Math.min(31, parseInt(e.target.value) || 1)) })}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Month</label>
            <input type="number" min={1} max={12} value={data.month}
              onChange={(e) => onChange({ ...data, month: Math.max(1, Math.min(12, parseInt(e.target.value) || 1)) })}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Year</label>
            <input type="number" min={1900} max={2100} value={data.year}
              onChange={(e) => onChange({ ...data, year: parseInt(e.target.value) || 2000 })}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)]">Birth Time <span className="font-normal">(optional, 24h IST)</span></label>
          <input type="text" value={data.time || ""} onChange={handle("time")}
            placeholder="HH:MM (e.g. 14:30)" maxLength={5}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
        </div>
      </div>
    </div>
  );
}
