// components/MoveHistory.jsx
"use client";

import { buildHistoryRows } from "../utils/game-utils";

export default function MoveHistory({ history }) {
  const rows = buildHistoryRows(history);
  const lastIndex = history.length - 1;

  return (
    <div className="flex flex-col rounded-xl border border-(--border) bg-(--card) p-3">
      <h3 className="mb-2 text-sm font-semibold text-(--foreground)">Moves</h3>
      <div className="max-h-64 overflow-y-auto pr-1 text-sm">
        {rows.length === 0 ? (
          <p className="text-xs text-(--muted-foreground)">No moves yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((row) => (
                <tr key={row.no} className="font-mono">
                  <td className="w-8 py-0.5 pr-2 text-(--muted-foreground)">
                    {row.no}.
                  </td>
                  <td
                    className={`py-0.5 pr-2 ${
                      lastIndex === (row.no - 1) * 2
                        ? "font-bold text-(--primary)"
                        : "text-(--foreground)"
                    }`}
                  >
                    {row.white}
                  </td>
                  <td
                    className={`py-0.5 ${
                      lastIndex === (row.no - 1) * 2 + 1
                        ? "font-bold text-(--primary)"
                        : "text-(--foreground)"
                    }`}
                  >
                    {row.black ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
