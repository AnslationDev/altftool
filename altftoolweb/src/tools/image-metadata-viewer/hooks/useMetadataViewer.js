"use client";

import { useState, useCallback } from "react";
import { MetadataParser } from "../utils/metadataParser";
import { ColorAnalyzer } from "../utils/colorAnalyzer";
import { PrivacyDetector } from "../services/detectionService";
import { SUPPORTED_FORMATS } from "../constants/index";

export function useMetadataViewer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [colorPalette, setColorPalette] = useState([]);
  const [dominantColor, setDominantColor] = useState(null);
  const [averageColor, setAverageColor] = useState(null);
  const [hasTransparency, setHasTransparency] = useState(false);
  const [privacyAnalysis, setPrivacyAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    camera: true,
    exposure: true,
    gps: true,
    dates: false,
    software: false,
    other: false,
  });
  const [activeTab, setActiveTab] = useState("metadata");

  const handleFileUpload = useCallback(async (uploadFile) => {
    if (!uploadFile) return;

    if (!SUPPORTED_FORMATS.includes(uploadFile.type)) {
      setError("Unsupported file format. Please upload a JPEG, PNG, WebP, GIF, TIFF, or BMP image.");
      return;
    }

    setError("");
    setIsLoading(true);
    setFile(uploadFile);

    const objectUrl = URL.createObjectURL(uploadFile);
    setPreview(objectUrl);

    try {
      const buffer = await uploadFile.arrayBuffer();
      const parsed = MetadataParser.parseExif(buffer);

      const fileInfo = {
        name: uploadFile.name,
        size: uploadFile.size,
        type: uploadFile.type || "Unknown",
      };

      const enriched = {
        ...parsed,
        fileInfo,
        camera: [
          { tag: -1, name: "File Name", value: fileInfo.name },
          { tag: -2, name: "File Size", value: MetadataParser.formatBytes(fileInfo.size) },
          { tag: -3, name: "File Type", value: fileInfo.type },
          ...parsed.camera,
        ],
      };

      setMetadata(enriched);

      const image = new Image();
      image.onload = () => {
        try {
          const palette = ColorAnalyzer.extractColorPalette(image, 8);
          setColorPalette(palette);
          setDominantColor(ColorAnalyzer.getDominantColor(image));
          setAverageColor(ColorAnalyzer.getAverageColor(image));
          setHasTransparency(ColorAnalyzer.hasTransparency(image));
        } catch {
          setColorPalette([]);
          setDominantColor(null);
          setAverageColor(null);
          setHasTransparency(false);
        }
        setIsLoading(false);
      };
      image.onerror = () => {
        setIsLoading(false);
      };
      image.src = objectUrl;
    } catch {
      setError("Failed to parse image metadata.");
      setIsLoading(false);
    }
  }, []);

  const removeImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setMetadata(null);
    setColorPalette([]);
    setDominantColor(null);
    setAverageColor(null);
    setHasTransparency(false);
    setPrivacyAnalysis(null);
    setError("");
    setIsLoading(false);
    setSearchQuery("");
    setActiveTab("metadata");
  }, [preview]);

  const replaceImage = useCallback(
    (newFile) => {
      removeImage();
      setTimeout(() => handleFileUpload(newFile), 0);
    },
    [removeImage, handleFileUpload]
  );

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const getFilteredMetadata = useCallback(() => {
    if (!metadata) return null;
    if (!searchQuery.trim()) return metadata;

    const q = searchQuery.toLowerCase().trim();
    const filterRows = (rows) =>
      rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          String(r.value).toLowerCase().includes(q)
      );

    return {
      ...metadata,
      camera: filterRows(metadata.camera),
      exposure: filterRows(metadata.exposure),
      gps: filterRows(metadata.gps),
      dates: filterRows(metadata.dates),
      software: filterRows(metadata.software),
      other: metadata.other ? filterRows(metadata.other) : [],
    };
  }, [metadata, searchQuery]);

  const getExportData = useCallback(() => {
    if (!metadata) return null;

    const analysis =
      privacyAnalysis || PrivacyDetector.analyzePrivacy(metadata);

    return {
      fileName: file?.name || "unknown",
      fileSize: file?.size || 0,
      fileType: file?.type || "unknown",
      metadata: {
        camera: metadata.camera,
        exposure: metadata.exposure,
        gps: metadata.gps,
        dates: metadata.dates,
        software: metadata.software,
      },
      colors: {
        palette: colorPalette,
        dominant: dominantColor,
        average: averageColor,
        hasTransparency,
      },
      privacy: analysis,
      exportedAt: new Date().toISOString(),
    };
  }, [
    metadata,
    file,
    colorPalette,
    dominantColor,
    averageColor,
    hasTransparency,
    privacyAnalysis,
  ]);

  return {
    file,
    preview,
    metadata,
    colorPalette,
    dominantColor,
    averageColor,
    hasTransparency,
    privacyAnalysis,
    setPrivacyAnalysis,
    error,
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedSections,
    activeTab,
    setActiveTab,
    handleFileUpload,
    removeImage,
    replaceImage,
    toggleSection,
    getFilteredMetadata,
    getExportData,
  };
}

export default useMetadataViewer;
