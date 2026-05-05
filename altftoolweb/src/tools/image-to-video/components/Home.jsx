"use client";
import { useState } from "react";
import FileDropzone from "./FileDropzone";
import SlideStrip from "./SlideStrip";
import PreviewCanvas from "./PreviewCanvas";
import ControlPanel from "./ControlPanel";
import ActionBar from "./ActionBar";
import VideoResult from "./VideoResult";
import OfflineBadge from "./OfflineBadge";
import StoryFlowBar from "./StoryFlowBar";
import LayerPanel from "./LayerPanel";
import LayerEditor from "./LayerEditor";
import { useVideoGenerator } from "../hooks/useVideoGenerator";
import { resolveAnimation } from "../utils/motionBuilder";
import { drawFrame } from "../utils/drawFrame";
import { applyEasing } from "../utils/easing";
// import TimelineEditor from "./TimelineEditor";
import SlideTimingPanel from "./SlideTimingPanel";
import FocusControls from "./FocusControls";
import SplitScreenEditor from "./SplitScreenEditor";
import BeatTapEditor from "./BeatTapEditor";
import HookBuilder from "./HookBuilder";
import ProjectManager      from "./ProjectManager";
import { Toaster } from "react-hot-toast";

import {
  saveProject,
  getProject,
  buildProjectData,
  deserializeSlides,
} from "../utils/projectDB";

const BETTER_PRESETS = [
  { animation: "kenBurns", easing: "cinematic", duration: 3.5 },
  { animation: "zoomFade", easing: "easeInOut", duration: 3 },
  { animation: "panLeft", easing: "easeOut", duration: 2.5 },
  { animation: "zoomIn", easing: "easeIn", duration: 4 },
];

/* ── Default layers for a fresh slide ── */
function makeDefaultLayers() {
  return [
    {
      id: `layer-img-${Date.now()}`,
      type: "image",
      name: "Background Image",
      visible: true,
      opacity: 1,
    },
  ];
}

/* ── ID generator ── */
let _lid = 0;
const newId = () => `layer-${Date.now()}-${++_lid}`;

