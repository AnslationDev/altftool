import React from "react";

import Layout from "../components/Layout";
import ImageUploader from "../components/ImageUploader";
import CompressionControl from "../components/CompressionControl";
import ImagePreview from "../components/ImagePreview";
import DownloadButton from "../components/DownloadButton";
import { useImageCompression } from "../hooks/useImageCompression";
import { ImageProcessor } from "../utils/ImageProcessor";

// extra content sections
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
// import PrivacyPolicy from "./components/PrivacyPolicy";
// import FAQ from "./components/FAQ";

function buildCompressionSummary(originalImage, compressedImage, error, isCompressing) {
  if (error) return `Error: ${error}`;
  if (isCompressing) return "Compressing image...";
  if (!originalImage) return "Upload an image to see compression output.";
  if (!compressedImage) return `Ready: ${originalImage.name} (${ImageProcessor.formatFileSize(originalImage.size)})`;

  const ratio = ImageProcessor.getCompressionRatio(
    originalImage.size,
    compressedImage.size,
  );

  return [
    "Compressed image ready",
    `Input: ${originalImage.name}`,
    `Original: ${ImageProcessor.formatFileSize(originalImage.size)}`,
    `Output: ${ImageProcessor.formatFileSize(compressedImage.size)}`,
    `Dimensions: ${compressedImage.width} x ${compressedImage.height}`,
    `Change: ${ratio > 0 ? "-" : "+"}${Math.abs(ratio)}%`,
  ].join("\n");
}

export default function ImageComressor() {
  const {
    originalImage,
    compressedImage,
    isCompressing,
    error,
    settings,
    handleImageUpload,
    compressImage,
    updateSettings,
    reset,
  } = useImageCompression();
  const outputSummary = buildCompressionSummary(
    originalImage,
    compressedImage,
    error,
    isCompressing,
  );

  return (
    <Layout>
      {/* MAIN TOOL AREA */}
      <div id="compression-tool" className="space-y-8">
        {/* UPLOADER */}
        <div className="rounded-lg shadow-md p-6 bg-(--card)">
          <ImageUploader
            onImageUpload={handleImageUpload}
            hasImage={!!originalImage}
          />
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-lg p-4 border border-(--red-border) bg-(--red-bg)">
            <div className="flex">
              <div className=" shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="ml-3">
                <h3 className="text-sm font-medium text-(--red-text)">Error</h3>
                <p className="mt-1 text-sm text-(--red-text)">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* TOOL FLOW */}
        {originalImage && (
          <>
            {/* CONTROLS */}
            <CompressionControl
              settings={settings}
              onSettingsChange={updateSettings}
              onCompress={compressImage}
              onReset={reset}
              isCompressing={isCompressing}
              hasImage={!!originalImage}
            />

            {/* PREVIEW */}
            <ImagePreview
              originalImage={originalImage}
              compressedImage={compressedImage}
              isCompressing={isCompressing}
            />

            {/* DOWNLOAD */}
            {compressedImage && (
              <DownloadButton
                compressedImage={compressedImage}
                originalFileName={originalImage.name}
              />
            )}
          </>
        )}

        <section className="rounded-lg border border-(--border) bg-(--card) p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-(--foreground)">Output Summary</h2>
            <span className="rounded-lg border border-(--border) bg-(--background) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">
              Browser-side
            </span>
          </div>
          <pre
            data-testid="tool-output"
            className="min-h-[112px] whitespace-pre-wrap rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--foreground)"
          >
            {outputSummary}
          </pre>
        </section>
      </div>

      {/* EXTRA SECTIONS */}
      <div className="mt-16 pt-8 border-t border-(--divider)">
        <HowItWorks />
        <div className=" border-t border-(--divider)"> <Features/></div>
       
        {/* <FAQ /> */}
      </div>
    </Layout>
  );
}
