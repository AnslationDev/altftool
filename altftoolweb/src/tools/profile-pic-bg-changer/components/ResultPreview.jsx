"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Instagram, Twitter, Linkedin } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ResultPreview({ image, onReset }) {
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!image) return null;

  const downloadAs = (format) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (format === "jpg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const watermark = new Image();
      watermark.src = "/assets/logo3.png";

      watermark.onload = () => {
        const scale = canvas.width * 0.12;
        const aspect = watermark.width / watermark.height;
        const wmW = scale;
        const wmH = scale / aspect;
        const pad = canvas.width * 0.02;

        ctx.globalAlpha = 0.6;
        ctx.drawImage(watermark, canvas.width - wmW - pad, canvas.height - wmH - pad, wmW, wmH);
        ctx.globalAlpha = 1;

        const mime = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
        const link = document.createElement("a");
        link.download = `profile-picture.${format}`;
        link.href = canvas.toDataURL(mime, 0.95);
        link.click();
        setShowDownloadOptions(false);
      };

      watermark.onerror = () => {
        const mime = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
        const link = document.createElement("a");
        link.download = `profile-picture.${format}`;
        link.href = canvas.toDataURL(mime, 0.95);
        link.click();
        setShowDownloadOptions(false);
      };
    };
  };

  const downloadAsCircle = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

      const link = document.createElement("a");
      link.download = "profile-picture-circle.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const shareSizes = [
    { label: "LinkedIn (400×400)", w: 400, h: 400 },
    { label: "Twitter (400×400)", w: 400, h: 400 },
    { label: "Instagram (320×320)", w: 320, h: 320 },
    { label: "Facebook (180×180)", w: 180, h: 180 },
  ];

  const exportForPlatform = (w, h) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const link = document.createElement("a");
      link.download = `profile-picture-${w}x${h}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  return (
    <div className="rounded-2xl bg-(--surface) border border-(--border) p-6 text-center shadow-md flex-1 max-w-md">
      <p className="mb-4 font-semibold text-sm text-(--muted-foreground) uppercase tracking-wide">Result</p>

      <div className="rounded-xl overflow-hidden mx-auto w-48 h-48 ring-2 ring-(--border) shadow-lg">
        <ManagedImage
          src={image}
          alt="Result"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="bg-(--primary) px-5 py-2 rounded-lg font-semibold text-sm text-white flex items-center gap-2 hover:opacity-90 transition"
          >
            Download
            <ChevronDown size={16} />
          </button>

          {showDownloadOptions && (
            <div className="absolute left-0 mt-2 w-48 bg-(--surface) border border-(--border) rounded-lg shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-150">
              <button onClick={() => downloadAs("png")} className="w-full px-4 py-2.5 text-left text-sm hover:bg-(--primary)/10 transition">PNG</button>
              <button onClick={() => downloadAs("jpg")} className="w-full px-4 py-2.5 text-left text-sm hover:bg-(--primary)/10 transition">JPG</button>
              <button onClick={() => downloadAs("webp")} className="w-full px-4 py-2.5 text-left text-sm hover:bg-(--primary)/10 transition">WEBP</button>
              <div className="border-t border-(--border) my-1" />
              <button onClick={downloadAsCircle} className="w-full px-4 py-2.5 text-left text-sm hover:bg-(--primary)/10 transition">Circle Crop (PNG)</button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="bg-(--primary) px-5 py-2 rounded-lg font-semibold text-sm text-white hover:opacity-90 transition"
        >
          Export for Platform
        </button>

        <button
          onClick={onReset}
          className="bg-(--muted)/20 px-5 py-2 rounded-lg font-semibold text-sm text-(--foreground) hover:bg-(--muted)/30 transition border border-(--border)"
        >
          New Image
        </button>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-(--surface) rounded-2xl p-7 shadow-2xl w-[340px] text-center animate-in fade-in zoom-in-95 duration-200 border border-(--border)">
            <h3 className="font-semibold text-lg mb-2">Export for Platform</h3>
            <p className="text-sm text-(--muted-foreground) mb-6">
              Choose the optimal size for each platform
            </p>

            <div className="space-y-2 mb-6">
              {shareSizes.map(({ label, w, h }) => (
                <button
                  key={label}
                  onClick={() => exportForPlatform(w, h)}
                  className="w-full px-4 py-3 rounded-lg border border-(--border) text-sm font-medium hover:bg-(--primary)/10 hover:border-(--primary) transition text-left"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-5 mb-6">
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 flex items-center justify-center rounded-full border border-(--border) hover:shadow-md hover:scale-105 transition">
                <Linkedin className="text-(--primary) group-hover:scale-110 transition" size={22} />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 flex items-center justify-center rounded-full border border-(--border) hover:shadow-md hover:scale-105 transition">
                <Instagram className="text-pink-500 group-hover:scale-110 transition" size={22} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 flex items-center justify-center rounded-full border border-(--border) hover:shadow-md hover:scale-105 transition">
                <Twitter className="text-(--primary) group-hover:scale-110 transition" size={22} />
              </a>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2.5 rounded-lg bg-(--primary) text-white text-sm font-medium hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
