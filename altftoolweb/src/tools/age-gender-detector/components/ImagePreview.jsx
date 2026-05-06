"use client";

import { useEffect, useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import { getFaceApi } from "../services/faceApiClient";

export default function ImagePreview({ mode, preview, onReset }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const [localImages, setLocalImages] = useState(
    Array.isArray(preview) ? preview : [preview]
  );

  const images = localImages;

  useEffect(() => {
    async function loadAndDraw() {
      // 🚫 STOP if compare mode and only 1 image
      if (mode === "compare" && images.length < 2) return;

      if (!imgRef.current || !canvasRef.current) return;

      const MODEL_URL = "/models";
      const faceapi = await getFaceApi();

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);

      const img = imgRef.current;
      const canvas = canvasRef.current;

      canvas.width = img.width;
      canvas.height = img.height;

      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 512 }))
        .withFaceLandmarks();

      const displaySize = { width: img.width, height: img.height };
      faceapi.matchDimensions(canvas, displaySize);

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resized.forEach((det) => {
        const landmarks = det.landmarks;
        if (!landmarks) return;

        const drawPoint = (pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#FF5733";
          ctx.fill();
        };

        landmarks.getLeftEye().forEach(drawPoint);
        landmarks.getRightEye().forEach(drawPoint);
        landmarks.getNose().forEach(drawPoint);
        landmarks.getMouth().forEach(drawPoint);
        landmarks.getJawOutline().forEach(drawPoint);
      });
    }

    loadAndDraw();
  }, [images, mode]);

  function handleUploadSecond(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setLocalImages((prev) => {
      const updated = [...prev];
      updated[1] = url;
      return updated;
    });
  }

  const isCompare = mode === "compare";

  return (
    <div className="relative">

      <div className={`grid gap-4 ${isCompare ? "grid-cols-2" : "grid-cols-1"}`}>

        {/* FIRST IMAGE */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-xl relative">
          {images[0] && (
            <>
              <ManagedImage
                ref={imgRef}
                src={images[0]}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />

              {/* Only draw canvas if NOT compare OR both images exist */}
              {(mode !== "compare" || images.length >= 2) && (
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              )}
            </>
          )}
        </div>

        {/* SECOND BOX */}
        {isCompare && (
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-xl relative flex items-center justify-center">

            {images[1] ? (
              <ManagedImage
                src={images[1]}
                alt="Second Upload"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <Upload size={32} />
                  <span className="text-sm mt-2">Upload another image</span>
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUploadSecond}
                />
              </>
            )}

          </div>
        )}

      </div>

      <button
        onClick={onReset}
        className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center"
      >
        <X size={18} className="text-white" />
      </button>

    </div>
  );
}
