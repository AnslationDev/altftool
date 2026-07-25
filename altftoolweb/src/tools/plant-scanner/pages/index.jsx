"use client";

import React, { useEffect, useState } from "react";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Leaf,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function PlantScanner() {
  const [loading, setLoading] = useState(false);
  const [plantData, setPlantData] = useState(null);
  const [error, setError] = useState(null);
  const [providerStatus, setProviderStatus] = useState("checking");

  // Image Upload State
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/tools/plant-identify", {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload) => {
        setProviderStatus(payload?.available ? "available" : "unavailable");
      })
      .catch((statusError) => {
        if (statusError?.name !== "AbortError") {
          setProviderStatus("unavailable");
        }
      });

    return () => controller.abort();
  }, []);

  const handleFileChange = (event) => {
    if (providerStatus !== "available") return;

    const file = event.target.files[0];
    setFileError("");
    setError(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("Image size must be less than 4 MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    setFileError("");
    setPlantData(null);
    setError(null);
  };

  const identifyPlant = async () => {
    if (!preview || providerStatus !== "available") return;

    setLoading(true);
    setError(null);
    setPlantData(null);

    try {
      // Get base64 string without data URL prefix
      const base64 = preview.split(",")[1];

      const response = await fetch("/api/tools/plant-identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503) setProviderStatus("unavailable");
        throw new Error(data.error || "The plant could not be identified right now.");
      }

      if (data.result?.is_plant?.binary) {
        const suggestions = data.result.classification?.suggestions || [];
        if (suggestions.length > 0) {
          setPlantData(suggestions.slice(0, 3));
        } else {
          setError(
            "No plant identified. Try a clearer image with the plant clearly visible."
          );
        }
      } else {
        setError(
          "The image does not appear to contain a plant. Please upload a clear photo of a plant."
        );
      }
    } catch (err) {
      setError(err.message || "An error occurred while identifying the plant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 mb-2">
            <Leaf className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-(--foreground) tracking-tight">
            AI Plant Scanner
          </h1>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Upload or take a photo of any plant to instantly identify it using advanced AI. Discover common names, taxonomy, and care details.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="bg-(--card) border border-(--border) rounded-3xl p-6 md:p-10 shadow-sm max-w-3xl mx-auto">

          <div aria-live="polite">
            {providerStatus === "checking" ? (
              <div className="mb-6 flex items-center gap-3 border border-(--border) bg-(--muted) p-4 text-sm text-(--muted-foreground)">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
                Checking plant identification availability...
              </div>
            ) : null}

            {providerStatus === "unavailable" ? (
              <div className="mb-6 flex items-start gap-3 border border-(--border) bg-(--muted) p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-(--muted-foreground)" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-(--foreground)">
                    Plant identification is temporarily unavailable
                  </p>
                  <p className="mt-1 text-sm text-(--muted-foreground)">
                    Selected images are not sent while the service is
                    unavailable. Please try again later.
                  </p>
                </div>
              </div>
            ) : null}

            {error && (
              <div role="alert" className="mb-6 flex items-start gap-3 border border-(--destructive)/30 bg-(--destructive)/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-(--destructive)" aria-hidden="true" />
                <p className="text-sm font-medium text-(--destructive)">{error}</p>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="space-y-6 text-center">

            {fileError && (
              <p className="inline-block bg-(--destructive)/10 px-4 py-2 text-sm font-medium text-(--destructive)">
                {fileError}
              </p>
            )}

            <div className={`relative border-2 border-dashed rounded-2xl p-6 md:p-10 transition-all ${
              preview ? 'border-(--primary)/30 bg-(--primary)/5' : 'border-(--border) bg-(--muted)/30 hover:bg-(--muted)/50 hover:border-(--primary)/50'
            }`}>
              {preview ? (
                <div className="space-y-4">
                  {/* The object URL is browser-local and cannot use the Next image optimizer. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Plant preview"
                    className="max-h-64 mx-auto rounded-xl object-contain shadow-sm"
                    decoding="async"
                  />
                  <p className="text-sm font-medium text-(--muted-foreground) truncate max-w-xs mx-auto">
                    {fileName}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                  <div className="w-20 h-20 bg-(--background) rounded-full flex items-center justify-center shadow-sm border border-(--border)">
                    <ImageIcon className="w-10 h-10 text-(--muted-foreground)" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-(--foreground) font-medium text-lg">No image selected</p>
                    <p className="text-(--muted-foreground) text-sm max-w-sm mx-auto">
                      Ensure the plant is well-lit and clearly visible in the center of the frame.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {!preview ? (
                <>
                  <label
                    aria-disabled={providerStatus !== "available"}
                    className={`w-full flex-1 sm:w-auto ${
                      providerStatus === "available"
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <input
                      type="file"
                      hidden
                      disabled={providerStatus !== "available"}
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                    />
                    <div className="flex h-12 items-center justify-center gap-2 border border-(--border) bg-(--background) px-6 font-medium text-(--foreground) transition hover:bg-(--muted) sm:hidden">
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </div>
                  </label>
                  <label
                    aria-disabled={providerStatus !== "available"}
                    className={`w-full flex-1 sm:w-auto ${
                      providerStatus === "available"
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <input
                      type="file"
                      hidden
                      disabled={providerStatus !== "available"}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="flex h-12 items-center justify-center gap-2 bg-(--primary) px-8 font-medium text-(--primary-foreground) transition hover:opacity-90 active:scale-[0.98]">
                      <Upload className="w-5 h-5" />
                      Choose Image
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <button
                    onClick={identifyPlant}
                    disabled={loading || providerStatus !== "available"}
                    className="w-full sm:w-auto flex-1 h-12 px-8 rounded-xl bg-(--primary) text-white font-medium hover:bg-(--primary)/90 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Leaf className="w-5 h-5" />
                        Identify Plant
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={loading}
                    className="w-full sm:w-auto h-12 px-8 rounded-xl bg-(--background) border border-(--border) text-(--foreground) font-medium hover:bg-(--muted) transition-all disabled:opacity-50"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Results Section */}
        {plantData && (
          <div className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-(--foreground) mb-6 text-center">Identification Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plantData.map((plant, index) => {
                const probability = Math.round(plant.probability * 100);
                const details = plant.details || {};
                const taxonomy = details.taxonomy || {};
                const commonNames = details.common_names || [];

                return (
                  <div key={index} className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-(--primary)/10 text-(--primary)">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {probability}% Match
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-(--foreground) mb-1 leading-tight">
                        {plant.name}
                      </h3>

                      {commonNames.length > 0 && (
                        <p className="text-sm font-medium text-(--muted-foreground) mb-4">
                          &ldquo;{commonNames[0]}&rdquo;
                        </p>
                      )}

                      <div className="w-full h-2 bg-(--muted) rounded-full overflow-hidden mb-6">
                        <div
                          className="h-full bg-(--primary) rounded-full"
                          style={{ width: `${probability}%` }}
                        />
                      </div>

                      <div className="space-y-2 mb-6 text-sm flex-1">
                        {taxonomy.family && (
                          <div className="flex justify-between border-b border-(--border) pb-2">
                            <span className="text-(--muted-foreground)">Family</span>
                            <span className="font-semibold text-(--foreground)">{taxonomy.family}</span>
                          </div>
                        )}
                        {taxonomy.genus && (
                          <div className="flex justify-between border-b border-(--border) pb-2">
                            <span className="text-(--muted-foreground)">Genus</span>
                            <span className="font-semibold text-(--foreground)">{taxonomy.genus}</span>
                          </div>
                        )}
                        {taxonomy.order && (
                          <div className="flex justify-between border-b border-(--border) pb-2">
                            <span className="text-(--muted-foreground)">Order</span>
                            <span className="font-semibold text-(--foreground)">{taxonomy.order}</span>
                          </div>
                        )}
                      </div>

                      {details.url && (
                        <a
                          href={details.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-(--muted) hover:bg-(--border) text-(--foreground) font-medium text-sm transition-colors mt-auto"
                        >
                          Learn More on Wikipedia
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
