"use client";

import React, { useState, useRef, useEffect } from "react";
import { Instagram, Twitter, Linkedin, ChevronDown } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ResultPreview({ image, onReset }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

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

  const downloadImage = (format) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      if (format === "jpg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      // ✅ LOGO WATERMARK
      const watermark = new Image();
      watermark.src = "/assets/logo3.png";

      watermark.onload = () => {
        const scale = canvas.width * 0.12; // size relative to image
        const aspectRatio = watermark.width / watermark.height;

        const wmWidth = scale;
        const wmHeight = scale / aspectRatio;

        const padding = canvas.width * 0.02;

        ctx.globalAlpha = 0.6; // subtle
        ctx.drawImage(
          watermark,
          canvas.width - wmWidth - padding,
          canvas.height - wmHeight - padding,
          wmWidth,
          wmHeight
        );
        ctx.globalAlpha = 1;

        const mime =
          format === "png"
            ? "image/png"
            : format === "webp"
            ? "image/webp"
            : "image/jpeg";

        const link = document.createElement("a");
        link.download = `background-removed.${format}`;
        link.href = canvas.toDataURL(mime, 0.95);
        link.click();

        setShowDownloadOptions(false);
      };
    };
  };

  const handleExportProfile = () => {
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

      // ✅ LOGO WATERMARK
      const watermark = new Image();
      watermark.src = "/assets/logo3.png";

      watermark.onload = () => {
        const scale = size * 0.2;
        const aspectRatio = watermark.width / watermark.height;

        const wmWidth = scale;
        const wmHeight = scale / aspectRatio;

        const padding = size * 0.05;

        ctx.globalAlpha = 0.6;
        ctx.drawImage(
          watermark,
          size - wmWidth - padding,
          size - wmHeight - padding,
          wmWidth,
          wmHeight
        );
        ctx.globalAlpha = 1;

        const link = document.createElement("a");
        link.download = "profile-picture.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
    };
  };

  return (
    <>
    {image ? 
      <div className="rounded-2xl bg-(--card) border border-(--border) p-6 text-center shadow-md">
        <p className="mb-4 font-semibold">After Background Removal</p>

        <div className="rounded-xl overflow-hidden relative">
          <ManagedImage
            src={image}
            alt="Result"
            className="mx-auto max-h-96 object-contain"
          />
        </div>

        <div className="mt-6 flex  justify-center items-center gap-2 relative">

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="bg-(--primary) px-6 py-2 rounded-md font-semibold text-sm sm:text-base text-white flex items-center gap-2"
            >
              Download the image
              <ChevronDown size={16} />
            </button>

            {showDownloadOptions && (
              <div className="absolute left-0 mt-2 w-44 bg-(--background) border border-(--border) rounded-lg shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => downloadImage("png")}
                  className="w-full px-4 py-2 text-left hover:bg-(--card)"
                >
                  PNG (Transparent)
                </button>
                <button
                  onClick={() => downloadImage("jpg")}
                  className="w-full px-4 py-2 text-left hover:bg-(--card)"
                >
                  JPG
                </button>
                <button
                  onClick={() => downloadImage("webp")}
                  className="w-full px-4 py-2 text-left hover:bg-(--card)"
                >
                  WEBP
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onReset}
            className="bg-gray-500 px-6 py-2 rounded-md font-semibold text-sm sm:text-base text-white cursor-pointer"
          >
            Try new image 
          </button>

          <button
            onClick={handleExportProfile}
            className="bg-(--primary) px-6 py-2 rounded-md font-semibold text-sm sm:text-base text-white cursor-pointer"
          >
            Export as Profile Picture
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="bg-(--primary) px-6 py-2 rounded-md font-semibold text-sm sm:text-base text-white cursor-pointer"
          >
            Share on Social Media
          </button>
        </div>
      </div>
      : <div>
        <p>Removing Background</p>
      </div>
}

      {showShareModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 ">
          
          <div className=" bg-(--background) rounded-2xl p-7 shadow-2xl w-[320px] text-center animate-in fade-in zoom-in-95 duration-200">
            
            <h3 className="font-semibold text-lg mb-2">
              Share your image
            </h3>
            <p className="text-sm text-(--muted-foreground) mb-6">
              Open platform to upload your image
            </p>

            <div className="flex justify-center gap-5 mb-6 bg-(--background)">
              
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-14 h-14 flex items-center justify-center rounded-full border bg-(--background) hover:shadow-md hover:scale-105 transition"
              >
                <Linkedin className="text-(--primary) group-hover:scale-110 transition" size={24} />
              </a>
              
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-14 h-14 flex items-center justify-center rounded-full border bg-(--background ) hover:shadow-md hover:scale-105 transition"
              >
                <Instagram className="text-pink-500 group-hover:scale-110 transition" size={24} />
              </a>

              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-14 h-14 flex items-center justify-center rounded-full border bg-(--background) hover:shadow-md hover:scale-105 transition"
              >
                <Twitter className="text-(--primary) group-hover:scale-110 transition" size={24} />
              </a>

            </div>

            <div className="border-t my-4"></div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 rounded-lg bg-(--primary) transition text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
        )}
    </>
  );
}