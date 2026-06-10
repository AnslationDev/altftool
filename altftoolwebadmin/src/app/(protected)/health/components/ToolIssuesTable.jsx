import { Wrench } from "lucide-react";
import { getScoreTone } from "./healthFormatters";

export default function ToolIssuesTable({ tools }) {
  return (
    <section className="border border-gray-200 bg-white shadow-sm rounded-md">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-700">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-950">Tool Quality Queue</h2>
            <p className="mt-1 text-xs text-gray-500">Lowest scoring registry items first</p>
          </div>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="p-6 text-sm text-gray-500">No tool quality issues found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tools.map((tool) => (
                <tr key={tool.slug}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-950">{tool.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{tool.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tool.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${getScoreTone(tool.score)}`}>
                      {tool.score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {tool.issues.map((issue) => (
                        <span
                          key={issue}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
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
