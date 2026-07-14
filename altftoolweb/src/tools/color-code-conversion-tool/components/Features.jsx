import { ClipboardCheck, History, Pipette, RefreshCw } from "lucide-react";

const features = [
  ["Auto Detection", "Detects supported formats while you type and normalizes every output.", RefreshCw],
  ["Live Preview", "Renders the actual color immediately with readable foreground checks.", Pipette],
  ["Copy Workflow", "Every converted value can be copied with a visible success state.", ClipboardCheck],
  ["Recent Colors", "Valid conversions are stored locally for quick recall.", History],
];

export default function Features() {
  return (
    <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {features.map(([title, description, Icon]) => (
        <div key={title} className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="mb-3 inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2">
            <Icon className="h-4 w-4 text-cyan-500" />
          </div>
          <h3 className="break-words text-sm font-black text-[var(--foreground)]">{title}</h3>
          <p className="mt-1 break-words text-xs leading-5 text-[var(--muted-foreground)] [overflow-wrap:anywhere]">{description}</p>
        </div>
      ))}
    </section>
  );
}
