"use client";
import React, { useState } from "react";
import {
  Zap,
  Globe,
  TrendingUp,
  Clock,
  Database,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import Features from "./Features";

export default function MainComponent() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  async function handleClick() {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setResult(null);
    setLoading(true);

    const apiKey = "AIzaSyAk6IN1Ocfe3hI03P7qC0Fv6QhsIHSUCKk";
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url,
    )}&key=${apiKey}`;

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      setResult(data);

      const audits = Object.values(data.lighthouseResult.audits);
      const topSuggestions = audits
        .filter(
          (audit) =>
            audit.score !== null &&
            audit.score < 1 &&
            audit.title &&
            audit.description,
        )
        .slice(0, 5)
        .map((audit) => ({
          title: audit.title,
          description: audit.description.replace(/\[.*?\]\(.*?\)/g, "").trim(),
        }));

      setSuggestions(topSuggestions);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error analyzing website. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-orange-400";
    return "text-red-500";
  };

  const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="border border-(--border) rounded-xl overflow-hidden transition-all">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center px-4 py-4 bg-(--background) hover:bg-(--muted) transition"
        >
          <span className="font-medium text-(--foreground)">{question}</span>

          <span
            className={`text-xl font-bold transition-transform ${
              open ? "rotate-45 text-(--primary)" : "text-(--muted-foreground)"
            }`}
          >
            +
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden px-4 pb-4 text-(--muted-foreground) text-sm">
            {answer}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-5">
      {/* Header */}
      <div className="p-6 rounded-xl   ">
        <div className="text-center">
          {/* <Zap className="w-12 h-12 text-(--primary) mx-auto mb-4" /> */}
          <h2 className="heading">Web Speed Checker</h2>
          <p className="description">
            Test your website performance and get actionable insights.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-(--card) border border-(--border) p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="
                w-full rounded-xl px-6 py-4
                bg-(--background)
                border border-(--border)
                text-(--foreground)
                placeholder:text-(--muted-foreground)
                focus:outline-none focus:ring-2 focus:ring-(--primary)
              "
            />

            <button
              onClick={handleClick}
              disabled={loading}
              className="
                px-8 py-4 rounded-xl
                bg-(--primary) text-(--primary-foreground)
                hover:bg-(--primary)/90
                disabled:opacity-60
                font-semibold flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-(--border)/30 border-t-(--foreground) rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Check Speed
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-(--primary)/40 border-t-(--primary) rounded-full animate-spin" />
            <p className="text-(--primary) font-medium">
              Analyzing website performance...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Metrics */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-(--foreground) text-center mb-8">
              Performance Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Performance Score */}
              <div className="p-6 bg-(--card) border border-(--border) rounded-xl hover:border-(--primary)/60 transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-(--primary)/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-(--primary)" />
                  </div>
                  <span className="text-(--muted-foreground)">
                    Performance Score
                  </span>
                </div>

                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    result.lighthouseResult.categories.performance.score * 100,
                  )}`}
                >
                  {Math.round(
                    result.lighthouseResult.categories.performance.score * 100,
                  )}
                </div>
              </div>

              {/* Load Time */}
              <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-(--primary)/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-(--primary)" />
                  </div>
                  <span className="text-(--muted-foreground)">Load Time</span>
                </div>

                <div className="text-4xl font-bold text-(--foreground)">
                  {result.lighthouseResult.audits["largest-contentful-paint"]
                    ?.displayValue || "--"}
                </div>
              </div>

              {/* Page Size */}
              <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-(--primary)/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-(--primary)" />
                  </div>
                  <span className="text-(--muted-foreground)">Page Size</span>
                </div>

                <div className="text-4xl font-bold text-(--foreground)">
                  {result.lighthouseResult.audits["total-byte-weight"]
                    ?.displayValue || "--"}
                </div>
              </div>

              {/* Requests */}
              <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-(--primary)/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-(--primary)" />
                  </div>
                  <span className="text-(--muted-foreground)">Requests</span>
                </div>

                <div className="text-4xl font-bold text-(--foreground)">
                  {result.lighthouseResult.audits["network-requests"]?.details
                    ?.items?.length || "--"}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-8 bg-(--card) border border-(--border) rounded-xl">
              <h2 className="text-2xl font-bold text-(--foreground) mb-6">
                Optimization Suggestions
              </h2>

              <div className="space-y-4">
                {suggestions.map((item, i) => (
                  <div
                    key={i}
                    className="p-6 bg-(--muted) border border-(--border) rounded-xl"
                  >
                    <h3 className="text-(--primary) font-semibold flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-(--primary)/20 rounded-full flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {item.title}
                    </h3>

                    <p className="text-(--muted-foreground) text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* FAQ */}
      <div className="p-6 bg-(--card) border border-(--border) rounded-xl">
      <Features/>
      </div>
    </div>
  );
}
