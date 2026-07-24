import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { formatNumber } from "./healthFormatters";

export default function QaCoverageTable({ qa }) {
  const tools = qa?.tools || [];

  return (
    <section id="tool-health-qa-table" className="rounded-md border border-border bg-surface shadow-sm" data-testid="tool-health-qa-table">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-surface-soft text-muted">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Top {formatNumber(qa?.total)} Tool QA Coverage
            </h2>
            <p className="mt-1 text-xs text-muted">
              Public route health plus explicit browser-flow regression coverage
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded border border-success bg-success-soft px-2.5 py-1 text-success">
            Routes {formatNumber(qa?.routeCovered)}/{formatNumber(qa?.total)}
          </span>
          <span className="rounded border border-border bg-surface-soft px-2.5 py-1 text-muted">
            Browser specs {formatNumber(qa?.functionalCovered)}/{formatNumber(qa?.total)}
          </span>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="p-6 text-sm text-muted">No priority QA data found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-left text-sm">
            <thead className="bg-surface-soft text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Route QA</th>
                <th className="px-4 py-3">Browser-flow spec</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {tools.map((tool) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3 font-bold text-foreground">#{tool.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{tool.name}</p>
                    <p className="mt-1 text-xs text-muted">{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{tool.category}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-border bg-surface-soft px-2 py-1 font-mono text-xs text-foreground">
                      {tool.route}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tool.routeCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-success" aria-label="Route covered" />
                    ) : (
                      <XCircle className="h-4 w-4 text-danger" aria-label="Route missing" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tool.functionalCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-success" aria-label="Browser-flow spec covered" />
                    ) : (
                      <span className="rounded border border-border bg-surface-soft px-2 py-1 text-xs font-semibold text-muted">
                        Route smoke only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
