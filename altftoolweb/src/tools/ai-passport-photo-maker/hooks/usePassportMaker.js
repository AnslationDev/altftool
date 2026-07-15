'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

import { PASSPORT_TEMPLATES, getTemplateById } from '../constants/templates';
import { BACKGROUND_OPTIONS } from '../constants/backgrounds';
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  PRINT_SHEET_OPTIONS,
  PAPER_SIZES,
  EXPORT_QUALITIES,
} from '../constants/defaults';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { loadImage, applyAdjustments, detectFaceRegion, cropToTemplate } from '../utils/imageProcessing';
import { checkCompliance } from '../utils/complianceUtils';
import { canvasToBlob, canvasToDataURL, downloadCanvas, mergeCanvasToPDF, createCanvas } from '../utils/canvasUtils';
import { generatePrintSheet } from '../utils/printSheetUtils';
import { detectFace } from '../services/faceDetectionService';

export default function usePassportMaker() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [template, setTemplateState] = useState(PASSPORT_TEMPLATES[0]);
  const [templates] = useState(PASSPORT_TEMPLATES);

  const [adjustments, setAdjustments] = useState({ ...DEFAULT_ADJUSTMENTS });

  const [background, setBackgroundState] = useState(BACKGROUND_OPTIONS[0]);

  const [editorStep, setEditorStep] = useState('upload');

  const [faceBounds, setFaceBounds] = useState(null);
  const [faceDetecting, setFaceDetecting] = useState(false);

  const [compliance, setCompliance] = useState(null);

  const [sheetOption, setSheetOption] = useState(PRINT_SHEET_OPTIONS[0].id);
  const [paperSize, setPaperSize] = useState(PAPER_SIZES[0]);

  const [exportFormat, setExportFormat] = useState('png');
  const [exportQuality, setExportQuality] = useState(EXPORT_QUALITIES[0].id);
  const [exporting, setExporting] = useState(false);

  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [settings, setSettingsState] = useState({ ...DEFAULT_SETTINGS });

  const [viewMode, setViewMode] = useState('original');
  const [gridVisible, setGridVisible] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ totalPhotos: 0, avgScore: 0, topTemplate: null });

  const processingCanvasRef = useRef(null);

  useEffect(() => {
    const savedHistory = loadFromStorage(STORAGE_KEYS.HISTORY, []);
    const savedFavorites = loadFromStorage(STORAGE_KEYS.FAVORITES, []);
    const savedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    setHistory(savedHistory);
    setFavorites(savedFavorites);
    setSettingsState(savedSettings);

    if (savedSettings.gridVisible !== undefined) {
      setGridVisible(savedSettings.gridVisible);
    }

    calculateStats(savedHistory);
  }, []);

  function calculateStats(historyData) {
    const list = historyData || history;
    if (!list.length) {
      setStats({ totalPhotos: 0, avgScore: 0, topTemplate: null });
      return;
    }

    const totalPhotos = list.length;
    const scores = list.filter(h => h.complianceScore != null).map(h => h.complianceScore);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const templateCounts = {};
    list.forEach(h => {
      const id = h.templateId || h.template?.id;
      if (id) templateCounts[id] = (templateCounts[id] || 0) + 1;
    });
    let topTemplate = null;
    let maxCount = 0;
    Object.entries(templateCounts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topTemplate = id;
      }
    });

    setStats({ totalPhotos, avgScore, topTemplate });
  }

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onRotationChange = useCallback((newRotation) => {
    setRotation(newRotation);
  }, []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const setTemplate = useCallback((templateOrId) => {
    let newTemplate;
    if (typeof templateOrId === 'string') {
      newTemplate = getTemplateById(templateOrId);
      if (!newTemplate) return;
    } else {
      newTemplate = templateOrId;
    }

    setTemplateState(newTemplate);
    setCompliance(null);
    setCroppedAreaPixels(null);
  }, []);

  const updateAdjustment = useCallback((key, value) => {
    setAdjustments(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetAdjustments = useCallback(() => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
  }, []);

  const setBackground = useCallback((bgOrObj) => {
    let bgObj;
    if (typeof bgOrObj === 'string') {
      const found = BACKGROUND_OPTIONS.find(b => b.id === bgOrObj);
      bgObj = found || { id: 'custom', name: 'Custom Color', color: bgOrObj };
    } else {
      bgObj = bgOrObj;
    }

    if (bgObj.id === 'custom' && bgOrObj.color && bgOrObj.color !== bgObj.color) {
      bgObj = { ...bgObj, color: bgOrObj.color };
    }

    setBackgroundState(bgObj);
  }, []);

  const handleUpload = useCallback(async (file) => {
    setError(null);
    setProcessing(true);
    setLoadingMessage('Processing image...');

    try {
      let processedFile = file;

      if (file.size > 5 * 1024 * 1024 || file.type === 'image/heic' || file.type === 'image/heif') {
        setLoadingMessage('Compressing image...');
        processedFile = await imageCompression(file, {
          maxSizeMB: 5,
          maxWidthOrHeight: 3000,
          useWebWorker: true,
        });
      }

      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(processedFile);
      });

      setLoadingMessage('Loading image...');
      const img = await loadImage(dataUrl);

      const imageInfo = {
        file: processedFile,
        dataUrl,
        width: img.width,
        height: img.height,
      };

      setImage(imageInfo);
      setProcessedImage(null);
      setCompliance(null);
      setFaceBounds(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setAdjustments({ ...DEFAULT_ADJUSTMENTS });
      setViewMode('original');

      setFaceDetecting(true);
      setLoadingMessage('Detecting face...');
      try {
        const detected = await detectFace(img);
        if (detected && detected.x !== undefined) {
          setFaceBounds(detected);
          const faceCropX = (detected.x / img.width) * 100;
          const faceCropY = (detected.y / img.height) * 100;
          const faceCropW = (detected.w / img.width) * 100;
          const faceCropH = (detected.h / img.height) * 100;

          setCrop({
            x: faceCropX + faceCropW / 2 - 25,
            y: faceCropY + faceCropH / 2 - 25,
          });

          const faceArea = (detected.w * detected.h) / (img.width * img.height);
          const calculatedZoom = Math.max(0.5, Math.min(3, 0.5 / faceArea));
          setZoom(Math.min(calculatedZoom, 3));
        } else {
          const fallbackBounds = detectFaceRegion(img);
          if (fallbackBounds) {
            setFaceBounds(fallbackBounds);
          }
        }
      } catch {
        const fallbackBounds = detectFaceRegion(img);
        if (fallbackBounds) {
          setFaceBounds(fallbackBounds);
        }
      }
      setFaceDetecting(false);

      setEditorStep('crop');
      setLoadingMessage(null);
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      setLoadingMessage(null);
    } finally {
      setProcessing(false);
    }
  }, []);

  const generateResult = useCallback(async () => {
    if (!image) return null;

    setProcessing(true);
    setLoadingMessage('Generating result...');

    try {
      const img = await loadImage(image.dataUrl);
      const tpl = template;

      const cropW = croppedAreaPixels?.width || img.width;
      const cropH = croppedAreaPixels?.height || img.height;
      const cropX = croppedAreaPixels?.x || 0;
      const cropY = croppedAreaPixels?.y || 0;

      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = tpl.width;
      resultCanvas.height = tpl.height;
      const ctx = resultCanvas.getContext('2d');

      const bgColor = background.color && background.color !== 'transparent' && background.color !== 'blur' && background.color !== 'gradient'
        ? background.color
        : background.id === 'transparent' ? null : '#FFFFFF';

      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
      }

      ctx.save();

      if (rotation) {
        const rad = (rotation * Math.PI) / 180;
        ctx.translate(resultCanvas.width / 2, resultCanvas.height / 2);
        ctx.rotate(rad);
        ctx.translate(-resultCanvas.width / 2, -resultCanvas.height / 2);
      }

      if (adjustments.flipH || adjustments.flipV) {
        ctx.translate(adjustments.flipH ? resultCanvas.width : 0, adjustments.flipV ? resultCanvas.height : 0);
        ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);
      }

      const zoomAdjust = adjustments.zoom || 1;
      const drawW = cropW * zoomAdjust;
      const drawH = cropH * zoomAdjust;
      const drawX = -cropX * zoomAdjust + (resultCanvas.width - drawW) / 2 + (cropW - drawW) / 2;
      const drawY = -cropY * zoomAdjust + (resultCanvas.height - drawH) / 2 + (cropH - drawH) / 2;

      ctx.drawImage(img, 0, 0, img.width, img.height, drawX, drawY, resultCanvas.width, resultCanvas.height);

      ctx.restore();

      const hasAdjustments = adjustments.brightness || adjustments.contrast || adjustments.saturation
        || adjustments.sharpness || adjustments.exposure || adjustments.shadows
        || adjustments.highlights || adjustments.temperature || adjustments.tint;

      if (hasAdjustments) {
        applyAdjustments(ctx, resultCanvas.width, resultCanvas.height, adjustments);
      }

      if (background.id === 'blur') {
        applyBlurEffect(ctx, resultCanvas.width, resultCanvas.height);
      } else if (background.id === 'gradient') {
        applyGradientEffect(ctx, resultCanvas.width, resultCanvas.height);
      }

      const dataUrl = resultCanvas.toDataURL('image/png');

      setProcessedImage(dataUrl);

      setCompliance(null);
      try {
        const complianceResult = checkCompliance(
          ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height),
          tpl
        );
        setCompliance(complianceResult);
      } catch {
        // compliance check failed silently
      }

      processingCanvasRef.current = resultCanvas;
      setLoadingMessage(null);
      return dataUrl;
    } catch (err) {
      setError(err.message || 'Failed to generate result');
      setLoadingMessage(null);
      return null;
    } finally {
      setProcessing(false);
    }
  }, [image, template, adjustments, background, croppedAreaPixels, rotation]);

  const performExport = useCallback(async (resultDataUrl, format, qualityId) => {
    const fmt = format || exportFormat;
    const qId = qualityId || exportQuality;
    const qualityObj = EXPORT_QUALITIES.find(q => q.id === qId) || EXPORT_QUALITIES[0];
    const tpl = template;

    const date = new Date().toISOString().split('T')[0];
    const safeName = tpl.name.replace(/\s+/g, '_').toLowerCase();

    if (fmt === 'pdf') {
      const pdf = new jsPDF({
        orientation: tpl.width > tpl.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [tpl.width, tpl.height],
      });
      pdf.addImage(resultDataUrl, 'PNG', 0, 0, tpl.width, tpl.height);
      const pdfBlob = pdf.output('blob');
      saveAs(pdfBlob, `${safeName}_passport_${date}.pdf`);
    } else {
      const mimeType = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
      const blob = await (await fetch(resultDataUrl)).blob();
      const newBlob = new Blob([blob], { type: mimeType });
      const ext = fmt === 'jpg' ? 'jpg' : 'png';
      saveAs(newBlob, `${safeName}_passport_${date}.${ext}`);
    }

    const historyEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      templateId: tpl.id,
      template: { id: tpl.id, name: tpl.name, country: tpl.country },
      background: { id: background.id, color: background.color },
      adjustments: { ...adjustments },
      complianceScore: compliance?.overallScore || null,
      exportFormat: fmt,
      exportQuality: qId,
      thumbnail: null,
    };

    try {
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 120;
      thumbCanvas.height = 160;
      const thumbCtx = thumbCanvas.getContext('2d');
      const img = await loadImage(resultDataUrl);
      thumbCtx.drawImage(img, 0, 0, 120, 160);
      historyEntry.thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.5);
    } catch {
      // thumbnail generation failed
    }

    const updatedHistory = addToHistoryInternal(historyEntry);
    calculateStats(updatedHistory);
  }, [exportFormat, exportQuality, template, background, adjustments, compliance]);

  function addToHistoryInternal(item) {
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 20);
    setHistory(updated);
    saveToStorage(STORAGE_KEYS.HISTORY, updated);
    return updated;
  }

  const handleExport = useCallback(async (format) => {
    setExporting(true);
    setError(null);

    try {
      let resultDataUrl = processedImage;

      if (!resultDataUrl && processingCanvasRef.current) {
        resultDataUrl = processingCanvasRef.current.toDataURL('image/png');
      }

      if (!resultDataUrl) {
        resultDataUrl = await generateResult();
      }

      if (!resultDataUrl) {
        throw new Error('No image to export');
      }

      await performExport(resultDataUrl, format || exportFormat, null);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }, [processedImage, generateResult, performExport, exportFormat]);

  const handleReset = useCallback(() => {
    setImage(null);
    setProcessedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setTemplateState(PASSPORT_TEMPLATES[0]);
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setBackgroundState(BACKGROUND_OPTIONS[0]);
    setEditorStep('upload');
    setFaceBounds(null);
    setFaceDetecting(false);
    setCompliance(null);
    setViewMode('original');
    setError(null);
    setLoadingMessage(null);
    setSheetOption(PRINT_SHEET_OPTIONS[0].id);
    setPaperSize(PAPER_SIZES[0]);
    setExportFormat('png');
    setExportQuality(EXPORT_QUALITIES[0].id);
    processingCanvasRef.current = null;
  }, []);

  const clearAll = useCallback(() => {
    handleReset();
  }, [handleReset]);

  const addToHistory = useCallback((result) => {
    if (!result) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      templateId: template.id,
      template: { id: template.id, name: template.name, country: template.country },
      background: { id: background.id, color: background.color },
      adjustments: { ...adjustments },
      complianceScore: result.complianceScore || compliance?.overallScore || null,
      exportFormat: result.exportFormat || exportFormat,
      exportQuality: result.exportQuality || exportQuality,
      thumbnail: result.thumbnail || null,
    };
    const updatedHistory = addToHistoryInternal(entry);
    calculateStats(updatedHistory);
  }, [template, background, adjustments, compliance, exportFormat, exportQuality, history]);

  const toggleFavorite = useCallback((item) => {
    const exists = favorites.findIndex(f => (f.id === item.id || (f.timestamp === item.timestamp)));
    let updated;
    if (exists >= 0) {
      updated = favorites.filter((_, i) => i !== exists);
    } else {
      updated = [...favorites, item];
    }
    setFavorites(updated);
    saveToStorage(STORAGE_KEYS.FAVORITES, updated);
    return updated;
  }, [favorites]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveToStorage(STORAGE_KEYS.HISTORY, []);
    setStats({ totalPhotos: 0, avgScore: 0, topTemplate: null });
  }, []);

  const removeHistoryItem = useCallback((id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveToStorage(STORAGE_KEYS.HISTORY, updated);
    calculateStats(updated);
  }, [history]);

  const updateSetting = useCallback((key, value) => {
    setSettingsState(prev => {
      const updated = { ...prev, [key]: value };
      saveToStorage(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });

    if (key === 'gridVisible') {
      setGridVisible(value);
    }
  }, []);

  function applyBlurEffect(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    const radius = 5;
    const size = radius * 2 + 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx));
            const py = Math.min(height - 1, Math.max(0, y + ky));
            const i = (py * width + px) * 4;
            r += copy[i];
            g += copy[i + 1];
            b += copy[i + 2];
            a += copy[i + 3];
            count++;
          }
        }
        const i = (y * width + x) * 4;
        data[i] = r / count;
        data[i + 1] = g / count;
        data[i + 2] = b / count;
        data[i + 3] = a / count;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function applyGradientEffect(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  return {
    image,
    processedImage,
    processing,

    crop,
    zoom,
    rotation,
    croppedAreaPixels,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onRotationChange,

    template,
    setTemplate,
    templates,

    adjustments,
    updateAdjustment,
    resetAdjustments,

    background,
    setBackground,

    editorStep,
    setEditorStep,

    faceBounds,
    faceDetecting,

    compliance,

    sheetOption,
    setSheetOption,
    paperSize,
    setPaperSize,

    exportFormat,
    setExportFormat,
    exportQuality,
    setExportQuality,
    exporting,

    history,
    favorites,
    addToHistory,
    toggleFavorite,
    clearHistory,
    removeHistoryItem,

    settings,
    updateSetting,

    handleUpload,
    handleCropComplete,
    generateResult,
    handleExport,
    handleReset,
    clearAll,

    viewMode,
    setViewMode,
    gridVisible,
    setGridVisible,
    loadingMessage,
    error,

    stats,
  };
}
