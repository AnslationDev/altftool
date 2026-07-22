import { Book } from "lucide-react";
import { REMEDIES } from "../constants";

export default function RemediesCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
        <Book className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Manglik Dosha Remedies</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {REMEDIES.map((r, i) => (
          <div key={i} className="px-6 py-3">
            <p className="text-sm font-bold text-[var(--foreground)]">{r.title}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
