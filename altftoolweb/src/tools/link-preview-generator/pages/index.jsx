"use client";

import { useState, useEffect, useRef } from "react";
import PreviewCard from "../components/PreviewCard";
import ProcessBreakdown from "../components/ProcessBreakdown";
import Features from "../components/Features";

export default function LinkPreview() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  // Load saved URLs
  useEffect(() => {
    const storedRecent = JSON.parse(localStorage.getItem("recentUrls")) || [];
    setRecent(storedRecent);
  }, []);

  // Save recent URLs
  useEffect(() => {
    localStorage.setItem("recentUrls", JSON.stringify(recent));
  }, [recent]);

  // Accepts an optional explicit URL so callers (e.g. the Recent-URLs list)
  // don't race the `url` state, which only updates on the next render.
  const fetchPreview = async (targetUrl) => {
    const effectiveUrl = targetUrl ?? url;
    if (!effectiveUrl || loading) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/tools/link-preview?url=${encodeURIComponent(effectiveUrl)}`,
      );
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.description || data.error);

      // Discard this response if a newer request has since been issued.
      if (requestId !== requestIdRef.current) return;

      setPreview(data);

      setRecent((prev) => {
        const newList = [data.url, ...prev.filter((u) => u !== data.url)].slice(
          0,
          5,
        );
        return newList;
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to fetch link preview:", err);
      setError("Failed to fetch preview. Try a valid URL.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const handleRecentClick = (link) => {
    setUrl(link);
    fetchPreview(link);
  };

  const handleRecentKeyDown = (event, link) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRecentClick(link);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto"
        >
          <input
            type="text"
            placeholder="Paste URL here..."
            className="px-4 py-3 rounded-xl border border-(--border) w-full bg-(--card) text-(--card-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 cursor-pointer rounded-xl text-(--primary-foreground) bg-(--primary) font-semibold hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Generate"}
          </button>
        </form>

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
                  onKeyDown={(event) => handleRecentKeyDown(event, link)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Generate preview for ${link}`}
                  className="cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all bg-(--muted) text-(--muted-foreground) hover:bg-(--muted-foreground)/20 border border-(--border) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                >
                  {link.length > 30 ? link.slice(0, 30) + "..." : link}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Error */}
        {error && (
          <p
            role="status"
            aria-live="polite"
            className="text-red-500 mt-3 text-lg font-medium"
          >
            {error}
          </p>
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
