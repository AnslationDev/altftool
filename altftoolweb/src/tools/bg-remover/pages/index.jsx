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

  const [isEditingCanvas, setIsEditingCanvas] = useState(false);

  const canvasRef = useRef(null);
  const imageUrlsRef = useRef({ originalImage: null, resultImage: null, finalImage: null });
  // Tracks the most recent finalImage URL that composeImage generated itself (merge/shadow
  // output), so the next run (or a manual edit) can revoke it instead of leaking it.
  const composedUrlRef = useRef(null);

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
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (resultImage) URL.revokeObjectURL(resultImage);
      if (finalImage) URL.revokeObjectURL(finalImage);
      composedUrlRef.current = null;

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
    composedUrlRef.current = null;

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
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const fg = new Image();
      fg.src = fgSrc;

      fg.onerror = () => {
        reject(new Error(`Failed to load the cutout image for compositing: ${fgSrc}`));
      };

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

        bg.onerror = () => {
          console.error("Background failed to load: ", bgSrc);
          reject(new Error(`Failed to load background image: ${bgSrc}`));
        };

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

  // Builds a true drop shadow: a solid-colour silhouette derived from the subject's own alpha
  // channel (via a source-in composite), not a blurred colour duplicate of the subject itself.
  // The canvas is padded so the blurred/offset silhouette is never clipped at the edges.
  const applyShadowOnly = useCallback(async (imgSrc, settings) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgSrc;

      img.onerror = () => {
        reject(new Error(`Failed to load image for shadow compositing: ${imgSrc}`));
      };

      img.onload = () => {
        const radians = (settings.angle * Math.PI) / 180;
        const offsetX = Math.cos(radians) * settings.distance;
        const offsetY = Math.sin(radians) * settings.distance;

        const pad = Math.ceil(settings.blur * 2 + settings.distance + 4);

        const canvas = document.createElement("canvas");
        canvas.width = img.width + pad * 2;
        canvas.height = img.height + pad * 2;
        const ctx = canvas.getContext("2d");

        const silhouette = document.createElement("canvas");
        silhouette.width = img.width;
        silhouette.height = img.height;
        const silhouetteCtx = silhouette.getContext("2d");
        silhouetteCtx.drawImage(img, 0, 0);
        silhouetteCtx.globalCompositeOperation = "source-in";
        silhouetteCtx.fillStyle = "#000000";
        silhouetteCtx.fillRect(0, 0, silhouette.width, silhouette.height);

        ctx.save();
        ctx.filter = `blur(${settings.blur}px)`;
        ctx.globalAlpha = settings.opacity;
        ctx.drawImage(silhouette, pad + offsetX, pad + offsetY);
        ctx.restore();

        ctx.drawImage(img, pad, pad);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to render the shadow composite"));
            return;
          }
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
      // Shadow is derived from the subject's alpha channel, so it must run BEFORE the subject
      // is flattened onto an opaque background (otherwise there is no transparency left to
      // derive a silhouette from).
      let nextImage = sourceImage;
      const generatedUrls = [];

      try {
        if (shadowSettings.enabled) {
          nextImage = await applyShadowOnly(sourceImage, shadowSettings);
          generatedUrls.push(nextImage);
        }

        if (selectedBg) {
          const merged = await mergeImages(selectedBg, nextImage);
          generatedUrls.push(merged);
          nextImage = merged;
        }
      } catch (err) {
        console.error(err);
        showAlert("Failed to compose the image preview", "error");
        nextImage = sourceImage;
      }

      // Revoke every URL generated during this run except the one we're about to keep/show.
      generatedUrls.forEach((url) => {
        if (url !== nextImage) URL.revokeObjectURL(url);
      });

      if (cancelled) {
        if (nextImage !== sourceImage) URL.revokeObjectURL(nextImage);
        return;
      }

      // Revoke the composite this effect generated last time, now that it's being replaced.
      if (composedUrlRef.current && composedUrlRef.current !== sourceImage) {
        URL.revokeObjectURL(composedUrlRef.current);
      }
      composedUrlRef.current = nextImage !== sourceImage ? nextImage : null;

      setFinalImage(nextImage);
    };

    composeImage();

    return () => {
      cancelled = true;
    };
  }, [applyShadowOnly, baseImage, mergeImages, resultImage, selectedBg, shadowSettings, showAlert]);

  const handleBackgroundSelect = async (bg) => {
    setSelectedBg(bg);
  };

  const handleReset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (resultImage) URL.revokeObjectURL(resultImage);
    if (finalImage) URL.revokeObjectURL(finalImage);
    composedUrlRef.current = null;

    setOriginalImage(null);
    setResultImage(null);
    setFinalImage(null);
    setBaseImage(null);
    setSelectedBg(null);
    setIsLoading(false);
    setBatchFiles(null);
    setIsEditingCanvas(false);
  };

  const handleImportChanges = async () => {
    if (!canvasRef.current) return;
    const updatedImage = await canvasRef.current.getCanvasImage();
    if (updatedImage) {
      // Revoke the pre-edit URLs (raw result/base and any generated composite) before
      // replacing them, the same way a fresh upload does.
      if (finalImage && finalImage !== resultImage && finalImage !== baseImage) {
        URL.revokeObjectURL(finalImage);
      }
      if (resultImage) URL.revokeObjectURL(resultImage);
      if (baseImage && baseImage !== resultImage) URL.revokeObjectURL(baseImage);
      composedUrlRef.current = null;

      setBaseImage(updatedImage);
      setResultImage(updatedImage);
      setFinalImage(updatedImage);
    }
    setIsEditingCanvas(false);
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

                {(resultImage) && (
                  <ShadowControls settings={shadowSettings} onChange={setShadowSettings} />
                )}

                {isEditingCanvas ? (
                  <div className="flex flex-col items-center gap-4">
                    <EditableCanvas
                      ref={canvasRef}
                      resultImage={finalImage || resultImage}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingCanvas(false)}
                        className="px-4 py-2 rounded-md font-semibold text-sm border border-(--border) bg-(--card) text-(--foreground)"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleImportChanges}
                        className="px-4 py-2 rounded-md font-semibold text-sm bg-(--primary) text-white"
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row justify-center gap-6">
                    {(originalImage) && <OriginalPreview image={originalImage} />}

                    {(resultImage) && (
                      <div className="flex flex-col items-center gap-3">
                        <ResultPreview
                          image={finalImage || resultImage}
                          onReset={handleReset}
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingCanvas(true)}
                          className="text-sm font-semibold text-(--primary) hover:underline"
                        >
                          Manually edit cutout
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </section>

            </div>
          )
        )}

      </div>
    </main>
  );
}
