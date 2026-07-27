"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import { EXAMS, countPosts, entryBasicPay, listSectors, searchExams } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [copied, setCopied] = useState(false);

  const sectors = useMemo(() => listSectors(), []);
  const results = useMemo(() => searchExams({ query, sector }), [query, sector]);
  const postTotal = useMemo(() => countPosts(results), [results]);

  const summary = useMemo(
    () =>
      results
        .map(
          (exam) =>
            `${exam.exam} (${exam.conductedBy})\n` +
            exam.posts
              .map((post) => {
                const basic = entryBasicPay(post.payLevel);
                const pay =
                  post.payLevel != null
                    ? ` — Level ${post.payLevel}${basic ? `, basic ${INR.format(basic)}` : ""}`
                    : "";
                return `  • ${post.title}${pay}`;
              })
              .join("\n"),
        )
        .join("\n\n"),
    [results],
  );

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setQuery("");
    setSector("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Job preference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Exam To Job Mapping Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search major Indian recruitment exams and see the posts they lead to, with 7th CPC pay
          level, entry basic pay and a one-line job profile for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ej-query">
              Search exams and posts
            </label>
            <input
              id="ej-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. income tax, station master, PO"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ej-sector">
              Sector
            </label>
            <select
              id="ej-sector"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              <option value="">All sectors</option>
              {sectors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Matches
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {results.length} exam{results.length === 1 ? "" : "s"} · {postTotal} post
              {postTotal === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={results.length === 0}
              aria-label="Copy the matching exam and post list"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset search and filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      {results.length === 0 ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          No exam matches that search. Try a broader term or clear the sector filter.
        </p>
      ) : (
        results.map((exam) => (
          <section
            key={exam.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-lg font-semibold">{exam.exam}</h2>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="shrink-0 text-[var(--muted-foreground)]">Conducted by:</dt>
                <dd className="font-medium">{exam.conductedBy}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-[var(--muted-foreground)]">Sector:</dt>
                <dd className="font-medium">{exam.sector}</dd>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <dt className="shrink-0 text-[var(--muted-foreground)]">Eligibility:</dt>
                <dd className="font-medium">{exam.eligibility}</dd>
              </div>
            </dl>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Post
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pay level
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Entry basic pay
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Profile
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exam.posts.map((post) => {
                    const basic = entryBasicPay(post.payLevel);
                    return (
                      <tr key={post.title} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2.5 pr-3 font-semibold">{post.title}</td>
                        <td className="py-2.5 pr-3">
                          {post.payLevel != null ? `Level ${post.payLevel}` : "Own scale"}
                        </td>
                        <td className="py-2.5 pr-3">{basic != null ? INR.format(basic) : "—"}</td>
                        <td className="py-2.5 text-[var(--muted-foreground)]">{post.profile}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Basic pay is the 7th CPC pay matrix entry figure — gross salary adds DA,
        HRA and other allowances. Posts, vacancies, eligibility and age limits change with every
        notification, so always verify against the latest official recruitment notice.
      </p>
    </main>
  );
}
