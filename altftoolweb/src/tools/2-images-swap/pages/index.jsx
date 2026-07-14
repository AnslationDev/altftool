"use client";

import React from "react";
import { Shuffle } from "lucide-react";
import { useImageSwap } from "../hooks/useImageSwap";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import ImageInfo from "../components/ImageInfo";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";

export default function ToolHome() {
  const {
    imageA,
    imageB,
    isSwapped,
    error,
    fileInputA,
    fileInputB,
    handleFileA,
    handleFileB,
    handleDrop,
    handleDragOver,
    swapImages,
    removeImage,
    reset,
    getDisplayImages,
    downloadImage,
    formatFileSize,
  } = useImageSwap();

  const displayImages = getDisplayImages();

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 pb-20">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Shuffle className="h-4 w-4" />
            Design
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            2 Images Swap
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Upload two images and instantly swap their positions. Compare side-by-side and export the results.
          </p>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-lg p-4 border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-700 dark:text-red-400">Error</h3>
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Uploaders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-(--border) bg-(--card) p-4 sm:p-5">
            <ImageUploader
              slot="a"
              image={imageA}
              onFileSelect={handleFileA}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onRemove={removeImage}
              fileInputRef={fileInputA}
              formatFileSize={formatFileSize}
            />
          </div>
          <div className="rounded-lg border border-(--border) bg-(--card) p-4 sm:p-5">
            <ImageUploader
              slot="b"
              image={imageB}
              onFileSelect={handleFileB}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onRemove={removeImage}
              fileInputRef={fileInputB}
              formatFileSize={formatFileSize}
            />
          </div>
        </div>

        {/* Image Info */}
        <ImageInfo imageA={imageA} imageB={imageB} formatFileSize={formatFileSize} />

        {/* Preview */}
        <ImagePreview
          displayImages={displayImages}
          imageA={imageA}
          imageB={imageB}
          isSwapped={isSwapped}
          onSwap={swapImages}
          onReset={reset}
          onDownload={downloadImage}
        />

        {/* Extra sections */}
        <div className="mt-16 pt-8 border-t border-(--divider)">
          <HowItWorks />
          <div className="border-t border-(--divider)">
            <Features />
          </div>
        </div>
      </div>
    </main>
  );
}
