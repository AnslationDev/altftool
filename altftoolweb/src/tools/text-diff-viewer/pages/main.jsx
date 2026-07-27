"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@altftool/ui";
import { Search, X, BarChart3 } from "lucide-react";
import { useDiff } from "../hooks/useDiff";
import EditorPanel from "../components/EditorPanel";
import DiffViewer from "../components/DiffViewer";
import TimelineSidebar from "../components/TimelineSidebar";
import Toolbar from "../components/Toolbar";
import AnalyticsPanel from "../components/AnalyticsPanel";
import ExportDialog from "../components/ExportDialog";
import { copyToClipboard } from "../utils/helpers";

export default function TextDiffViewerPage() {
  const diff = useDiff();
  const [showExport, setShowExport] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const handleExport = useCallback(() => setShowExport(true), []);
  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Text Diff Viewer", text: "Check out this diff comparison", url });
    } else {
      copyToClipboard(url);
      diff.showToast("Link copied!");
    }
  }, [diff]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const name = prompt("Version name:");
        if (name) diff.saveVersion(name);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) diff.redo();
        else diff.undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        diff.setShowSearch(!diff.showSearch);
      }
      if (e.key === "Escape") {
        diff.setShowSearch(false);
        diff.setShowAnalytics(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [diff]);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Text Diff Viewer</h1>
            <p className="text-sm text-(--muted-foreground) mt-1">Compare text versions side-by-side with analytics and version history.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--muted) border border-(--border) text-xs text-(--muted-foreground)">
              <BarChart3 size="14" />
              <span>{diff.stats.similarity}% similar</span>
            </div>
          </div>
        </div>

        <Toolbar
          viewMode={diff.viewMode}
          setViewMode={diff.setViewMode}
          diffMode={diff.diffMode}
          setDiffMode={diff.setDiffMode}
          ignoreSpaces={diff.ignoreSpaces}
          setIgnoreSpaces={diff.setIgnoreSpaces}
          ignoreCase={diff.ignoreCase}
          setIgnoreCase={diff.setIgnoreCase}
          onUndo={diff.undo}
          onRedo={diff.redo}
          canUndo={diff.canUndo}
          canRedo={diff.canRedo}
          onSwap={diff.swapTexts}
          onClear={diff.clearAll}
          onExport={handleExport}
          onCopy={() => {
            copyToClipboard(JSON.stringify(diff.diffResult));
            diff.showToast("Diff copied!");
          }}
          onShare={handleShare}
          onSearch={() => diff.setShowSearch(!diff.showSearch)}
          onAnalytics={() => diff.setShowAnalytics(!diff.showAnalytics)}
          onSettings={() => setShowSettings(!showSettings)}
          onFullscreen={diff.toggleFullscreen}
          onSave={() => {
            const name = prompt("Version name:");
            if (name) diff.saveVersion(name);
          }}
        />

        <AnalyticsPanel stats={diff.stats} open={diff.showAnalytics} />

        {diff.showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-(--card) border border-(--border) rounded-xl"
          >
            <Search size="16" className="text-(--muted-foreground)" />
            <input
              value={diff.searchQuery}
              onChange={(e) => diff.setSearchQuery(e.target.value)}
              aria-label="Search in diff"
              placeholder="Search in diff..."
              className="flex-1 min-h-11 bg-transparent text-sm text-(--foreground) focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => { diff.setSearchQuery(""); diff.setShowSearch(false); }}
              aria-label="Close search"
              className="flex min-h-11 min-w-11 items-center justify-center p-1 rounded hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
            >
              <X size="16" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className={`lg:col-span-${showTimeline ? 9 : 12} space-y-4`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="overflow-hidden rounded-xl border border-(--border)">
                <EditorPanel
                  label="Original (A)"
                  value={diff.textA}
                  onChange={diff.setTextA}
                  placeholder="Paste original text..."
                  color="primary"
                />
              </Card>
              <Card className="overflow-hidden rounded-xl border border-(--border)">
                <EditorPanel
                  label="Modified (B)"
                  value={diff.textB}
                  onChange={diff.setTextB}
                  placeholder="Paste modified text..."
                  color="blue"
                />
              </Card>
            </div>

            {(diff.textA || diff.textB) && (
              <DiffViewer
                diffResult={diff.filteredDiff}
                viewMode={diff.viewMode}
                stats={diff.stats}
                searchQuery={diff.searchQuery}
              />
            )}

            {!diff.textA && !diff.textB && (
              <Card className="p-12 text-center">
                <div className="text-(--muted-foreground)">
                  <FileTextIcon />
                  <p className="text-sm mt-2">Paste text in both panels above to see the diff</p>
                  <div className="mt-4 flex gap-2 text-xs text-(--muted-foreground) justify-center">
                    <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘S</kbd> Save version</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘Z</kbd> Undo</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘F</kbd> Search</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘⇧Z</kbd> Redo</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className={`lg:col-span-3 ${showTimeline ? "" : "hidden"}`}>
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-(--foreground) uppercase tracking-wider">
                  Timeline ({diff.versions.length})
                </h3>
                <button
                  onClick={() => setShowTimeline(false)}
                  aria-label="Hide timeline"
                  className="flex min-h-11 min-w-11 items-center justify-center p-1 rounded hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
                >
                  <X size="14" />
                </button>
              </div>
              <TimelineSidebar
                versions={diff.versions}
                selectedVersionId={diff.selectedVersionId}
                onLoad={diff.loadVersion}
                onDelete={diff.deleteVersion}
                onRename={diff.renameVersion}
                onCompare={diff.compareWithVersion}
              />
            </Card>
          </div>
        </div>

        {!showTimeline && (
          <button
            onClick={() => setShowTimeline(true)}
            className="fixed bottom-6 right-6 z-40 min-h-11 px-4 py-2 rounded-full bg-(--primary) text-(--primary-foreground) shadow-lg text-sm font-semibold hover:opacity-90 transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
          >
            Timeline ({diff.versions.length})
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-2">How to Use</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-(--muted-foreground)">
              <li>Paste or type text in the Original (A) panel.</li>
              <li>Paste or type text in the Modified (B) panel.</li>
              <li>The diff will automatically compute and display.</li>
              <li>Switch between Side-by-Side and Inline views.</li>
              <li>Save versions, export, or share your diff.</li>
            </ol>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-4">FAQ</h2>
            <div className="space-y-3">
              {[
                { q: "What diff modes are available?", a: "Word, Line, and Character-level diffing with options to ignore spaces and case." },
                { q: "Can I save my diffs?", a: "Yes! Press ⌘S or click Save to store versions locally in your browser." },
                { q: "How do I export?", a: "Click the export button to download as HTML, Markdown, or JSON." },
              ].map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-sm font-semibold text-(--foreground)">{faq.q}</h3>
                  <p className="text-sm text-(--muted-foreground)">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        textA={diff.textA}
        textB={diff.textB}
        options={{ ignoreSpaces: diff.ignoreSpaces, ignoreCase: diff.ignoreCase, mode: diff.diffMode }}
      />

      {diff.toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-(--card) border border-(--border) shadow-lg text-sm text-(--foreground) animate-in">
          {diff.toast.message}
        </div>
      )}
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg className="mx-auto opacity-20" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
