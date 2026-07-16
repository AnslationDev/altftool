"use client";
import { useImageSlider } from "../hooks/useImageSlider";
import ImageUploader from "../components/ImageUploader";
import ComparisonSlider from "../components/ComparisonSlider";
import Features from "../components/Features";

export default function BeforeAfterSlider() {
  const {
    beforeImage,
    afterImage,
    sliderPos,
    containerRef,
    handleBeforeUpload,
    handleAfterUpload,
    handleSliderChange,
    reset,
    swapImages,
  } = useImageSlider();

  const hasBoth = beforeImage && afterImage;
  const outputSummary = [
    "Before/After comparison ready",
    beforeImage ? `Before: ${beforeImage.name} (${beforeImage.width}x${beforeImage.height})` : "Before: not uploaded",
    afterImage ? `After: ${afterImage.name} (${afterImage.width}x${afterImage.height})` : "After: not uploaded",
    sliderPos ? `Slider position: ${Math.round(sliderPos)}%` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="container py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-block">
            <h1 className="heading text-center animate-fade-up pt-5 mt-[-40]">Before/After Slider</h1>
            <div className="h-1 bg-gradient-primary rounded-full" />
          </div>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Compare two images interactively with a draggable slider. Perfect for showcasing photo edits, restorations, and transformations.
          </p>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ImageUploader
              label="Before Image"
              onUpload={handleBeforeUpload}
              hasImage={!!beforeImage}
              testId="before-image-upload"
            />
            <ImageUploader
              label="After Image"
              onUpload={handleAfterUpload}
              hasImage={!!afterImage}
              testId="after-image-upload"
            />
          </div>

          {hasBoth && (
            <div className="space-y-4">
              <ComparisonSlider
                beforeUrl={beforeImage.url}
                afterUrl={afterImage.url}
                sliderPos={sliderPos}
                onSliderChange={handleSliderChange}
                containerRef={containerRef}
              />
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={swapImages}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) transition text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Swap Images
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) transition text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          )}

          {!hasBoth && (
            <p className="text-center text-sm text-(--muted-foreground) py-4">
              Upload both before and after images to start comparing
            </p>
          )}
        </div>

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
