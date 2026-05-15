"use client";

import React, { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import VoronoiCanvas from "../components/VoronoiCanvas";
import ControlPanel from "../components/ControlPanel";
import Description from "../components/Description";
import "../styles/index.css";

export default function ToolHome() {
    const canvasRef = useRef(null);

    const [pointCount, setPointCount] = useState(50);
    const [colorScheme, setColorScheme] = useState("rainbow");
    const [cellBorder, setCellBorder] = useState(true);
    const [borderColor, setBorderColor] = useState("#000000");
    const [borderWidth, setBorderWidth] = useState(2);
    const [animationSpeed, setAnimationSpeed] = useState(0);
    const [useGradient, setUseGradient] = useState(false);
    const [seed, setSeed] = useState(Math.random());
    const [cellOpacity, setCellOpacity] = useState(1);
    const [pixelSize, setPixelSize] = useState(2);
    const [showSeedPoints, setShowSeedPoints] = useState(true);
    const [borderSensitivity, setBorderSensitivity] = useState(2);
    const [borderLimit, setBorderLimit] = useState(8);
    const [symmetryMode, setSymmetryMode] = useState(false);
    const [gradientColorStart, setGradientColorStart] = useState("#3b82f6");
    const [gradientColorEnd, setGradientColorEnd] = useState("#ec4899");
    const [seedPointColor, setSeedPointColor] = useState("#ffffff");
    const [seedPointSize, setSeedPointSize] = useState(4);
    const [symmetryAxis, setSymmetryAxis] = useState("vertical");
    const [showSymmetryAxisLine, setShowSymmetryAxisLine] = useState(true);

    const handleDownload = (format) => {
        const canvasApi = canvasRef.current;
        if (!canvasApi) {
            toast.error("Canvas is not ready yet.");
            return;
        }

        const link = document.createElement("a");
        link.download = `voronoi-art-${Date.now()}.${format}`;

        if (format === "png") {
            link.href = canvasApi.toDataURL("image/png");
        } else if (format === "jpg") {
            link.href = canvasApi.toDataURL("image/jpeg", 0.95);
        } else if (format === "webp") {
            link.href = canvasApi.toDataURL("image/webp", 0.95);
        }

        link.click();
        toast.success(`Downloaded as ${format.toUpperCase()}!`, {
            description: "Your voronoi art has been saved.",
        });
    };

    const handleCopyCSS = () => {
        const cssCode = `/* Voronoi Art Generator - CSS Background */
.voronoi-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* Add canvas element for dynamic rendering */
canvas.voronoi-canvas {
  display: block;
  width: 100%;
  height: 100%;
}`;

        navigator.clipboard.writeText(cssCode);
        toast.success("CSS Copied!", {
            description: "Voronoi CSS has been copied to your clipboard.",
        });
    };

    const handlePresetApply = (preset) => {
        setPointCount(preset.points);
        setColorScheme(preset.colors);
        setCellBorder(preset.border);
        setBorderColor(preset.borderColor);
        setSeed(Math.random());
        toast.success(`Applied \"${preset.name}\" preset!`);
    };

    const handleRandomize = () => {
        setPointCount(Math.floor(Math.random() * 150) + 20);
        setColorScheme(
            ["rainbow", "pastel", "dark", "neon", "sunset", "ocean", "forest", "candy", "arctic", "volcano", "cyberpunk", "vintage"][
                Math.floor(Math.random() * 12)
            ]
        );
        setCellBorder(Math.random() > 0.3);
        setBorderWidth(Math.floor(Math.random() * 4) + 1);
        setPixelSize(Math.random() > 0.5 ? 2 : 3);
        setCellOpacity(0.8 + Math.random() * 0.2);
        setSeed(Math.random());
        toast.success("Randomized!");
    };


    const handleRelaxSeeds = (iterations = 2) => {
        const success = canvasRef.current?.relaxSeeds?.(iterations);
        if (!success) {
            toast.error("Unable to relax seeds right now.");
            return;
        }
        toast.success(`Relaxed seeds (${iterations} iteration${iterations > 1 ? "s" : ""}).`);
    };


    return (
        <div className="voronoi-tool-shell">
            <Toaster />
            <div className="voronoi-tool-container">
                <Header />

                <div className="voronoi-tool-grid">
                    <div className="voronoi-left-col">
                        <ControlPanel
                            pointCount={pointCount}
                            setPointCount={setPointCount}
                            colorScheme={colorScheme}
                            setColorScheme={setColorScheme}
                            cellBorder={cellBorder}
                            setCellBorder={setCellBorder}
                            borderColor={borderColor}
                            setBorderColor={setBorderColor}
                            borderWidth={borderWidth}
                            setBorderWidth={setBorderWidth}
                            animationSpeed={animationSpeed}
                            setAnimationSpeed={setAnimationSpeed}
                            useGradient={useGradient}
                            setUseGradient={setUseGradient}
                            cellOpacity={cellOpacity}
                            setCellOpacity={setCellOpacity}
                            pixelSize={pixelSize}
                            setPixelSize={setPixelSize}
                            onApplyPreset={handlePresetApply}
                            showAnimationSpeed={false}
                            showSeedPoints={showSeedPoints}
                            setShowSeedPoints={setShowSeedPoints}
                            borderSensitivity={borderSensitivity}
                            setBorderSensitivity={setBorderSensitivity}
                            borderLimit={borderLimit}
                            setBorderLimit={setBorderLimit}
                            symmetryMode={symmetryMode}
                            setSymmetryMode={setSymmetryMode}
                            gradientColorStart={gradientColorStart}
                            setGradientColorStart={setGradientColorStart}
                            gradientColorEnd={gradientColorEnd}
                            setGradientColorEnd={setGradientColorEnd}
                            seedPointColor={seedPointColor}
                            setSeedPointColor={setSeedPointColor}
                            seedPointSize={seedPointSize}
                            setSeedPointSize={setSeedPointSize}
                            symmetryAxis={symmetryAxis}
                            setSymmetryAxis={setSymmetryAxis}
                            showSymmetryAxisLine={showSymmetryAxisLine}
                            setShowSymmetryAxisLine={setShowSymmetryAxisLine}
                        />

                        <div className="voronoi-card voronoi-actions-card">
                            <div className="voronoi-action-title">Actions & Export</div>
                            <div className="voronoi-actions-list">
                                <button
                                    onClick={handleRandomize}
                                    className="tool-btn-primary voronoi-btn"
                                >
                                    Randomize
                                </button>
                                <button
                                    onClick={handleCopyCSS}
                                    className="tool-btn-secondary voronoi-btn"
                                >
                                    Copy CSS
                                </button>
                                <div className="voronoi-actions-grid-2">
                                    <button
                                        onClick={() => handleRelaxSeeds(1)}
                                        className="tool-btn-muted voronoi-btn voronoi-btn-sm"
                                    >
                                        Relax x1
                                    </button>
                                    <button
                                        onClick={() => handleRelaxSeeds(3)}
                                        className="tool-btn-muted voronoi-btn voronoi-btn-sm"
                                    >
                                        Relax x3
                                    </button>
                                </div>
                                <div className="voronoi-actions-grid-3">
                                    <button
                                        onClick={() => handleDownload("png")}
                                        className="tool-btn-muted voronoi-btn voronoi-btn-sm"
                                    >
                                        PNG
                                    </button>
                                    <button
                                        onClick={() => handleDownload("jpg")}
                                        className="tool-btn-muted voronoi-btn voronoi-btn-sm"
                                    >
                                        JPG
                                    </button>
                                    <button
                                        onClick={() => handleDownload("webp")}
                                        className="tool-btn-muted voronoi-btn voronoi-btn-sm"
                                    >
                                        WebP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="voronoi-right-col">
                        <div className="voronoi-card voronoi-canvas-card">
                            <VoronoiCanvas
                                ref={canvasRef}
                                pointCount={pointCount}
                                colorScheme={colorScheme}
                                cellBorder={cellBorder}
                                borderColor={borderColor}
                                borderWidth={borderWidth}
                                animationSpeed={animationSpeed}
                                useGradient={useGradient}
                                seed={seed}
                                cellOpacity={cellOpacity}
                                pixelSize={pixelSize}
                                showSeedPoints={showSeedPoints}
                                interactiveSeeds
                                borderSensitivity={borderSensitivity}
                                borderLimit={borderLimit}
                                symmetryMode={symmetryMode}
                                gradientColorStart={gradientColorStart}
                                gradientColorEnd={gradientColorEnd}
                                seedPointColor={seedPointColor}
                                seedPointSize={seedPointSize}
                                symmetryAxis={symmetryAxis}
                                showSymmetryAxisLine={showSymmetryAxisLine}
                            />
                        </div>

                        <p className="voronoi-tip">
                            Tip: Click canvas to add seed, drag seed to move, right-click seed to remove.
                        </p>

                        <div className="voronoi-card voronoi-anim-card">
                            <label className="voronoi-label">
                                Animation Speed: {animationSpeed.toFixed(1)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                value={animationSpeed}
                                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                                className="voronoi-range"
                            />
                            <p className="voronoi-help">0 = static, higher = animated</p>
                        </div>
                    </div>
                </div>

                <Description />
            </div>
        </div>
    );
}
