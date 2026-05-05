"use client";
import React from "react";
import { ImageProcessor } from "../utils/ImageProcessor";

export default function ImagePreview({
  originalImage,
  compressedImage,
  isCompressing,
}) {
  const compressionRatio = compressedImage
    ? ImageProcessor.getCompressionRatio(
        originalImage.size,
        compressedImage.size,
      )
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ORIGINAL IMAGE */}
      <div className="bg-(--background) text-(--card-foreground) rounded-lg shadow-md overflow-hidden border border-(--border)">
        <div className="bg-(--muted) text-(--foreground) px-4 py-3 border-b border-(--border)">
          <h3 className="text-lg font-semibold">Original Image</h3>
        </div>

        <div className="p-4">
          <div className="relative aspect-video mb-4 bg-(--muted) rounded-lg overflow-hidden">
            <img
              src={originalImage.preview}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-(--muted-foreground)">File name:</span>
              <span className="font-medium truncate ml-2">
                {originalImage.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-(--muted-foreground)">File size:</span>
              <span className="font-medium">
                {ImageProcessor.formatFileSize(originalImage.size)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPRESSED IMAGE */}
      <div className="bg-(--card) text-(--card-foreground) rounded-lg shadow-md overflow-hidden border border-(--border)">
        <div className="bg-(--muted) text-(--foreground) px-4 py-3 border-b border-(--border)">
          <h3 className="text-lg font-semibold">Compressed Image</h3>
        </div>

        <div className="p-4">
          {isCompressing ? (
            <div className="aspect-video bg-(--muted) rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary) mx-auto mb-4"></div>
                <p className="text-(--muted-foreground)">
                  Compressing image...
                </p>
              </div>
            </div>
          ) : compressedImage ? (
            <>
              <div className="relative aspect-video mb-4 bg-(--muted) rounded-lg overflow-hidden">
                <img
                  src={compressedImage.url}
                  alt="Compressed"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-(--muted-foreground)">File size:</span>
                  <span className="font-medium">
                    {ImageProcessor.formatFileSize(compressedImage.size)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-(--muted-foreground)">Dimensions:</span>
                  <span className="font-medium">
                    {compressedImage.width} × {compressedImage.height}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-(--muted-foreground)">
                    Compression:
                  </span>
                  <span
                    className={`font-medium ${
                      compressionRatio > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {compressionRatio > 0 ? "-" : "+"}
                    {Math.abs(compressionRatio)}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="aspect-video bg-(--muted) rounded-lg flex items-center justify-center">
              <p className="text-(--muted-foreground)">
                Compressed image will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
