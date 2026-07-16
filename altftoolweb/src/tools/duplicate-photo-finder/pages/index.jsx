"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Printer,
  Settings2,
  ShieldCheck,
  Plus,
  Scan,
  FolderTree,
  BarChart3,
  CheckCheck,
  Info,
} from "lucide-react";
import VisualCompare from "../components/VisualCompare";
import StatsPanel from "../components/StatsPanel";
import DuplicateGroups from "../components/DuplicateGroups";
import { computeHash, computeSimilarity } from "../utils/imageHash";

const INITIAL_DEMO_IMAGES = [
  {
    id: "img1",
    name: "travel_vacation.jpg",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&fit=crop",
    size: 245000,
    dimensions: "1920x1080",
    format: "jpg",
  },
  {
    id: "img2",
    name: "travel_vacation_compressed.jpg",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&fit=crop",
    size: 112000,
    dimensions: "1280x720",
    format: "jpg",
  },
  {
    id: "img3",
    name: "workspace_design.png",
    src: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300&fit=crop",
    size: 615000,
    dimensions: "2048x1536",
    format: "png",
  },
  {
    id: "img4",
    name: "workspace_design_edited.png",
    src: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300&fit=crop",
    size: 580000,
    dimensions: "2048x1536",
    format: "png",
  },
];

