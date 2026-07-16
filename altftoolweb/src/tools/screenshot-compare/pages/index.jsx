"use client";
import { useScreenshotCompare } from "../hooks/useScreenshotCompare";
import ImageUploader from "../components/ImageUploader";
import ViewToggle from "../components/ViewToggle";
import SliderView from "../components/SliderView";
import SideBySideView from "../components/SideBySideView";
import DiffView from "../components/DiffView";
import ImageInfo from "../components/ImageInfo";
import Features from "../components/Features";

export default function ScreenshotCompare() {
  const {
    image1,
    image2,
    diffResult,
    sliderPos,
    viewMode,
    isProcessing,
    error,
    containerRef,
    handleUpload1,
    handleUpload2,
    handleSliderChange,
    setViewMode,
    runDiff,
    reset,
    swapImages,
    formatFileSize,
  } = useScreenshotCompare();

  const hasBoth = image1 && image2;
  const outputSummary = [
    "Screenshot comparison ready",
    image1 ? `Image 1: ${image1.file?.name || "—"} (${image1.width}x${image1.height})` : "Image 1: not uploaded",
    image2 ? `Image 2: ${image2.file?.name || "—"} (${image2.width}x${image2.height})` : "Image 2: not uploaded",
    sliderPos ? `Slider position: ${Math.round(sliderPos)}%` : "",
    diffResult ? `Pixel difference: ${diffResult.diffPercent.toFixed(2)}%` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Screenshot Compare</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Compare two screenshots side-by-side, with a draggable slider, or as a pixel-difference overlay. Perfect for UI review, version tracking, and QA testing.
          </p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ImageUploader
              label="Image 1 (Original)"
              onUpload={handleUpload1}
              hasImage={!!image1}
              testId="screenshot-image1-upload"
            />
            <ImageUploader
              label="Image 2 (New)"
              onUpload={handleUpload2}
              hasImage={!!image2}
              testId="screenshot-image2-upload"
            />
          </div>

          {hasBoth && (
            <div className="space-y-4">
              <ViewToggle active={viewMode} onChange={setViewMode} />
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={runDiff}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition text-sm font-medium cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Computing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Compute Diff
                    </>
                  )}
                </button>
                <button
                  onClick={swapImages}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) transition text-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Swap
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) transition text-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>

              {viewMode === "slider" && (
                <SliderView
                  image1Url={image1.url}
                  image2Url={image2.url}
                  sliderPos={sliderPos}
                  onSliderChange={handleSliderChange}
                  containerRef={containerRef}
                />
              )}
              {viewMode === "side-by-side" && (
                <SideBySideView image1Url={image1.url} image2Url={image2.url} />
              )}
              {viewMode === "diff" && (
                diffResult ? (
                  <DiffView
                    image1Url={image1.url}
                    image2Url={image2.url}
                    diffResult={diffResult}
                    sliderPos={sliderPos}
                    onSliderChange={handleSliderChange}
                    containerRef={containerRef}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-(--muted-foreground) mb-3">Click &quot;Compute Diff&quot; to see pixel-level differences</p>
                    <button
                      onClick={runDiff}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition text-sm font-medium cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Compute Diff
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {!hasBoth && (
            <p className="text-center text-sm text-(--muted-foreground) py-4">
              Upload both images to start comparing
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-lg p-4 border border-(--red-border) bg-(--red-bg)">
              <p className="text-sm text-(--red-text)">{error}</p>
            </div>
          )}
        </div>

        {hasBoth && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <ImageInfo image={image1} label="Image 1 (Original)" formatFileSize={formatFileSize} />
            <ImageInfo image={image2} label="Image 2 (New)" formatFileSize={formatFileSize} />
          </div>
        )}

        <section className="rounded-xl border border-(--border) bg-(--card) p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-(--foreground)">Output Summary</h2>
            <span className="rounded-lg border border-(--border) bg-(--background) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">Browser-side</span>
          </div>
          <pre data-testid="tool-output" className="min-h-[80px] whitespace-pre-wrap rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--foreground)">
            {outputSummary}
          </pre>
        </section>

        <div className="mt-16 pt-8 border-t border-(--divider)">
          <Features />
        </div>
      </div>
    </div>
  );
}
