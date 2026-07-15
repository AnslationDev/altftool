"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Camera,
  Sliders,
  Maximize2,
  Layers,
  Plus,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Eye,
  RotateCcw,
  Info,
  Share2,
  Compass,
  Activity,
  ChevronDown,
  Sparkles,
  Scale,
  Cpu,
  Ruler,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SENSOR_PRESETS,
  SENSOR_CATEGORIES,
  FOCAL_PRESETS,
  APERTURE_PRESETS,
  SCENE_OBJECTS,
  calcDiagonal,
  calcCropFactor,
  calcFov,
  calcCoverage,
  getLensType
} from "./utils/fovHelpers";

// --- Visual Glassmorphism Card ---
const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-6 backdrop-blur-md shadow-xl hover:border-blue-500/20 transition-all ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

export default function LensFovCalculator() {
  // --- Core Configuration States ---
  const [selectedSensorId, setSelectedSensorId] = useState("full-frame");
  const [customWidth, setCustomWidth] = useState(36.0);
  const [customHeight, setCustomHeight] = useState(24.0);
  const [focalLength, setFocalLength] = useState(50);
  const [selectedAperture, setSelectedAperture] = useState(2.8);
  const [subjectDistance, setSubjectDistance] = useState(5);
  const [distanceUnit, setDistanceUnit] = useState("m"); // 'm' or 'ft'
  const [activeScene, setActiveScene] = useState("mountain");
  const [comparisonList, setComparisonList] = useState([]);
  const [savedSetups, setSavedSetups] = useState([]);
  const [setupNameInput, setSetupNameInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [titleText, setTitleText] = useState("");

  const canvasRef = useRef(null);

  // Dynamic typing effect for Header Title
  const fullTitle = "LENS FIELD OF VIEW CALCULATOR";
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, index));
      index++;
      if (index > fullTitle.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // --- Local Storage Initialization ---
  useEffect(() => {
    try {
      const storedSensor = localStorage.getItem("lens_fov_sensor_id");
      const storedWidth = localStorage.getItem("lens_fov_custom_width");
      const storedHeight = localStorage.getItem("lens_fov_custom_height");
      const storedFocal = localStorage.getItem("lens_fov_focal");
      const storedDistance = localStorage.getItem("lens_fov_distance");
      const storedUnit = localStorage.getItem("lens_fov_unit");
      const storedSetups = localStorage.getItem("lens_fov_saved_setups");
      const storedComparisons = localStorage.getItem("lens_fov_comparison_list");

      if (storedSensor) setSelectedSensorId(storedSensor);
      if (storedWidth) setCustomWidth(parseFloat(storedWidth));
      if (storedHeight) setCustomHeight(parseFloat(storedHeight));
      if (storedFocal) setFocalLength(parseInt(storedFocal));
      if (storedDistance) setSubjectDistance(parseFloat(storedDistance));
      if (storedUnit) setDistanceUnit(storedUnit);
      if (storedSetups) setSavedSetups(JSON.parse(storedSetups));
      if (storedComparisons) setComparisonList(JSON.parse(storedComparisons));
    } catch (e) {
      console.error("Failed to load local storage configurations", e);
    }
  }, []);

  // --- Persistence Synchronization ---
  useEffect(() => {
    if (selectedSensorId) localStorage.setItem("lens_fov_sensor_id", selectedSensorId);
  }, [selectedSensorId]);

  useEffect(() => {
    localStorage.setItem("lens_fov_custom_width", customWidth.toString());
    localStorage.setItem("lens_fov_custom_height", customHeight.toString());
  }, [customWidth, customHeight]);

  useEffect(() => {
    localStorage.setItem("lens_fov_focal", focalLength.toString());
  }, [focalLength]);

  useEffect(() => {
    localStorage.setItem("lens_fov_distance", subjectDistance.toString());
  }, [subjectDistance]);

  useEffect(() => {
    localStorage.setItem("lens_fov_unit", distanceUnit);
  }, [distanceUnit]);

  useEffect(() => {
    localStorage.setItem("lens_fov_saved_setups", JSON.stringify(savedSetups));
  }, [savedSetups]);

  useEffect(() => {
    localStorage.setItem("lens_fov_comparison_list", JSON.stringify(comparisonList));
  }, [comparisonList]);

  // --- Math Computations (Memoized) ---
  const activeSensor = useMemo(() => {
    if (selectedSensorId === "custom") {
      return {
        id: "custom",
        name: "Custom Sensor Spec",
        width: customWidth,
        height: customHeight,
        category: SENSOR_CATEGORIES.CUSTOM,
        description: "Manually calibrated camera dimensions"
      };
    }
    const preset = SENSOR_PRESETS.find((s) => s.id === selectedSensorId);
    return preset || SENSOR_PRESETS[0];
  }, [selectedSensorId, customWidth, customHeight]);

  const sensorDiagonal = useMemo(() => {
    return calcDiagonal(activeSensor.width, activeSensor.height);
  }, [activeSensor]);

  const cropFactor = useMemo(() => {
    return calcCropFactor(activeSensor.width, activeSensor.height);
  }, [activeSensor]);

  const equivFocalLength = useMemo(() => {
    return Math.round(focalLength * cropFactor * 10) / 10;
  }, [focalLength, cropFactor]);

  const equivAperture = useMemo(() => {
    return Math.round(selectedAperture * cropFactor * 10) / 10;
  }, [selectedAperture, cropFactor]);

  const hFov = useMemo(() => {
    return calcFov(activeSensor.width, focalLength);
  }, [activeSensor.width, focalLength]);

  const vFov = useMemo(() => {
    return calcFov(activeSensor.height, focalLength);
  }, [activeSensor.height, focalLength]);

  const dFov = useMemo(() => {
    return calcFov(sensorDiagonal, focalLength);
  }, [sensorDiagonal, focalLength]);

  const coverageWidth = useMemo(() => {
    return calcCoverage(hFov, subjectDistance);
  }, [hFov, subjectDistance]);

  const coverageHeight = useMemo(() => {
    return calcCoverage(vFov, subjectDistance);
  }, [vFov, subjectDistance]);

  const lensType = useMemo(() => {
    return getLensType(equivFocalLength);
  }, [equivFocalLength]);

  // --- Viewfinder Real-Time Canvas Animator ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId;

    // Normalizing equivalent focal length around standard 50mm reference.
    // Wide focal lengths zoom out (scale < 1.0), telephotos crop/zoom in (scale > 1.0)
    // Clamp the scale bounds so the vector scenes look pristine
    const zoomFactor = Math.max(0.12, Math.min(8.0, equivFocalLength / 50));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Reset and fill background
      ctx.fillStyle = "#030A1C"; // Deep cinematic slate
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Simulated scenery with camera scaling
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoomFactor, zoomFactor);

      if (activeScene === "mountain") {
        // Glowing sun/moon
        ctx.beginPath();
        ctx.arc(0, -15, 20, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.85)"; // Amber sun glow
        ctx.fill();

        // High Peak Mountains
        ctx.beginPath();
        ctx.moveTo(-180, 50);
        ctx.lineTo(-80, -35);
        ctx.lineTo(20, 50);
        ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
        ctx.fill();
        // snow peak
        ctx.beginPath();
        ctx.moveTo(-80, -35);
        ctx.lineTo(-92, -20);
        ctx.lineTo(-68, -20);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-40, 50);
        ctx.lineTo(40, -50);
        ctx.lineTo(150, 50);
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fill();
        // snow peak 2
        ctx.beginPath();
        ctx.moveTo(40, -50);
        ctx.lineTo(28, -32);
        ctx.lineTo(52, -32);
        ctx.fillStyle = "#E2E8F0";
        ctx.fill();

        // Pine trees in the foreground
        for (let px = -110; px <= 110; px += 35) {
          // trunk
          ctx.fillStyle = "#451a03";
          ctx.fillRect(px - 2, 38, 4, 12);
          // green foliage
          ctx.beginPath();
          ctx.moveTo(px, 50);
          ctx.lineTo(px - 14, 30);
          ctx.lineTo(px + 14, 30);
          ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(px, 34);
          ctx.lineTo(px - 10, 18);
          ctx.lineTo(px + 10, 18);
          ctx.fillStyle = "rgba(5, 150, 105, 0.9)";
          ctx.fill();
        }

        // Small cottage
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // Red cottage body
        ctx.fillRect(-20, 32, 18, 14);
        ctx.beginPath();
        ctx.moveTo(-23, 32);
        ctx.lineTo(-11, 20);
        ctx.lineTo(1, 32);
        ctx.fillStyle = "#ffffff"; // White roof
        ctx.fill();

      } else if (activeScene === "portrait") {
        // Stylized cyberpunk/glowing portrait subject
        // Background lights
        ctx.beginPath();
        ctx.arc(-50, -30, 30, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(60, -20, 25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168, 85, 247, 0.1)";
        ctx.fill();

        // Shoulder
        ctx.beginPath();
        ctx.moveTo(-50, 50);
        ctx.quadraticCurveTo(-45, 10, -18, 5);
        ctx.lineTo(18, 5);
        ctx.quadraticCurveTo(45, 10, 50, 50);
        ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
        ctx.strokeStyle = "#F43F5E";
        ctx.lineWidth = 1.8;
        ctx.fill();
        ctx.stroke();

        // Head and Neck
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-7, 5, 14, 15);
        ctx.strokeStyle = "#F43F5E";
        ctx.strokeRect(-7, 5, 14, 15);

        ctx.beginPath();
        ctx.arc(0, -18, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.strokeStyle = "#F43F5E";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hair outlines
        ctx.beginPath();
        ctx.arc(0, -22, 23, Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle = "#EC4899";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Sci-Fi Glasses
        ctx.fillStyle = "#06B6D4";
        ctx.fillRect(-12, -22, 24, 5);
        ctx.strokeStyle = "#0891B2";
        ctx.strokeRect(-12, -22, 24, 5);
        
        // Smiling Lips
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0, Math.PI);
        ctx.strokeStyle = "#F43F5E";
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (activeScene === "cityscape") {
        // High-rise structures
        // Tower 1
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(-85, -50, 30, 105);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
        ctx.strokeRect(-85, -50, 30, 105);

        // Tower 2 (Main)
        ctx.fillStyle = "#090d16";
        ctx.fillRect(-40, -85, 38, 140);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
        ctx.strokeRect(-40, -85, 38, 140);
        // Spire
        ctx.beginPath();
        ctx.moveTo(-21, -85);
        ctx.lineTo(-21, -115);
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tower 3
        ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
        ctx.fillRect(8, -60, 32, 115);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
        ctx.strokeRect(8, -60, 32, 115);

        // Tower 4
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.fillRect(48, -25, 32, 80);
        ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
        ctx.strokeRect(48, -25, 32, 80);

        // Window elements inside Main Tower
        ctx.fillStyle = "rgba(110, 231, 183, 0.85)"; // Neon Mint Windows
        for (let wy = -75; wy <= 40; wy += 18) {
          ctx.fillRect(-32, wy, 4, 4);
          ctx.fillRect(-15, wy, 4, 4);
        }
        
        // Window elements in left tower
        ctx.fillStyle = "rgba(103, 232, 249, 0.7)"; // Cyan Windows
        for (let wy = -40; wy <= 40; wy += 16) {
          ctx.fillRect(-78, wy, 4, 4);
          ctx.fillRect(-66, wy, 4, 4);
        }
      }

      ctx.restore();

      // 3. Technical Camera Viewfinder overlay HUD (unscaled)
      // Subtle Rule of Thirds Matrix gridlines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
      ctx.lineWidth = 1.0;
      
      ctx.beginPath();
      // vertical lines
      ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
      ctx.moveTo((2 * w) / 3, 0); ctx.lineTo((2 * w) / 3, h);
      // horizontal lines
      ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (2 * h) / 3); ctx.lineTo(w, (2 * h) / 3);
      ctx.stroke();

      // Center crosshairs
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, h / 2); ctx.lineTo(w / 2 + 10, h / 2);
      ctx.moveTo(w / 2, h / 2 - 10); ctx.lineTo(w / 2, h / 2 + 10);
      ctx.stroke();

      // Viewfinder framing brackets
      const bracketLen = 20;
      const spacing = 12;
      ctx.strokeStyle = "#3B82F6"; // High-tech active blue
      ctx.lineWidth = 2.0;

      // Top-Left bracket
      ctx.beginPath();
      ctx.moveTo(spacing + bracketLen, spacing);
      ctx.lineTo(spacing, spacing);
      ctx.lineTo(spacing, spacing + bracketLen);
      ctx.stroke();

      // Top-Right bracket
      ctx.beginPath();
      ctx.moveTo(w - spacing - bracketLen, spacing);
      ctx.lineTo(w - spacing, spacing);
      ctx.lineTo(w - spacing, spacing + bracketLen);
      ctx.stroke();

      // Bottom-Left bracket
      ctx.beginPath();
      ctx.moveTo(spacing + bracketLen, h - spacing);
      ctx.lineTo(spacing, h - spacing);
      ctx.lineTo(spacing, h - spacing - bracketLen);
      ctx.stroke();

      // Bottom-Right bracket
      ctx.beginPath();
      ctx.moveTo(w - spacing - bracketLen, h - spacing);
      ctx.lineTo(w - spacing, h - spacing);
      ctx.lineTo(w - spacing, h - spacing - bracketLen);
      ctx.stroke();

      // 4. Status HUD texts
      // Flashing recording indicator
      const isRedVisible = Math.floor(Date.now() / 850) % 2 === 0;
      if (isRedVisible) {
        ctx.fillStyle = "#EF4444";
        ctx.beginPath();
        ctx.arc(32, 32, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 11px monospace";
      ctx.fillText("REC", 45, 36);

      // Camera state stats (top right)
      ctx.fillStyle = "#3B82F6";
      ctx.fillText("4K HFR", w - 160, 36);
      ctx.fillStyle = "#10B981";
      ctx.fillText("STABLE ONLINE", w - 100, 36);

      // Main stats HUD (bottom left)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`${focalLength}mm f/${selectedAperture}`, 30, h - 45);

      ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`H-FOV: ${hFov.toFixed(1)}°`, 30, h - 28);
      ctx.fillText(`V-FOV: ${vFov.toFixed(1)}°`, 30, h - 14);

      // Equivalent info (bottom right)
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`${equivFocalLength}mm EQUIV`, w - 160, h - 35);
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`${cropFactor.toFixed(2)}x CROP`, w - 160, h - 20);

      // 5. DRAW CONCENTRIC OVERLAY BOXES FOR COMPARED LENSES (Cinema Frame style)
      comparisonList.forEach((cmp, index) => {
        // Calculate equivalent focal length of compared lens
        const cmpCrop = calcCropFactor(cmp.sensor.width, cmp.sensor.height);
        const cmpEquivFocal = cmp.focalLength * cmpCrop;

        // If the compared lens is longer (telephoto), it will capture a narrower frame inside the active scene.
        // We draw the framing crop box outline!
        if (cmpEquivFocal > equivFocalLength) {
          const ratio = equivFocalLength / cmpEquivFocal;
          
          const boxW = w * ratio;
          const boxH = h * ratio;
          const boxX = (w - boxW) / 2;
          const boxY = (h - boxH) / 2;

          // Color coordinates
          const colors = ["#EC4899", "#F59E0B", "#10B981", "#8B5CF6"];
          const boxColor = colors[index % colors.length];

          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]); // Dashed box
          ctx.strokeRect(boxX, boxY, boxW, boxH);
          ctx.setLineDash([]); // Reset line dash

          // Label for the box
          ctx.fillStyle = boxColor;
          ctx.font = "bold 9px monospace";
          ctx.fillText(
            `${cmp.focalLength}mm (${cmp.sensor.name.substring(0, 8)})`,
            boxX + 6,
            boxY + 12
          );
        }
      });

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [equivFocalLength, focalLength, selectedAperture, hFov, vFov, cropFactor, activeScene, comparisonList]);

  // --- Handlers & Controllers ---
  const handleSensorSelect = (id) => {
    setSelectedSensorId(id);
    if (id !== "custom") {
      const preset = SENSOR_PRESETS.find((s) => s.id === id);
      if (preset) {
        setCustomWidth(preset.width);
        setCustomHeight(preset.height);
      }
    }
  };

  const handleCustomWidthChange = (val) => {
    const parsed = Math.max(0.1, Math.min(200, parseFloat(val) || 0));
    setCustomWidth(parsed);
    setSelectedSensorId("custom");
  };

  const handleCustomHeightChange = (val) => {
    const parsed = Math.max(0.1, Math.min(200, parseFloat(val) || 0));
    setCustomHeight(parsed);
    setSelectedSensorId("custom");
  };

  const handleFocalSlider = (val) => {
    setFocalLength(Math.max(1, Math.min(1000, parseInt(val) || 1)));
  };

  const handleFocalInput = (val) => {
    const parsed = Math.max(1, Math.min(2000, parseInt(val) || 0));
    setFocalLength(parsed);
  };

  const handleDistanceInput = (val) => {
    const parsed = Math.max(0.1, Math.min(10000, parseFloat(val) || 0));
    setSubjectDistance(parsed);
  };

  const resetAllFields = () => {
    if (confirm("Reset current inputs to standard Full Frame 50mm values?")) {
      setSelectedSensorId("full-frame");
      setCustomWidth(36.0);
      setCustomHeight(24.0);
      setFocalLength(50);
      setSelectedAperture(2.8);
      setSubjectDistance(5);
      setDistanceUnit("m");
    }
  };

  // --- Saved Setup Management ---
  const saveCurrentSetup = (e) => {
    e.preventDefault();
    if (!setupNameInput.trim()) return;

    const newSetup = {
      id: Date.now(),
      name: setupNameInput,
      sensor: { ...activeSensor },
      focalLength,
      aperture: selectedAperture,
      hFov,
      vFov,
      dFov,
      equivFocalLength,
      timestamp: new Date().toISOString()
    };

    setSavedSetups((prev) => [newSetup, ...prev]);
    setSetupNameInput("");
    triggerNotification("Setup Saved Successfully!");
  };

  const deleteSavedSetup = (id) => {
    setSavedSetups((prev) => prev.filter((s) => s.id !== id));
    triggerNotification("Setup Deleted.");
  };

  const loadSavedSetup = (setup) => {
    if (setup.sensor.id === "custom") {
      setSelectedSensorId("custom");
      setCustomWidth(setup.sensor.width);
      setCustomHeight(setup.sensor.height);
    } else {
      setSelectedSensorId(setup.sensor.id);
      setCustomWidth(setup.sensor.width);
      setCustomHeight(setup.sensor.height);
    }
    setFocalLength(setup.focalLength);
    setSelectedAperture(setup.aperture);
    triggerNotification(`Loaded Setup: ${setup.name}`);
  };

  // --- Lens Comparison Engine ---
  const addToComparison = () => {
    if (comparisonList.length >= 4) {
      alert("You can compare up to 4 lenses simultaneously.");
      return;
    }
    // Avoid exact duplicate
    const isDup = comparisonList.some(
      (c) =>
        c.focalLength === focalLength &&
        c.sensor.width === activeSensor.width &&
        c.sensor.height === activeSensor.height
    );

    if (isDup) {
      triggerNotification("Lens configuration already in comparison.");
      return;
    }

    const newItem = {
      id: Date.now(),
      sensor: { ...activeSensor },
      focalLength,
      aperture: selectedAperture,
      hFov,
      vFov,
      dFov,
      equivFocalLength,
      equivAperture,
      coverageWidth,
      coverageHeight,
      lensType
    };

    setComparisonList((prev) => [...prev, newItem]);
    triggerNotification(`Added ${focalLength}mm to comparison list.`);
  };

  const removeComparisonItem = (id) => {
    setComparisonList((prev) => prev.filter((item) => item.id !== id));
    triggerNotification("Lens removed from comparison.");
  };

  const clearComparisonList = () => {
    setComparisonList([]);
    triggerNotification("Comparison deck cleared.");
  };

  const triggerNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30 text-(--foreground) overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* --- futuristic tool header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Camera size={14} className="animate-pulse" />
            Optics Protocol Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            {titleText}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Simulate angle of coverage, estimate spatial scene measurements, compare crop configurations, and visualize frame views dynamically.
          </p>
        </motion.div>

        {/* Floating Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-blue-600 border border-blue-400 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2.5"
            >
              <Check size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- main workspace dashboard --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE: Inputs & Calculations (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Sensor Config Card */}
            <GlassCard title="1. Sensor Format Configuration" icon={Cpu} delay={0.1}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                    Select Camera Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SENSOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSensorSelect(preset.id)}
                        className={`py-3 px-2 rounded-2xl border text-[11px] font-bold text-left transition-all ${
                          selectedSensorId === preset.id
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30"
                        }`}
                      >
                        <div className="truncate font-black">{preset.name}</div>
                        <div className={`text-[8px] truncate mt-0.5 ${selectedSensorId === preset.id ? 'text-blue-100' : 'text-muted-foreground/80'}`}>
                          {preset.width} x {preset.height}mm
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSensorSelect("custom")}
                      className={`py-3 px-2 rounded-2xl border text-[11px] font-bold text-left transition-all ${
                        selectedSensorId === "custom"
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                          : "bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30"
                      }`}
                    >
                      <div className="font-black">Custom Spec...</div>
                      <div className={`text-[8px] mt-0.5 ${selectedSensorId === 'custom' ? 'text-blue-100' : 'text-muted-foreground/80'}`}>
                        Configure manual mm
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom dimensions drawer */}
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                      Active Sensor Metric Spec
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {activeSensor.description || "Custom Dimension Setting"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                        Sensor Width (mm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={customWidth}
                          onChange={(e) => handleCustomWidthChange(e.target.value)}
                          className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2 text-xs focus:border-blue-500/50 outline-none transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground">mm</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                        Sensor Height (mm)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={customHeight}
                          onChange={(e) => handleCustomHeightChange(e.target.value)}
                          className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2 text-xs focus:border-blue-500/50 outline-none transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground">mm</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold border-t border-(--border)">
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-muted-foreground">Diagonal</div>
                      <div className="text-(--foreground) mt-0.5">{sensorDiagonal.toFixed(1)} mm</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-muted-foreground">Aspect Ratio</div>
                      <div className="text-(--foreground) mt-0.5">
                        {(customWidth / customHeight).toFixed(2)}:1
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-muted-foreground">Crop Factor</div>
                      <div className="text-orange-400 mt-0.5">{cropFactor.toFixed(2)}x</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 2. Lens Config Card */}
            <GlassCard title="2. Focal Length & Aperture" icon={Sliders} delay={0.2}>
              <div className="space-y-5">
                {/* Focal length slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Focal Length
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={focalLength}
                        onChange={(e) => handleFocalInput(e.target.value)}
                        className="w-16 bg-(--background) border border-(--border) rounded-lg px-2 py-0.5 text-center text-xs font-bold text-blue-400 focus:border-blue-500 outline-none"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">mm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="600"
                    value={focalLength}
                    onChange={(e) => handleFocalSlider(e.target.value)}
                    className="w-full accent-blue-500 cursor-ew-resize bg-(--border) h-1 rounded-lg outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-2">
                    {FOCAL_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setFocalLength(preset.value)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                          focalLength === preset.value
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500/5 text-blue-400 border border-blue-500/10 hover:border-blue-500/30"
                        }`}
                      >
                        {preset.value}mm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aperture slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Lens Aperture
                    </label>
                    <span className="text-xs font-black text-blue-400">f/{selectedAperture}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {APERTURE_PRESETS.map((ap) => (
                      <button
                        key={ap.value}
                        onClick={() => setSelectedAperture(ap.value)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          selectedAperture === ap.value
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500/5 text-blue-400 border border-blue-500/10 hover:border-blue-500/30"
                        }`}
                      >
                        {ap.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crop equivalences box */}
                <div className="p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between text-xs font-bold">
                  <div className="space-y-0.5">
                    <div className="text-[8px] uppercase tracking-wider text-orange-400">
                      35mm Equivalent focal length
                    </div>
                    <div className="text-(--foreground) text-sm font-black">
                      {equivFocalLength} mm
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <div className="text-[8px] uppercase tracking-wider text-orange-400">
                      35mm Equivalent Depth-of-Field
                    </div>
                    <div className="text-(--foreground) text-sm font-black">
                      f/{equivAperture}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 3. Coverage Analysis & Real-time Calculations */}
            <GlassCard title="3. Scene Distance & Framing Area" icon={Ruler} delay={0.3}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                      Target Subject Distance
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={subjectDistance}
                        onChange={(e) => handleDistanceInput(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-xs focus:border-blue-500/50 outline-none transition-colors font-bold text-(--foreground)"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex border border-(--border) bg-(--background) rounded-lg overflow-hidden shrink-0">
                        <button
                          onClick={() => setDistanceUnit("m")}
                          className={`px-1.5 py-0.5 text-[8px] font-bold uppercase transition-all ${
                            distanceUnit === "m" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-blue-500/10"
                          }`}
                        >
                          M
                        </button>
                        <button
                          onClick={() => setDistanceUnit("ft")}
                          className={`px-1.5 py-0.5 text-[8px] font-bold uppercase transition-all ${
                            distanceUnit === "ft" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-blue-500/10"
                          }`}
                        >
                          FT
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                      Estimated Field Type
                    </label>
                    <div className={`w-full py-2.5 px-3 rounded-xl border font-black text-xs text-center uppercase tracking-wider ${lensType.color}`}>
                      {lensType.name}
                    </div>
                  </div>
                </div>

                {/* Spatial measurements output grid */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground">Framing Width</div>
                    <div className="text-(--foreground) text-base font-black mt-1">
                      {coverageWidth.toFixed(2)} {distanceUnit}
                    </div>
                    <div className="text-[8px] text-muted-foreground/70 mt-0.5">
                      Left to right span
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground">Framing Height</div>
                    <div className="text-(--foreground) text-base font-black mt-1">
                      {coverageHeight.toFixed(2)} {distanceUnit}
                    </div>
                    <div className="text-[8px] text-muted-foreground/70 mt-0.5">
                      Top to bottom span
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

          </div>

          {/* RIGHT SIDE: Viewfinder Simulation & Presets (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Viewfinder Canvas Card */}
            <GlassCard
              title="Camera Viewfinder Simulation"
              icon={Camera}
            >
              <div className="space-y-4">
                {/* Scene selector sub-header button group to prevent clipping */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-(--border)">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Select Target Scene
                  </span>
                  <div className="flex border border-(--border) bg-(--background) rounded-xl overflow-hidden shadow-inner shrink-0">
                    {SCENE_OBJECTS.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => setActiveScene(obj.id)}
                        className={`px-3.5 py-1.5 text-[9px] font-black uppercase transition-all cursor-pointer ${
                          activeScene === obj.id
                            ? "bg-blue-600 text-white"
                            : "text-muted-foreground hover:bg-blue-500/10"
                        }`}
                      >
                        {obj.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real Canvas element */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-(--border) shadow-2xl">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={360}
                    className="w-full h-full block"
                  />
                  
                  {/* Scene selector badge float */}
                  <div className="absolute top-4 left-4 pointer-events-none px-2 py-1 rounded-md bg-[#020817]/80 text-[#06B6D4] font-mono text-[8px] uppercase tracking-wider border border-[#06B6D4]/30">
                    FEED: {activeScene.toUpperCase()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={addToComparison}
                    className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Layers size={12} /> Add to Comparison Deck
                  </button>
                  <button
                    onClick={resetAllFields}
                    className="py-3 px-3.5 rounded-2xl bg-(--background) border border-(--border) text-muted-foreground hover:border-red-500/50 hover:text-red-400 transition-all flex items-center justify-center"
                    title="Reset configuration"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Quick Math Stats Panel */}
            <GlassCard title="Real-Time Angle Values" icon={Activity} delay={0.15}>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-2xl bg-(--background) border border-(--border)">
                  <div className="text-[7.5px] uppercase tracking-wider text-muted-foreground">H-FOV</div>
                  <div className="text-(--foreground) text-base font-black mt-0.5">{hFov.toFixed(1)}°</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-(--background) border border-(--border)">
                  <div className="text-[7.5px] uppercase tracking-wider text-muted-foreground">V-FOV</div>
                  <div className="text-(--foreground) text-base font-black mt-0.5">{vFov.toFixed(1)}°</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-(--background) border border-(--border)">
                  <div className="text-[7.5px] uppercase tracking-wider text-muted-foreground">D-FOV</div>
                  <div className="text-(--foreground) text-base font-black mt-0.5">{dFov.toFixed(1)}°</div>
                </div>
              </div>
            </GlassCard>

            {/* Save Setup Widget */}
            <GlassCard title="Save Current Config" icon={Bookmark} delay={0.2}>
              <form onSubmit={saveCurrentSetup} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Portrait Setup (85mm FF)"
                  value={setupNameInput}
                  onChange={(e) => setSetupNameInput(e.target.value)}
                  className="flex-1 bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-xs outline-none focus:border-blue-500/50 transition-all font-bold text-(--foreground) placeholder:text-muted-foreground/60"
                />
                <button
                  type="submit"
                  disabled={!setupNameInput.trim()}
                  className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider transition-all shrink-0 shadow-lg shadow-blue-500/10"
                >
                  Save
                </button>
              </form>
            </GlassCard>

          </div>
        </div>

        {/* --- LENS COMPARISON VIEWPORT --- */}
        <AnimatePresence>
          {comparisonList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full"
            >
              <GlassCard
                title={`Multi-Lens Comparison Deck (${comparisonList.length}/4)`}
                icon={Layers}
                headerActions={
                  <button
                    onClick={clearComparisonList}
                    className="text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/20 bg-red-500/5 rounded-xl px-3 py-1.5 transition-all"
                  >
                    Clear Comparison
                  </button>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {comparisonList.map((item, index) => {
                    const colors = ["border-pink-500/30", "border-orange-500/30", "border-emerald-500/30", "border-purple-500/30"];
                    const headerColors = ["text-pink-400 bg-pink-500/10", "text-orange-400 bg-orange-500/10", "text-emerald-400 bg-emerald-500/10", "text-purple-400 bg-purple-500/10"];

                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-3xl bg-(--background) border relative hover:-translate-y-1 transition-all ${colors[index % colors.length]}`}
                      >
                        <button
                          onClick={() => removeComparisonItem(item.id)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${headerColors[index % headerColors.length]}`}>
                              Lens {index + 1}
                            </span>
                            <span className="text-xs font-black text-(--foreground)">
                              {item.focalLength}mm f/{item.aperture}
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between border-b border-(--border) pb-1">
                              <span className="text-muted-foreground text-[10px]">Sensor Presets</span>
                              <span className="font-bold text-(--foreground) truncate max-w-[130px]">{item.sensor.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-(--border) pb-1">
                              <span className="text-muted-foreground text-[10px]">Diagonal FOV</span>
                              <span className="font-bold text-blue-400">{item.dFov.toFixed(1)}°</span>
                            </div>
                            <div className="flex justify-between border-b border-(--border) pb-1">
                              <span className="text-muted-foreground text-[10px]">35mm Equiv.</span>
                              <span className="font-bold text-orange-400">{item.equivFocalLength}mm</span>
                            </div>
                            <div className="flex justify-between border-b border-(--border) pb-1">
                              <span className="text-muted-foreground text-[10px]">Coverage Width</span>
                              <span className="font-bold text-emerald-400">
                                {item.coverageWidth.toFixed(2)} {distanceUnit}
                              </span>
                            </div>
                            <div className="flex justify-between pb-1">
                              <span className="text-muted-foreground text-[10px]">Lens Category</span>
                              <span className="font-bold text-(--foreground) truncate max-w-[120px]">{item.lensType.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SAVED CONFIGURATIONS VIEW --- */}
        {savedSetups.length > 0 && (
          <GlassCard title="Saved Calculations Log" icon={BookmarkCheck} delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSetups.map((setup) => (
                <div
                  key={setup.id}
                  className="p-5 rounded-3xl bg-(--background) border border-(--border) hover:border-blue-500/30 group relative transition-all"
                >
                  <button
                    onClick={() => deleteSavedSetup(setup.id)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="space-y-3.5">
                    <h4 className="text-sm font-black text-(--foreground) truncate pr-6">{setup.name}</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-(--border) pt-3 text-muted-foreground">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider">Focal Spec</span>
                        <span className="font-bold text-(--foreground)">{setup.focalLength}mm f/{setup.aperture}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider">Sensor Spec</span>
                        <span className="font-bold text-(--foreground) truncate block">{setup.sensor.name}</span>
                      </div>
                      <div className="col-span-2 pt-1.5 flex justify-between items-center">
                        <button
                          onClick={() => loadSavedSetup(setup)}
                          className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                        >
                          <Eye size={11} /> Load Setup
                        </button>
                        <span className="text-[8px] text-muted-foreground/50">
                          {new Date(setup.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* --- TECHNICAL DOCUMENTARY FOOTER --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {[
            {
              icon: Scale,
              title: "Trigonometric Optical Math",
              desc: "Horizontal, vertical, and diagonal FOV values computed in real-time utilizing high-precision optical tangent and arctangent trigonometry."
            },
            {
              icon: Compass,
              title: "Crop Factor Adaptations",
              desc: "Seamless full-frame equivalence factor mapping. Compare how lenses behave on Micro Four Thirds or Medium Format vs standard 35mm formats."
            },
            {
              icon: Info,
              title: "Framing Bounds Estimates",
              desc: "Know exactly how much spatial scene area your optics can frame. Highly useful for studio planning, landscape plotting, and drone coverages."
            }
          ].map((feat, i) => (
            <div key={i} className="space-y-4 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit group-hover:scale-110 transition-transform">
                <feat.icon size={24} />
              </div>
              <h4 className="text-lg font-bold text-(--foreground)">{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
