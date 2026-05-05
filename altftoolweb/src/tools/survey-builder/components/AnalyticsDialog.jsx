"use client";
import React from "react";
import { X, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8A2BE2",
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#FCBAD3",
];

export default function AnalyticsDialog({ open, onClose, survey, responses }) {
  if (!open || !survey) return null;

  const responseCount = responses.filter(
    (r) => r.surveyId === survey.id,
  ).length;
  const surveyResponses = responses.filter((r) => r.surveyId === survey.id);

  // ---------------- CSV EXPORT ----------------
  const handleExportCSV = () => {
    const headers = [
      "Response ID",
      "Submitted At",
      ...survey.questions.map((q) => q.label),
    ];

    const rows = surveyResponses.map((r) => [
      r.id,
      new Date(r.submittedAt).toLocaleString(),
      ...survey.questions.map((q) => {
        const ans = r.answers[q.id];
        return Array.isArray(ans) ? ans.join("; ") : ans || "";
      }),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${c}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${survey.title}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- ANALYTICS ----------------
  const getQuestionAnalytics = (q) => {
    const answers = surveyResponses.map((r) => r.answers[q.id]).filter(Boolean);

    if (q.type === "radio" || q.type === "checkbox") {
      return {
        type: "choice",
        data: q.options.map((opt) => ({
          name: opt,
          value: answers.filter((a) =>
            Array.isArray(a) ? a.includes(opt) : a === opt,
          ).length,
        })),
      };
    }

    if (q.type === "rating") {
      const nums = answers.map(Number).filter((n) => !isNaN(n));
      const avg =
        nums.length > 0
          ? (nums.reduce((x, y) => x + y, 0) / nums.length).toFixed(1)
          : 0;

      return {
        type: "rating",
        avg,
        data: [1, 2, 3, 4, 5].map((r) => ({
          name: `${r} ⭐`,
          value: nums.filter((n) => n === r).length,
        })),
      };
    }

    if (q.type === "short_text" || q.type === "paragraph") {
      return { type: "text", data: answers };
    }

    return null;
  };

  // ---------------- UI ----------------
  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center 
        bg-black/40 backdrop-blur-md
      "
    >
      {/* MODAL CARD */}
      <div
        className="
          w-full max-w-5xl max-h-[90vh] overflow-y-auto
          bg-(--card) border border-(--border)
          rounded-2xl shadow-2xl p-0 animate-fadeIn
        "
      >
        {/* HEADER */}
        <div
          className="
            flex items-center justify-between 
            px-6 py-4 border-b border-(--border)
            bg-(--card)
          "
        >
          <div>
            <h2 className="text-xl font-bold text-(--foreground)">
              📊 Analytics:{" "}
              <span className="text-(--primary)">{survey.title}</span>
            </h2>
            <p className="text-sm text-(--muted-foreground)">
              {responseCount} {responseCount === 1 ? "Response" : "Responses"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              p-2 rounded-lg bg-(--muted) text-(--foreground) 
              hover:bg-(--muted)/80 transition
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* SUMMARY CARDS */}
          <div
            className="
              grid grid-cols-1 sm:grid-cols-3 gap-4 
              bg-(--background) border border-(--border)
              p-4 rounded-xl shadow-sm
            "
          >
            <SummaryCard label="Total Responses" value={responseCount} />
            <SummaryCard label="Questions" value={survey.questions.length} />
            <SummaryCard
              label="Created On"
              value={new Date(survey.createdAt).toLocaleDateString()}
            />
          </div>

          {/* NO RESPONSES */}
          {responseCount === 0 ? (
            <div
              className="
                p-10 text-center border-2 border-dashed border-(--border)
                rounded-xl bg-(--background)
              "
            >
              <p className="text-lg font-semibold text-(--foreground)">
                No responses yet
              </p>
              <p className="text-(--muted-foreground)">
                Share your survey to start collecting responses!
              </p>
            </div>
          ) : (
            // WITH RESPONSES
            <div className="flex flex-col gap-6">
              {survey.questions.map((q, idx) => {
                const a = getQuestionAnalytics(q);
                if (!a) return null;

                return (
                  <div
                    key={q.id}
                    className="
                      bg-(--card) border border-(--border)
                      p-5 rounded-xl shadow-sm
                    "
                  >
                    {/* TITLE */}
                    <h3 className="font-semibold text-lg text-(--foreground)">
                      Q{idx + 1}: {q.label}
                    </h3>

                    <span
                      className="
                        inline-block mt-2 px-3 py-1 rounded-full 
                        text-sm font-semibold border border-(--border)
                        text-(--primary)
                      "
                    >
                      {q.type.replace("_", " ").toUpperCase()}
                    </span>

                    <div className="mt-5">
                      {/* CHOICE BAR CHART */}
                      {a.type === "choice" && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={a.data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="value"
                              fill="var(--primary)"
                              name="Responses"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {/* RATING PIE */}
                      {a.type === "rating" && (
                        <div>
                          <p className="text-center text-xl font-bold text-(--primary) mb-3">
                            ⭐ Average: {a.avg} / 5
                          </p>

                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={a.data}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label
                              >
                                {a.data.map((entry, i) => (
                                  <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* TEXT RESPONSES */}
                      {a.type === "text" && (
                        <div>
                          <p className="text-sm font-semibold text-(--foreground) mb-2">
                            All Responses ({a.data.length}):
                          </p>

                          <div
                            className="
                              max-h-64 overflow-y-auto no-scrollbar
                              bg-(--background) border border-(--border)
                              rounded-lg p-3 space-y-2
                            "
                          >
                            {a.data.map((t, i) => (
                              <div
                                key={i}
                                className="p-3 bg-(--card) border border-(--border) rounded-xl"
                              >
                                <p className="text-(--foreground)">{t}</p>
                                <p className="text-(--muted-foreground) text-xs mt-1">
                                  Response {i + 1}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="
            flex justify-end gap-3 
            px-6 py-4 border-t border-(--border)
            bg-(--card)
          "
        >
          <button
            onClick={handleExportCSV}
            disabled={responseCount === 0}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border)
              text-(--foreground) hover:bg-(--muted) transition disabled:opacity-50
            "
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-lg bg-(--primary) text-(--primary-foreground)
              hover:opacity-90 transition
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* Small Summary Card Component */
function SummaryCard({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-(--primary)">{value}</p>
      <p className="text-sm text-(--muted-foreground)">{label}</p>
    </div>
  );
}
