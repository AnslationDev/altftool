import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { formatNumber } from "./healthFormatters";

export default function QaCoverageTable({ qa }) {
  const tools = qa?.tools || [];

  return (
    <section id="tool-health-qa-table" className="border border-gray-200 bg-white shadow-sm rounded-md" data-testid="tool-health-qa-table">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-950">Top 40 Tool QA Coverage</h2>
            <p className="mt-1 text-xs text-gray-500">Public route health plus deeper functional flow coverage</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
            Routes {formatNumber(qa?.routeCovered)}/{formatNumber(qa?.total)}
          </span>
          <span className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-gray-700">
            Functional {formatNumber(qa?.functionalCovered)}
          </span>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No priority QA data found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Route QA</th>
                <th className="px-4 py-3">Functional QA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tools.map((tool) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3 font-bold text-gray-950">#{tool.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-950">{tool.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tool.category}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700">
                      {tool.route}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tool.routeCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Route covered" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600" aria-label="Route missing" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tool.functionalCovered ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Functional flow covered" />
                    ) : (
                      <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500">
                        Route smoke
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
