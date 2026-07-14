"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import { getFaceApi } from "../services/faceApiClient";

export default function ImagePreview({ preview, onReset, result }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function drawOverlays() {
      if (!imgRef.current || !canvasRef.current || !result || !imageLoaded) return;

      const img = imgRef.current;
      const canvas = canvasRef.current;

      // Set canvas display and drawing size to match the image dimensions
      canvas.width = img.clientWidth || img.width || 500;
      canvas.height = img.clientHeight || img.height || 500;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine scale factors between original image and displayed image
      const scaleX = canvas.width / (img.naturalWidth || img.width || 1);
      const scaleY = canvas.height / (img.naturalHeight || img.height || 1);

      result.forEach((face) => {
        const { box, landmarks, dominantEmotion, dominantConfidence } = face;
        if (!box) return;

        // Scale box coordinates
        const x = box.x * scaleX;
        const y = box.y * scaleY;
        const w = box.width * scaleX;
        const h = box.height * scaleY;

        // Draw Bounding Box (Teal-500 `#14B8A6`)
        ctx.strokeStyle = "#14B8A6";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeRect(x, y, w, h);

        // Draw Bounding Box Shadow/Glow (subtle primary overlay)
        ctx.strokeStyle = "rgba(20, 184, 166, 0.35)";
        ctx.lineWidth = 6;
        ctx.strokeRect(x, y, w, h);

        // Draw Label Background (Teal-600 `#0D9488` with round border)
        const labelText = `${dominantEmotion.toUpperCase()} (${Math.round(dominantConfidence * 100)}%)`;
        ctx.font = "bold 12px sans-serif";
        const textWidth = ctx.measureText(labelText).width;
        const labelHeight = 20;

        ctx.fillStyle = "#0D9488";
        // Draw small label tag above the face box
        const labelY = y - labelHeight - 5 > 0 ? y - labelHeight - 5 : y + 5;
        const labelX = x;

        // Draw rounded rectangle for label tag
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, textWidth + 12, labelHeight, 4);
        ctx.fill();

        // Draw Text inside tag (White)
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, labelX + 6, labelY + labelHeight / 2);

        // Draw Landmark Dots (Cyan-400 `#22D3EE`)
        if (landmarks) {
          ctx.fillStyle = "#22D3EE";
          
          const drawPoints = (points) => {
            if (!points) return;
            points.forEach((pt) => {
              const scaledPt = { x: pt.x * scaleX, y: pt.y * scaleY };
              ctx.beginPath();
              ctx.arc(scaledPt.x, scaledPt.y, 2, 0, Math.PI * 2);
              ctx.fill();
            });
          };

          // Draw eyes, nose, mouth and eyebrows
          drawPoints(landmarks.leftEye);
          drawPoints(landmarks.rightEye);
          drawPoints(landmarks.nose);
          drawPoints(landmarks.mouth);
          drawPoints(landmarks.leftBrow);
          drawPoints(landmarks.rightBrow);
        }
      });
    }

    drawOverlays();

    // Redraw on window resize
    const handleResize = () => drawOverlays();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [result, imageLoaded]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="w-full rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] shadow-xl relative border border-border">
        {preview && (
          <>
            <ManagedImage
              ref={imgRef}
              src={preview}
              alt="Uploaded Preview"
              className="w-full h-auto block"
              onLoad={() => setImageLoaded(true)}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </>
        )}
      </div>

      <button
        onClick={onReset}
        className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center transition cursor-pointer active:scale-95 duration-100"
        aria-label="Remove image"
      >
        <X size={18} className="text-white" />
      </button>
    </div>
  );
}
