"use client";

import { useCallback } from "react";
import {
  ScanSearch,
  Search,
  Camera,
  Aperture,
  MapPin,
  Calendar,
  Monitor,
  Info,
  AlertTriangle,
  Palette,
  Shield,
  Download,
} from "lucide-react";
import { useMetadataViewer } from "../hooks/useMetadataViewer";
import { PrivacyDetector } from "../services/detectionService";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import MetadataSection from "../components/MetadataSection";
import ColorPalette from "../components/ColorPalette";
import PrivacyAnalysis from "../components/PrivacyAnalysis";
import ExportPanel from "../components/ExportPanel";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";

const TABS = [
  { id: "metadata", label: "Metadata", icon: Camera },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "export", label: "Export", icon: Download },
];

const SECTION_CONFIG = [
  { key: "camera", title: "Camera", Icon: Camera },
  { key: "exposure", title: "Exposure", Icon: Aperture },
  { key: "gps", title: "GPS", Icon: MapPin },
  { key: "dates", title: "Dates", Icon: Calendar },
  { key: "software", title: "Software", Icon: Monitor },
  { key: "other", title: "Other", Icon: Info },
];

export default function ImageMetadataViewer() {
  const {
    file,
    preview,
    metadata,
    colorPalette,
    dominantColor,
    averageColor,
    hasTransparency,
    privacyAnalysis,
    setPrivacyAnalysis,
    error,
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedSections,
    activeTab,
    setActiveTab,
    handleFileUpload,
    removeImage,
    replaceImage,
    toggleSection,
    getFilteredMetadata,
    getExportData,
  } = useMetadataViewer();

  const filteredMetadata = getFilteredMetadata();

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      if (tabId === "privacy" && metadata && !privacyAnalysis) {
        const analysis = PrivacyDetector.analyzePrivacy(metadata);
        setPrivacyAnalysis(analysis);
      }
    },
    [metadata, privacyAnalysis, setActiveTab, setPrivacyAnalysis]
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ScanSearch className="h-4 w-4" />
            Image metadata
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Image Metadata Viewer
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Extract and view complete image metadata including EXIF, IPTC, GPS, and file properties. Analyze color palettes and check for privacy risks before sharing.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <ImageUploader
                onFileUpload={handleFileUpload}
                onRemoveImage={removeImage}
                hasImage={!!preview}
              />
            </div>

            {preview && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <ImagePreview
                  file={file}
                  preview={preview}
                  metadata={metadata}
                  onReplace={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const f = e.target.files?.[0];
                      if (f) replaceImage(f);
                    };
                    input.click();
                  }}
                  onRemove={removeImage}
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-[var(--muted)] p-1">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "metadata" && (
              <div className="space-y-4">
                {preview && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search metadata fields..."
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                )}

                {filteredMetadata ? (
                  <div className="space-y-3">
                    {SECTION_CONFIG.map((section) => {
                      const rows = filteredMetadata[section.key] || [];
                      if (rows.length === 0) return null;
                      return (
                        <MetadataSection
                          key={section.key}
                          title={section.title}
                          icon={section.Icon}
                          rows={rows}
                          isExpanded={expandedSections[section.key]}
                          onToggle={() => toggleSection(section.key)}
                          searchQuery={searchQuery}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted-foreground)]">
                    Upload an image to view its complete metadata.
                  </div>
                )}
              </div>
            )}

            {activeTab === "colors" && (
              <ColorPalette
                palette={colorPalette}
                dominantColor={dominantColor}
                averageColor={averageColor}
                hasTransparency={hasTransparency}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacyAnalysis analysis={privacyAnalysis} />
            )}

            {activeTab === "export" && (
              <ExportPanel
                metadata={metadata}
                colorPalette={colorPalette}
                dominantColor={dominantColor}
                privacyAnalysis={privacyAnalysis}
                fileName={file?.name}
              />
            )}
          </div>
        </section>

        <div className="border-t border-[var(--border)]" />

        <HowItWorks />
        <Features />
      </div>
    </main>
  );
}
