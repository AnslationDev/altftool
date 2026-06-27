"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import getStroke from "perfect-freehand";
import { nanoid } from "nanoid";
import LZString from "lz-string";

import { STORAGE_KEY, HISTORY_LIMIT, ACCENT, DEFAULT_STYLE, buildToolbarFromConfig, buildToolKeysFromConfig } from './utils/constants';
import { DEFAULT_HOME_CONTENT } from './lib/homeContent';
import { clone, normalizeScene, scenesEqual, makeElement, normalizeElement, boundsOf, centerOf, hitElement, getSelectedBounds, getHandles, pointInRect, roughOptions, pathFromStroke, drawElement, drawGrid, drawSelection, textSize, downloadFile, autoLayout } from './utils/utils';
import BottomBar from "./components/BottomBar";
import CommandPalette from "./components/CommandPalette";
import ContextMenu from "./components/ContextMenu";
import LeftToolbar from "./components/LeftToolbar";
import PropertiesPanel from "./components/PropertiesPanel";
import SketchFlowStyles from "./components/SketchFlowStyles";
import TextEditorOverlay from "./components/TextEditorOverlay";
import LaserPanel from "./components/LaserPanel";
import TopBar from "./components/TopBar";

export default function SketchFlow({ config: configProp }) {
  const config = configProp || DEFAULT_HOME_CONTENT;
  const { branding, defaults, settings: settingsBase, tools, ui } = config;

  const settings = useMemo(() => {
    return { ...settingsBase, ...(settingsBase?.customJson && typeof settingsBase.customJson === "object" ? settingsBase.customJson : {}) };
  }, [settingsBase]);

  const accentRaw = branding?.accentColor || ACCENT;
  const hasAdminStrokeDefault = defaults?.strokeColor !== undefined && defaults?.strokeColor !== null;
  const storageKey = settings?.storageKey || STORAGE_KEY;
  const historyLimit = Number(settings?.historyLimit) || HISTORY_LIMIT;
  const autosaveIntervalMs = Number(settings?.autosaveIntervalMs) || 2000;
  const exportPrefix = ui?.exportFilePrefix || "sketchflow";

  const cameraDefault = useMemo(() => {
    return settings?.cameraDefault || { x: 420, y: 240, zoom: 1 };
  }, [settings?.cameraDefault]);

  const toolbar = useMemo(() => buildToolbarFromConfig(tools?.items), [tools]);
  const toolKeys = useMemo(() => buildToolKeysFromConfig(tools?.items), [tools]);
  const fontOptions = useMemo(() => {
    return defaults?.fontOptions?.length
      ? defaults.fontOptions
      : [defaults?.fontFamily || DEFAULT_STYLE.fontFamily, "system-ui, sans-serif", "Georgia, serif", "monospace"];
  }, [defaults]);

  const storageKeyRef = useRef(storageKey);
  const historyLimitRef = useRef(historyLimit);

  useEffect(() => {
    storageKeyRef.current = storageKey;
    historyLimitRef.current = historyLimit;
  }, [storageKey, historyLimit]);

  const canvasRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const textEditorRef = useRef(null);
  const imageCacheRef = useRef({});
  const actionRef = useRef(null);
  const clipboardRef = useRef([]);
  const lastSavedRef = useRef("");
  const spaceDownRef = useRef(false);
  const elementsRef = useRef([]);
  const historyRef = useRef({ past: [], future: [] });
  const textCommitLockRef = useRef(false);
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tool, setTool] = useState("select");
  const [camera, setCamera] = useState(cameraDefault);
  const [size, setSize] = useState({ width: 900, height: 620 });
  const [style, setStyle] = useState(() => ({
    ...DEFAULT_STYLE,
    ...defaults,
    ...(!hasAdminStrokeDefault ? { strokeColor: Boolean(settings?.darkModeDefault) ? '#ffffff' : '#000000' } : {}),
  }));
  const [history, setHistory] = useState({ past: [], future: [] });
  const [grid, setGrid] = useState(() => ({
    enabled: settings?.gridEnabled ?? true,
    step: settings?.gridStep ?? 32,
  }));
  const [dark, setDark] = useState(() => Boolean(settings?.darkModeDefault));
  const accent = dark
    ? (accentRaw === "#6965db" ? "#2dd4bf" : accentRaw)
    : (accentRaw === "#6965db" ? "#14b8a6" : accentRaw);
  const [includeBackground, setIncludeBackground] = useState(() => Boolean(settings?.includeBackgroundDefault ?? true));
  const [toast, setToast] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [selectBox, setSelectBox] = useState(null);
  const [editingText, setEditingText] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const themeInitRef = useRef(false);
  const currentLaserRef = useRef(null);
  const laserStrokesRef = useRef([]);
  const [laserSettings, setLaserSettings] = useState({ size: 6, color: "#ef4444" });

  const selectedElements = useMemo(() => elements.filter((el) => selectedIds.includes(el.id)), [elements, selectedIds]);
  const primary = selectedElements[0] || null;

  const expandSelectionWithGroups = useCallback((ids, scene = elementsRef.current) => {
    const groupIds = new Set(
      scene
        .filter((el) => ids.includes(el.id))
        .flatMap((el) => el.groupIds || [])
        .filter(Boolean)
    );
    if (!groupIds.size) return ids;
    return scene
      .filter((el) => ids.includes(el.id) || (el.groupIds || []).some((groupId) => groupIds.has(groupId)))
      .map((el) => el.id);
  }, []);

  const selectElementIds = useCallback((ids, scene = elementsRef.current) => {
    setSelectedIds(expandSelectionWithGroups([...new Set(ids)], scene));
  }, [expandSelectionWithGroups]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 1400);
  }, []);

  useEffect(() => () => window.clearTimeout(showToast.timer), [showToast]);

  const syncHistory = useCallback((nextHistory) => {
    historyRef.current = nextHistory;
    setHistory(nextHistory);
  }, []);

  const pushHistory = useCallback((snapshot) => {
    const safeSnapshot = clone(normalizeScene(snapshot ?? elementsRef.current).filter((el) => !el._draft));
    const currentHistory = historyRef.current;
    const lastSnapshot = currentHistory.past[currentHistory.past.length - 1];
    if (lastSnapshot && scenesEqual(lastSnapshot, safeSnapshot)) return;
    syncHistory({
      past: [...currentHistory.past.slice(-(historyLimitRef.current - 1)), safeSnapshot],
      future: [],
    });
  }, [syncHistory]);

  const applyElements = useCallback((nextElements) => {
    const normalized = normalizeScene(nextElements);
    elementsRef.current = normalized;
    setElements(normalized);
  }, []);

  const persistedElements = useMemo(() => normalizeScene(elements).filter((el) => !el._draft), [elements]);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  const commit = useCallback((next, options = {}) => {
    setElements((prev) => {
      const normalizedPrev = normalizeScene(prev);
      const normalized = normalizeScene(next);
      if (options.history !== false && !scenesEqual(normalizedPrev, normalized)) pushHistory(normalizedPrev);
      elementsRef.current = normalized;
      return normalized;
    });
  }, [pushHistory]);

  const updateElements = useCallback((updater, options = {}) => {
    setElements((prev) => {
      const normalizedPrev = normalizeScene(prev);
      const next = normalizeScene(updater(clone(prev)));
      if (options.history !== false && !scenesEqual(normalizedPrev, next)) pushHistory(normalizedPrev);
      elementsRef.current = next;
      return next;
    });
  }, [pushHistory]);

  const screenToScene = useCallback((event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - camera.x) / camera.zoom,
      y: (event.clientY - rect.top - camera.y) / camera.zoom,
      screenX: event.clientX - rect.left,
      screenY: event.clientY - rect.top,
    };
  }, [camera]);

  const render = useCallback((targetCanvas = canvasRef.current, renderOptions = {}) => {
    if (!targetCanvas) return;
    const ctx = targetCanvas.getContext("2d");
    const scene = renderOptions.elements || elements;
    const dpr = renderOptions.dpr || window.devicePixelRatio || 1;
    const width = renderOptions.width || size.width;
    const height = renderOptions.height || size.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (renderOptions.background !== false) {
      ctx.fillStyle = dark ? "#0b1220" : "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.save();
    ctx.translate(renderOptions.camera?.x ?? camera.x, renderOptions.camera?.y ?? camera.y);
    ctx.scale(renderOptions.camera?.zoom ?? camera.zoom, renderOptions.camera?.zoom ?? camera.zoom);
    if (grid.enabled && renderOptions.grid !== false) drawGrid(ctx, renderOptions.camera || camera, { width, height }, grid.step, dark);
    const rc = rough.canvas(targetCanvas);
    scene.forEach((el) => drawElement(ctx, rc, el, imageCacheRef.current, accent));

    if (!renderOptions.exportMode) {
      const now = Date.now();
      const strokes = laserStrokesRef.current;
      const currentLaser = currentLaserRef.current;
      const drawLaserStroke = (stroke, opacity) => {
        if (opacity <= 0) return;
        const strokeData = getStroke(stroke.points, {
          size: stroke.size,
          thinning: 0.52,
          smoothing: 0.58,
          streamline: 0.5,
        });
        const d = pathFromStroke(strokeData);
        if (!d) return;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = stroke.color;
        ctx.fill(new Path2D(d));
        ctx.restore();
      };
      strokes.forEach((s) => {
        const age = now - s.createdAt;
        if (age > 3500) return;
        const opacity = age < 2500 ? 1 : Math.max(0, 1 - (age - 2500) / 1000);
        drawLaserStroke(s, opacity);
      });
      if (currentLaser) drawLaserStroke(currentLaser, 1);

      drawSelection(ctx, scene, selectedIds, camera, accent);
      if (selectBox) {
        ctx.strokeStyle = accent;
        ctx.fillStyle = accent.startsWith("#") && accent.length === 7
          ? `rgba(${parseInt(accent.slice(1, 3), 16)},${parseInt(accent.slice(3, 5), 16)},${parseInt(accent.slice(5, 7), 16)},0.1)`
          : "rgba(105,101,219,.10)";
        ctx.lineWidth = 1 / camera.zoom;
        ctx.strokeRect(selectBox.x, selectBox.y, selectBox.width, selectBox.height);
        ctx.fillRect(selectBox.x, selectBox.y, selectBox.width, selectBox.height);
      }
    }
    ctx.restore();
  }, [camera, dark, elements, grid, selectedIds, selectBox, size, accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      setSize({ width: rect.width, height: rect.height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    if (hasAdminStrokeDefault) return;

    const themeDefault = dark ? '#ffffff' : '#000000';
    const oppositeDefault = dark ? '#000000' : '#ffffff';
    const legacyDefault = '#1f2937';

    setStyle(prev => ({ ...prev, strokeColor: themeDefault }));

    if (!themeInitRef.current) {
      themeInitRef.current = true;
      return;
    }

    updateElements((prev) => {
      let changed = false;
      const next = prev.map(el => {
        if (el.strokeColor === oppositeDefault || el.strokeColor === legacyDefault) {
          changed = true;
          return { ...el, strokeColor: themeDefault };
        }
        return el;
      });
      return changed ? next : prev;
    }, { history: false });
  }, [dark, hasAdminStrokeDefault, updateElements]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const json = LZString.decompressFromEncodedURIComponent(hash);
        const data = JSON.parse(json);
        if (data?.elements?.length) {
          const restored = data.elements.map(normalizeElement);
          applyElements(restored);
          if (data.camera) setCamera(data.camera);
          if (data.dark !== undefined) setDark(data.dark);
          if (data.grid) setGrid(data.grid);
          window.history.replaceState(null, "", window.location.pathname);
          showToast("Shared diagram loaded — you can edit and save your own copy");
          return;
        }
      } catch {
        // ignore invalid hash
      }
    }

    const key = storageKeyRef.current;
    const saved = window.localStorage.getItem(key);
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const defaultDark = settings?.darkModeDefault ?? Boolean(prefersDark);
    const adminGrid = { enabled: settings?.gridEnabled ?? true, step: settings?.gridStep ?? 32 };

    if (!saved) {
      setDark(defaultDark);
      setGrid(adminGrid);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const restored = Array.isArray(parsed)
        ? parsed.map(normalizeElement)
        : Array.isArray(parsed.elements)
          ? parsed.elements.map(normalizeElement)
          : [];
      const restoredCamera = parsed.camera || cameraDefault;
      const restoredDark = parsed.dark ?? defaultDark;
      const restoredGrid = adminGrid;
      const themeDefault = restoredDark ? '#ffffff' : '#000000';
      const oldDefault = !restoredDark ? '#ffffff' : '#000000';
      const legacyDefault = '#1f2937';
      const migrated = !hasAdminStrokeDefault
        ? restored.map(el => (el.strokeColor === legacyDefault || el.strokeColor === oldDefault ? { ...el, strokeColor: themeDefault } : el))
        : restored;
      applyElements(migrated);
      setCamera(restoredCamera);
      setGrid(restoredGrid);
      setDark(restoredDark);
      lastSavedRef.current = JSON.stringify({ elements: migrated, camera: restoredCamera, grid: restoredGrid, dark: restoredDark });
      syncHistory({ past: [], future: [] });
    } catch {
      // Ignore broken local drafts.
    }
  }, [applyElements, cameraDefault, hasAdminStrokeDefault, settings, showToast, syncHistory]);

  useEffect(() => {
    const activeImageIds = new Set(elements.filter((el) => el.type === "image" && el.imageSrc).map((el) => el.id));
    Object.keys(imageCacheRef.current).forEach((id) => {
      if (!activeImageIds.has(id)) delete imageCacheRef.current[id];
    });
    elements.forEach((el) => {
      if (el.type !== "image" || !el.imageSrc) return;
      const cached = imageCacheRef.current[el.id];
      if (cached?.src === el.imageSrc && (cached.dataset?.loading === "true" || (cached.complete && cached.naturalWidth > 0))) return;
      const image = new Image();
      image.decoding = "async";
      image.dataset.loading = "true";
      image.onload = () => {
        image.dataset.loading = "false";
        const decoded = image.decode ? image.decode().catch(() => null) : Promise.resolve();
        decoded.finally(() => window.requestAnimationFrame(() => render()));
      };
      image.onerror = () => {
        image.dataset.loading = "false";
        showToast("Image could not be displayed");
      };
      imageCacheRef.current[el.id] = image;
      image.src = el.imageSrc;
    });
  }, [elements, render, showToast]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const payload = JSON.stringify({ elements: persistedElements, camera, grid, dark });
      if (payload !== lastSavedRef.current) {
        try {
          window.localStorage.setItem(storageKeyRef.current, payload);
          lastSavedRef.current = payload;
          showToast("Saved");
        } catch {
          lastSavedRef.current = payload;
          showToast("Local autosave is full");
        }
      }
    }, autosaveIntervalMs);
    return () => window.clearInterval(timer);
  }, [autosaveIntervalMs, camera, dark, grid, persistedElements, showToast]);

  const undo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (!currentHistory.past.length) return;
    const currentScene = clone(elementsRef.current);
    const previousScene = clone(currentHistory.past[currentHistory.past.length - 1]);
    syncHistory({
      past: currentHistory.past.slice(0, -1),
      future: [currentScene, ...currentHistory.future],
    });
    applyElements(previousScene);
    setSelectedIds([]);
    showToast("Undo");
  }, [applyElements, showToast, syncHistory]);

  const redo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (!currentHistory.future.length) return;
    const currentScene = clone(elementsRef.current);
    const nextScene = clone(currentHistory.future[0]);
    const nextPast = scenesEqual(currentHistory.past[currentHistory.past.length - 1], currentScene)
      ? currentHistory.past
      : [...currentHistory.past, currentScene].slice(-historyLimitRef.current);
    syncHistory({
      past: nextPast,
      future: currentHistory.future.slice(1),
    });
    applyElements(nextScene);
    setSelectedIds([]);
    showToast("Redo");
  }, [applyElements, showToast, syncHistory]);

  const findHit = useCallback((point) => {
    return [...elements].reverse().find((el) => hitElement(el, point, 8 / camera.zoom));
  }, [camera.zoom, elements]);

  const findArrowEndpointHandle = useCallback((point) => {
    if (selectedIds.length !== 1) return null;
    const arrow = elements.find((el) => el.id === selectedIds[0] && el.type === "arrow");
    if (!arrow?.points?.length) return null;
    const threshold = 14 / camera.zoom;
    const start = arrow.points[0];
    const end = arrow.points[arrow.points.length - 1];
    if (Math.hypot(point.x - start[0], point.y - start[1]) <= threshold) return { id: arrow.id, endpoint: "start" };
    if (Math.hypot(point.x - end[0], point.y - end[1]) <= threshold) return { id: arrow.id, endpoint: "end" };
    return null;
  }, [camera.zoom, elements, selectedIds]);

  const resizeElements = (original, ids, start, point, handle) => {
    const originalBounds = getSelectedBounds(original, ids);
    if (!originalBounds) return original;
    let { x, y, width, height } = originalBounds;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    const eastHandles = new Set(["e", "ne", "se"]);
    const westHandles = new Set(["west", "nw", "sw"]);
    const southHandles = new Set(["s", "se", "sw"]);
    const northHandles = new Set(["n", "ne", "nw"]);
    if (eastHandles.has(handle)) width += dx;
    if (westHandles.has(handle)) {
      x += dx;
      width -= dx;
    }
    if (southHandles.has(handle)) height += dy;
    if (northHandles.has(handle)) {
      y += dy;
      height -= dy;
    }
    width = Math.max(8, width);
    height = Math.max(8, height);
    const sx = width / Math.max(1, originalBounds.width);
    const sy = height / Math.max(1, originalBounds.height);
    return original.map((el) => {
      if (!ids.includes(el.id) || el.locked) return el;
      if (["line", "arrow", "freedraw", "laser"].includes(el.type)) {
        return { ...el, points: el.points.map(([px, py]) => [x + (px - originalBounds.x) * sx, y + (py - originalBounds.y) * sy]) };
      }
      return { ...el, x: x + (el.x - originalBounds.x) * sx, y: y + (el.y - originalBounds.y) * sy, width: el.width * sx, height: el.height * sy };
    });
  };

  const moveSelection = (original, ids, dx, dy) => {
    const moved = new Set(ids);
    return original.map((el) => {
      if (ids.includes(el.id) && !el.locked) {
        if (["line", "arrow", "freedraw", "laser"].includes(el.type)) return { ...el, points: el.points.map(([x, y]) => [x + dx, y + dy]) };
        return { ...el, x: el.x + dx, y: el.y + dy };
      }
      if (el.type === "arrow" && (moved.has(el.boundStartId) || moved.has(el.boundEndId))) {
        const points = [...el.points];
        if (moved.has(el.boundStartId)) points[0] = [points[0][0] + dx, points[0][1] + dy];
        if (moved.has(el.boundEndId)) points[points.length - 1] = [points.at(-1)[0] + dx, points.at(-1)[1] + dy];
        return { ...el, points };
      }
      return el;
    });
  };

  const bindArrowEnds = (arrow, scene) => {
    const bindPoint = (point) => {
      const shape = scene.find((el) => el.id !== arrow.id && !["line", "arrow", "freedraw", "laser", "text", "image"].includes(el.type) && hitElement(el, { x: point[0], y: point[1] }, 18));
      if (!shape) return { id: null, point };
      const c = centerOf(shape);
      const b = boundsOf(shape);
      const angle = Math.atan2(point[1] - c.y, point[0] - c.x);
      const snapped = [c.x + Math.cos(angle) * b.width / 2, c.y + Math.sin(angle) * b.height / 2];
      return { id: shape.id, point: snapped };
    };
    const start = bindPoint(arrow.points[0]);
    const end = bindPoint(arrow.points.at(-1));
    return { ...arrow, points: [start.point, end.point], boundStartId: start.id, boundEndId: end.id };
  };

  const handlePointerDown = (event) => {
    if (editingText) return;
    const point = screenToScene(event);
    setContextMenu(null);
    canvasRef.current.setPointerCapture?.(event.pointerId);
    if (event.button === 1 || (event.button === 0 && spaceDownRef.current)) {
      actionRef.current = { type: "panning", start: point, camera };
      return;
    }
    if (event.button === 2) {
      const hit = findHit(point);
      if (hit && !selectedIds.includes(hit.id)) selectElementIds([hit.id]);
      setContextMenu({ x: event.clientX, y: event.clientY });
      return;
    }
    if (event.button !== 0) return;
    if (tool === "select") {
      const endpoint = findArrowEndpointHandle(point);
      if (endpoint) {
        actionRef.current = { type: "arrow-endpoint", ...endpoint, start: point, original: clone(elements) };
        return;
      }
      const bounds = getSelectedBounds(elements, selectedIds);
      const handle = getHandles(bounds, camera.zoom).find((h) => pointInRect(point, h));
      if (handle) {
        actionRef.current = { type: handle.name === "rotate" ? "rotating" : "resizing", handle: handle.name, start: point, original: clone(elements), ids: selectedIds };
        return;
      }
      const hit = findHit(point);
      if (hit) {
        const rawIds = event.shiftKey ? (selectedIds.includes(hit.id) ? selectedIds.filter((id) => id !== hit.id) : [...selectedIds, hit.id]) : selectedIds.includes(hit.id) ? selectedIds : [hit.id];
        const ids = expandSelectionWithGroups(rawIds, elements);
        setSelectedIds(ids);
        actionRef.current = { type: "moving", start: point, original: clone(elements), ids };
      } else {
        setSelectedIds([]);
        actionRef.current = { type: "selecting", start: point };
        setSelectBox({ x: point.x, y: point.y, width: 0, height: 0 });
      }
      return;
    }
    if (tool === "eraser") {
      const hit = findHit(point);
      if (hit) updateElements((prev) => prev.filter((el) => el.id !== hit.id));
      return;
    }
    if (tool === "image") {
      actionRef.current = { type: "image", point };
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
        imageInputRef.current.click();
      }
      return;
    }
    if (tool === "text") {
      const hit = findHit(point);
      if (hit?.type === "text") {
        selectElementIds([hit.id]);
        setEditingText({ id: hit.id, value: hit.text || "", isNew: false, original: clone(elementsRef.current) });
        setTool("select");
        return;
      }
      const el = makeElement("text", point.x, point.y, style);
      el.text = "";
      el._draft = true;
      const size = textSize("", el.fontSize);
      el.width = size.width;
      el.height = size.height;
      const original = clone(elementsRef.current);
      applyElements([...original, el]);
      selectElementIds([el.id], [...original, el]);
      setEditingText({ id: el.id, value: "", isNew: true, original });
      setTool("select");
      return;
    }
    if (tool === "laser") {
      currentLaserRef.current = { points: [[point.x, point.y]], color: laserSettings.color, size: laserSettings.size };
      actionRef.current = { type: "drawing-laser" };
      return;
    }
    const type = tool === "frame" ? "frame" : tool;
    const el = makeElement(type, point.x, point.y, style);
    if (type === "frame") {
      el.fillStyle = "none";
      el.backgroundColor = "transparent";
      el.strokeStyle = "dashed";
    }
    const currentScene = elementsRef.current;
    actionRef.current = { type: "drawing", element: el, start: point, original: clone(currentScene) };
    applyElements([...currentScene, el]);
    selectElementIds([el.id], [...currentScene, el]);
  };

  const handlePointerMove = (event) => {
    const action = actionRef.current;
    if (!action) return;
    const point = screenToScene(event);
    if (action.type === "panning") {
      setCamera({ ...action.camera, x: action.camera.x + (point.screenX - action.start.screenX), y: action.camera.y + (point.screenY - action.start.screenY) });
      return;
    }
    if (action.type === "moving") {
      const dx = point.x - action.start.x;
      const dy = point.y - action.start.y;
      applyElements(moveSelection(action.original, action.ids, dx, dy));
      return;
    }
    if (action.type === "resizing") {
      applyElements(resizeElements(action.original, action.ids, action.start, point, action.handle));
      return;
    }
    if (action.type === "arrow-endpoint") {
      applyElements(action.original.map((el) => {
        if (el.id !== action.id || el.type !== "arrow" || el.locked) return el;
        const points = [...el.points];
        if (action.endpoint === "start") points[0] = [point.x, point.y];
        if (action.endpoint === "end") points[points.length - 1] = [point.x, point.y];
        return {
          ...el,
          points,
          boundStartId: action.endpoint === "start" ? null : el.boundStartId,
          boundEndId: action.endpoint === "end" ? null : el.boundEndId,
        };
      }));
      return;
    }
    if (action.type === "rotating") {
      const b = getSelectedBounds(action.original, action.ids);
      const c = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      const angle = Math.atan2(point.y - c.y, point.x - c.x) + Math.PI / 2;
      applyElements(action.original.map((el) => (action.ids.includes(el.id) && !["line", "arrow", "freedraw", "laser"].includes(el.type) ? { ...el, angle } : el)));
      return;
    }
    if (action.type === "selecting") {
      const x = Math.min(action.start.x, point.x);
      const y = Math.min(action.start.y, point.y);
      const width = Math.abs(point.x - action.start.x);
      const height = Math.abs(point.y - action.start.y);
      const box = { x, y, width, height };
      setSelectBox(box);
      const ids = elements.filter((el) => {
        const b = boundsOf(el);
        return b.x >= box.x && b.y >= box.y && b.x + b.width <= box.x + box.width && b.y + b.height <= box.y + box.height;
      }).map((el) => el.id);
      selectElementIds(ids, elements);
      return;
    }
    if (action.type === "drawing-laser") {
      currentLaserRef.current.points.push([point.x, point.y]);
      render();
      return;
    }
    if (action.type === "drawing") {
      setElements((prev) => {
        const next = normalizeScene(prev.map((el) => {
          if (el.id !== action.element.id) return el;
          if (el.type === "freedraw") return { ...el, points: [...el.points, [point.x, point.y]] };
          if (el.type === "laser") return { ...el, points: [...el.points, [point.x, point.y]] };
          if (el.type === "line" || el.type === "arrow") return { ...el, points: [el.points[0], [point.x, point.y]], width: point.x - el.x, height: point.y - el.y };
          return { ...el, x: action.start.x, y: action.start.y, width: point.x - action.start.x, height: point.y - action.start.y };
        }));
        elementsRef.current = next;
        return next;
      });
    }
  };

  const handlePointerUp = () => {
    const action = actionRef.current;
    if (action?.type === "drawing-laser") {
      const laser = currentLaserRef.current;
      if (laser && laser.points.length > 2) {
        const entry = { id: nanoid(8), points: laser.points, color: laser.color, size: laser.size, createdAt: Date.now() };
        laserStrokesRef.current = [...laserStrokesRef.current, entry];
      }
      currentLaserRef.current = null;
      actionRef.current = null;
      render();
      return;
    }
    if (action?.type === "drawing") {
      const drawnId = action.element.id;
      const currentScene = elementsRef.current;
      const next = normalizeScene(currentScene.map((el) => (el.id === drawnId && el.type === "arrow" ? bindArrowEnds(el, currentScene) : el)).filter((el) => {
        const b = boundsOf(el);
        return el.type === "text" || b.width > 2 || b.height > 2 || el.points?.length > 2;
      }));
      applyElements(next);
      if (next.some((el) => el.id === drawnId) && !scenesEqual(action.original, next)) pushHistory(action.original);
      if (tool !== "laser") setTool("select");
    }
    if (action?.type === "arrow-endpoint") {
      const currentScene = elementsRef.current;
      const next = normalizeScene(currentScene.map((el) => (el.id === action.id && el.type === "arrow" ? bindArrowEnds(el, currentScene) : el)));
      applyElements(next);
      if (!scenesEqual(action.original, next)) pushHistory(action.original);
    }
    if (["moving", "resizing", "rotating"].includes(action?.type)) {
      if (!scenesEqual(action.original, elementsRef.current)) pushHistory(action.original);
    }
    if (action?.type === "selecting") setSelectBox(null);
    actionRef.current = null;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    if (!event.ctrlKey && !event.metaKey) {
      setCamera((prev) => ({ ...prev, x: prev.x - event.deltaX, y: prev.y - event.deltaY }));
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setCamera((prev) => {
      const oldZoom = prev.zoom;
      const zoom = Math.max(0.1, Math.min(30, oldZoom * (event.deltaY < 0 ? 1.12 : 0.88)));
      const sceneX = (pointer.x - prev.x) / oldZoom;
      const sceneY = (pointer.y - prev.y) / oldZoom;
      return { zoom, x: pointer.x - sceneX * zoom, y: pointer.y - sceneY * zoom };
    });
  };

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    updateElements((prev) => prev.filter((el) => !selectedIds.includes(el.id) || el.locked));
    setSelectedIds([]);
  }, [selectedIds, updateElements]);

  const duplicateSelected = useCallback(() => {
    if (!selectedIds.length) return;
    const copies = elements.filter((el) => selectedIds.includes(el.id)).map((el) => ({
      ...clone(el),
      id: nanoid(10),
      x: el.x + 28,
      y: el.y + 28,
      points: el.points?.map(([x, y]) => [x + 28, y + 28]) || [],
      groupIds: [...(el.groupIds || [])],
    }));
    commit([...elements, ...copies]);
    selectElementIds(copies.map((el) => el.id), [...elements, ...copies]);
  }, [commit, elements, selectElementIds, selectedIds]);

  const copySelected = useCallback(() => {
    clipboardRef.current = clone(elements.filter((el) => selectedIds.includes(el.id)));
    showToast("Copied");
  }, [elements, selectedIds, showToast]);

  const paste = useCallback(() => {
    const items = clipboardRef.current.map((el) => ({ ...clone(el), id: nanoid(10), x: el.x + 36, y: el.y + 36, points: el.points?.map(([x, y]) => [x + 36, y + 36]) || [] }));
    if (!items.length) return;
    commit([...elements, ...items]);
    selectElementIds(items.map((el) => el.id), [...elements, ...items]);
  }, [commit, elements, selectElementIds]);

  const updateSelectedStyle = (patch) => {
    setStyle((prev) => ({ ...prev, ...patch }));
    if (!selectedIds.length) return;
    updateElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && !el.locked ? { ...el, ...patch } : el)));
  };

  const groupSelected = useCallback(() => {
    if (selectedIds.length < 2) return;
    const groupId = nanoid(8);
    updateElements((prev) => prev.map((el) => (selectedIds.includes(el.id) ? { ...el, groupIds: [...new Set([...(el.groupIds || []), groupId])] } : el)));
  }, [selectedIds, updateElements]);

  const ungroupSelected = useCallback(() => {
    updateElements((prev) => prev.map((el) => (selectedIds.includes(el.id) ? { ...el, groupIds: [] } : el)));
  }, [selectedIds, updateElements]);

  const reorderSelected = (direction) => {
    updateElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id));
      const rest = prev.filter((el) => !selectedIds.includes(el.id));
      return direction === "front" ? [...rest, ...selected] : [...selected, ...rest];
    });
  };

  const addLink = () => {
    const value = window.prompt("Add hyperlink", primary?.hyperlink || "https://");
    if (value !== null) updateSelectedStyle({ hyperlink: value });
  };

  const lockSelected = () => updateElements((prev) => prev.map((el) => (selectedIds.includes(el.id) ? { ...el, locked: !el.locked } : el)));

  const clearCanvas = () => {
    if (window.confirm("Clear the whole SketchFlow canvas?")) {
      commit([]);
      setSelectedIds([]);
      showToast("Canvas cleared");
    }
  };

  const searchTextOnCanvas = useCallback(() => {
    const q = window.prompt("Search text on canvas");
    if (!q?.trim()) return;
    const matches = elements.filter((el) => el.type === "text" && el.text.toLowerCase().includes(q.trim().toLowerCase()));
    selectElementIds(matches.map((el) => el.id));
    if (matches[0]) {
      const b = boundsOf(matches[0]);
      setCamera((prev) => ({
        ...prev,
        x: size.width / 2 - (b.x + b.width / 2) * prev.zoom,
        y: size.height / 2 - (b.y + b.height / 2) * prev.zoom,
      }));
      showToast(`${matches.length} match${matches.length === 1 ? "" : "es"} found`);
    } else {
      showToast("No text match");
    }
  }, [elements, selectElementIds, showToast, size.height, size.width]);

  const fitToScreen = useCallback(() => {
    const b = getSelectedBounds(elements, elements.map((el) => el.id));
    if (!b) {
      setCamera({ x: size.width / 2, y: size.height / 2, zoom: 1 });
      return;
    }
    const zoom = Math.max(0.1, Math.min(3, Math.min((size.width - 120) / b.width, (size.height - 120) / b.height)));
    setCamera({ zoom, x: size.width / 2 - (b.x + b.width / 2) * zoom, y: size.height / 2 - (b.y + b.height / 2) * zoom });
  }, [elements, size]);

  const autoLayoutScene = useCallback(() => {
    const current = elementsRef.current;
    if (!current.length) return;
    const original = clone(current);
    const layouted = autoLayout(original);
    if (scenesEqual(original, layouted)) {
      showToast("Diagram already well organized");
      return;
    }
    pushHistory(original);
    applyElements(layouted);
    showToast("Auto layout applied");
    window.requestAnimationFrame(() => {
      const allIds = layouted.map(el => el.id);
      const total = getSelectedBounds(layouted, allIds);
      if (!total) return;
      const zoom = Math.max(0.1, Math.min(3, Math.min((size.width - 120) / total.width, (size.height - 120) / total.height)));
      setCamera({ zoom, x: size.width / 2 - (total.x + total.width / 2) * zoom, y: size.height / 2 - (total.y + total.height / 2) * zoom });
    });
  }, [pushHistory, applyElements, showToast, size]);

  const shareScene = useCallback(() => {
    const data = {
      v: 1,
      elements: persistedElements,
      camera,
      dark,
      grid,
    };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}#${compressed}`;
    navigator.clipboard.writeText(url).then(
      () => showToast("Share link copied to clipboard"),
      () => showToast("Could not copy share link")
    );
  }, [persistedElements, camera, dark, grid, showToast]);

  const exportPng = () => {
    const scene = persistedElements;
    const boxes = scene.map(boundsOf);
    const b = boxes.length
      ? { x: Math.min(...boxes.map((box) => box.x)) - 80, y: Math.min(...boxes.map((box) => box.y)) - 80, width: Math.max(...boxes.map((box) => box.x + box.width)) - Math.min(...boxes.map((box) => box.x)) + 160, height: Math.max(...boxes.map((box) => box.y + box.height)) - Math.min(...boxes.map((box) => box.y)) + 160 }
      : { x: -500, y: -350, width: 1000, height: 700 };
    const canvas = document.createElement("canvas");
    const dpr = 2;
    canvas.width = b.width * dpr;
    canvas.height = b.height * dpr;
    canvas.style.width = `${b.width}px`;
    canvas.style.height = `${b.height}px`;
    render(canvas, { dpr, width: b.width, height: b.height, camera: { x: -b.x, y: -b.y, zoom: 1 }, exportMode: true, background: includeBackground, elements: scene });
    canvas.toBlob((blob) => blob && downloadFile(`${exportPrefix}.png`, blob, "image/png"));
  };

  const setSvgTransform = (node, el) => {
    if (!node || !el.angle || ["line", "arrow", "freedraw", "laser"].includes(el.type)) return;
    const c = centerOf(el);
    node.setAttribute("transform", `rotate(${(el.angle * 180) / Math.PI} ${c.x} ${c.y})`);
  };

  const appendSvgArrowhead = (svg, start, end, style, color, width, opacity) => {
    if (!style || style === "none") return;
    const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    const size = 10 + width * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rotatePoint = (x, y) => [end[0] + x * cos - y * sin, end[1] + x * sin + y * cos];
    let node = null;
    if (style === "triangle") {
      node = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      node.setAttribute("points", [[0, 0], [-size, size * 0.5], [-size, -size * 0.5]].map(([x, y]) => rotatePoint(x, y).join(",")).join(" "));
      node.setAttribute("fill", color);
    } else if (style === "dot") {
      node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      node.setAttribute("cx", String(end[0]));
      node.setAttribute("cy", String(end[1]));
      node.setAttribute("r", String(size * 0.38));
      node.setAttribute("fill", color);
    } else if (style === "bar") {
      node = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const a = rotatePoint(-2, -size * 0.6);
      const b = rotatePoint(-2, size * 0.6);
      node.setAttribute("x1", String(a[0]));
      node.setAttribute("y1", String(a[1]));
      node.setAttribute("x2", String(b[0]));
      node.setAttribute("y2", String(b[1]));
      node.setAttribute("stroke", color);
      node.setAttribute("stroke-width", String(width));
      node.setAttribute("stroke-linecap", "round");
    }
    if (node) {
      node.setAttribute("opacity", String(opacity));
      svg.appendChild(node);
    }
  };

  const exportSvg = () => {
    const scene = persistedElements;
    const boxes = scene.map(boundsOf);
    const minX = boxes.length ? Math.min(...boxes.map((b) => b.x)) - 60 : -500;
    const minY = boxes.length ? Math.min(...boxes.map((b) => b.y)) - 60 : -350;
    const maxX = boxes.length ? Math.max(...boxes.map((b) => b.x + b.width)) + 60 : 500;
    const maxY = boxes.length ? Math.max(...boxes.map((b) => b.y + b.height)) + 60 : 350;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", String(maxX - minX));
    svg.setAttribute("height", String(maxY - minY));
    svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    if (includeBackground) {
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("x", String(minX));
      bg.setAttribute("y", String(minY));
      bg.setAttribute("width", String(maxX - minX));
      bg.setAttribute("height", String(maxY - minY));
      bg.setAttribute("fill", dark ? "#0b1220" : "#ffffff");
      svg.appendChild(bg);
    }
    const rsvg = rough.svg(svg);
    scene.forEach((el) => {
      const opacity = Math.max(0, Math.min(1, el.opacity / 100));
      const opts = roughOptions(el);
      let node = null;
      if (el.type === "rectangle" || el.type === "frame") node = rsvg.rectangle(el.x, el.y, el.width, el.height, opts);
      if (el.type === "ellipse") node = rsvg.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width, el.height, opts);
      if (el.type === "diamond") node = rsvg.polygon([[el.x + el.width / 2, el.y], [el.x + el.width, el.y + el.height / 2], [el.x + el.width / 2, el.y + el.height], [el.x, el.y + el.height / 2]], opts);
      if (el.type === "line") node = rsvg.line(el.points[0][0], el.points[0][1], el.points.at(-1)[0], el.points.at(-1)[1], opts);
      if (el.type === "arrow") {
        const start = el.points[0];
        const end = el.points.at(-1);
        if (el.arrowType === "elbow") {
          const mid = [end[0], start[1]];
          const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
          group.appendChild(rsvg.line(start[0], start[1], mid[0], mid[1], opts));
          group.appendChild(rsvg.line(mid[0], mid[1], end[0], end[1], opts));
          node = group;
        } else if (el.arrowType === "curved") {
          const control = [(start[0] + end[0]) / 2, Math.min(start[1], end[1]) - Math.abs(end[0] - start[0]) * 0.18 - 20];
          node = document.createElementNS("http://www.w3.org/2000/svg", "path");
          node.setAttribute("d", `M ${start[0]} ${start[1]} Q ${control[0]} ${control[1]} ${end[0]} ${end[1]}`);
          node.setAttribute("fill", "none");
          node.setAttribute("stroke", el.strokeColor);
          node.setAttribute("stroke-width", String(el.strokeWidth));
          node.setAttribute("stroke-linecap", "round");
          if (el.strokeStyle === "dashed") node.setAttribute("stroke-dasharray", `${el.strokeWidth * 5} ${el.strokeWidth * 4}`);
          if (el.strokeStyle === "dotted") node.setAttribute("stroke-dasharray", `${el.strokeWidth} ${el.strokeWidth * 3}`);
        } else {
          node = rsvg.line(start[0], start[1], end[0], end[1], opts);
        }
      }
      if (node) {
        node.setAttribute("opacity", String(opacity));
        setSvgTransform(node, el);
        svg.appendChild(node);
      }
      if (el.type === "arrow") {
        const start = el.points[0];
        const end = el.points.at(-1);
        if (el.arrowType === "elbow") {
          const mid = [end[0], start[1]];
          appendSvgArrowhead(svg, mid, end, el.endArrowhead, el.strokeColor, el.strokeWidth, opacity);
          appendSvgArrowhead(svg, mid, start, el.startArrowhead, el.strokeColor, el.strokeWidth, opacity);
        } else if (el.arrowType === "curved") {
          const control = [(start[0] + end[0]) / 2, Math.min(start[1], end[1]) - Math.abs(end[0] - start[0]) * 0.18 - 20];
          appendSvgArrowhead(svg, control, end, el.endArrowhead, el.strokeColor, el.strokeWidth, opacity);
          appendSvgArrowhead(svg, control, start, el.startArrowhead, el.strokeColor, el.strokeWidth, opacity);
        } else {
          appendSvgArrowhead(svg, start, end, el.endArrowhead, el.strokeColor, el.strokeWidth, opacity);
          appendSvgArrowhead(svg, end, start, el.startArrowhead, el.strokeColor, el.strokeWidth, opacity);
        }
      }
      if (el.type === "freedraw" || el.type === "laser") {
        const stroke = getStroke(el.points || [], {
          size: Math.max(2, el.strokeWidth * (el.type === "laser" ? 4 : 3)),
          thinning: 0.52,
          smoothing: 0.58,
          streamline: 0.5,
        });
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathFromStroke(stroke));
        path.setAttribute("fill", el.type === "laser" ? "#ef4444" : el.strokeColor);
        path.setAttribute("opacity", String(opacity));
        svg.appendChild(path);
      }
      if (el.type === "text") {
        String(el.text).split("\n").forEach((line, i) => {
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
          const textX = el.textAlign === "center" ? el.x + el.width / 2 : el.textAlign === "right" ? el.x + el.width : el.x;
          const anchor = el.textAlign === "center" ? "middle" : el.textAlign === "right" ? "end" : "start";
          text.setAttribute("x", String(textX));
          text.setAttribute("y", String(el.y + i * el.fontSize * 1.25 + el.fontSize));
          text.setAttribute("font-size", String(el.fontSize));
          text.setAttribute("font-family", el.fontFamily);
          text.setAttribute("text-anchor", anchor);
          text.setAttribute("fill", el.strokeColor);
          text.setAttribute("opacity", String(opacity));
          setSvgTransform(text, el);
          text.textContent = line;
          svg.appendChild(text);
        });
      }
      if (el.type === "image" && el.imageSrc) {
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("x", String(el.x));
        image.setAttribute("y", String(el.y));
        image.setAttribute("width", String(el.width));
        image.setAttribute("height", String(el.height));
        image.setAttribute("href", el.imageSrc);
        image.setAttribute("opacity", String(opacity));
        setSvgTransform(image, el);
        svg.appendChild(image);
      }
    });
    downloadFile(`${exportPrefix}.svg`, new XMLSerializer().serializeToString(svg), "image/svg+xml");
  };

  const saveScene = () => downloadFile(`${exportPrefix}.sketchflow`, JSON.stringify({ elements: persistedElements, camera, grid, dark }, null, 2), "application/json");

  const loadScene = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        commit(Array.isArray(parsed) ? parsed : parsed.elements || []);
        setCamera(parsed.camera || camera);
        setGrid(parsed.grid || grid);
        if (typeof parsed.dark === "boolean") setDark(parsed.dark);
        setSelectedIds([]);
        setEditingText(null);
        actionRef.current = null;
        showToast("Loaded");
      } catch {
        showToast("Invalid file");
      }
    };
    reader.readAsText(file);
  };

  const addImage = (file) => {
    if (!file) {
      actionRef.current = null;
      return;
    }
    if (!file.type?.startsWith("image/")) {
      actionRef.current = null;
      showToast("Please upload an image file");
      return;
    }
    const point = actionRef.current?.point || { x: 0, y: 0 };
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        const naturalWidth = image.naturalWidth || image.width || 320;
        const naturalHeight = image.naturalHeight || image.height || 220;
        const maxWidth = Math.min(720, Math.max(180, (size.width * 0.68) / camera.zoom));
        const maxHeight = Math.min(520, Math.max(140, (size.height * 0.62) / camera.zoom));
        const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
        const el = makeElement("image", point.x, point.y, style);
        el.width = Math.max(24, naturalWidth * scale);
        el.height = Math.max(24, naturalHeight * scale);
        el.x = point.x - el.width / 2;
        el.y = point.y - el.height / 2;
        el.imageSrc = String(reader.result);
        el.imageName = file.name;
        image.dataset.loading = "false";
        imageCacheRef.current[el.id] = image;
        const nextScene = [...elementsRef.current, el];
        commit(nextScene);
        selectElementIds([el.id], nextScene);
        setTool("select");
        actionRef.current = null;
        showToast("Image added");
        window.requestAnimationFrame(() => render(undefined, { elements: nextScene }));
      };
      image.onerror = () => {
        actionRef.current = null;
        showToast("Image could not be loaded");
      };
      image.src = String(reader.result);
    };
    reader.onerror = () => {
      actionRef.current = null;
      showToast("Image could not be read");
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    const file = [...(event.dataTransfer?.files || [])].find((item) => item.type?.startsWith("image/"));
    if (!file) {
      showToast("Drop an image file");
      return;
    }
    const point = screenToScene(event);
    actionRef.current = { type: "image", point };
    addImage(file);
  };

  const beginTextEdit = (event) => {
    if (editingText) return;
    const point = screenToScene(event);
    const hit = findHit(point);
    if (hit?.type === "text") {
      selectElementIds([hit.id]);
      setEditingText({ id: hit.id, value: hit.text || "", isNew: false, original: clone(elementsRef.current) });
    } else if (hit) {
      selectElementIds([hit.id]);
    } else {
      const el = makeElement("text", point.x, point.y, style);
      el.text = "";
      el._draft = true;
      const sz = textSize("", el.fontSize);
      el.width = sz.width;
      el.height = sz.height;
      const original = clone(elementsRef.current);
      applyElements([...original, el]);
      selectElementIds([el.id], [...original, el]);
      setEditingText({ id: el.id, value: "", isNew: true, original });
    }
  };

  const commitText = () => {
    if (!editingText || textCommitLockRef.current) return;
    textCommitLockRef.current = true;
    const value = editingText.value.replace(/\s+$/g, "");
    if (!value.trim()) {
      if (editingText.isNew) {
        applyElements(editingText.original || elementsRef.current.filter((el) => el.id !== editingText.id));
      } else {
        updateElements((prev) => prev.filter((el) => el.id !== editingText.id));
      }
      setSelectedIds([]);
      setEditingText(null);
      showToast("Text removed");
      return;
    }
    if (editingText.isNew) {
      const next = normalizeScene(elementsRef.current.map((el) => {
        if (el.id !== editingText.id) return el;
        const sz = textSize(value, el.fontSize);
        const { _draft, ...clean } = el;
        return { ...clean, text: value, width: sz.width, height: sz.height };
      }));
      pushHistory(editingText.original || []);
      applyElements(next);
    } else {
      updateElements((prev) => prev.map((el) => {
        if (el.id !== editingText.id) return el;
        const sz = textSize(value, el.fontSize);
        const { _draft, ...clean } = el;
        return { ...clean, text: value, width: sz.width, height: sz.height };
      }));
    }
    setEditingText(null);
    showToast("Text updated");
  };

  const commands = [
    ...toolbar.map(([id, label]) => ({ label: `Tool: ${label}`, run: () => setTool(id) })),
    { label: "Export PNG", run: exportPng },
    { label: "Export SVG", run: exportSvg },
    { label: "Save SketchFlow file", run: saveScene },
    { label: "Toggle theme", run: () => setDark((v) => !v) },
    { label: "Toggle grid", run: () => setGrid((g) => ({ ...g, enabled: !g.enabled })) },
    { label: "Fit to screen", run: fitToScreen },
    { label: "Auto layout diagram", run: autoLayoutScene },
    { label: "Clear canvas", run: clearCanvas },
    { label: "Search canvas text", run: searchTextOnCanvas },
    { label: "Select all", run: () => selectElementIds(elements.map((el) => el.id)) },
  ];
  const filteredCommands = commands.filter((action) => action.label.toLowerCase().includes(paletteQuery.toLowerCase()));

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target?.tagName === "TEXTAREA" || event.target?.tagName === "INPUT" || event.target?.tagName === "SELECT") return;
      if (event.code === "Space") {
        spaceDownRef.current = true;
        event.preventDefault();
      }
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        setPaletteOpen(true);
        setPaletteQuery("");
        return;
      }
      if (paletteOpen) return;
      const commandKey = event.ctrlKey || event.metaKey;
      const undoShortcut = commandKey && key === "z" && !event.shiftKey;
      const redoShortcut = commandKey && ((key === "z" && event.shiftKey) || key === "y");
      if (redoShortcut) {
        event.preventDefault();
        return redo();
      }
      if (undoShortcut) {
        event.preventDefault();
        return undo();
      }
      if (commandKey && key === "a") {
        event.preventDefault();
        selectElementIds(elements.map((el) => el.id));
        return;
      }
      if (commandKey && key === "c") {
        event.preventDefault();
        return copySelected();
      }
      if (commandKey && key === "v") {
        event.preventDefault();
        return paste();
      }
      if (commandKey && key === "d") {
        event.preventDefault();
        return duplicateSelected();
      }
      if (commandKey && key === "g" && event.shiftKey) {
        event.preventDefault();
        return ungroupSelected();
      }
      if (commandKey && key === "g") {
        event.preventDefault();
        return groupSelected();
      }
      if (commandKey && key === "f") {
        event.preventDefault();
        return searchTextOnCanvas();
      }
      if (commandKey && key === "0") {
        event.preventDefault();
        return fitToScreen();
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setCamera((c) => ({ ...c, zoom: Math.min(30, c.zoom * 1.15) }));
      }
      if (event.key === "-") {
        event.preventDefault();
        setCamera((c) => ({ ...c, zoom: Math.max(0.1, c.zoom / 1.15) }));
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
      if (toolKeys[key]) {
        event.preventDefault();
        setTool(toolKeys[key]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const onKeyUp = (event) => {
      if (event.code === "Space") spaceDownRef.current = false;
    };
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [copySelected, deleteSelected, duplicateSelected, elements, fitToScreen, groupSelected, paletteOpen, paste, redo, searchTextOnCanvas, selectElementIds, toolKeys, undo, ungroupSelected]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const before = laserStrokesRef.current.length;
      laserStrokesRef.current = laserStrokesRef.current.filter((s) => now - s.createdAt < 4000);
      if (laserStrokesRef.current.length !== before) render();
      if (laserStrokesRef.current.some((s) => { const a = now - s.createdAt; return a >= 2500 && a < 3500; })) render();
    }, 80);
    return () => clearInterval(timer);
  }, [render]);

  useEffect(() => {
    const onKey = (event) => {
      if (!paletteOpen) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setPaletteIndex((i) => (filteredCommands.length ? Math.min(filteredCommands.length - 1, i + 1) : 0));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setPaletteIndex((i) => (filteredCommands.length ? Math.max(0, i - 1) : 0));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        filteredCommands[paletteIndex]?.run();
        setPaletteOpen(false);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filteredCommands, paletteIndex, paletteOpen]);

  const editingElement = editingText ? elements.find((el) => el.id === editingText.id) : null;
  const liveTextSize = editingElement ? textSize(editingText.value || "Text", editingElement.fontSize) : null;
  const textareaStyle = editingElement
    ? {
      left: `${camera.x + editingElement.x * camera.zoom}px`,
      top: `${camera.y + editingElement.y * camera.zoom}px`,
      width: `${Math.max(140, liveTextSize.width * camera.zoom)}px`,
      minHeight: `${Math.max(48, liveTextSize.height * camera.zoom)}px`,
      fontSize: `${editingElement.fontSize * camera.zoom}px`,
      lineHeight: 1.25,
      fontFamily: editingElement.fontFamily,
      textAlign: editingElement.textAlign,
      color: editingElement.strokeColor,
      transform: `rotate(${editingElement.angle || 0}rad)`,
      transformOrigin: "top left",
      background: dark ? "rgba(18,18,18,.72)" : "rgba(255,255,255,.72)",
    }
    : {};

  useEffect(() => {
    textCommitLockRef.current = false;
    if (!editingText?.id || !textEditorRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      textEditorRef.current?.focus();
      textEditorRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editingText?.id]);

  useEffect(() => {
    if (tool !== "laser") currentLaserRef.current = null;
    if (!toolbar.some(([id]) => id === tool)) {
      setTool(toolbar[0]?.[0] || "select");
    }
  }, [toolbar, tool]);

  return (
    <main className="sketchflow-shell" data-sf-theme={dark ? "dark" : "light"}>
      <div className="sf-root">
        <TopBar
          appName={branding?.appName}
          tagline={branding?.tagline}
          brandIconKey={branding?.brandIconKey}
          currentToolLabel={toolbar.find(([id]) => id === tool)?.[1]}
          dark={dark}
          grid={grid}
          history={history}
          onGridChange={(checked) => setGrid((current) => ({ ...current, enabled: checked }))}
          onGridStepChange={(value) => setGrid((current) => ({ ...current, step: Math.max(8, Number(value) || 32) }))}
          onUndo={undo}
          onRedo={redo}
          onExportPng={exportPng}
          onExportSvg={exportSvg}
          onSave={saveScene}
          onLoad={() => fileInputRef.current?.click()}
          onShare={shareScene}
          onToggleTheme={() => setDark((current) => !current)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <LeftToolbar toolbar={toolbar} activeTool={tool} onSelectTool={setTool} />
        {tool === "laser" && (
          <LaserPanel
            size={laserSettings.size}
            color={laserSettings.color}
            onSizeChange={(s) => setLaserSettings((p) => ({ ...p, size: s }))}
            onColorChange={(c) => setLaserSettings((p) => ({ ...p, color: c }))}
          />
        )}

        <section
          className="sf-canvas-wrap"
          onContextMenu={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
        >
          <canvas
            ref={canvasRef}
            className="sf-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={beginTextEdit}
          />
          <TextEditorOverlay
            editorRef={textEditorRef}
            editingText={editingElement ? editingText : null}
            style={textareaStyle}
            onChange={(value) => setEditingText((prev) => (prev ? { ...prev, value } : prev))}
            onCommit={commitText}
          />
          <BottomBar
            zoom={camera.zoom}
            tool={tool}
            onZoomOut={() => setCamera((current) => ({ ...current, zoom: Math.max(0.1, current.zoom / 1.15) }))}
            onZoomIn={() => setCamera((current) => ({ ...current, zoom: Math.min(30, current.zoom * 1.15) }))}
            onFitToScreen={fitToScreen}
            onAutoLayout={autoLayoutScene}
            onToggleSelectMode={() => setTool(tool === "select" ? "frame" : "select")}
            onFullscreen={() => document.documentElement.requestFullscreen?.()}
          />
          {toast ? <div className="sf-toast">{toast}</div> : null}
        </section>

        <PropertiesPanel
          primary={primary}
          selectedCount={selectedIds.length}
          includeBackground={includeBackground}
          title={ui?.propertiesTitle}
          fontOptions={fontOptions}
          onStyleChange={updateSelectedStyle}
          onIncludeBackgroundChange={setIncludeBackground}
        />

        <ContextMenu
          menu={contextMenu}
          onCopy={copySelected}
          onPaste={paste}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
          onBringToFront={() => reorderSelected("front")}
          onSendToBack={() => reorderSelected("back")}
          onGroup={groupSelected}
          onUngroup={ungroupSelected}
          onLock={lockSelected}
          onAddLink={addLink}
          onClose={() => setContextMenu(null)}
        />

        <CommandPalette
          open={paletteOpen}
          query={paletteQuery}
          index={paletteIndex}
          commands={filteredCommands}
          placeholder={ui?.commandPalettePlaceholder}
          onQueryChange={(value) => {
            setPaletteQuery(value);
            setPaletteIndex(0);
          }}
          onIndexChange={setPaletteIndex}
          onRun={(action) => {
            action.run();
            setPaletteOpen(false);
          }}
          onClose={() => setPaletteOpen(false)}
        />

        <input ref={imageInputRef} hidden type="file" accept="image/*" onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} />
        <input ref={fileInputRef} hidden type="file" accept=".json,.sketchflow" onChange={(e) => { loadScene(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <SketchFlowStyles accent={accent} googleFontUrl={ui?.googleFontUrl} />
    </main>
  );
}
