"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import Header from "../components/Header";
import PersonForm from "../components/PersonForm";
import MatchScore from "../components/MatchScore";
import KootaDetail from "../components/KootaDetail";
import { calculateAshtakoot } from "../utils/ashtakootCalc";

const now = new Date();
function def(name) {
  return { name: "", day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear(), time: "", lat: 28.6139, lon: 77.209 };
}

export default function AshtakootMatching() {
  const [p1, setP1] = useState(() => def("Person 1"));
  const [p2, setP2] = useState(() => def("Person 2"));
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    if (!calculated) return null;
    return calculateAshtakoot(
      { name: p1.name, date: { year: p1.year, month: p1.month, day: p1.day }, time: p1.time },
      { name: p2.name, date: { year: p2.year, month: p2.month, day: p2.day }, time: p2.time },
    );
  }, [p1, p2, calculated]);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Header />

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <PersonForm label="Person 1" data={p1} onChange={setP1} accentColor="bg-blue-500/5" />
            <PersonForm label="Person 2" data={p2} onChange={setP2} accentColor="bg-rose-500/5" />
          </div>

          <div className="text-center">
            <button
              onClick={() => setCalculated(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.97]"
            >
              <Calculator className="h-4 w-4" />
              Calculate Ashtakoot
            </button>
          </div>

          {result && (
            <>
              <MatchScore result={result} />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="border-b border-[var(--border)] px-6 py-4">
                  <h3 className="text-base font-bold text-[var(--foreground)]">Koota Breakdown</h3>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  {result.kootas.map((k, i) => (
                    <KootaDetail key={i} koota={k} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. Results are for informational purposes.
        </p>
      </div>
    </div>
  );
}
