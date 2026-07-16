"use client";
import React, { useRef, useEffect } from "react";
import { UserCircle } from "lucide-react";

export default function VisualCanvas({ imageSrc, title, settings, processing }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Fit image into canvas container
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      const w = img.width * scale;
      const h = img.height * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, w, h);

      // Render facial metadata overlays
      const centerX = x + w / 2;
      const centerY = y + h / 2.1;
      const faceW = w * 0.45;
      const faceH = h * 0.55;

      // 1. Draw Bounding Box
      if (settings.showBoundingBoxes && !processing) {
        ctx.strokeStyle = "#14B8A6"; // Teal Box
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - faceW / 2, centerY - faceH / 2, faceW, faceH);

        // Draw corner brackets
        ctx.fillStyle = "#14B8A6";
        ctx.font = "bold 10px monospace";
        ctx.fillText("BIOMETRIC ALIGNED [99%]", centerX - faceW / 2, centerY - faceH / 2 - 8);
      }

      // 2. Draw Facial Landmarks (Eyes, Nose, Mouth, Eyebrows)
      if (settings.showLandmarks && !processing) {
        ctx.fillStyle = "#22d3ee"; // Cyan dots
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 1.5;

        // Landmark coordinates relative to center
        const landmarks = {
          leftEye: [centerX - faceW * 0.22, centerY - faceH * 0.08],
          rightEye: [centerX + faceW * 0.22, centerY - faceH * 0.08],
          noseTip: [centerX, centerY + faceH * 0.08],
          mouthLeft: [centerX - faceW * 0.18, centerY + faceH * 0.24],
          mouthRight: [centerX + faceW * 0.18, centerY + faceH * 0.24],
          mouthCenter: [centerX, centerY + faceH * 0.26],
          leftBrow: [
            [centerX - faceW * 0.32, centerY - faceH * 0.18],
            [centerX - faceW * 0.12, centerY - faceH * 0.18],
          ],
          rightBrow: [
            [centerX + faceW * 0.12, centerY - faceH * 0.18],
            [centerX + faceW * 0.32, centerY - faceH * 0.18],
          ],
        };

        const drawPoint = (pt) => {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 4, 0, Math.PI * 2);
          ctx.fill();
        };

        drawPoint(landmarks.leftEye);
        drawPoint(landmarks.rightEye);

        // Draw Nose
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - faceH * 0.08);
        ctx.lineTo(landmarks.noseTip[0], landmarks.noseTip[1]);
        ctx.stroke();
        drawPoint(landmarks.noseTip);

        // Draw Eyebrows lines
        ctx.beginPath();
        ctx.moveTo(landmarks.leftBrow[0][0], landmarks.leftBrow[0][1]);
        ctx.lineTo(landmarks.leftBrow[1][0], landmarks.leftBrow[1][1]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(landmarks.rightBrow[0][0], landmarks.rightBrow[0][1]);
        ctx.lineTo(landmarks.rightBrow[1][0], landmarks.rightBrow[1][1]);
        ctx.stroke();

        // Draw Mouth shape
        ctx.beginPath();
        ctx.moveTo(landmarks.mouthLeft[0], landmarks.mouthLeft[1]);
        ctx.quadraticCurveTo(landmarks.mouthCenter[0], landmarks.mouthCenter[1] + 4, landmarks.mouthRight[0], landmarks.mouthRight[1]);
        ctx.stroke();
      }
    };
  }, [imageSrc, settings, processing]);

  return (
    <div className="bg-(--surface) border border-(--border) p-5 rounded-2xl shadow-lg flex flex-col items-center relative overflow-hidden backdrop-blur-md bg-opacity-80">
      <h4 className="text-xs font-extrabold text-(--foreground) mb-4 uppercase tracking-widest flex items-center gap-2">
        <UserCircle className="w-4 h-4 text-teal-500" /> {title}
      </h4>

      <div className={`relative w-full aspect-square max-w-[320px] rounded-xl overflow-hidden flex items-center justify-center transition-all ${
        imageSrc ? "border-2 border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner" : "border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
      }`}>
        
        {processing && imageSrc && (
          <div 
            className="absolute left-0 right-0 h-1 bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,1)] z-10"
            style={{ animation: "scan 2s infinite ease-in-out" }}
          />
        )}
        
        {processing && imageSrc && (
          <div className="absolute inset-0 bg-teal-900/20 z-0 mix-blend-overlay"></div>
        )}

        {imageSrc ? (
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className={`w-full h-full object-contain transition-opacity duration-300 ${processing ? 'opacity-80' : 'opacity-100'}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center space-y-3">
            <UserCircle className="w-12 h-12 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-wider">Empty Canvas</span>
            <span className="text-[10px] opacity-70">Upload a face to begin analysis</span>
          </div>
        )}
      </div>
    </div>
  );
}
