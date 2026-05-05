"use client";
import React from "react";

export default function DownloadButton({ compressedImage, originalFileName }) {
  const handleDownload = () => {
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.href = compressedImage.url;

    const nameWithoutExt = originalFileName.split(".").slice(0, -1).join(".");
    const extension = compressedImage.blob.type.split("/")[1];

    link.download = `${nameWithoutExt}_compressed.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!compressedImage) return null;

  return (
    <div className="text-center">
      <button
        onClick={handleDownload}
        className="inline-flex items-center px-6 py-3 rounded-lg font-medium cursor-pointer
                   bg-(--primary) text-(--primary-foreground)
                   hover:opacity-85 transition-all"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download Compressed Image
      </button>
    </div>
  );
}