export default function Home() {
  const [slides, setSlides] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [globalDuration, setGlobalDuration] = useState(2.5);
  const [easing, setEasing] = useState("easeInOut");
  const [loopType, setLoopType] = useState("normal");
  const [splitLayout, setSplitLayout] = useState("none");
  const [splitSlotMap, setSplitSlotMap] = useState({}); // { slotIndex: slideId }
  const [hook, setHook] = useState({
    enabled: false,
    text: "",
    style: "fadeSlideUp",
    color: "#ffffff",
    fontSize: 52,
    position: "center",
    duration: 0.45,
  });
const [projectId,   setProjectId]   = useState(null);
const [projectName, setProjectName] = useState("Untitled Project");
const [isSaving,    setIsSaving]    = useState(false);

const handleSaveProject = (name) => {
  return new Promise(async (resolve, reject) => {
    setIsSaving(true);
    try {
      const data = await buildProjectData(projectId, name, {
        slides, globalDuration, easing,
        hook, splitLayout, splitSlotMap,
      });
      await saveProject(data);
      setProjectId(data.id);
      setProjectName(name);
      setIsSaving(false);
      resolve();
    } catch (err) {
      console.error("Save failed", err);
      setIsSaving(false);
      reject(err);
    }
  });
};

const handleLoadProject = async (project) => {
  try {
    // Rebuild img elements from saved urls
    const loadedSlides = await deserializeSlides(project.slides ?? []);
    setSlides(loadedSlides);
    setGlobalDuration(project.globalDuration ?? 2.5);
    setEasing(project.easing ?? "easeInOut");
    setHook(project.hook ?? { enabled: false });
    setSplitLayout(project.splitLayout ?? "none");
    setSplitSlotMap(project.splitSlotMap ?? {});
    setProjectId(project.id);
    setProjectName(project.name);
    setVideoUrl(null);
    if (loadedSlides.length) setSelectedId(loadedSlides[0].id);
  } catch (err) {
    console.error("Load failed", err);
  }
};

  const { generate, isGenerating, progress, videoUrl, setVideoUrl } =
    useVideoGenerator();


  const selectedSlide =
    slides.find((s) => s.id === selectedId) ?? slides[0] ?? null;
  const selectedIndex = slides.findIndex((s) => s.id === selectedSlide?.id);
  const currentLayers = selectedSlide?.layers ?? [];
  const selectedLayer =
    currentLayers.find((l) => l.id === selectedLayerId) ?? null;

  /* ── Helpers to mutate layers on the selected slide ── */
  const mutateLayers = (slideId, fn) =>
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId ? { ...s, layers: fn(s.layers ?? []) } : s,
      ),
    );

  /* ── Slide management ── */
  const handleImagesLoaded = (newSlides) => {
    const withLayers = newSlides.map((s) => ({
      ...s,
      layers: makeDefaultLayers(),
    }));
    setSlides((prev) => [...prev, ...withLayers]);
    if (!selectedId && withLayers.length) setSelectedId(withLayers[0].id);
    setVideoUrl(null);
  };

  const handleRemove = (id) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedLayerId(null);
    }
    setVideoUrl(null);
  };

  const handleAnimationChange = (id, animation) =>
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, animation } : s)),
    );

  // Update any key(s) on a single slide
  const handleSlideUpdate = (id, patch) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  const handleShuffle = () => {
    setSlides((prev) => [...prev].sort(() => Math.random() - 0.5));
    setVideoUrl(null);
  };

  const handleMakeBetter = () => {
    const p = BETTER_PRESETS[Math.floor(Math.random() * BETTER_PRESETS.length)];
    setGlobalDuration(p.duration);
    setEasing(p.easing);
    setSlides((prev) => prev.map((s) => ({ ...s, animation: p.animation })));
    setVideoUrl(null);
  };

  const handleExportFrame = () => {
    if (!selectedSlide) return;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext("2d");
    drawFrame(
      ctx,
      selectedSlide.img,
      resolveAnimation(selectedSlide),
      applyEasing(0.5, easing),
      720,
      1280,
      selectedSlide.layers,
    );
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "frame.png";
    a.click();
  };

  /* ── Layer operations ── */
  const handleSelectLayer = (layerId) => setSelectedLayerId(layerId);

  const handleToggleVisibility = (layerId) => {
    if (!selectedSlide) return;
    mutateLayers(selectedSlide.id, (layers) =>
      layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    );
  };

  const handleDeleteLayer = (layerId) => {
    if (!selectedSlide) return;
    mutateLayers(selectedSlide.id, (layers) =>
      layers.filter((l) => l.id !== layerId),
    );
    if (selectedLayerId === layerId) setSelectedLayerId(null);
  };

  const handleReorderLayers = (nextLayers) => {
    if (!selectedSlide) return;
    mutateLayers(selectedSlide.id, () => nextLayers);
  };

  const handleOpacityChange = (layerId, opacity) => {
    if (!selectedSlide) return;
    mutateLayers(selectedSlide.id, (layers) =>
      layers.map((l) => (l.id === layerId ? { ...l, opacity } : l)),
    );
  };

  const handleAddText = () => {
    if (!selectedSlide) return;
    const id = newId();
    mutateLayers(selectedSlide.id, (layers) => [
      ...layers,
      {
        id,
        type: "text",
        name: "Text Layer",
        visible: true,
        opacity: 1,
        text: "Your Text Here",
        fontSize: 56,
        fontFamily: "Arial",
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
        x: 50,
        y: 50,
        stroke: true,
        strokeColor: "#000000",
      },
    ]);
    setSelectedLayerId(id);
  };

  const handleAddShape = () => {
    if (!selectedSlide) return;
    const id = newId();
    mutateLayers(selectedSlide.id, (layers) => [
      ...layers,
      {
        id,
        type: "shape",
        name: "Shape Layer",
        visible: true,
        opacity: 0.85,
        shapeType: "rect",
        fillColor: "#000000",
        borderEnabled: false,
        borderColor: "#ffffff",
        borderWidth: 2,
        x: 50,
        y: 85,
        w: 80,
        h: 12,
      },
    ]);
    setSelectedLayerId(id);
  };

  const handleLayerChange = (updatedLayer) => {
    if (!selectedSlide) return;
    mutateLayers(selectedSlide.id, (layers) =>
      layers.map((l) => (l.id === updatedLayer.id ? updatedLayer : l)),
    );
  };

  // Handler add karo existing handlers ke saath
  const handleAddSubtitle = () => {
    if (!selectedSlide) return;
    handleSlideUpdate(selectedSlide.id, {
      layers: [
        ...(selectedSlide.layers ?? [
          {
            id: "__base__",
            type: "image",
            name: "Background Image",
            visible: true,
            opacity: 1,
          },
        ]),
        {
          id: crypto.randomUUID(),
          type: "text",
          name: "Subtitle",
          text: "Add your subtitle here…",
          x: 50,
          y: 85,
          fontSize: 36,
          fontFamily: "Arial",
          fontWeight: "bold",
          color: "#ffffff",
          textAlign: "center",
          stroke: true,
          strokeColor: "#000000",
          visible: true,
          opacity: 1,
          animate: "subtitleSlide",
        },
      ],
    });
  };

  const handleSlotAssign = (slotIndex, slideId) => {
    setSplitSlotMap((prev) => ({ ...prev, [slotIndex]: slideId }));
  };

  const handleBeatsApply = (updatedSlides) => {
    setSlides(updatedSlides);
    setVideoUrl(null);
  };

  // Build splitConfig object passed to drawFrame + PreviewCanvas
  const splitConfig =
    splitLayout !== "none"
      ? {
          layout: splitLayout,
          slots: Object.fromEntries(
            Object.entries(splitSlotMap).map(([i, id]) => [
              i,
              slides.find((s) => s.id === id)?.img ?? null,
            ]),
          ),
        }
      : null;

  return (
    // <div className="w-full bg-(--card) rounded-xl overflow-hidden">
    <div className="w-full max-w-6xl mx-auto space-y-5">
<Toaster position="top-center" />
      <OfflineBadge />
            <ProjectManager
  onSave={handleSaveProject}
  onLoad={handleLoadProject}
  currentProjectName={projectName}
  onNameChange={setProjectName}
  isSaving={isSaving}
/>

      <div className="flex flex-col gap-5 items-start">
        <div className="flex-1 w-full space-y-4">
          <FileDropzone onImagesLoaded={handleImagesLoaded} />

          {slides.length > 0 && (
            <>
              <StoryFlowBar
                totalSlides={slides.length}
                currentSlideIndex={selectedIndex}
              />
              {/* Timeline — visual overview of all slides + entry/exit caps */}
              {/* <TimelineEditor
                slides={slides}
                selectedId={selectedSlide?.id}
                onSelect={setSelectedId}
                globalDuration={globalDuration}
              /> */}
              <div className="w-full flex flex-col items-center gap-4">
                {/* Live preview canvas */}
                {selectedSlide && (
                  <PreviewCanvas
                    slide={selectedSlide}
                    duration={globalDuration}
                    easing={easing}
                    onFocusChange={handleSlideUpdate}
                    splitConfig={splitConfig}
                    hook={hook}
                  />
                )}
                <SlideStrip
                  slides={slides}
                  selectedId={selectedSlide?.id}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setSelectedLayerId(null);
                  }}
                  onRemove={handleRemove}
                  onAnimationChange={handleAnimationChange}
                />

                {videoUrl && <VideoResult videoUrl={videoUrl} />}

                {/* Layer system — only shown when a slide is selected */}
                {selectedSlide && (
                  <div className="w-full space-y-3">
                    {/* Layer list */}
                    <LayerPanel
                      layers={currentLayers}
                      selectedLayerId={selectedLayerId}
                      onSelectLayer={handleSelectLayer}
                      onToggleVisibility={handleToggleVisibility}
                      onDeleteLayer={handleDeleteLayer}
                      onReorderLayers={handleReorderLayers}
                      onOpacityChange={handleOpacityChange}
                      onAddText={handleAddText}
                      onAddShape={handleAddShape}
                      onAddSubtitle={handleAddSubtitle}
                    />

                    {/* Layer property editor */}
                    <LayerEditor
                      layer={selectedLayer}
                      onChange={handleLayerChange}
                    />
                  </div>
                  
                )}
                
              </div>
              <SplitScreenEditor
                splitLayout={splitLayout}
                onLayoutChange={(val) => {
                  setSplitLayout(val);
                  setVideoUrl(null);
                }}
                slides={slides}
                splitSlotMap={splitSlotMap}
                onSlotAssign={handleSlotAssign}
              />

              {/* Per-slide timing controls */}
              <SlideTimingPanel
                slide={selectedSlide}
                globalDuration={globalDuration}
                onChange={handleSlideUpdate}
              />

              <BeatTapEditor slides={slides} onApply={handleBeatsApply} />
              <HookBuilder hook={hook} onChange={setHook} />

              <FocusControls
                slide={selectedSlide}
                onChange={handleSlideUpdate}
              />

              <ControlPanel
                globalDuration={globalDuration}
                onDurationChange={setGlobalDuration}
                easing={easing}
                onEasingChange={setEasing}
              />

              <div className="w-full">
                <p className="text-sm font-semibold text-(--foreground) mb-1">
                  Loop Style
                </p>

                <select
                  value={loopType}
                  onChange={(e) => setLoopType(e.target.value)}
                  className="w-full text-xs bg-(--background) border border-(--border) rounded-lg px-2 py-1.5"
                >
                  <option value="normal">Normal</option>
                  <option value="reverse">Reverse</option>
                  <option value="bounce">Bounce</option>
                  <option value="abab">ABAB</option>
                </select>
              </div>
              <ActionBar
                onGenerate={() =>
                  generate(
                    slides,
                    globalDuration,
                    easing,
                    loopType,
                    splitConfig,
                    hook,
                    0.4,
                  )
                }
                onShuffle={handleShuffle}
                onMakeBetter={handleMakeBetter}
                onExportFrame={handleExportFrame}
                isGenerating={isGenerating}
                progress={progress}
                hasSlides={slides.length > 0}
              />
            </>
          )}
        </div>
      </div>
    </div>
    // </div>
  );
}