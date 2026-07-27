"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Film,
  Video,
  Smartphone,
  Megaphone,
  Sparkles,
  Globe,
  Wrench,
  Plus,
  Trash2,
  Camera,
  Bookmark,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Download,
  Upload,
  Printer,
  Edit3,
  Copy,
  RotateCcw,
  RotateCw,
  Sliders,
  X,
  Grid,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Layers,
  Clapperboard,
  Tv
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- PRESET SHOT TYPES & CAM ANGLES ---
const SHOT_TYPES = [
  { value: "Wide Shot", label: "Wide Shot (WS)", desc: "Establishes environment and subjects in scene." },
  { value: "Mid Shot", label: "Mid Shot (MS)", desc: "Focuses on subject from waist up; standard dialog framing." },
  { value: "Close-up", label: "Close-up (CU)", desc: "Emphasizes facial expressions, emotions, or small objects." },
  { value: "POV", label: "Point of View (POV)", desc: "Simulates looking directly through a character's eyes." },
  { value: "Overhead", label: "Overhead / High angle", desc: "Top-down view to emphasize scale, placement, or dread." },
  { value: "Drone", label: "Drone / Aerial", desc: "Extreme height tracking, establishes geography." },
  { value: "Tracking Shot", label: "Tracking / Pan", desc: "Camera moves alongside subject to follow action." },
  { value: "Custom", label: "Custom Setup", desc: "Non-standard frame composition." }
];

const CAM_ANGLES = [
  { value: "Eye Level", label: "Eye Level" },
  { value: "Low Angle", label: "Low Angle (Heroic)" },
  { value: "High Angle", label: "High Angle (Vulnerable)" },
  { value: "Dutch Angle", label: "Dutch Angle (Tension/Disorientation)" },
  { value: "Worm's Eye", label: "Worm's Eye (Extreme Low)" },
  { value: "Bird's Eye", label: "Bird's Eye (Top-Down)" }
];

