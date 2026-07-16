"use client";

import React, { useState, useEffect } from "react";
import { Network, CheckCircle2, Copy, FileDown, Plus, Trash2, Sliders, Eye } from "lucide-react";

export default function ToolHome() {
  const [urls, setUrls] = useState([
    { loc: "https://www.yourdomain.com/", lastmod: new Date().toISOString().split("T")[0], changefreq: "daily", priority: "1.0" },
    { loc: "https://www.yourdomain.com/about", lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.8" },
    { loc: "https://www.yourdomain.com/contact", lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.5" }
  ]);

  const [newLoc, setNewLoc] = useState("");
  const [newLastmod, setNewLastmod] = useState(new Date().toISOString().split("T")[0]);
  const [newChangefreq, setNewChangefreq] = useState("weekly");
  const [newPriority, setNewPriority] = useState("0.8");

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    urls.forEach((item) => {
      xml += "  <url>\n";
      xml += `    <loc>${item.loc.trim()}</loc>\n`;
      if (item.lastmod) {
        xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
      }
      if (item.changefreq) {
        xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      }
      if (item.priority) {
        xml += `    <priority>${item.priority}</priority>\n`;
      }
      xml += "  </url>\n";
    });

    xml += "</urlset>";
    setOutput(xml);
  }, [urls]);

  const addUrl = (e) => {
    if (e) e.preventDefault();
    if (!newLoc.trim()) return;

    let cleanUrl = newLoc.trim();
    // Add protocol if missing
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }

    setUrls([
      ...urls,
      {
        loc: cleanUrl,
        lastmod: newLastmod,
        changefreq: newChangefreq,
        priority: newPriority
      }
    ]);

    setNewLoc("");
  };

  const removeUrl = (idx) => {
    setUrls(urls.filter((_, i) => i !== idx));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([output], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sitemap.xml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Network className="h-5 w-5 text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Sitemap XML Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Developer, SEO
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Generate SEO-compliant XML sitemaps to optimize search engine indexing. Define Priorities, modification schedules, and download XML.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "SEO Friendly"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="w-full space-y-6">
          
          {/* Builder Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
              <Sliders size={14} className="text-primary" />
              XML URL Configuration
            </h2>

            {/* Form to add URL */}
            <form onSubmit={addUrl} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Location URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Page URL Address
                  </label>
                  <input
                    type="text"
                    required
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="e.g. https://www.yourdomain.com/blog"
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Crawling Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="1.0">1.0 (Home / Primary)</option>
                    <option value="0.9">0.9</option>
                    <option value="0.8">0.8 (Categories / Articles)</option>
                    <option value="0.7">0.7</option>
                    <option value="0.5">0.5 (Utility / Contact)</option>
                    <option value="0.3">0.3</option>
                    <option value="0.1">0.1 (Archives)</option>
                  </select>
                </div>

                {/* Change Frequency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Change Frequency
                  </label>
                  <select
                    value={newChangefreq}
                    onChange={(e) => setNewChangefreq(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="always">Always</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                {/* Last Mod Date */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Last Modified Date
                  </label>
                  <input
                    type="date"
                    value={newLastmod}
                    onChange={(e) => setNewLastmod(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition"
              >
                <Plus size={14} /> Add URL to Sitemap
              </button>
            </form>

            {/* List of URLs */}
            <div className="space-y-3 pt-6 border-t border-border mt-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Configured Pages ({urls.length})
              </label>
              
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {urls.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-soft border border-border text-xs leading-relaxed"
                  >
                    <div className="truncate max-w-[85%] space-y-0.5">
                      <div className="font-mono font-bold text-foreground truncate">{item.loc}</div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground font-semibold">
                        <span>Freq: {item.changefreq}</span>
                        <span>Priority: {item.priority}</span>
                        <span>Mod: {item.lastmod}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUrl(idx)}
                      className="text-muted-foreground hover:text-red-500 transition shrink-0 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Preview Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-primary" />
                File Preview (sitemap.xml)
              </h2>
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  disabled={urls.length === 0}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                >
                  {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={urls.length === 0}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                >
                  {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                  {downloaded ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>

            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full bg-surface-soft border border-border rounded-xl font-mono text-xs leading-relaxed p-4 outline-none resize-none cursor-text animate-fade-in"
            />

            <div className="text-[10px] text-muted-foreground leading-relaxed bg-surface-soft p-3 rounded-lg border border-border/80 font-semibold">
              💡 **SEO Tip:** Place the generated `sitemap.xml` in your domain root, then submit it to Google Search Console to speed up your page crawling.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
