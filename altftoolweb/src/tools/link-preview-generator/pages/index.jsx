"use client";

import { useState, useEffect } from "react";
import PreviewCard from "../components/PreviewCard";
import ProcessBreakdown from "../components/ProcessBreakdown";
import Features from "../components/Features";

export default function LinkPreview() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved URLs
  useEffect(() => {
    const storedRecent = JSON.parse(localStorage.getItem("recentUrls")) || [];
    setRecent(storedRecent);
  }, []);

  // Save recent URLs
  useEffect(() => {
    localStorage.setItem("recentUrls", JSON.stringify(recent));
  }, [recent]);

  const fetchPreview = async () => {
    if (!url) return;
    setLoading(true);
    setError("");

    try {
      const API_KEY = "dfce90ab55ee1269d5de77b336fcbc1a";
      const res = await fetch(
        `https://api.linkpreview.net/?key=${API_KEY}&q=${encodeURIComponent(url)}`,
      );
      const data = await res.json();

      if (data.error) throw new Error(data.description);

      setPreview(data);

      setRecent((prev) => {
        const newList = [data.url, ...prev.filter((u) => u !== data.url)].slice(
          0,
          5,
        );
        return newList;
      });
    } catch (err) {
      console.error("Failed to fetch link preview:", err);
      setError("Failed to fetch preview. Try a valid URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecentClick = (link) => {
    setUrl(link);
    fetchPreview();
  };

  return (
    <div className="min-h-auto flex flex-col transition-colors duration-500 overflow-x-hidden bg-(--background) text-(--foreground)">
      <main className="grow container mx-auto text-center px-4 mt-10">
        {/* Title */}
        <h2 className="heading ">Generate Website Preview</h2>
        <p className="description mb-6">
          Quickly create rich link previews for any URL shared.
        </p>
        {/* Input Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Paste URL here..."
            className="px-4 py-3 rounded-xl border border-(--border) w-full bg-(--card) text-(--card-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={fetchPreview}
            className="px-8 py-3 cursor-pointer rounded-xl text-(--primary-foreground) bg-(--primary) font-semibold hover:opacity-90 transition-all"
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </div>

        {/* Recent URLs */}
        {recent.length > 0 && (
          <section className="mt-10 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-3 text-(--primary)">
              Recent URLs
            </h3>
            <ul className="flex flex-wrap justify-center gap-3">
              {recent.map((link, i) => (
                <li
                  key={i}
                  onClick={() => handleRecentClick(link)}
                  className="cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all bg-(--muted) text-(--muted-foreground) hover:bg-(--muted-foreground)/20 border border-(--border)"
                >
                  {link.length > 30 ? link.slice(0, 30) + "..." : link}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-3 text-lg font-medium">{error}</p>
        )}

        {/* Preview Card */}
        <PreviewCard data={preview} />

        {/* Process Breakdown */}
        <ProcessBreakdown />

        <Features/>
      </main>
    </div>
  );
}
