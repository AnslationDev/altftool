import { AlertCircle, CheckCircle, Info, ShieldCheck } from "lucide-react";

export default function StatusPanels({ messages, stats, history, restoreHistory }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <section className="rounded-3xl p-4 bg-(--card) border border-(--border) shadow-xl">
        <h3 className="font-bold text-(--foreground) flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          Validation
        </h3>
        <div className="space-y-2 max-h-40 overflow-auto">
          {messages.map((message, index) => (
            <div key={`${message.text}-${index}`} className="flex items-start gap-2 text-sm text-(--foreground)">
              {message.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              ) : message.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              )}
              <span className="break-words">{message.text}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex items-start gap-2 text-sm text-(--foreground)">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Valid PHP syntax. No errors detected.</span>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl p-4 bg-(--card) border border-(--border) shadow-xl">
        <h3 className="font-bold text-(--foreground) mb-3">Statistics</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Original Size" value={`${stats.originalSize || 0} B`} />
          <Stat label="Formatted Size" value={`${stats.formattedSize || 0} B`} />
          <Stat label="Lines" value={stats.lines || 0} />
        </div>
      </section>

      <section className="rounded-3xl p-4 bg-(--card) border border-(--border) shadow-xl min-w-0">
        <h3 className="font-bold text-(--foreground) mb-3">History</h3>
        <div className="space-y-2 max-h-40 overflow-auto">
          {history.length ? (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => restoreHistory(item)}
                className="w-full text-left rounded-xl border border-(--border) bg-(--muted)/25 p-3 hover:border-indigo-400 transition cursor-pointer"
              >
                <div className="text-sm font-semibold text-(--foreground) truncate">{item.title}</div>
                <div className="text-xs text-(--secondary)">{item.lines} lines</div>
              </button>
            ))
          ) : (
            <p className="text-sm text-(--secondary)">Recent formatted PHP appears here.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--muted)/25 p-3 min-w-0">
      <div className="text-xs text-(--secondary)">{label}</div>
      <div className="font-bold text-(--foreground) truncate">{value}</div>
    </div>
  );
}