export default function DuplicatePhotoFinderApp() {
  const [images, setImages] = useState([]);
  const [hashes, setHashes] = useState({});
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [threshold, setThreshold] = useState(90);
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedItems, setSelectedItems] = useState([]);
  const [comparePayload, setComparePayload] = useState(null);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    return () => { scanningRef.current = false; };
  }, []);

  const hashImages = useCallback(async (items) => {
    const hashMap = {};
    for (let i = 0; i < items.length; i++) {
      if (!scanningRef.current) break;
      setScanProgress({ current: i + 1, total: items.length });
      try {
        const result = await computeHash(items[i].src);
        hashMap[items[i].id] = result.hash;
        items[i].dimensions = result.dimensions;
      } catch {
        // skip images that fail to hash
      }
    }
    return hashMap;
  }, []);

  const handleLoadDemo = useCallback(async () => {
    if (demoLoaded) return;
    setScanning(true);
    scanningRef.current = true;
    setScanProgress({ current: 0, total: INITIAL_DEMO_IMAGES.length });

    const items = INITIAL_DEMO_IMAGES.map((img) => ({
      ...img,
      id: `demo_${Date.now()}_${img.id}`,
    }));

    const hashMap = await hashImages(items);
    if (!scanningRef.current) return;

    setImages(items);
    setHashes(hashMap);
    setScanning(false);
    setDemoLoaded(true);
    setSelectedItems([]);
  }, [demoLoaded, hashImages]);

  useEffect(() => {
    handleLoadDemo();
  }, [handleLoadDemo]);

  const handleUploadFiles = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setScanning(true);
    scanningRef.current = true;
    setScanProgress({ current: 0, total: files.length });

    const tempItems = files.map((file, idx) => {
      const url = URL.createObjectURL(file);
      const nameParts = file.name.split(".");
      const format = nameParts[nameParts.length - 1] || "png";
      return {
        id: `upload_${Date.now()}_${idx}`,
        name: file.name,
        src: url,
        size: file.size,
        format: format.toLowerCase(),
      };
    });

    const hashMap = await hashImages(tempItems);
    if (!scanningRef.current) return;

    setImages((prev) => [...prev, ...tempItems]);
    setHashes((prev) => ({ ...prev, ...hashMap }));
    setScanning(false);
    e.target.value = "";
  }, [hashImages]);

  const resetDemo = useCallback(() => {
    scanningRef.current = false;
    setImages([]);
    setHashes({});
    setDemoLoaded(false);
    setSelectedItems([]);
    setComparePayload(null);
  }, []);

  const groups = useMemo(() => {
    const imageIds = Object.keys(hashes);
    if (imageIds.length < 2) return [];

    const visited = new Set();
    const result = [];

    for (let i = 0; i < imageIds.length; i++) {
      if (visited.has(imageIds[i])) continue;

      const groupItems = [imageIds[i]];
      visited.add(imageIds[i]);

      for (let j = i + 1; j < imageIds.length; j++) {
        if (visited.has(imageIds[j])) continue;

        const sim = computeSimilarity(hashes[imageIds[i]], hashes[imageIds[j]]);
        if (sim >= threshold) {
          groupItems.push(imageIds[j]);
          visited.add(imageIds[j]);
        }
      }

      if (groupItems.length >= 2) {
        const firstHash = hashes[imageIds[i]];
        const avgSim = groupItems.slice(1).reduce((sum, id) => {
          return sum + computeSimilarity(firstHash, hashes[id]);
        }, 100) / groupItems.length;

        result.push({
          similarity: Math.round(avgSim),
          items: groupItems.map((id) => images.find((img) => img.id === id)).filter(Boolean),
        });
      }
    }

    return result;
  }, [images, hashes, threshold]);

  const totalSize = useMemo(() => images.reduce((sum, item) => sum + item.size, 0), [images]);
  const duplicateSize = useMemo(() => {
    let wasted = 0;
    groups.forEach((g) => {
      const sorted = [...g.items].sort((a, b) => b.size - a.size);
      for (let i = 1; i < sorted.length; i++) {
        wasted += sorted[i].size;
      }
    });
    return wasted;
  }, [groups]);

  const formatCounts = useMemo(() => {
    const acc = {};
    images.forEach((item) => {
      acc[item.format] = (acc[item.format] || 0) + 1;
    });
    return acc;
  }, [images]);

  const handleSmartSelect = useCallback((strategy) => {
    const ids = [];
    groups.forEach((g) => {
      const items = [...g.items];
      if (strategy === "smallest") {
        items.sort((a, b) => b.size - a.size);
        for (let i = 1; i < items.length; i++) ids.push(items[i].id);
      } else if (strategy === "compressed") {
        items.sort((a, b) => {
          const aRes = parseInt(a.dimensions?.split("x")[0]) || 0;
          const bRes = parseInt(b.dimensions?.split("x")[0]) || 0;
          return bRes - aRes;
        });
        for (let i = 1; i < items.length; i++) ids.push(items[i].id);
      }
    });
    setSelectedItems(ids);
  }, [groups]);

  const handleDeleteSelected = useCallback(() => {
    const toDelete = new Set(selectedItems);
    setImages((prev) => prev.filter((item) => !toDelete.has(item.id)));
    setHashes((prev) => {
      const next = { ...prev };
      toDelete.forEach((id) => delete next[id]);
      return next;
    });
    setSelectedItems([]);
  }, [selectedItems]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const formatKB = (bytes) => {
    if (!bytes) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Image Optimization Suite
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Duplicate Photo Finder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detect visually similar images using perceptual hashing &mdash; 100% private, all processing stays in your browser.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUploadFiles}
              className="hidden"
              id="folder-upload"
              aria-label="Upload images to scan for duplicates"
            />
            <label
              htmlFor="folder-upload"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Images
            </label>
            <button
              onClick={resetDemo}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-border hover:bg-secondary text-foreground text-xs font-bold rounded-lg transition-all"
              aria-label="Reset and load fresh demo data"
            >
              Reset Demo
            </button>
          </div>
        </div>

        <div
          className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 rounded-xl text-xs text-amber-600 leading-relaxed"
          role="status"
          aria-label="Privacy notice"
        >
          <strong className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            Privacy Notice:
          </strong>{" "}
          All image processing happens entirely in your browser via perceptual hashing. Your photos never leave your device.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <aside className="lg:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              Parameters
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <label htmlFor="similarity-threshold" className="uppercase tracking-wider">
                  Similarity Threshold
                </label>
                <span>{threshold}%</span>
              </div>
              <input
                id="similarity-threshold"
                type="range"
                min={60}
                max={100}
                step={1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary"
                aria-valuemin={60}
                aria-valuemax={100}
                aria-valuenow={threshold}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>60% (Loose)</span>
                <span>100% (Exact)</span>
              </div>
            </div>

            <div className="bg-secondary/20 p-4 rounded-xl border border-border/60 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                Smart Selection
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleSmartSelect("compressed")}
                  className="w-full text-left px-3 py-2 bg-card hover:bg-secondary/60 border border-border rounded-lg text-xs text-foreground font-semibold transition-all"
                  aria-label="Select lower resolution copies within each group"
                >
                  Select Compressed Copies
                </button>
                <button
                  onClick={() => handleSmartSelect("smallest")}
                  className="w-full text-left px-3 py-2 bg-card hover:bg-secondary/60 border border-border rounded-lg text-xs text-foreground font-semibold transition-all"
                  aria-label="Select smaller file size copies within each group"
                >
                  Select Smaller Files
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Storage Summary</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Images</span>
                  <span className="font-bold text-foreground">{images.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Duplicate Groups</span>
                  <span className="font-bold text-foreground">{groups.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Size</span>
                  <span className="font-bold text-foreground">{formatKB(totalSize)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Wasted Space</span>
                  <span className="font-bold text-rose-500">{formatKB(duplicateSize)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              aria-label="Print analysis report"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              Print Report
            </button>
          </aside>

          <main className="lg:col-span-8 space-y-6">

            <div className="flex bg-card border border-border p-1 rounded-xl shadow-sm" role="tablist">
              <button
                onClick={() => setActiveTab("groups")}
                role="tab"
                aria-selected={activeTab === "groups"}
                aria-controls="groups-panel"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "groups"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" aria-hidden="true" />
                Duplicate Groups
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                role="tab"
                aria-selected={activeTab === "stats"}
                aria-controls="stats-panel"
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "stats"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                Space Analytics
              </button>
            </div>

            {scanning && (
              <div
                className="bg-card border border-border rounded-2xl p-8 text-center space-y-4 shadow-sm"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent border-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Scanning images...
                  </span>
                </div>
                <div className="w-full max-w-xs mx-auto bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(scanProgress.current / Math.max(scanProgress.total, 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Computing perceptual hashes: {scanProgress.current} of {scanProgress.total} images
                </p>
              </div>
            )}

            {!scanning && activeTab === "groups" && (
              <div id="groups-panel" role="tabpanel">
                {groups.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3 shadow-sm">
                    <Scan className="w-10 h-10 text-muted-foreground mx-auto" aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">
                      {images.length < 2
                        ? "Add at least 2 images to start scanning"
                        : "No duplicate groups found at the current threshold"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try lowering the similarity threshold or add more images.
                    </p>
                  </div>
                ) : (
                  <DuplicateGroups
                    groups={groups}
                    selectedItems={selectedItems}
                    onToggleSelect={(id) =>
                      setSelectedItems((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                      )
                    }
                    onCompare={(a, b) =>
                      setComparePayload({ imgA: a.src, imgB: b.src, titleA: a.name, titleB: b.name })
                    }
                    onDeleteSelected={handleDeleteSelected}
                  />
                )}
              </div>
            )}

            {!scanning && activeTab === "stats" && (
              <div id="stats-panel" role="tabpanel">
                <StatsPanel
                  totalSize={totalSize}
                  duplicateSize={duplicateSize}
                  formatCounts={formatCounts}
                />
              </div>
            )}

          </main>

        </div>

      </div>

      {comparePayload && (
        <VisualCompare
          imgA={comparePayload.imgA}
          imgB={comparePayload.imgB}
          titleA={comparePayload.titleA}
          titleB={comparePayload.titleB}
          onClose={() => setComparePayload(null)}
        />
      )}
    </div>
  );
}
