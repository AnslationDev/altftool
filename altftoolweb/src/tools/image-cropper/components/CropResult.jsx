import React from "react";
import { Eye, Image as ImageIcon, ChevronDown } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

const CropResult = ({
  croppedImage,
  onDownload,
  onRecrop,
  onReset,
  originalImage,
  quality,
  beforeSize,
  afterSize,
  compressImage,
  handleQualityChange,
  downloadFormat,
  setDownloadFormat,
  downloadSize,
  setDownloadSize,
  setQuality,
}) => {
  const [showBefore, setShowBefore] = React.useState(false);
  const [showFormatMenu, setShowFormatMenu] = React.useState(false);
const [showSizeMenu, setShowSizeMenu] = React.useState(false);
const [showDownloadOptions, setShowDownloadOptions] = React.useState(false);
const [showSizeOptions, setShowSizeOptions] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Cropped Result</h2>
        {/* (Before / After Toggle) */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setShowBefore(true)}
            className={`px-3 py-1 mb-2 rounded-md cursor-pointer flex items-center gap-2 ${
              showBefore
                ? "bg-(--primary) text-white"
                : "bg-white text-black border-gray-300"
            }`}
          >
            {" "}
            <Eye size={16} />
            Before
          </button>

          <button
            onClick={() => setShowBefore(false)}
            className={`px-3 py-1  mb-2 rounded-md cursor-pointer flex items-center gap-2 ${
              !showBefore
                ? "bg-(--primary) text-white"
                : "bg-white text-black border-gray-300"
            }`}
          >
            {" "}
            <ImageIcon size={16} />
            After
          </button>
        </div>

<div className="flex flex-col gap-3 w-full sm:w-auto">
          
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Download Dropdown Button */}
<div className="relative">
  <button
    onClick={() => setShowDownloadOptions(!showDownloadOptions)}
    className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2 cursor-pointer hover:opacity-90"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>

    Download Image
    <ChevronDown className="w-4 h-4" />
  </button>

  {/* Dropdown */}
  {showDownloadOptions && (
    <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-(--border) bg-(--card) shadow-lg p-3 z-20 space-y-3">
      {/* Format Selection */}
      <div>
        <p className="text-xs text-(--muted-foreground) mb-2">
          Download Format
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setDownloadFormat("jpeg")}
            className={`flex-1 px-3 py-2 rounded-md text-sm border ${
              downloadFormat === "jpeg"
                ? "bg-(--primary) text-white border-(--primary)"
                : "border-(--border)"
            }`}
          >
            JPG
          </button>

          <button
            onClick={() => setDownloadFormat("png")}
            className={`flex-1 px-3 py-2 rounded-md text-sm border ${
              downloadFormat === "png"
                ? "bg-(--primary) text-white border-(--primary)"
                : "border-(--border)"
            }`}
          >
            PNG
          </button>
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <p className="text-xs text-(--muted-foreground) mb-2">Size</p>

        <button
          onClick={() => setShowSizeOptions(!showSizeOptions)}
          className="w-full px-3 py-2 rounded-md border border-(--border) text-sm flex items-center justify-between"
        >
          {downloadSize === "original"
            ? "Original"
            : downloadSize === "medium"
            ? "Medium"
            : "Small"}

          <ChevronDown className="w-4 h-4" />
        </button>

        {showSizeOptions && (
          <div className="mt-2 rounded-md border border-(--border) overflow-hidden">
            <button
              onClick={() => {
                setDownloadSize("original");
                setShowSizeOptions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-(--muted)"
            >
              Original
            </button>

            <button
              onClick={() => {
                setDownloadSize("medium");
                setShowSizeOptions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-(--muted)"
            >
              Medium
            </button>

            <button
              onClick={() => {
                setDownloadSize("small");
                setShowSizeOptions(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-(--muted)"
            >
              Small
            </button>
          </div>
        )}
      </div>

      {/* Final Download Button */}
      <button
        onClick={() => {
          onDownload();
          setShowDownloadOptions(false);
        }}
        className="w-full px-3 py-2 rounded-md bg-(--primary) text-white text-sm hover:opacity-90"
      >
        Download
      </button>
    </div>
  )}
</div>
          <button
            onClick={onRecrop}
            className="px-4 py-2 bg-gray-500 border border-(--border) rounded-md cursor-pointer"
          >
            Re-crop
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-(--primary) border border-(--border) rounded-md cursor-pointer"
          >
            Start Over
          </button>
        </div>
      </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-(--card)">
        <ManagedImage
          src={showBefore ? originalImage : croppedImage}
          alt="preview"
          className="max-w-full h-auto mx-auto block"
        />
      </div>
      {/* Image Compression Section */}
      <div className="border border-(--border) rounded-xl bg-(--card) p-4 space-y-4">
        <h3 className="text-lg font-semibold text-(--foreground)">
          Image Compression
        </h3>

        {/* Quality Label */}
        <div className="flex items-center justify-between text-sm text-(--muted-foreground) ">
          <span>Quality</span>
          <span>{quality.toFixed(1)}</span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={quality}
          onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
          className="w-full h-2  rounded-lg appearance-none cursor-pointer accent-(--primary) bg-(--muted)"
        />
        <div className="flex justify-between text-xs text-(--muted-foreground)">
          <span>Low</span>
          <span>High</span>
        </div>

        {/* Size Info */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 rounded-lg bg-(--muted) px-3 py-2 text-sm">
            <span className="font-medium">Before Size:</span>{" "}
            {beforeSize ? `${(beforeSize / 1024).toFixed(1)} KB` : "--"}
          </div>

          <div className="flex-1 rounded-lg bg-(--muted) px-3 py-2 text-sm">
            <span className="font-medium">After Size:</span>{" "}
            {afterSize ? `${(afterSize / 1024).toFixed(1)} KB` : "--"}
          </div>
        </div>

        {/* Apply Compression Button */}
        <button
          onClick={compressImage}
          className="px-4 py-2 bg-(--primary) text-white rounded-lg cursor-pointer hover:opacity-90 transition"
        >
          Apply Compression
        </button>
      </div>

      <div className="p-4 rounded-r-lg">
        <div className="flex">
          <div className="shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-green-500">
              Your image has been cropped & optimized successfully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropResult;
