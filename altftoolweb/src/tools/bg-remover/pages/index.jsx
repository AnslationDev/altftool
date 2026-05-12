"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "../components/Header";
import UploadBox from "../components/UploadBox";
import OriginalPreview from "../components/Original";
import ResultPreview from "../components/Results";
import BackgroundSelector from "../components/BgSelector";
import EditableCanvas from "../components/EditableCanvas";
import ShadowControls from "../components/ShadowControls";
import BatchProcessor from "../components/BatchProcessing";
// import  {error}  from "console";
import {useAlert } from "@/shared/ui/AlertProvider";

let backgroundRemovalModulePromise;

async function removeImageBackground(file) {
  backgroundRemovalModulePromise ||= import("@imgly/background-removal");
  const { removeBackground } = await backgroundRemovalModulePromise;
  return removeBackground(file);
}

export default function ToolHome() {
  const [originalImage, setOriginalImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [batchFiles, setBatchFiles] = useState(null);

  const [baseImage, setBaseImage] = useState(null);

  const [shadowSettings, setShadowSettings] = useState({
    enabled: true,
    angle: 45,
    blur: 15,
    opacity: 0.4,
    distance: 20,
  });

  const canvasRef = useRef(null);
  const imageUrlsRef = useRef({ originalImage: null, resultImage: null, finalImage: null });

  const {showAlert} = useAlert();

  const BACKGROUNDS = [
    { name: "White", src: "/backgrounds/white.png" },
    // { name: "Gradient", src: "/backgrounds/gradient.png" },
    { name: "Office", src: "/backgrounds/office.png" },
    { name: "Beach", src: "/backgrounds/beach.png" },
    { name: "Studio", src: "/backgrounds/studio.png" },
    { name: "Blur", src: "/backgrounds/blur.png" },
  ];

  useEffect(() => {
    imageUrlsRef.current = { originalImage, resultImage, finalImage };
  }, [finalImage, originalImage, resultImage]);

  useEffect(() => {
    return () => {
      const latestImages = imageUrlsRef.current;
      if (latestImages.originalImage) URL.revokeObjectURL(latestImages.originalImage);
      if (latestImages.resultImage) URL.revokeObjectURL(latestImages.resultImage);
      if (latestImages.finalImage) URL.revokeObjectURL(latestImages.finalImage);
    };
  }, []);

  const processImage = async (file) => {
    if (!file) return;

    if (Array.isArray(file)) {
      setBatchFiles(file);
      setOriginalImage(null);
      setResultImage(null);
      setFinalImage(null);
      return;
    }

    setBatchFiles(null);

    if (!file.type.startsWith("image/")) return;

    if (file.size > 10 * 1024 * 1024) {
      showAlert("File is too large! Max 10 MB.", "error");
      return;
    }

    if (originalImage) URL.revokeObjectURL(originalImage);
    if (resultImage) URL.revokeObjectURL(resultImage);
    if (finalImage) URL.revokeObjectURL(finalImage);

    setFinalImage(null);
    setSelectedBg(null);
    setResultImage(null);
    setBaseImage(null);
    setIsLoading(true);

    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);

    try {
      const resultBlob = await removeImageBackground(file);
      const resultUrl = URL.createObjectURL(resultBlob);

      setResultImage(resultUrl);
      setBaseImage(resultUrl);
      setFinalImage(resultUrl);
    } catch (error) {
      console.error(error);
      showAlert("Failed to remove background", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const mergeImages = useCallback(async (bgSrc, fgSrc) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const fg = new Image();
      fg.src = fgSrc;

      fg.onload = () => {
        canvas.width = fg.width;
        canvas.height = fg.height;

        if (typeof bgSrc === "string" && bgSrc.startsWith("#")) {
          ctx.fillStyle = bgSrc;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(fg, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
          });

          return;
        }

        const bg = new Image();
        bg.src = bgSrc;

        // bg.onerror = () =>{
        //   console.error("Background failed to load: ", bgSrc)
        // }

        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(fg, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
          });
        };
      };
    });
  }, []);

  const applyShadowOnly = useCallback(async (imgSrc, settings) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = imgSrc;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        const radians = (settings.angle * Math.PI) / 180;
        const offsetX = Math.cos(radians) * settings.distance;
        const offsetY = Math.sin(radians) * settings.distance;

        ctx.save();
        ctx.filter = `blur(${settings.blur}px)`;
        ctx.globalAlpha = settings.opacity;

        ctx.drawImage(img, offsetX, offsetY);

        ctx.restore();

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        });
      };
    });
  }, []);

  useEffect(() => {
    if (!resultImage) return;
    let cancelled = false;

    const composeImage = async () => {
      const sourceImage = baseImage || resultImage;
      let nextImage = sourceImage;

      if (selectedBg) {
        nextImage = await mergeImages(selectedBg, sourceImage);
      }

      if (shadowSettings.enabled) {
        nextImage = await applyShadowOnly(nextImage, shadowSettings);
      }

      if (!cancelled) setFinalImage(nextImage);
    };

    composeImage();

    return () => {
      cancelled = true;
    };
  }, [applyShadowOnly, baseImage, mergeImages, resultImage, selectedBg, shadowSettings]);

  const handleBackgroundSelect = async (bg) => {
    setSelectedBg(bg);
    console.log("Selected BG:", selectedBg);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setFinalImage(null);
    setBaseImage(null);
    setSelectedBg(null);
    setIsLoading(false);
    setBatchFiles(null);
  };

  const handleImportChanges = async () => {
    if (!canvasRef.current) return;
    const updatedImage = await canvasRef.current.getCanvasImage();
    if (updatedImage) {
      setBaseImage(updatedImage);
      setResultImage(updatedImage);
      setFinalImage(updatedImage);
    }
  };

  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        <Header />

        <div className="mt-6">
          <UploadBox processImage={processImage} isLoading={isLoading} />
        </div>

        {batchFiles ? (
          <div className="mt-10">
            <BatchProcessor files={batchFiles} />
          </div>
        ) : (
          (originalImage || resultImage) && (
            <div className="space-y-12">

              <section className="flex flex-col gap-5">
                {(resultImage) && <BackgroundSelector
                  backgrounds={BACKGROUNDS}
                  onSelect={handleBackgroundSelect}
                />} 

                <div className="flex flex-row justify-center gap-6">
                  {(originalImage) && <OriginalPreview image={originalImage} />}

                  {(resultImage) && <ResultPreview
                    image={finalImage || resultImage}
                    onReset={handleReset}
                  />}

                </div>

              </section>

            </div>
          )
        )}

      </div>
    </main>
  );
}
