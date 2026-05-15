"use client";

import React, { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import ControlPanel from "../components/ControlPanel";
import GoldenCanvas from "../components/GoldenCanvas";
import Description from "../components/Description";
import "../styles/index.css";

const DEFAULT_STATE = {
    canvasSize: 900,
    backgroundColor: "#0f172a",
    useGradientBackground: true,
    gradientStart: "#1f2937",
    gradientEnd: "#111827",
    showFibonacciGrid: true,
    showGoldenSpiral: true,
    showPhiGrid: false,
    showRuleOfThirds: false,
    showDiagonalGuides: false,
    tileCount: 10,
    strokeColor: "#f59e0b",
    fillOpacity: 0.16,
    strokeWidth: 2.4,
    rotateDeg: 0,
    spiralDirection: "clockwise",
    animateRotation: false,
    animationSpeed: 1,
    lineStyle: "solid",
};

export default function ToolHome() {
    const canvasRef = useRef(null);

    const [canvasSize, setCanvasSize] = useState(DEFAULT_STATE.canvasSize);
    const [backgroundColor, setBackgroundColor] = useState(DEFAULT_STATE.backgroundColor);
    const [useGradientBackground, setUseGradientBackground] = useState(DEFAULT_STATE.useGradientBackground);
    const [gradientStart, setGradientStart] = useState(DEFAULT_STATE.gradientStart);
    const [gradientEnd, setGradientEnd] = useState(DEFAULT_STATE.gradientEnd);
    const [showFibonacciGrid, setShowFibonacciGrid] = useState(DEFAULT_STATE.showFibonacciGrid);
    const [showGoldenSpiral, setShowGoldenSpiral] = useState(DEFAULT_STATE.showGoldenSpiral);
    const [showPhiGrid, setShowPhiGrid] = useState(DEFAULT_STATE.showPhiGrid);
    const [showRuleOfThirds, setShowRuleOfThirds] = useState(DEFAULT_STATE.showRuleOfThirds);
    const [showDiagonalGuides, setShowDiagonalGuides] = useState(DEFAULT_STATE.showDiagonalGuides);
    const [tileCount, setTileCount] = useState(DEFAULT_STATE.tileCount);
    const [strokeColor, setStrokeColor] = useState(DEFAULT_STATE.strokeColor);
    const [fillOpacity, setFillOpacity] = useState(DEFAULT_STATE.fillOpacity);
    const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STATE.strokeWidth);
    const [rotateDeg, setRotateDeg] = useState(DEFAULT_STATE.rotateDeg);
    const [spiralDirection, setSpiralDirection] = useState(DEFAULT_STATE.spiralDirection);
    const [animateRotation, setAnimateRotation] = useState(DEFAULT_STATE.animateRotation);
    const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_STATE.animationSpeed);
    const [lineStyle, setLineStyle] = useState(DEFAULT_STATE.lineStyle);

    const state = {
        canvasSize,
        backgroundColor,
        useGradientBackground,
        gradientStart,
        gradientEnd,
        showFibonacciGrid,
        showGoldenSpiral,
        showPhiGrid,
        showRuleOfThirds,
        showDiagonalGuides,
        tileCount,
        strokeColor,
        fillOpacity,
        strokeWidth,
        rotateDeg,
        spiralDirection,
        animateRotation,
        animationSpeed,
        lineStyle,
    };

    const setters = {
        setCanvasSize,
        setBackgroundColor,
        setUseGradientBackground,
        setGradientStart,
        setGradientEnd,
        setShowFibonacciGrid,
        setShowGoldenSpiral,
        setShowPhiGrid,
        setShowRuleOfThirds,
        setShowDiagonalGuides,
        setTileCount,
        setStrokeColor,
        setFillOpacity,
        setStrokeWidth,
        setRotateDeg,
        setSpiralDirection,
        setAnimateRotation,
        setAnimationSpeed,
        setLineStyle,
    };

    const applyPreset = (preset) => {
        Object.entries(preset).forEach(([key, val]) => {
            const setter = setters[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`];
            if (setter) setter(val);
        });
        toast.success(`Applied \"${preset.name}\" preset.`);
    };

    const handleReset = () => {
        Object.entries(DEFAULT_STATE).forEach(([key, val]) => {
            const setter = setters[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`];
            if (setter) setter(val);
        });
        toast.success("Reset to defaults.");
    };

    const handleRandomStyle = () => {
        const rand = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
        setStrokeColor(`#${rand()}${rand()}${rand()}`);
        setGradientStart(`#${rand()}${rand()}${rand()}`);
        setGradientEnd(`#${rand()}${rand()}${rand()}`);
        setRotateDeg(Math.floor(Math.random() * 360) - 180);
        setLineStyle(["solid", "dashed", "dotted"][Math.floor(Math.random() * 3)]);
        toast.success("Random style generated.");
    };

    const handleExportPNG = () => {
        const url = canvasRef.current?.toDataURL?.("image/png");
        if (!url) {
            toast.error("Canvas not ready.");
            return;
        }
        const link = document.createElement("a");
        link.href = url;
        link.download = `golden-ratio-${Date.now()}.png`;
        link.click();
        toast.success("PNG exported.");
    };


    return (
        <div className="golden-tool-shell">
            <Toaster />
            <div className="golden-tool-container">
                <Header />

                <div className="golden-tool-grid">
                    <div className="golden-left-col">
                        <ControlPanel state={state} setters={setters} onApplyPreset={applyPreset} />

                        <div className="golden-card golden-actions-card">
                            <div className="golden-action-title">Actions & Export</div>
                            <div className="golden-actions-list">
                                <button onClick={handleRandomStyle} className="tool-btn-primary golden-btn">Random Style</button>
                                <button onClick={handleReset} className="tool-btn-primary golden-btn">Reset Layout</button>
                                <button onClick={handleExportPNG} className="tool-btn-primary golden-btn golden-btn-sm">Export PNG</button>
                            </div>
                        </div>
                    </div>

                    <div className="golden-right-col">
                        <div className="golden-card golden-canvas-card">
                            <GoldenCanvas
                                ref={canvasRef}
                                canvasSize={canvasSize}
                                backgroundColor={backgroundColor}
                                useGradientBackground={useGradientBackground}
                                gradientStart={gradientStart}
                                gradientEnd={gradientEnd}
                                showFibonacciGrid={showFibonacciGrid}
                                showGoldenSpiral={showGoldenSpiral}
                                showPhiGrid={showPhiGrid}
                                showRuleOfThirds={showRuleOfThirds}
                                showDiagonalGuides={showDiagonalGuides}
                                tileCount={tileCount}
                                strokeColor={strokeColor}
                                fillOpacity={fillOpacity}
                                strokeWidth={strokeWidth}
                                rotateDeg={rotateDeg}
                                spiralDirection={spiralDirection}
                                animateRotation={animateRotation}
                                animationSpeed={animationSpeed}
                                lineStyle={lineStyle}
                            />
                        </div>

                        <p className="golden-tip">
                            Tip: Toggle overlays to compare composition systems and export final guides for design or photography.
                        </p>
                    </div>
                </div>

                <Description />
            </div>
        </div>
    );
}