const SCENE_STATUSES = [
  { value: "Draft", label: "Draft", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "Planned", label: "Planned", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "Ready", label: "Ready", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { value: "Shooting", label: "Shooting", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "Completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
];

const PROJECT_TYPES = [
  { value: "Film", label: "Feature Film", icon: Film },
  { value: "Short Film", label: "Short Film", icon: Video },
  { value: "YouTube", label: "YouTube Video", icon: Tv },
  { value: "Reel", label: "Social Reel / TikTok", icon: Smartphone },
  { value: "Advertisement", label: "Commercial Ad", icon: Megaphone },
  { value: "Animation", label: "Animation Board", icon: Sparkles },
  { value: "Documentary", label: "Documentary", icon: Globe },
  { value: "Custom", label: "Custom Creative", icon: Wrench }
];

// --- HIGH QUALITY DEFAULT PROJECTS FOR INITIAL LAUNCH ---
const DEFAULT_PROJECTS = [
  {
    id: "proj-cyberpunk-dawn",
    title: "Neo-Tokyo Cyberpunk Dawn",
    type: "Film",
    description: "A dark cyberpunk sci-fi teaser establishing the cybercity scale, drone surveillance, and a street-level cybernetic hack.",
    tags: ["Sci-Fi", "Cinematic", "Cyberpunk", "Trailer"],
    createdAt: "2026-05-18T08:00:00Z",
    scenes: [
      {
        id: "scene-1",
        number: 1,
        title: "Establishing Hologram Towers",
        duration: 8,
        objective: "Introduce scale and the oppressive holographic advertisements.",
        notes: "Drones fly in a flock pattern. Sky color should look like a television tuned to a dead channel.",
        status: "Ready",
        dialogue: "Voiceover: Neon and rain didn't save us. They just blurred the margins of who owned our minds.",
        voiceover: "Deep, gravelly synth-modulated narrator voice.",
        music: "Low ambient retro synthesizer pad, slow rhythmic industrial heartbeat.",
        actorCues: "Crowd walks in synchrony staring down at mobile devices.",
        soundCues: "Distant hum of mega-billboard generators, splash of cyber-cycle on rain puddle.",
        shots: [
          {
            id: "shot-1-1",
            title: "Overhead Drone Sweep",
            type: "Drone",
            angle: "Bird's Eye",
            description: "Camera glides between neon-tinted skyscrapers. A giant fish hologram swims across the building facade.",
            notes: "Hologram should reflect in wet asphalt below.",
            image: ""
          }
        ]
      },
      {
        id: "scene-2",
        number: 2,
        title: "Hacker Alley Interface",
        duration: 12,
        objective: "Introduce the protagonist Vance executing a neural hack.",
        notes: "Extreme close-up on eye. Visual reflections of green terminal text flowing across Vance's LED visor.",
        status: "Planned",
        dialogue: "Vance (whispers): Hold. Bypassing primary mainframe node now. Just give me three seconds.",
        voiceover: "",
        music: "Tempo increases, heavy syncopated arpeggio fading in.",
        actorCues: "Vance looks nervously over shoulder, fingers dancing rapidly on a portable holographic keyboard deck.",
        soundCues: "Crackling data signals, electric hiss of neural link cable plugging into neck socket.",
        shots: [
          {
            id: "shot-2-1",
            title: "Visor Macro closeup",
            type: "Close-up",
            angle: "Low Angle",
            description: "Tight macro shot of LED goggles showing terminal boot sequence inside the lens glass.",
            notes: "Glow should illuminate Vance's face in fluorescent cyan.",
            image: ""
          },
          {
            id: "shot-2-2",
            title: "Server Node POV",
            type: "POV",
            angle: "Eye Level",
            description: "Vance's visual stream of the network architecture expanding in 3D wireframe graphics.",
            notes: "Glitch graphics flashing red 'WARNING: BREACH DETECTED'.",
            image: ""
          }
        ]
      }
    ]
  },
  {
    id: "proj-electric-pulse",
    title: "Electric Horizon Campaign",
    type: "Advertisement",
    description: "Launch campaign advertisement for an autonomous electric supercar speeding through dusty salt flats.",
    tags: ["Commercial", "Ad", "Automotive", "High-Speed"],
    createdAt: "2026-05-18T09:00:00Z",
    scenes: [
      {
        id: "scene-ad-1",
        number: 1,
        title: "Dust storm reveal",
        duration: 4,
        objective: "Build suspense. Reveal silhouette of Horizon X car through thick sand haze.",
        notes: "High contrast lighting. Backlit solar glare.",
        status: "Draft",
        dialogue: "Announcer: Silence is the new roar.",
        voiceover: "Whispered, powerful female voice over track.",
        music: "Deep bass rumble, ticking watch effect.",
        actorCues: "",
        soundCues: "Wind howling, deep electric motor hum beginning to wind up.",
        shots: [
          {
            id: "shot-ad-1-1",
            title: "Low Ground track",
            type: "Tracking Shot",
            angle: "Low Angle",
            description: "Camera is inches off salt flats, car tires kick up white crystalline dust clouds as it rockets forward.",
            notes: "High-speed tracking rig required.",
            image: ""
          }
        ]
      }
    ]
  }
];

// --- CARD LAYOUT MATCHING AGE CALCULATOR EXACTLY ---
const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    onClick={onClick}
    className={`bg-(--background) rounded-xl p-4 border border-(--border) ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon size={16} className="text-(--primary)" />}
          <h3 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

export default function StoryboardBuilder() {
  // --- Header Title Animation ---
  const [titleText, setTitleText] = useState("");
  const fullTitle = "Storyboard Builder";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, index));
      index++;
      if (index > fullTitle.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // --- Core States ---
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [activeSceneId, setActiveSceneId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [presElapsedSeconds, setPresElapsedSeconds] = useState(0);
  const [liveLocalTime, setLiveLocalTime] = useState("");

  // Views & UI Controllers
  const [isExportMode, setIsExportMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentPresIdx, setCurrentPresIdx] = useState(0);
  const [presAutoPlay, setPresAutoPlay] = useState(false);
  const [presSlideTime, setPresSlideTime] = useState(5); // in seconds
  const [presSoundEnabled, setPresSoundEnabled] = useState(true);

  // New Project Modal State
  const [isNewProjOpen, setIsNewProjOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Film");
  const [newDesc, setNewDesc] = useState("");
  const [newTagsStr, setNewTagsStr] = useState("");

  // Canvas / Sketchpad Modal State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasTarget, setCanvasTarget] = useState(null); // { sceneId, shotId }
  const canvasRef = useRef(null);
  const [drawColor, setDrawColor] = useState("#ffffff");
  const [drawSize, setDrawSize] = useState(4);
  const [drawTool, setDrawTool] = useState("pencil"); // pencil, eraser
  const [canvasGuide, setCanvasGuide] = useState("thirds"); // none, thirds, horizon, perspective
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isDrawingRef = useRef(false);

  // Local Storage Hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem("storyboard_projects");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProjects(parsed);
        if (parsed.length > 0) {
          setActiveProjectId(parsed[0].id);
        }
      } else {
        // Hydrate with defaults
        setProjects(DEFAULT_PROJECTS);
        setActiveProjectId(DEFAULT_PROJECTS[0].id);
        localStorage.setItem("storyboard_projects", JSON.stringify(DEFAULT_PROJECTS));
      }
    } catch (e) {
      console.error("Local storage restoration failed", e);
    }
  }, []);

  const syncProjects = (updatedProjects) => {
    setProjects(updatedProjects);
    localStorage.setItem("storyboard_projects", JSON.stringify(updatedProjects));
  };

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 3500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3500);
    }
  };

  // --- Active Helpers ---
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const activeScene = useMemo(() => {
    if (!activeProject) return null;
    return activeProject.scenes.find((s) => s.id === activeSceneId) || null;
  }, [activeProject, activeSceneId]);

  // --- Dashboard Metrics calculations ---
  const metrics = useMemo(() => {
    if (!activeProject || !activeProject.scenes) {
      return { totalScenes: 0, completedScenes: 0, pendingScenes: 0, estDuration: 0, progress: 0, totalShots: 0 };
    }
    const totalScenes = activeProject.scenes.length;
    const completedScenes = activeProject.scenes.filter((s) => s.status === "Completed").length;
    const pendingScenes = totalScenes - completedScenes;
    const estDuration = activeProject.scenes.reduce((acc, s) => acc + (parseInt(s.duration) || 0), 0);
    const progress = totalScenes > 0 ? Math.round((completedScenes / totalScenes) * 100) : 0;
    const totalShots = activeProject.scenes.reduce((acc, s) => acc + (s.shots ? s.shots.length : 0), 0);

    return { totalScenes, completedScenes, pendingScenes, estDuration, progress, totalShots };
  }, [activeProject]);

  // --- PROJECT ACTIONS ---
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj = {
      id: "proj-" + Date.now(),
      title: newTitle.trim(),
      type: newType,
      description: newDesc.trim(),
      tags: newTagsStr.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      scenes: []
    };

    const updated = [newProj, ...projects];
    syncProjects(updated);
    setActiveProjectId(newProj.id);
    setIsNewProjOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewTagsStr("");
    showToast(`Project Created: ${newProj.title}`);
  };

  const handleDeleteProject = (projId) => {
    if (window.confirm("Are you sure you want to delete this storyboard project? All scenes, notes, and sketches will be permanently lost.")) {
      const updated = projects.filter((p) => p.id !== projId);
      syncProjects(updated);
      if (updated.length > 0) {
        setActiveProjectId(updated[0].id);
      } else {
        setActiveProjectId("");
      }
      showToast("Project deleted.");
    }
  };

  const handleDuplicateProject = (proj) => {
    const duplicated = {
      ...proj,
      id: "proj-" + Date.now(),
      title: `${proj.title} (Copy)`,
      createdAt: new Date().toISOString()
    };
    const updated = [duplicated, ...projects];
    syncProjects(updated);
    setActiveProjectId(duplicated.id);
    showToast(`Duplicated: ${duplicated.title}`);
  };

  // --- SCENE ACTIONS ---
  const handleAddScene = () => {
    if (!activeProject) return;

    const nextNum = activeProject.scenes.length + 1;
    const newScene = {
      id: "scene-" + Date.now(),
      number: nextNum,
      title: `Scene ${nextNum} - Unnamed Beat`,
      duration: 5,
      objective: "",
      notes: "",
      status: "Draft",
      dialogue: "",
      voiceover: "",
      music: "",
      actorCues: "",
      soundCues: "",
      shots: [
        {
          id: "shot-" + Date.now() + "-1",
          title: "Opening Composition",
          type: "Wide Shot",
          angle: "Eye Level",
          description: "Camera description...",
          notes: "",
          image: ""
        }
      ]
    };

    const updatedScenes = [...activeProject.scenes, newScene];
    const updatedProjects = projects.map((p) => {
      if (p.id === activeProjectId) {
        return { ...p, scenes: updatedScenes };
      }
      return p;
    });

    syncProjects(updatedProjects);
    setActiveSceneId(newScene.id);
    showToast("Scene added successfully.");
  };

  const handleUpdateScene = (sceneId, updatedFields) => {
    if (!activeProject) return;

    const updatedScenes = activeProject.scenes.map((s) => {
      if (s.id === sceneId) {
        return { ...s, ...updatedFields };
      }
      return s;
    });

    const updatedProjects = projects.map((p) => {
      if (p.id === activeProjectId) {
        return { ...p, scenes: updatedScenes };
      }
      return p;
    });

    syncProjects(updatedProjects);
  };

  const handleDeleteScene = (sceneId) => {
    if (!activeProject) return;

    const filteredScenes = activeProject.scenes.filter((s) => s.id !== sceneId);
    // Recalculate scene order numbers
    const updatedScenes = filteredScenes.map((s, idx) => ({
      ...s,
      number: idx + 1
    }));

    const updatedProjects = projects.map((p) => {
      if (p.id === activeProjectId) {
        return { ...p, scenes: updatedScenes };
      }
      return p;
    });

    syncProjects(updatedProjects);
    if (activeSceneId === sceneId) {
      setActiveSceneId("");
    }
    showToast("Scene removed.");
  };

  const handleDuplicateScene = (scene) => {
    if (!activeProject) return;

    const duplicatedScene = {
      ...scene,
      id: "scene-" + Date.now(),
      title: `${scene.title} (Copy)`,
      number: activeProject.scenes.length + 1,
      shots: scene.shots.map((sh, idx) => ({
        ...sh,
        id: `shot-${Date.now()}-${idx}`
      }))
    };

    const updatedScenes = [...activeProject.scenes, duplicatedScene];
    const updatedProjects = projects.map((p) => {
      if (p.id === activeProjectId) {
        return { ...p, scenes: updatedScenes };
      }
      return p;
    });

    syncProjects(updatedProjects);
    setActiveSceneId(duplicatedScene.id);
    showToast("Scene duplicated.");
  };

  // --- DRAG AND DROP SCENE REORDER ---
  const [draggedSceneIdx, setDraggedSceneIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedSceneIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedSceneIdx === null || draggedSceneIdx === index) return;

    const items = [...activeProject.scenes];
    const draggedItem = items[draggedSceneIdx];
    items.splice(draggedSceneIdx, 1);
    items.splice(index, 0, draggedItem);

    const reordered = items.map((s, idx) => ({
      ...s,
      number: idx + 1
    }));

    const updatedProjects = projects.map((p) => {
      if (p.id === activeProjectId) {
        return { ...p, scenes: reordered };
      }
      return p;
    });

    syncProjects(updatedProjects);
    setDraggedSceneIdx(null);
    showToast("Sequence updated.");
  };

  // --- SHOT PLANNER ACTIONS ---
  const handleAddShot = (sceneId) => {
    if (!activeProject) return;

    const targetScene = activeProject.scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    const nextShotNum = targetScene.shots.length + 1;
    const newShot = {
      id: "shot-" + Date.now() + "-" + nextShotNum,
      title: `Shot ${nextShotNum}`,
      type: "Wide Shot",
      angle: "Eye Level",
      description: "",
      notes: "",
      image: ""
    };

    const updatedShots = [...targetScene.shots, newShot];
    handleUpdateScene(sceneId, { shots: updatedShots });
  };

  const handleUpdateShot = (sceneId, shotId, updatedFields) => {
    if (!activeProject) return;

    const targetScene = activeProject.scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    const updatedShots = targetScene.shots.map((sh) => {
      if (sh.id === shotId) {
        return { ...sh, ...updatedFields };
      }
      return sh;
    });

    handleUpdateScene(sceneId, { shots: updatedShots });
  };

  const handleDeleteShot = (sceneId, shotId) => {
    if (!activeProject) return;

    const targetScene = activeProject.scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    if (targetScene.shots.length <= 1) {
      showToast("A scene must contain at least one shot setup.", true);
      return;
    }

    const filteredShots = targetScene.shots.filter((sh) => sh.id !== shotId);
    handleUpdateScene(sceneId, { shots: filteredShots });
    showToast("Shot deleted.");
  };

  const handleUploadImageReference = (sceneId, shotId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const targetWidth = 480;
        const targetHeight = 270;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const base64 = canvas.toDataURL("image/jpeg", 0.5);
        handleUpdateShot(sceneId, shotId, { image: base64 });
        showToast("Reference image added.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- DRAWING CANVAS ENGINE ---
  const openCanvasModal = (sceneId, shotId) => {
    setCanvasTarget({ sceneId, shotId });
    setIsCanvasOpen(true);

    const targetScene = activeProject.scenes.find((s) => s.id === sceneId);
    const targetShot = targetScene?.shots.find((sh) => sh.id === shotId);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (targetShot && targetShot.image) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveCanvasState();
        };
        img.src = targetShot.image;
      } else {
        saveCanvasState();
      }
    }, 100);
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const history = canvasHistory.slice(0, historyPointer + 1);
    const updated = [...history, snapshot];
    if (updated.length > 20) updated.shift();

    setCanvasHistory(updated);
    setHistoryPointer(updated.length - 1);
  };

  const handleCanvasUndo = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      setHistoryPointer(prevPointer);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(canvasHistory[prevPointer], 0, 0);
    }
  };

  const handleCanvasRedo = () => {
    if (historyPointer < canvasHistory.length - 1) {
      const nextPointer = historyPointer + 1;
      setHistoryPointer(nextPointer);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(canvasHistory[nextPointer], 0, 0);
    }
  };

  const handleCanvasClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.strokeStyle = drawTool === "eraser" ? "#18181b" : drawColor;
    ctx.lineWidth = drawTool === "eraser" ? drawSize * 4 : drawSize;
  };

  const drawStroke = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveCanvasState();
    }
  };

  const handleSaveSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasTarget) return;

    const dataURL = canvas.toDataURL("image/jpeg", 0.4);

    handleUpdateShot(canvasTarget.sceneId, canvasTarget.shotId, { image: dataURL });
    setIsCanvasOpen(false);
    setCanvasHistory([]);
    setHistoryPointer(-1);
    setCanvasTarget(null);
    showToast("Concept sketch saved to board.");
  };

  // --- AUDIO SYNTH ---
  const playClapperSound = () => {
    if (!presSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);

      const osc2 = audioCtx.createOscillator();
      const gainNode2 = audioCtx.createGain();
      osc2.connect(gainNode2);
      gainNode2.connect(audioCtx.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(140, audioCtx.currentTime);
      gainNode2.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.04);

    } catch (e) {
      console.warn("Browser audio execution blocked.", e);
    }
  };

  // --- CINEMATIC AUTOPLAY ENGINE ---
  const presentationShotsList = useMemo(() => {
    if (!activeProject || !activeProject.scenes) return [];
    const list = [];
    activeProject.scenes.forEach((sc) => {
      sc.shots.forEach((sh, shIdx) => {
        list.push({
          ...sh,
          sceneId: sc.id,
          sceneTitle: sc.title,
          sceneNum: sc.number,
          sceneObj: sc.objective,
          sceneNotes: sc.notes,
          dialogue: sc.dialogue,
          voiceover: sc.voiceover,
          music: sc.music,
          actorCues: sc.actorCues,
          soundCues: sc.soundCues,
          duration: sc.duration,
          shotIdx: shIdx + 1,
          totalShotsInScene: sc.shots.length
        });
      });
    });
    return list;
  }, [activeProject]);

  const activePresShot = presentationShotsList[currentPresIdx] || null;

  // --- Live time clock ticker ---
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLiveLocalTime(d.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Real-time Presentation Autoplay Engine ---
  useEffect(() => {
    let interval = null;
    if (isPresentationMode && presAutoPlay && presentationShotsList.length > 0) {
      interval = setInterval(() => {
        const targetDuration = activePresShot ? (parseInt(activePresShot.duration) || presSlideTime || 5) : (presSlideTime || 5);
        setPresElapsedSeconds((prev) => {
          if (prev + 1 >= targetDuration) {
            setCurrentPresIdx((currentIdx) => {
              const nextIdx = currentIdx < presentationShotsList.length - 1 ? currentIdx + 1 : 0;
              playClapperSound();
              return nextIdx;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPresentationMode, presAutoPlay, presentationShotsList, activePresShot, presSlideTime]);

  const handleTogglePresentation = () => {
    if (presentationShotsList.length === 0) {
      showToast("Create at least one scene with a shot setup to preview.", true);
      return;
    }
    setIsPresentationMode(!isPresentationMode);
    setCurrentPresIdx(0);
    setPresElapsedSeconds(0);
    setPresAutoPlay(false);
  };

  // --- PRINT / PDF EXPORT HANDLER ---
  const handlePrint = () => {
    window.print();
  };

  // --- IMPORT / EXPORT RAW JSON DATA ---
  const handleExportJSON = () => {
    if (!activeProject) return;
    const blob = new Blob([JSON.stringify(activeProject, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storyboard_${activeProject.title.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Project JSON exported successfully.");
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.title || !parsed.scenes) {
          showToast("Invalid project layout configuration.", true);
          return;
        }

        const imported = {
          ...parsed,
          id: "proj-" + Date.now(),
          title: `${parsed.title} (Imported)`
        };

        const updated = [imported, ...projects];
        syncProjects(updated);
        setActiveProjectId(imported.id);
        showToast(`Imported project: ${imported.title}`);
      } catch (err) {
        showToast("Error parsing storyboard JSON.", true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="px-4 py-6 text-(--foreground) bg-(--background) font-secondary selection:bg-primary/20">

      {/* ================================= HEADER MATCHING AGE CALCULATOR ================================= */}
      {!isPresentationMode && !isExportMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-(--background) text-center mb-5"
        >
          <h1 className="heading flex justify-center gap-2 animate-fade-up">
            {titleText}
          </h1>
          <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-6">
            Create visual sequences, plan scene durations, sequence shots, and script creative stories.
          </p>
        </motion.div>
      )}

      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {(successMsg || errorMsg) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg border font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2.5 ${
              errorMsg
                ? "bg-red-50 border-red-200 text-red-650"
                : "bg-green-50 border border-green-200 text-green-750"
            }`}
          >
            {errorMsg ? <AlertCircle size={14} className="shrink-0" /> : <Check size={14} className="shrink-0" />}
            <span>{errorMsg || successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================= MAIN CONTAINER MATCHING AGE CALCULATOR ================================= */}
      {!isPresentationMode && !isExportMode && (
        <div className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg py-5 border border-(--border)">
          <div className="p-6 space-y-6">

            {/* Global Actions Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-(--background) text-(--secondary) p-4 rounded-xl border border-(--border)">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsNewProjOpen(true)}
                  className="bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) px-6 py-2.5 rounded-lg cursor-pointer transition-all font-bold text-xs uppercase tracking-wider"
                >
                  <Plus size={14} className="inline mr-1" /> New Storyboard
                </button>
                <label className="border border-(--border) text-(--secondary) hover:bg-black/5 dark:hover:bg-white/5 px-6 py-2.5 rounded-lg cursor-pointer transition-all font-bold text-xs uppercase tracking-wider flex items-center">
                  <Upload size={14} className="inline mr-1.5" /> Import JSON
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>

              <div className="text-[10px] font-black text-(--primary) uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Clock size={11} className="shrink-0 text-(--primary) animate-pulse" /> Studio Time: {liveLocalTime || "00:00:00"}
              </div>
            </div>

            {/* Split Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT BAR: Active Project selection */}
              <div className="lg:col-span-4 space-y-6">
                <GlassCard title="Storyboard Projects" icon={Bookmark}>
                  {projects.length === 0 ? (
                    <div className="text-center py-6 text-(--secondary) text-xs">
                      No storyboards loaded. Click 'New Storyboard' to start.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {projects.map((proj) => {
                        const TypeIcon = PROJECT_TYPES.find((t) => t.value === proj.type)?.icon || Film;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => {
                              setActiveProjectId(proj.id);
                              setActiveSceneId("");
                            }}
                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                              activeProjectId === proj.id
                                ? "bg-(--background) border-(--primary) text-(--primary) font-bold"
                                : "bg-(--background) border-(--border) text-(--secondary) hover:border-(--primary)"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <TypeIcon size={14} className="text-(--primary)" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate text-(--foreground)">{proj.title}</div>
                                <div className="text-[9px] uppercase tracking-wider text-(--secondary) opacity-80 mt-0.5">
                                  {proj.type} • {proj.scenes.length} Scenes
                                </div>
                              </div>
                            </div>

                            {/* Quick delete/copy actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateProject(proj);
                                }}
                                title="Duplicate Project"
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-(--secondary)"
                              >
                                <Copy size={11} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(proj.id);
                                }}
                                title="Delete Storyboard"
                                className="p-1 hover:bg-red-50 text-(--secondary) hover:text-red-650 rounded"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>

                {/* Project description & tools */}
                {activeProject && (
                  <GlassCard>
                    <div>
                      <h4 className="text-[9px] uppercase tracking-wider text-(--secondary) font-black">Storyboard Target</h4>
                      <p className="text-xs text-(--muted-foreground) mt-2 leading-relaxed">{activeProject.description || "No description set."}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-3">
                      <span className="px-2 py-0.5 rounded bg-(--background) border border-(--border) text-(--secondary) text-[9px] uppercase font-bold">
                        {activeProject.type}
                      </span>
                      {activeProject.tags.map((tg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-(--background) border border-(--primary) text-(--primary) text-[9px]">
                          #{tg}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-(--border) mt-4 pt-4 flex justify-between gap-2">
                      <button
                        onClick={() => setIsExportMode(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-(--border) text-(--secondary) hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Printer size={12} /> Export Sheets
                      </button>
                      <button
                        onClick={handleExportJSON}
                        className="p-2 border border-(--border) text-(--secondary) hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                        title="Download JSON Backup"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </GlassCard>
                )}
              </div>

              {/* RIGHT DASHBOARD: Metrics summary & Timeline view */}
              <div className="lg:col-span-8 space-y-6">

                {/* Studio Metrics styled as Age Calculator Cards */}
                {activeProject && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-(--background) text-(--secondary) p-4 rounded-xl border border-(--border)">
                    {[
                      { label: "Total Scenes", value: metrics.totalScenes, desc: "sequence units" },
                      { label: "Duration", value: `${metrics.estDuration}s`, desc: "cumulative timing" },
                      { label: "Shot Setups", value: metrics.totalShots, desc: "visual drafts" },
                      { label: "Progress", value: `${metrics.progress}%`, desc: `${metrics.completedScenes}/${metrics.totalScenes} done` }
                    ].map((st, i) => (
                      <div
                        key={i}
                        className="bg-(--background) text-(--muted-foreground) rounded-lg p-3 border border-(--border) flex flex-col justify-between"
                      >
                        <div className="text-2xl font-bold text-(--foreground) bg-(--background)">
                          {st.value}
                        </div>
                        <div className="text-[10px] text-(--secondary) uppercase font-bold mt-1">{st.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dynamic Timeline Progression Map */}
                {activeProject && (
                  <GlassCard
                    title="Timeline Sequencing"
                    icon={Grid}
                    headerActions={
                      <button
                        onClick={handleTogglePresentation}
                        className="flex items-center gap-1.5 px-4 py-2 border border-(--border) text-(--secondary) hover:border-(--primary) rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Play size={10} /> Live Preview
                      </button>
                    }
                  >
                    {activeProject.scenes.length === 0 ? (
                      <div className="text-center py-6 text-(--secondary) text-xs">
                        Timeline empty. Add scenes below to map sequence.
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth custom-scrollbar">
                        {activeProject.scenes.map((sc, idx) => {
                          const statusObj = SCENE_STATUSES.find((s) => s.value === sc.status);
                          return (
                            <React.Fragment key={sc.id}>
                              {idx > 0 && <ArrowRight size={12} className="text-(--secondary) opacity-50 shrink-0" />}

                              {/* Timeline Node card */}
                              <div
                                onClick={() => setActiveSceneId(sc.id)}
                                className={`p-3 rounded-lg border shrink-0 w-[140px] text-left transition-all cursor-pointer ${
                                  activeSceneId === sc.id
                                    ? "border-(--primary) bg-(--background) text-(--primary) font-bold shadow"
                                    : "border-(--border) bg-(--background) text-(--secondary) hover:border-(--primary)"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
                                    #{sc.number}
                                  </span>
                                  <span className="text-[8px] uppercase font-bold opacity-80">
                                    {sc.status}
                                  </span>
                                </div>
                                <div className="text-xs font-bold truncate mt-1 text-(--foreground)">{sc.title}</div>
                                <div className="flex justify-between text-[8px] text-(--secondary) mt-1.5 opacity-80">
                                  <span>{sc.shots.length} Shots</span>
                                  <span>{sc.duration}s</span>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </GlassCard>
                )}
              </div>

            </div> {/* Close grid grid-cols-1 lg:grid-cols-12 */}

            {/* ================================= THE SCENE CREATOR & LIST SYSTEM ================================= */}
            {activeProject && (
              <div className="space-y-4 border-t border-(--border) pt-6">

                {/* Scenes Grid Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-bold uppercase text-(--foreground) tracking-wider flex items-center gap-2">
                      <List size={16} className="text-(--primary)" /> Shooting Boards & Shots
                    </h2>
                    <p className="text-xs text-(--secondary)">Drag cards to rearrange story flow. Edit detailed scripts and visuals.</p>
                  </div>

                  <button
                    onClick={handleAddScene}
                    className="bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) px-6 py-2.5 rounded-lg cursor-pointer transition-all font-bold text-xs uppercase tracking-wider"
                  >
                    <Plus size={14} className="inline mr-1" /> Add Scene Card
                  </button>
                </div>

                {/* Draggable Scene Board Container */}
                {activeProject.scenes.length === 0 ? (
                  <GlassCard className="text-center py-12 text-(--secondary) text-xs">
                    This storyboard project is blank. Click the "Add Scene Card" button to initialize.
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeProject.scenes.map((sc, index) => {
                      const isExpanded = activeSceneId === sc.id;
                      const statusObj = SCENE_STATUSES.find((s) => s.value === sc.status);

                      return (
                        <div
                          key={sc.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          style={{ zIndex: openStatusDropdownId === sc.id ? 40 : 1 }}
                          className={`group/scene relative rounded-xl border transition-all duration-300 ${
                            isExpanded
                              ? "bg-(--card) border-(--primary) shadow-md"
                              : "bg-(--background) border-(--border) hover:border-(--primary)"
                          }`}
                        >
                          {/* Drag visual Handle on left */}
                          <div className="absolute left-2.5 top-5 flex flex-col gap-0.5 cursor-grab text-(--secondary) opacity-40 hover:opacity-100 transition-opacity">
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <div className="w-1 h-1 rounded-full bg-current" />
                            <div className="w-1 h-1 rounded-full bg-current" />
                          </div>

                          {/* Header Row (Summary fields) */}
                          <div
                            onClick={() => setActiveSceneId(isExpanded ? "" : sc.id)}
                            className="pl-7 pr-4 py-4 cursor-pointer flex flex-wrap items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="text-xs font-bold bg-black/5 dark:bg-white/5 border border-(--border) text-(--foreground) px-2 py-0.5 rounded">
                                Scene {sc.number}
                              </span>

                              {/* Scene Title Input inline */}
                              <input
                                type="text"
                                value={sc.title}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleUpdateScene(sc.id, { title: e.target.value })}
                                className="bg-transparent border-b border-transparent hover:border-(--border) focus:border-(--primary) text-xs font-bold text-(--foreground) outline-none transition-all w-[180px] sm:w-[280px] truncate"
                              />
                            </div>

                            {/* Status & Timing widgets */}
                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                <Clock size={11} className="text-(--secondary)" />
                                <input
                                  type="number"
                                  min="1"
                                  max="3600"
                                  value={sc.duration}
                                  onChange={(e) => handleUpdateScene(sc.id, { duration: parseInt(e.target.value) || 0 })}
                                  className="w-10 bg-(--background) border border-(--border) rounded px-1.5 py-0.5 text-xs font-bold text-center text-(--foreground) outline-none focus:border-(--primary)"
                                />
                                <span className="text-[10px] text-(--secondary) uppercase font-bold">sec</span>
                              </div>

                              {/* Custom Status Dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenStatusDropdownId(openStatusDropdownId === sc.id ? null : sc.id)}
                                  className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg border bg-(--background) border-(--border) text-(--foreground) outline-none cursor-pointer hover:border-(--primary) flex items-center gap-1.5 transition-all select-none"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    sc.status === "Draft" ? "bg-slate-400" :
                                    sc.status === "Planned" ? "bg-blue-500" :
                                    sc.status === "Ready" ? "bg-cyan-500" :
                                    sc.status === "Shooting" ? "bg-amber-500" :
                                    "bg-emerald-500"
                                  }`} />
                                  <span>{sc.status}</span>
                                  <ChevronDown size={10} className={`transform transition-transform duration-200 ${openStatusDropdownId === sc.id ? "rotate-180 text-(--primary)" : "rotate-0 text-(--secondary)"}`} />
                                </button>

                                {openStatusDropdownId === sc.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20 cursor-default"
                                      onClick={() => setOpenStatusDropdownId(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1.5 w-36 bg-(--card) border border-(--border) rounded-lg shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                      {SCENE_STATUSES.map((st) => (
                                        <button
                                          key={st.value}
                                          onClick={() => {
                                            handleUpdateScene(sc.id, { status: st.value });
                                            setOpenStatusDropdownId(null);
                                          }}
                                          className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
                                            sc.status === st.value
                                              ? "text-(--primary) bg-primary/5 font-extrabold"
                                              : "text-(--foreground)"
                                          }`}
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            st.value === "Draft" ? "bg-slate-400" :
                                            st.value === "Planned" ? "bg-blue-500" :
                                            st.value === "Ready" ? "bg-cyan-500" :
                                            st.value === "Shooting" ? "bg-amber-500" :
                                            "bg-emerald-500"
                                          }`} />
                                          <span>{st.label}</span>
                                          {sc.status === st.value && <Check size={10} className="ml-auto text-(--primary)" />}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Duplicate & delete tools */}
                              <div className="flex items-center gap-1 border-l border-(--border) pl-2">
                                <button
                                  onClick={() => handleDuplicateScene(sc)}
                                  title="Duplicate Scene Card"
                                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 text-(--secondary) hover:text-(--primary) rounded transition-all cursor-pointer"
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteScene(sc.id)}
                                  title="Delete Scene"
                                  className="p-1 hover:bg-red-50 text-(--secondary) hover:text-red-650 rounded transition-all cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Section (Detailed scripts, camera setups, canvas sketches) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border-t border-(--border) px-4 py-4 space-y-6 pl-7 bg-(--background)/50"
                              >

                                {/* Section 1: Objective & Script Direction notes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase tracking-wider font-bold text-(--secondary) flex items-center gap-1.5">
                                      <Camera size={11} className="text-(--primary)" /> Scene Objective & Context
                                    </label>
                                    <textarea
                                      placeholder="What is the story beat accomplish here? e.g. Introduce character, show tension..."
                                      value={sc.objective}
                                      onChange={(e) => handleUpdateScene(sc.id, { objective: e.target.value })}
                                      className="w-full min-h-[60px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-[9px] uppercase tracking-wider font-bold text-(--secondary) flex items-center gap-1.5">
                                      <Sliders size={11} className="text-(--primary)" /> Director / Production Notes
                                    </label>
                                    <textarea
                                      placeholder="Atmosphere, speed, lighting directives..."
                                      value={sc.notes}
                                      onChange={(e) => handleUpdateScene(sc.id, { notes: e.target.value })}
                                      className="w-full min-h-[60px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                    />
                                  </div>
                                </div>

                                {/* Section 2: Camera Shots Subsystem (With visual drawings & specifications) */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-(--border) pb-2">
                                    <h4 className="text-[10px] font-bold uppercase text-(--secondary) flex items-center gap-1.5">
                                      <Layers size={12} className="text-(--primary)" /> Camera Shot Sequence Setup
                                    </h4>
                                    <button
                                      onClick={() => handleAddShot(sc.id)}
                                      className="flex items-center gap-1 px-3 py-1.5 border border-(--border) hover:border-(--primary) text-(--secondary) hover:text-(--primary) rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer bg-(--background)"
                                    >
                                      <Plus size={9} /> Add Shot Frame
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sc.shots.map((sh, shIdx) => (
                                      <div
                                        key={sh.id}
                                        className="bg-(--background) border border-(--border) rounded-lg p-3.5 space-y-3 hover:border-(--primary) transition-all"
                                      >

                                        {/* Shot Frame Header */}
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-bold bg-black/5 dark:bg-white/5 border border-(--border) text-(--secondary) px-2 py-0.5 rounded">
                                            Frame {shIdx + 1}
                                          </span>
                                          <button
                                            onClick={() => handleDeleteShot(sc.id, sh.id)}
                                            className="p-1 hover:bg-red-50 text-(--secondary) hover:text-red-650 rounded transition-all cursor-pointer"
                                            title="Delete Shot Frame"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        </div>

                                        {/* Shot visual sketching card */}
                                        <div className="relative aspect-video rounded-lg bg-black/5 dark:bg-black/20 border border-(--border) overflow-hidden group/canvas">
                                          {sh.image ? (
                                            <img src={sh.image} alt={sh.title} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-(--secondary) opacity-50 text-[10px]">
                                              <Camera size={20} className="mb-1.5 opacity-60 text-(--primary)" />
                                              No Concept Image
                                            </div>
                                          )}

                                          {/* Hover tool overlay */}
                                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/canvas:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                              onClick={() => openCanvasModal(sc.id, sh.id)}
                                              className="px-3 py-1.5 bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all scale-95 cursor-pointer"
                                            >
                                              <Edit3 size={10} className="inline mr-1" /> Sketch
                                            </button>

                                            <label className="px-3 py-1.5 bg-black/90 hover:bg-black border border-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all scale-95 cursor-pointer flex items-center">
                                              <Upload size={10} className="inline mr-1" /> Upload
                                              <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleUploadImageReference(sc.id, sh.id, e)}
                                                className="hidden"
                                              />
                                            </label>
                                          </div>
                                        </div>

                                        {/* Specifications */}
                                        <div className="space-y-2">
                                          <input
                                            type="text"
                                            placeholder="Frame Title..."
                                            value={sh.title}
                                            onChange={(e) => handleUpdateShot(sc.id, sh.id, { title: e.target.value })}
                                            className="w-full bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 text-xs font-bold text-(--foreground) outline-none focus:border-(--primary) transition-all"
                                          />

                                          <div className="grid grid-cols-2 gap-1.5">
                                            <select
                                              value={sh.type}
                                              onChange={(e) => handleUpdateShot(sc.id, sh.id, { type: e.target.value })}
                                              className="w-full bg-(--background) border border-(--border) rounded-lg px-2 py-1.5 text-[10px] text-(--secondary) outline-none focus:border-(--primary) cursor-pointer"
                                            >
                                              {SHOT_TYPES.map((t) => (
                                                <option key={t.value} value={t.value} className="bg-(--card) text-(--foreground)">
                                                  {t.label}
                                                </option>
                                              ))}
                                            </select>

                                            <select
                                              value={sh.angle}
                                              onChange={(e) => handleUpdateShot(sc.id, sh.id, { angle: e.target.value })}
                                              className="w-full bg-(--background) border border-(--border) rounded-lg px-2 py-1.5 text-[10px] text-(--secondary) outline-none focus:border-(--primary) cursor-pointer"
                                            >
                                              {CAM_ANGLES.map((t) => (
                                                <option key={t.value} value={t.value} className="bg-(--card) text-(--foreground)">
                                                  {t.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>

                                          <textarea
                                            placeholder="Framing details, camera movement..."
                                            value={sh.description}
                                            onChange={(e) => handleUpdateShot(sc.id, sh.id, { description: e.target.value })}
                                            className="w-full min-h-[40px] max-h-[80px] bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 text-[10px] text-(--foreground) outline-none focus:border-(--primary) transition-all"
                                          />
                                        </div>

                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Section 3: Script dialogues & FX */}
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-bold uppercase text-(--secondary) flex items-center gap-1.5 border-b border-(--border) pb-2">
                                    <List size={12} className="text-(--primary)" /> Dialect, Voiceover & Production Reminders
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-wider font-bold text-(--secondary)">Character Dialogue</label>
                                      <textarea
                                        placeholder="Dialogue spoken by characters..."
                                        value={sc.dialogue}
                                        onChange={(e) => handleUpdateScene(sc.id, { dialogue: e.target.value })}
                                        className="w-full min-h-[60px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-wider font-bold text-(--secondary)">Voiceover / Narration</label>
                                      <textarea
                                        placeholder="VO cues or spoken narrative..."
                                        value={sc.voiceover}
                                        onChange={(e) => handleUpdateScene(sc.id, { voiceover: e.target.value })}
                                        className="w-full min-h-[60px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-wider font-bold text-(--secondary)">Music & Sound FX</label>
                                      <textarea
                                        placeholder="Audio tracks, ambient sounds..."
                                        value={sc.music}
                                        onChange={(e) => handleUpdateScene(sc.id, { music: e.target.value })}
                                        className="w-full min-h-[60px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-wider font-bold text-(--secondary)">Actor Cues / Blocking</label>
                                      <textarea
                                        placeholder="Actor placements, facial markers..."
                                        value={sc.actorCues}
                                        onChange={(e) => handleUpdateScene(sc.id, { actorCues: e.target.value })}
                                        className="w-full min-h-[50px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-wider font-bold text-(--secondary)">Foley & Ambient cues</label>
                                      <textarea
                                        placeholder="Audio sounds, ambient noises..."
                                        value={sc.soundCues}
                                        onChange={(e) => handleUpdateScene(sc.id, { soundCues: e.target.value })}
                                        className="w-full min-h-[50px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) focus:border-(--primary) outline-none transition-all placeholder:text-muted-foreground/60"
                                      />
                                    </div>
                                  </div>
                                </div>

                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================= SKETCHPAD / DRAWING CANVAS MODAL ================================= */}
      <AnimatePresence>
        {isCanvasOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-(--card) border border-(--border) rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col"
            >

              {/* Header */}
              <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-black/5 dark:bg-white/5">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2">
                    <Edit3 size={14} className="text-(--primary)" /> Storyboard Concept Sketchpad
                  </h3>
                  <p className="text-[9px] text-(--secondary) uppercase tracking-widest">Draw scene layouts, characters, and framing lines</p>
                </div>
                <button
                  onClick={() => setIsCanvasOpen(false)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-(--secondary) hover:text-(--foreground) transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Layout body */}
              <div className="grid grid-cols-1 lg:grid-cols-12">

                {/* Left block: Canvas Board */}
                <div className="lg:col-span-8 p-5 flex flex-col items-center justify-center bg-black/5 dark:bg-black/20">
                  <div className="relative border border-(--border) rounded-xl overflow-hidden shadow-inner aspect-video w-full bg-(--card) select-none">

                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={360}
                      onMouseDown={startDrawing}
                      onMouseMove={drawStroke}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={drawStroke}
                      onTouchEnd={stopDrawing}
                      className="w-full h-full cursor-crosshair block"
                    />

                    {/* Rule of Thirds Guide */}
                    {canvasGuide === "thirds" && (
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-dashed border-(--foreground) opacity-20" />
                        <div className="border-r border-dashed border-(--foreground) opacity-20" />
                        <div />
                        <div className="border-b border-dashed border-(--foreground) opacity-20 col-span-3 row-start-1" />
                        <div className="border-b border-dashed border-(--foreground) opacity-20 col-span-3 row-start-2" />
                      </div>
                    )}

                    {/* Horizon guide */}
                    {canvasGuide === "horizon" && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-(--foreground) opacity-30 pointer-events-none flex items-center justify-center">
                        <span className="text-[8px] uppercase tracking-widest text-(--secondary) bg-(--card) px-2 py-0.5 rounded-full border border-(--border) -translate-y-1/2">
                          Horizon Level
                        </span>
                      </div>
                    )}

                    {/* Vanishing perspective guide */}
                    {canvasGuide === "perspective" && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="0" x2="640" y2="360" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="640" y1="0" x2="0" y2="360" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="320" y1="0" x2="320" y2="360" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                          <line x1="0" y1="180" x2="640" y2="180" stroke="#ffffff" strokeWidth="1" strokeDasharray="3,3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between text-[9px] text-(--secondary) uppercase tracking-wider mt-2.5">
                    <span>Frame: 16:9 Cinematic Widescreen</span>
                    <span>Tap/Hold mouse button and drag to sketch</span>
                  </div>
                </div>

                {/* Right block: Drawing toolbox */}
                <div className="lg:col-span-4 p-5 border-l border-(--border) flex flex-col justify-between bg-black/5 dark:bg-white/5">
                  <div className="space-y-5">

                    {/* Tool switcher */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Drawing Tool</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setDrawTool("pencil")}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            drawTool === "pencil"
                              ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                              : "bg-(--background) border-(--border) text-(--secondary)"
                          }`}
                        >
                          Pencil Sketcher
                        </button>
                        <button
                          onClick={() => setDrawTool("eraser")}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            drawTool === "eraser"
                              ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                              : "bg-(--background) border-(--border) text-(--secondary)"
                          }`}
                        >
                          Stroke Eraser
                        </button>
                      </div>
                    </div>

                    {/* Brush Colors */}
                    {drawTool === "pencil" && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Brush Color</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { hex: "#ffffff", label: "White" },
                            { hex: "#3b82f6", label: "Blue" },
                            { hex: "#10b981", label: "Green" },
                            { hex: "#f43f5e", label: "Red" },
                            { hex: "#000000", label: "Black" }
                          ].map((clr) => (
                            <button
                              key={clr.hex}
                              onClick={() => setDrawColor(clr.hex)}
                              style={{ backgroundColor: clr.hex }}
                              className={`aspect-square rounded-full border-2 transition-all cursor-pointer ${
                                drawColor === clr.hex ? "border-(--primary) scale-110" : "border-black/20"
                              }`}
                              title={clr.label}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stroke weights */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest text-(--secondary) font-black">
                        <span>Brush Stroke weight</span>
                        <span className="text-(--foreground) font-bold">{drawSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={drawSize}
                        onChange={(e) => setDrawSize(parseInt(e.target.value) || 2)}
                        className="w-full accent-(--primary) bg-black/10 dark:bg-white/10 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* HUD overlays */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Grid HUD Overlays</label>
                      <select
                        value={canvasGuide}
                        onChange={(e) => setCanvasGuide(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 text-xs text-(--foreground) outline-none focus:border-(--primary) cursor-pointer"
                      >
                        <option value="none">Clear (No guides)</option>
                        <option value="thirds">Rule of Thirds Grid</option>
                        <option value="horizon">Center Horizon Guide</option>
                        <option value="perspective">Linear vanishing perspective</option>
                      </select>
                    </div>

                    {/* History */}
                    <div className="space-y-2 border-t border-(--border) pt-4">
                      <div className="flex gap-2">
                        <button
                          onClick={handleCanvasUndo}
                          disabled={historyPointer <= 0}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-(--background) border border-(--border) hover:border-(--primary) text-(--secondary) hover:text-(--foreground) rounded-lg text-xs disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <RotateCcw size={12} /> Undo
                        </button>
                        <button
                          onClick={handleCanvasRedo}
                          disabled={historyPointer >= canvasHistory.length - 1}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-(--background) border border-(--border) hover:border-(--primary) text-(--secondary) hover:text-(--foreground) rounded-lg text-xs disabled:opacity-40 transition-all cursor-pointer"
                        >
                          <RotateCw size={12} /> Redo
                        </button>
                      </div>

                      <button
                        onClick={handleCanvasClear}
                        className="w-full py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Clear Canvas Frame
                      </button>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-(--border)">
                    <button
                      onClick={handleSaveSketch}
                      className="w-full py-2.5 bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Save Concept Sketch
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================= CINEMATIC AUTOPLAY PRESENTATION VIEWER ================================= */}
      <AnimatePresence>
        {isPresentationMode && (
          <div className="fixed inset-0 z-50 bg-(--background) flex flex-col justify-between p-6 text-(--foreground)">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-(--border) pb-4">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] uppercase tracking-widest font-black text-(--primary)">
                  Director's Sequence Presentation
                </span>
                <h2 className="text-sm font-bold text-(--foreground) uppercase truncate max-w-[280px] md:max-w-[480px]">
                  {activeProject?.title}
                </h2>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPresSoundEnabled(!presSoundEnabled)}
                  className="p-2 bg-(--card) border border-(--border) rounded-lg text-(--secondary) hover:text-(--foreground) transition-all cursor-pointer flex items-center justify-center"
                >
                  {presSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                <div className="flex items-center gap-1.5 text-xs text-(--secondary)">
                  <span>Auto:</span>
                  <select
                    value={presSlideTime}
                    onChange={(e) => setPresSlideTime(parseInt(e.target.value) || 5)}
                    className="bg-(--card) border border-(--border) rounded px-1.5 py-1 text-(--foreground) outline-none cursor-pointer"
                  >
                    <option value={3}>3s speed</option>
                    <option value={5}>5s standard</option>
                    <option value={10}>10s slow</option>
                    <option value={0}>Auto Scene Duration</option>
                  </select>
                </div>

                <button
                  onClick={handleTogglePresentation}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Exit Preview
                </button>
              </div>
            </div>

            {/* Central presentation visual */}
            {activePresShot && (
              <div className="my-auto max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                {/* Visual Shot panel */}
                <div className="md:col-span-7 space-y-3">
                  <div className="relative aspect-video rounded-xl bg-(--card) border border-(--border) overflow-hidden shadow-lg">
                    {activePresShot.image ? (
                      <img src={activePresShot.image} alt={activePresShot.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-(--secondary) text-xs bg-(--card)">
                        <Camera size={36} className="mb-2 text-(--secondary) opacity-65" />
                        No Graphic Concept
                      </div>
                    )}

                    {/* HUD tracker */}
                    <div className="absolute top-3 left-3 bg-black/60 border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                      Scene {activePresShot.sceneNum} • Shot {activePresShot.shotIdx}/{activePresShot.totalShotsInScene}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-(--primary) text-[10px] font-bold uppercase tracking-wider rounded">
                      {activePresShot.type}
                    </span>
                    <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-bold uppercase tracking-wider rounded">
                      {activePresShot.angle}
                    </span>
                    <span className="px-2 py-0.5 bg-(--card) border border-(--border) text-(--secondary) text-[10px] font-bold uppercase tracking-wider rounded">
                      {activePresShot.duration}s
                    </span>
                  </div>
                </div>

                {/* Subtitle / spoken panel */}
                <div className="md:col-span-5 space-y-4 text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-(--foreground) text-base font-bold tracking-wide">{activePresShot.title}</h3>
                    <p className="text-(--secondary) text-[10px] uppercase tracking-wider font-bold">{activePresShot.sceneTitle}</p>
                  </div>

                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {activePresShot.dialogue && (
                      <div className="p-3 bg-(--card) border border-(--border) rounded-lg">
                        <span className="text-[8px] uppercase tracking-widest font-bold text-(--primary) block mb-0.5">Character dialogue</span>
                        <p className="text-xs font-semibold text-(--foreground) leading-relaxed">"{activePresShot.dialogue}"</p>
                      </div>
                    )}

                    {activePresShot.voiceover && (
                      <div className="p-3 bg-(--card) border border-(--border) rounded-lg">
                        <span className="text-[8px] uppercase tracking-widest font-bold text-violet-500 block mb-0.5">Voiceover Narrative</span>
                        <p className="text-xs italic text-(--foreground) leading-relaxed">{activePresShot.voiceover}</p>
                      </div>
                    )}

                    {activePresShot.music && (
                      <div className="p-3 bg-(--card) border border-(--border) rounded-lg">
                        <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-500 block mb-0.5">Audio FX details</span>
                        <p className="text-xs text-(--secondary) leading-relaxed">{activePresShot.music}</p>
                      </div>
                    )}

                    {activePresShot.description && (
                      <div className="p-3 bg-(--card) border border-(--border) rounded-lg">
                        <span className="text-[8px] uppercase tracking-widest font-bold text-(--secondary) block mb-0.5">Visual script action</span>
                        <p className="text-xs text-(--secondary) leading-relaxed">{activePresShot.description}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Slider bottom progress bar */}
            <div className="w-full max-w-xl mx-auto space-y-3">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    if (currentPresIdx > 0) {
                      setCurrentPresIdx(prev => prev - 1);
                      setPresElapsedSeconds(0);
                      playClapperSound();
                    }
                  }}
                  disabled={currentPresIdx === 0}
                  className="p-2.5 bg-(--card) hover:bg-black/5 dark:hover:bg-white/5 border border-(--border) text-(--foreground) rounded-lg disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => setPresAutoPlay(!presAutoPlay)}
                  className="px-6 py-2 bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer justify-center"
                >
                  {presAutoPlay ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Auto Play</>}
                </button>

                <button
                  onClick={() => {
                    setPresElapsedSeconds(0);
                    if (currentPresIdx < presentationShotsList.length - 1) {
                      setCurrentPresIdx(prev => prev + 1);
                      playClapperSound();
                    } else {
                      setCurrentPresIdx(0);
                      playClapperSound();
                    }
                  }}
                  className="p-2.5 bg-(--card) hover:bg-black/5 dark:hover:bg-white/5 border border-(--border) text-(--foreground) rounded-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex justify-between text-[9px] text-(--secondary) uppercase tracking-widest font-bold">
                <span>Beat {currentPresIdx + 1} of {presentationShotsList.length}</span>
                <span>
                  {presAutoPlay
                    ? `Time: 0:${presElapsedSeconds < 10 ? '0' : ''}${presElapsedSeconds} / 0:${(activePresShot?.duration || presSlideTime) < 10 ? '0' : ''}${activePresShot?.duration || presSlideTime}`
                    : `Paused: 0:${presElapsedSeconds < 10 ? '0' : ''}${presElapsedSeconds} / 0:${(activePresShot?.duration || presSlideTime) < 10 ? '0' : ''}${activePresShot?.duration || presSlideTime}`
                  }
                </span>
              </div>

              {/* Active Shot Sub-progress bar ticking in real-time */}
              <div className="w-full bg-(--card) h-1.5 rounded-full overflow-hidden relative border border-(--border)">
                <div
                  style={{ width: `${(presElapsedSeconds / (activePresShot?.duration || presSlideTime || 5)) * 100}%` }}
                  className="bg-(--primary) h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                />
              </div>

              {/* Total Storyboard progress */}
              <div className="flex justify-between text-[8px] text-(--secondary) uppercase tracking-wider font-bold">
                <span>Total Storyboard Progress</span>
                <span>{Math.round(((currentPresIdx + 1) / presentationShotsList.length) * 100)}%</span>
              </div>
              <div className="w-full bg-(--card) h-1 rounded-full overflow-hidden border border-(--border)">
                <div
                  style={{ width: `${((currentPresIdx + 1) / presentationShotsList.length) * 100}%` }}
                  className="bg-(--secondary) h-full transition-all duration-300"
                />
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* ================================= HIGH-QUALITY PDF / PRINT EXPORT SHEET ================================= */}
      <AnimatePresence>
        {isExportMode && activeProject && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-4 md:p-6 print:relative print:inset-auto print:bg-white print:p-0 print:overflow-visible">

            {/* Export control header bar */}
            <div className="max-w-5xl mx-auto mb-6 bg-(--card) border border-(--border) rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] uppercase tracking-widest text-(--primary) font-black">Binder layout setup</span>
                <h3 className="text-xs font-bold text-(--foreground) uppercase">Director's Script & Shooting Binder</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Printer size={12} className="inline mr-1" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setIsExportMode(false)}
                  className="border border-(--border) text-(--secondary) hover:bg-black/5 dark:hover:bg-white/5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Exit Binder
                </button>
              </div>
            </div>

            {/* Print paper layout structure */}
            <div className="max-w-5xl mx-auto bg-(--card) border border-(--border) rounded-xl p-6 md:p-10 shadow-lg text-left text-(--foreground) space-y-8 print:border-0 print:p-0 print:bg-white print:text-black print:shadow-none">

              {/* Cover top info */}
              <div className="border-b-2 border-(--primary) pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:border-black print:pb-2">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-widest font-black bg-black/5 dark:bg-white/5 text-(--primary) px-2 py-0.5 rounded border border-(--border) print:bg-zinc-100 print:text-black print:border-zinc-300">
                    Production Storyboard
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-(--foreground) tracking-tight print:text-black">{activeProject.title}</h1>
                  <p className="text-xs text-(--muted-foreground) max-w-xl print:text-zinc-700">{activeProject.description}</p>
                </div>

                <div className="text-[10px] uppercase tracking-wider text-(--secondary) space-y-0.5 text-left md:text-right print:text-zinc-650">
                  <div>Type: <span className="font-bold text-(--foreground) print:text-black">{activeProject.type}</span></div>
                  <div>Estimated Duration: <span className="font-bold text-(--foreground) print:text-black">{metrics.estDuration}s</span></div>
                  <div>Total Scenes: <span className="font-bold text-(--foreground) print:text-black">{metrics.totalScenes}</span></div>
                  <div>Created: <span className="font-bold text-(--foreground) print:text-black">{new Date(activeProject.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>

              {/* Scenes sheet progression */}
              <div className="space-y-8 print:space-y-6">
                {activeProject.scenes.map((sc) => (
                  <div
                    key={sc.id}
                    className="border border-(--border) rounded-xl p-4 space-y-4 page-break-inside:avoid bg-(--background)/30 print:border-zinc-350 print:bg-white print:text-black print:p-3"
                  >

                    {/* Scene banner bar */}
                    <div className="flex justify-between items-center border-b border-(--border) pb-2 print:border-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-black/5 dark:bg-white/5 border border-(--border) px-1.5 py-0.5 rounded print:bg-zinc-100 print:text-black print:border-zinc-300">
                          Scene {sc.number}
                        </span>
                        <h3 className="text-xs font-bold text-(--foreground) print:text-black">{sc.title}</h3>
                      </div>
                      <div className="text-[9px] text-(--secondary) font-bold uppercase tracking-wider">
                        Duration: {sc.duration}s • {sc.status}
                      </div>
                    </div>

                    {/* Objective */}
                    {sc.objective && (
                      <div className="text-[11px]">
                        <span className="text-[8px] uppercase tracking-wider text-(--secondary) font-bold block mb-0.5">Objective:</span>
                        <p className="text-(--muted-foreground) print:text-zinc-800 leading-relaxed">{sc.objective}</p>
                      </div>
                    )}

                    {/* Frame layouts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sc.shots.map((sh, idx) => (
                        <div
                          key={sh.id}
                          className="bg-(--background) border border-(--border) rounded-lg p-3 space-y-2.5 print:border-zinc-250 print:bg-white"
                        >
                          <div className="flex justify-between text-[9px] text-(--secondary) font-bold">
                            <span>Frame {idx + 1}: {sh.title}</span>
                            <span className="uppercase text-(--primary) print:text-black">{sh.type} • {sh.angle}</span>
                          </div>

                          {/* Image box */}
                          <div className="aspect-video w-full rounded bg-black/5 dark:bg-black/10 border border-(--border) overflow-hidden flex items-center justify-center print:border-zinc-300">
                            {sh.image ? (
                              <img src={sh.image} alt={sh.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-(--secondary) opacity-40">No Concept Sketch</span>
                            )}
                          </div>

                          {/* Description */}
                          {sh.description && (
                            <p className="text-[10px] text-(--muted-foreground) leading-relaxed print:text-zinc-800">
                              {sh.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Cues */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-(--border) pt-3 print:border-zinc-150">
                      {sc.dialogue && (
                        <div className="text-[11px]">
                          <span className="text-[8px] uppercase tracking-wider text-(--secondary) font-bold block mb-0.5">Dialogue</span>
                          <p className="text-(--muted-foreground) italic print:text-zinc-900 leading-relaxed">"{sc.dialogue}"</p>
                        </div>
                      )}

                      {sc.voiceover && (
                        <div className="text-[11px]">
                          <span className="text-[8px] uppercase tracking-wider text-(--secondary) font-bold block mb-0.5">Voiceover</span>
                          <p className="text-(--muted-foreground) italic print:text-zinc-900 leading-relaxed">{sc.voiceover}</p>
                        </div>
                      )}

                      {sc.music && (
                        <div className="text-[11px] col-span-2">
                          <span className="text-[8px] uppercase tracking-wider text-(--secondary) font-bold block mb-0.5">Audio & Foley cues</span>
                          <p className="text-(--muted-foreground) leading-relaxed">{sc.music}</p>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================= CREATE STORYBOARD MODAL DIALOG ================================= */}
      <AnimatePresence>
        {isNewProjOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-(--card) border border-(--border) rounded-xl w-full max-w-md overflow-hidden shadow-lg p-5 space-y-4 text-left"
            >
              <div className="flex justify-between items-center pb-2.5 border-b border-(--border)">
                <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">Initialize Storyboard</h3>
                <button
                  onClick={() => setIsNewProjOpen(false)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-(--secondary) hover:text-(--foreground) cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Storyboard Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Dawn Chase"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--primary) transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Project Format</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-muted-foreground outline-none focus:border-(--primary) cursor-pointer"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-(--card) text-(--foreground)">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Concept Overview</label>
                  <textarea
                    placeholder="Brief description of project goal..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full min-h-[50px] bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--primary) transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-(--secondary) font-black">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Action, Sci-Fi, Cinematic"
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                    className="w-full bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-xs text-(--foreground) outline-none focus:border-(--primary) transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-(--primary) hover:bg-(--primary-hover) text-(--primary-foreground) rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Create Board
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--primary); }
      `}</style>

    </div>
  );
}
