"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button, Card } from "@altftool/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Save, Download, FileJson, Undo2, Redo2, Star,
  History, BarChart3, Settings, Maximize2, ScrollText,
} from "lucide-react";
import { useWheel } from "../hooks/useWheel";
import WheelCanvas from "../components/WheelCanvas";
import EntryManager from "../components/EntryManager";
import WinnerModal from "../components/WinnerModal";
import StatisticsCard from "../components/StatisticsCard";
import HistoryPanel from "../components/HistoryPanel";
import ThemeSwitcher from "../components/ThemeSwitcher";
import SpinControls from "../components/SpinControls";
import WheelTemplates from "../components/WheelTemplates";
import ShareDialog from "../components/ShareDialog";
import ImportExport from "../components/ImportExport";

const Toast = dynamic(() => import("react-hot-toast").then((m) => ({ default: m.toast })), { ssr: false });

export default function DecisionWheelPage() {
  const wheel = useWheel();
  const [showShare, setShowShare] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState("wheel");

  const handleSpin = useCallback(() => {
    wheel.spin();
  }, [wheel]);

  const handleSpinEnd = useCallback(() => {
    if (wheel.currentWinner) {
      import("react-hot-toast").then((m) => {
        m.toast.success(`${wheel.currentWinner.name} won!`, { duration: 3000 });
      });
    }
  }, [wheel.currentWinner]);

  const handleSave = useCallback(() => {
    const name = prompt("Name this wheel:");
    if (name) {
      wheel.saveWheel(name);
      import("react-hot-toast").then((m) => m.toast.success("Wheel saved!"));
    }
  }, [wheel]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " && !e.target.matches("input,textarea,select")) {
        e.preventDefault();
        handleSpin();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) wheel.redo();
        else wheel.undo();
      }
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSpin, toggleFullscreen, wheel]);

  const layout = useMemo(() => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            className="flex flex-col items-center p-6 rounded-2xl bg-(--card) border border-(--border) shadow-sm"
            layout
          >
            <WheelCanvas
              entries={wheel.entries}
              colors={wheel.colors}
              isSpinning={wheel.isSpinning}
              spinSpeed={wheel.spinSpeed}
              onSpinEnd={handleSpinEnd}
            />
          </motion.div>

          {showStats && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-(--foreground) mb-3 flex items-center gap-2">
                  <BarChart3 size="16" className="text-(--primary)" /> Statistics
                </h3>
                <StatisticsCard stats={wheel.stats} history={wheel.history} entries={wheel.entries} />
              </Card>
            </motion.div>
          )}

          <Card className="p-4">
            <WheelTemplates onSelect={wheel.loadTemplate} />
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4">
            <SpinControls
              mode={wheel.mode}
              onSpin={handleSpin}
              onTeamSelect={wheel.teamSelect}
              onResetTeam={wheel.resetTeam}
              entries={wheel.entries}
              isSpinning={wheel.isSpinning}
              spinSpeed={wheel.spinSpeed}
              onSpeedChange={wheel.setSpinSpeed}
              selectedEntries={wheel.selectedEntries}
              onUndo={wheel.undo}
              onRedo={wheel.redo}
              canUndo={wheel.undoStack > 0}
              canRedo={wheel.redoStack > 0}
              onModeChange={wheel.setMode}
            />
          </Card>

          <Card className="p-4">
            <EntryManager
              entries={wheel.entries}
              onAdd={wheel.addEntry}
              onAddMultiple={wheel.addEntries}
              onRemove={wheel.removeEntry}
              onEdit={wheel.editEntry}
              onDuplicate={wheel.duplicateEntry}
              onShuffle={wheel.shuffleEntries}
              onClear={wheel.clearEntries}
              onImport={wheel.importEntries}
            />
          </Card>

          <Card className="p-4">
            <ThemeSwitcher current={wheel.wheelTheme} onChange={wheel.setThemeAndSave} />
          </Card>

          <HistoryPanel history={wheel.history} onClear={() => {
            wheel.setHistory([]);
            setTimeout(wheel.save, 0);
          }} />
        </div>
      </div>
    </div>
  ), [wheel, showStats, handleSpin, handleSpinEnd]);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">Decision Wheel</h1>
            <p className="text-sm text-(--muted-foreground) mt-1">Spin to decide anything — pick winners, build teams, settle debates.</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setShowStats(!showStats)} className={`p-2 rounded-lg border transition ${
              showStats ? "bg-(--primary) text-(--primary-foreground) border-(--primary)" : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
            }`} title="Statistics">
              <BarChart3 size="18" />
            </button>
            <button onClick={handleSave} className="p-2 rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition" title="Save Wheel">
              <Save size="18" />
            </button>
            <button onClick={() => setShowShare(true)} className="p-2 rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition" title="Share">
              <Share2 size="18" />
            </button>
            <button onClick={() => setShowImport(true)} className="p-2 rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition" title="Import/Export">
              <FileJson size="18" />
            </button>
            <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition" title="Fullscreen">
              <Maximize2 size="18" />
            </button>
          </div>
        </div>

        {layout}

        <div className="mt-8 rounded-2xl bg-(--card) border border-(--border) p-6">
          <h2 className="text-lg font-bold text-(--foreground) mb-2">How to Use</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-(--muted-foreground)">
            <li>Add entries using the entry manager on the right.</li>
            <li>Choose a theme and adjust spin speed.</li>
            <li>Press <kbd className="px-1.5 py-0.5 rounded bg-(--muted) text-xs font-mono">SPACE</kbd> or click SPIN!</li>
            <li>View winner, history, and statistics.</li>
          </ol>
          <div className="mt-3 flex gap-2 text-xs text-(--muted-foreground)">
            <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">Space</kbd> Spin</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘Z</kbd> Undo</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘⇧Z</kbd> Redo</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-(--muted) font-mono">⌘F</kbd> Fullscreen</span>
          </div>
        </div>

        <div className="rounded-2xl bg-(--card) border border-(--border) p-6">
          <h2 className="text-lg font-bold text-(--foreground) mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How does the weighted spin work?", a: "Each entry has equal weight by default. The wheel randomly selects based on the number of slices." },
              { q: "Can I save my wheel?", a: "Yes! Click the save icon to save your current entries and theme. Wheels are stored in your browser." },
              { q: "How do I use the Team Picker?", a: "Switch to Team Picker mode, then click 'Pick Member' to randomly select team members one by one." },
              { q: "Is my data saved?", a: "All data is stored locally in your browser. Nothing is sent to any server." },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="text-sm font-semibold text-(--foreground) mb-1">{faq.q}</h3>
                <p className="text-sm text-(--muted-foreground)">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WinnerModal
        winner={wheel.currentWinner}
        onClose={() => wheel.setCurrentWinner(null)}
        onToggleFavorite={wheel.toggleFavorite}
        isFavorite={wheel.favorites.includes(wheel.currentWinner?.name)}
      />
      <ShareDialog
        open={showShare}
        onClose={() => setShowShare(false)}
        entries={wheel.entries}
      />
      <ImportExport
        open={showImport}
        onClose={() => setShowImport(false)}
        entries={wheel.entries}
        onImport={wheel.importEntries}
      />
    </div>
  );
}
