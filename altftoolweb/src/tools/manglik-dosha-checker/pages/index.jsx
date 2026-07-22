"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import Header from "../components/Header";
import PersonForm from "../components/PersonForm";
import DoshaResult from "../components/DoshaResult";
import RemediesCard from "../components/RemediesCard";
import { checkManglik } from "../utils/manglikCalc";

const now = new Date();

export default function ManglikChecker() {
  const [data, setData] = useState({
    name: "", day: now.getDate(), month: now.getMonth() + 1,
    year: now.getFullYear(), time: "",
  });
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    if (!calculated) return null;
    return checkManglik({ year: data.year, month: data.month, day: data.day }, data.time);
  }, [data, calculated]);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Header />

        <div className="space-y-6">
          <PersonForm data={data} onChange={setData} />

          <div className="text-center">
            <button
              onClick={() => setCalculated(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.97]"
            >
              <Calculator className="h-4 w-4" />
              Check Manglik Dosha
            </button>
          </div>

          {result && (
            <>
              <DoshaResult result={result} />
              <RemediesCard />
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser using astronomical algorithms. This is for informational purposes only.
        </p>
      </div>
    </div>
  );
}
