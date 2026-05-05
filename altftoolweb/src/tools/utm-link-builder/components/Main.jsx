"use client";

import { useState, useEffect } from "react";
import { Copy, Info, LinkIcon } from "lucide-react";
// import { toast } from "sonner"; // ❌ not installed – kept for future use
import HeroSection from "./HeroSection";

/* ---------------------------------------------
   Tooltip (simple, no shadcn)
--------------------------------------------- */
const Tooltip = ({ text }) => (
  <span className="relative group cursor-help">
    <Info className="w-4 h-4 text-(--muted-foreground)" />
    <span className="absolute z-20 hidden group-hover:block top-full mt-2 w-64 rounded-md bg-(--card) border border-(--border) p-2 text-xs text-(--foreground) shadow-lg">
      {text}
    </span>
  </span>
);

/* ---------------------------------------------
   Tooltips Content
--------------------------------------------- */
const tooltips = {
  baseUrl: "The full website URL (destination) where you want to send traffic",
  utm_source:
    "Identifies the source of traffic (e.g., google, newsletter, facebook)",
  utm_medium: "The marketing medium (e.g., cpc, email, social)",
  utm_campaign:
    "The specific campaign name (e.g., spring_sale, product_launch)",
  utm_id: "Campaign ID for analytics platforms",
  utm_term: "Paid search keywords or terms",
  utm_content: "Differentiate similar content or links",
};

/* ---------------------------------------------
   MAIN COMPONENT
--------------------------------------------- */
const MainComponent = () => {
  const [params, setParams] = useState({
    baseUrl: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_id: "",
    utm_term: "",
    utm_content: "",
  });

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const validateUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const normalizeValue = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

  const generateUrl = () => {
    if (
      !params.baseUrl ||
      !params.utm_source ||
      !params.utm_medium ||
      !params.utm_campaign
    ) {
      setGeneratedUrl("");
      return;
    }

    if (!validateUrl(params.baseUrl)) {
      setGeneratedUrl("");
      return;
    }

    try {
      const url = new URL(params.baseUrl);

      const utms = {
        utm_source: normalizeValue(params.utm_source),
        utm_medium: normalizeValue(params.utm_medium),
        utm_campaign: normalizeValue(params.utm_campaign),
        utm_id: normalizeValue(params.utm_id),
        utm_term: normalizeValue(params.utm_term),
        utm_content: normalizeValue(params.utm_content),
      };

      Object.entries(utms).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });

      setGeneratedUrl(url.toString());
    } catch {
      setGeneratedUrl("");
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) {
      alert("Please generate a URL first");
      // toast.error("Please generate a URL first");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      alert("URL copied to clipboard!");
      // toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy URL");
      // toast.error("Failed to copy URL");
    }
  };

  const handleChange = (key, value) => {
    setParams((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <HeroSection />

      {/* Builder */}
      <section id="builder" className="py-16 px-4 bg-(--muted) ">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* FORM */}
          <div className="p-6 bg-(--card) border border-(--border) rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-(--primary)" />
              Campaign Details
            </h3>

            {[
              [
                "baseUrl",
                "Base URL *",
                "https://example.com",
                tooltips.baseUrl,
              ],
              [
                "utm_source",
                "Campaign Source *",
                "google",
                tooltips.utm_source,
              ],
              ["utm_medium", "Campaign Medium *", "email", tooltips.utm_medium],
              [
                "utm_campaign",
                "Campaign Name *",
                "spring_sale",
                tooltips.utm_campaign,
              ],
              ["utm_id", "Campaign ID", "campaign_123", tooltips.utm_id],
              ["utm_term", "Campaign Term", "running_shoes", tooltips.utm_term],
              [
                "utm_content",
                "Campaign Content",
                "header_cta",
                tooltips.utm_content,
              ],
            ].map(([key, label, placeholder, tip]) => (
              <div key={key} className="mb-4">
                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                  {label}
                  <Tooltip text={tip} />
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg bg-(--background) border border-(--border) focus:outline-none focus:ring-2 focus:ring-(--primary)"
                  placeholder={placeholder}
                  value={params[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* RESULT */}
          <div className="p-6 bg-(--card) border border-(--border) rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Copy className="w-5 h-5 text-(--primary)" />
              Generated URL
            </h3>

            {generatedUrl ? (
              <>
                <div className="p-4 rounded-lg bg-(--background) border border-(--border) break-all text-sm font-mono">
                  {generatedUrl}
                </div>

                <button
                  onClick={handleCopy}
                  className="mt-4 w-full py-3 rounded-lg bg-(--primary) text-(--primary-foreground) font-semibold hover:opacity-90 transition"
                >
                  {copied ? "Copied!" : "Copy URL"}
                </button>
              </>
            ) : (
              <div className="text-center py-12 text-(--muted-foreground)">
                Fill required fields to generate URL
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainComponent;
