"use client";

import { useContext, useState } from "react";
import { DomainContext } from "../context/DomainContext";
import { fetchWordSuggestions } from "../utils/wordGeneratorApi";
import { X } from "lucide-react";
import DomainEmpty from "./DomainEmpty";

export default function BulkGeneratorButton() {
  const { setSuggestions, filters, setIsLoading, query } = useContext(DomainContext);
  const [loading, setLoading] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareDomains, setCompareDomains] = useState({ d1: "", d2: "" });
  const [comparisonResult, setComparisonResult] = useState(null);

  const generateBulkDomains = async () => {
    if (!query) {
    setSuggestions([]); // this triggers DomainEmpty
  }

    const bulkKeywords = [
      "tech", "app", "cloud", "web", "smart",
      "digital", "next", "pro", "go", "hub"
    ]; // You can add more or make dynamic

    setLoading(true);
    setIsLoading(true);
    setSuggestions([]); // clear current results

    try {
      const allResults = [];

      // Generate domains for each keyword
      for (const kw of bulkKeywords) {
        const results = await fetchWordSuggestions(kw, filters);
        allResults.push(...results);
      }

      setSuggestions(allResults);
    } catch (err) {
      console.error("Bulk generation failed:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  // Improved comparison logic
  const handleCompare = (e) => {
    e.preventDefault();
    const d1 = compareDomains.d1.trim();
    const d2 = compareDomains.d2.trim();
    if (!d1 || !d2) return;

    const getMetrics = (domain) => {
      const sld = domain.split(".")[0];
      const brandScore = Math.floor(Math.random() * 40) + 60; // simulate brand score
      const keywords = sld.split(/(?=[A-Z])|[-_]/);
      return { domain, sld, brandScore, keywords };
    };

    const dm1 = getMetrics(d1);
    const dm2 = getMetrics(d2);

    const result = [
      {
        metric: "Brandability",
        winner: dm1.brandScore >= dm2.brandScore ? dm1.domain : dm2.domain,
      },
      {
        metric: "Memorability",
        winner: dm1.sld.length <= dm2.sld.length ? dm1.domain : dm2.domain,
      },
      {
        metric: "SEO",
        winner: dm1.keywords.length >= dm2.keywords.length ? dm1.domain : dm2.domain,
      },
    ];

    setComparisonResult(result);
  };

  return (
    <div className="flex flex-row mt-6 gap-4">
      <button
        onClick={generateBulkDomains}
        className="px-6 py-4 bg-(--primary) text-white font-semibold rounded-xl shadow-lg flex items-center justify-center transition-all whitespace-nowrap hover:opacity-90 "
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Bulk ideas"}
      </button>

      <button
        className="px-6 py-4 bg-(--primary) text-white font-semibold rounded-xl shadow-lg flex items-center justify-center transition-all whitespace-nowrap hover:opacity-90 "
        onClick={() => setIsCompareOpen(true)}
      >
        Compare Two Domains
      </button>

      {/* Compare Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred Background */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCompareOpen(false)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-(--background) rounded-2xl shadow-2xl max-w-md w-full p-6 z-50">
            <button
              className="absolute top-4 right-4 text-(--foreground)/70 hover:text-(--foreground)"
              onClick={() => setIsCompareOpen(false)}
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Compare Domains</h2>

            <form onSubmit={handleCompare} className="space-y-4">
              <input
                type="text"
                placeholder="Domain 1"
                className="w-full border border-(--border) rounded-lg px-3 py-2 text-(--foreground) bg-(--background)"
                value={compareDomains.d1}
                onChange={(e) =>
                  setCompareDomains({ ...compareDomains, d1: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Domain 2"
                className="w-full border border-(--border) rounded-lg px-3 py-2 text-(--foreground) bg-(--background)"
                value={compareDomains.d2}
                onChange={(e) =>
                  setCompareDomains({ ...compareDomains, d2: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-(--primary) text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Compare
              </button>
            </form>

            {comparisonResult && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-(--foreground)">
                  Comparison Result
                </h3>
                <ul className="space-y-2 text-(--foreground)/80">
                  {comparisonResult.map((r) => (
                    <li key={r.metric}>
                      <span className="font-medium">{r.metric}:</span> {r.winner}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}