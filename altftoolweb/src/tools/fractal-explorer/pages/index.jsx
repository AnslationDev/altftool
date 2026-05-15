"use client";

import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import ControlPanel from "../components/ControlPanel";
import FractalCanvas from "../components/FractalCanvas";
import Description from "../components/Description";
import "../styles/index.css";

const DEFAULT_STATE = {
    fractalType: "mandelbrot",
    centerX: -0.5,
    centerY: 0,
    zoom: 1,
    maxIterations: 450,
    escapeRadius: 4,
    juliaReal: -0.8,
    juliaImag: 0.156,
    useGradient: true,
    gradientColorStart: "#1d4ed8",
    gradientColorEnd: "#ec4899",
    smoothColoring: true,
    colorPower: 1,
    hueShift: 0,
    animationSpeed: 0,
    supersample: 1,
};

export default function ToolHome() {
    const canvasRef = useRef(null);

    const [fractalType, setFractalType] = useState(DEFAULT_STATE.fractalType);
    const [centerX, setCenterX] = useState(DEFAULT_STATE.centerX);
    const [centerY, setCenterY] = useState(DEFAULT_STATE.centerY);
    const [zoom, setZoom] = useState(DEFAULT_STATE.zoom);
    const [maxIterations, setMaxIterations] = useState(DEFAULT_STATE.maxIterations);
    const [escapeRadius, setEscapeRadius] = useState(DEFAULT_STATE.escapeRadius);
    const [juliaReal, setJuliaReal] = useState(DEFAULT_STATE.juliaReal);
    const [juliaImag, setJuliaImag] = useState(DEFAULT_STATE.juliaImag);
    const [useGradient, setUseGradient] = useState(DEFAULT_STATE.useGradient);
    const [gradientColorStart, setGradientColorStart] = useState(DEFAULT_STATE.gradientColorStart);
    const [gradientColorEnd, setGradientColorEnd] = useState(DEFAULT_STATE.gradientColorEnd);
    const [smoothColoring, setSmoothColoring] = useState(DEFAULT_STATE.smoothColoring);
    const [colorPower, setColorPower] = useState(DEFAULT_STATE.colorPower);
    const [hueShift, setHueShift] = useState(DEFAULT_STATE.hueShift);
    const [animationSpeed, setAnimationSpeed] = useState(DEFAULT_STATE.animationSpeed);
    const [supersample, setSupersample] = useState(DEFAULT_STATE.supersample);

    useEffect(() => {
        canvasRef.current?.setOnViewChange?.((view) => {
            setCenterX(view.centerX);
            setCenterY(view.centerY);
            setZoom(view.zoom);
        });
    }, []);

    const state = {
        fractalType,
        centerX,
        centerY,
        zoom,
        maxIterations,
        escapeRadius,
        juliaReal,
        juliaImag,
        useGradient,
        gradientColorStart,
        gradientColorEnd,
        smoothColoring,
        colorPower,
        hueShift,
        animationSpeed,
        supersample,
    };

    const setters = {
        setFractalType,
        setCenterX,
        setCenterY,
        setZoom,
        setMaxIterations,
        setEscapeRadius,
        setJuliaReal,
        setJuliaImag,
        setUseGradient,
        setGradientColorStart,
        setGradientColorEnd,
        setSmoothColoring,
        setColorPower,
        setHueShift,
        setAnimationSpeed,
        setSupersample,
    };

    const applyPreset = (preset) => {
        if (preset.fractalType) setFractalType(preset.fractalType);
        if (Number.isFinite(preset.centerX)) setCenterX(preset.centerX);
        if (Number.isFinite(preset.centerY)) setCenterY(preset.centerY);
        if (Number.isFinite(preset.zoom)) setZoom(preset.zoom);
        if (Number.isFinite(preset.maxIterations)) setMaxIterations(preset.maxIterations);
        if (Number.isFinite(preset.juliaReal)) setJuliaReal(preset.juliaReal);
        if (Number.isFinite(preset.juliaImag)) setJuliaImag(preset.juliaImag);
        toast.success(`Applied \"${preset.name}\" preset.`);
    };

    const handleResetView = () => {
        setCenterX(DEFAULT_STATE.centerX);
        setCenterY(DEFAULT_STATE.centerY);
        setZoom(DEFAULT_STATE.zoom);
        setMaxIterations(DEFAULT_STATE.maxIterations);
        setEscapeRadius(DEFAULT_STATE.escapeRadius);
        setJuliaReal(DEFAULT_STATE.juliaReal);
        setJuliaImag(DEFAULT_STATE.juliaImag);
        setUseGradient(DEFAULT_STATE.useGradient);
        setGradientColorStart(DEFAULT_STATE.gradientColorStart);
        setGradientColorEnd(DEFAULT_STATE.gradientColorEnd);
        setSmoothColoring(DEFAULT_STATE.smoothColoring);
        setColorPower(DEFAULT_STATE.colorPower);
        setHueShift(DEFAULT_STATE.hueShift);
        setAnimationSpeed(DEFAULT_STATE.animationSpeed);
        setSupersample(DEFAULT_STATE.supersample);
        toast.success("View reset to defaults.");
    };

    const handleRandomPalette = () => {
        const rand = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
        setGradientColorStart(`#${rand()}${rand()}${rand()}`);
        setGradientColorEnd(`#${rand()}${rand()}${rand()}`);
        setHueShift(Math.random());
        toast.success("Random palette applied.");
    };

    const handleExportPNG = () => {
        const url = canvasRef.current?.toDataURL?.("image/png");
        if (!url) {
            toast.error("Canvas is not ready.");
            return;
        }
        const link = document.createElement("a");
        link.href = url;
        link.download = `fractal-${Date.now()}.png`;
        link.click();
        toast.success("PNG exported.");
    };


    return (
        <div className="fractal-tool-shell">
            <Toaster />
            <div className="fractal-tool-container">
                <Header />

                <div className="fractal-tool-grid">
                    <div className="fractal-left-col">
                        <ControlPanel state={state} setters={setters} onApplyPreset={applyPreset} />

                        <div className="fractal-card fractal-actions-card">
                            <div className="fractal-action-title">Actions & Export</div>
                            <div className="fractal-actions-list">
                                <button onClick={handleRandomPalette} className="tool-btn-primary fractal-btn">Random Palette</button>
                                <button onClick={handleResetView} className="tool-btn-secondary fractal-btn">Reset View</button>
                                <button onClick={handleExportPNG} className="tool-btn-muted fractal-btn fractal-btn-sm">Export PNG</button>
                            </div>
                        </div>
                    </div>

                    <div className="fractal-right-col">
                        <div className="fractal-card fractal-canvas-card">
                            <FractalCanvas
                                ref={canvasRef}
                                fractalType={fractalType}
                                centerX={centerX}
                                centerY={centerY}
                                zoom={zoom}
                                maxIterations={maxIterations}
                                escapeRadius={escapeRadius}
                                juliaReal={juliaReal}
                                juliaImag={juliaImag}
                                useGradient={useGradient}
                                gradientColorStart={gradientColorStart}
                                gradientColorEnd={gradientColorEnd}
                                smoothColoring={smoothColoring}
                                colorPower={colorPower}
                                hueShift={hueShift}
                                animationSpeed={animationSpeed}
                                supersample={supersample}
                                interactive
                            />
                        </div>

                        <p className="fractal-tip">
                            Tip: Click to zoom in, right-click to zoom out, drag to pan, and use wheel for fine zoom.
                        </p>
                    </div>
                </div>

                <Description />
            </div>
        </div>
    );
}
