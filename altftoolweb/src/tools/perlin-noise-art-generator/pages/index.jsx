"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import Header from "../components/Header";
import "../styles/index.css";

class NoiseGenerator {
    constructor(seed) {
        this.permutation = this.generatePermutation(seed);
        this.p = [...this.permutation, ...this.permutation];
    }
    generatePermutation(seed) {
        const perm = Array.from({ length: 256 }, (_, i) => i);
        let random = Math.max(1, seed | 0);
        for (let i = 255; i > 0; i--) {
            random = (random * 16807) % 2147483647;
            const j = Math.floor((random / 2147483647) * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }
        return perm;
    }
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y) {
        const h = hash & 7;
        const u = h < 4 ? x : y;
        const v = h < 4 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }
    perlin(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];
        return this.lerp(v, this.lerp(u, this.grad(aa, x, y), this.grad(ba, x - 1, y)), this.lerp(u, this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1)));
    }
    valueNoise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];
        return this.lerp(v, this.lerp(u, aa / 255, ba / 255), this.lerp(u, ab / 255, bb / 255));
    }
    fbm(x, y, octaves, persistence, lacunarity, fn) {
        let total = 0, amplitude = 1, frequency = 1, maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += fn.call(this, x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return total / maxValue;
    }
    ridged(x, y, octaves, persistence, lacunarity, offset) {
        let total = 0, amplitude = 1, frequency = 1, maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            const n = Math.abs(this.perlin(x * frequency, y * frequency));
            const ridge = offset - n;
            total += ridge * ridge * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return total / maxValue;
    }
}

export default function ToolHome() {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const [noiseType, setNoiseType] = useState("perlin");
    const [scale, setScale] = useState(50);
    const [octaves, setOctaves] = useState(4);
    const [persistence, setPersistence] = useState(0.5);
    const [lacunarity, setLacunarity] = useState(2.0);
    const [seed, setSeed] = useState(1337);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [colorPalette, setColorPalette] = useState("grayscale");
    const [resolution, setResolution] = useState(512);
    const [exportResolution, setExportResolution] = useState(2048);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(0.01);
    const [timeOffset, setTimeOffset] = useState(0);
    const [outputType, setOutputType] = useState("clouds");
    const [turbulence, setTurbulence] = useState(0);
    const [seamless, setSeamless] = useState(false);
    const [tilingX, setTilingX] = useState(1);
    const [tilingY, setTilingY] = useState(1);
    const [qualityMode, setQualityMode] = useState("fast");
    const [savedPresets, setSavedPresets] = useState([]);
    const [seedHistory, setSeedHistory] = useState([]);
    const [favoriteSeeds, setFavoriteSeeds] = useState([]);
    const [activeLayers, setActiveLayers] = useState([
        { enabled: true, blend: "add", weight: 0.7, offsetX: 0, offsetY: 0 },
        { enabled: false, blend: "multiply", weight: 0.35, offsetX: 37, offsetY: 71 },
    ]);

    useEffect(() => {
        setSavedPresets(JSON.parse(localStorage.getItem("perlin_user_presets") || "[]"));
        setSeedHistory(JSON.parse(localStorage.getItem("perlin_seed_history") || "[]"));
        setFavoriteSeeds(JSON.parse(localStorage.getItem("perlin_seed_favorites") || "[]"));
    }, []);

    const persist = (key, value) => localStorage.setItem(key, JSON.stringify(value));

    const addSeedHistory = (s) => {
        const next = [s, ...seedHistory.filter((x) => x !== s)].slice(0, 20);
        setSeedHistory(next);
        persist("perlin_seed_history", next);
    };

    const randomizeSeed = () => {
        const s = Math.floor(Math.random() * 1000000);
        setSeed(s);
        addSeedHistory(s);
    };

    const toggleFavoriteSeed = () => {
        const exists = favoriteSeeds.includes(seed);
        const next = exists ? favoriteSeeds.filter((x) => x !== seed) : [seed, ...favoriteSeeds].slice(0, 30);
        setFavoriteSeeds(next);
        persist("perlin_seed_favorites", next);
    };

    const getPalette = (palette) => {
        const palettes = {
            grayscale: [[0, 0, 0], [255, 255, 255]],
            viridis: [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]],
            plasma: [[13, 8, 135], [126, 3, 168], [204, 71, 120], [248, 149, 64], [240, 249, 33]],
            inferno: [[0, 0, 4], [87, 16, 110], [187, 55, 84], [249, 142, 9], [252, 255, 164]],
            ocean: [[0, 28, 107], [0, 119, 182], [3, 175, 213], [106, 213, 166], [199, 234, 229]],
            fire: [[0, 0, 0], [128, 0, 0], [255, 69, 0], [255, 165, 0], [255, 255, 0]],
            ice: [[3, 5, 61], [30, 70, 120], [100, 150, 200], [180, 220, 240], [240, 250, 255]],
            rainbow: [[255, 0, 0], [255, 165, 0], [255, 255, 0], [0, 128, 0], [0, 0, 255], [75, 0, 130], [238, 130, 238]],
            earth: [[34, 28, 53], [101, 72, 42], [139, 105, 62], [189, 158, 87], [228, 218, 173]],
            sunset: [[25, 10, 50], [128, 30, 80], [200, 80, 100], [255, 150, 100], [255, 220, 150]],
        };
        return palettes[palette] || palettes.grayscale;
    };

    const interpolateColor = (value, colors) => {
        const v = Math.max(0, Math.min(1, value));
        const segments = colors.length - 1;
        const segment = Math.min(Math.floor(v * segments), segments - 1);
        const local = v * segments - segment;
        const c1 = colors[segment];
        const c2 = colors[segment + 1];
        return [Math.round(c1[0] + (c2[0] - c1[0]) * local), Math.round(c1[1] + (c2[1] - c1[1]) * local), Math.round(c1[2] + (c2[2] - c1[2]) * local), 255];
    };

    const applyOutputType = (value, x, y) => {
        if (outputType === "terrain") {
            if (value < -0.3) return -0.8;
            if (value < 0.0) return -0.3;
            if (value < 0.4) return 0.2;
            if (value < 0.7) return 0.6;
            return 0.9;
        }
        if (outputType === "marble") return Math.sin(x * 0.1 + value * 5);
        if (outputType === "wood") return Math.sin(Math.sqrt(x * x + y * y) * 0.3 + value * 10);
        if (outputType === "water") return Math.sin(value * 8 + x * 0.05);
        if (outputType === "lava") return Math.abs(Math.sin(value * 6)) * Math.abs(value);
        if (outputType === "smoke") return Math.pow(Math.abs(value), 1.5);
        if (outputType === "abstract") return Math.sin(value * 10) * Math.cos(value * 8);
        return Math.abs(value);
    };

    const computeRawValue = (noise, px, py) => {
        let value = 0;
        if (noiseType === "perlin") value = noise.fbm(px, py, octaves, persistence, lacunarity, noise.perlin);
        else if (noiseType === "value") value = noise.fbm(px, py, octaves, persistence, lacunarity, noise.valueNoise);
        else if (noiseType === "fbm") value = noise.fbm(px, py, octaves, persistence, lacunarity, noise.perlin);
        else if (noiseType === "ridged") value = noise.ridged(px, py, octaves, persistence, lacunarity, 1);
        else value = noise.fbm(px, py, octaves, persistence, lacunarity, noise.perlin);
        if (turbulence > 0) value += noise.turbulence(px, py, 32) * turbulence * 0.1;
        return value;
    };

    const mixLayers = (noise, px, py) => {
        let acc = 0;
        let first = true;
        activeLayers.forEach((layer) => {
            if (!layer.enabled) return;
            const v = computeRawValue(noise, px + layer.offsetX, py + layer.offsetY) * layer.weight;
            if (first) {
                acc = v;
                first = false;
                return;
            }
            if (layer.blend === "add") acc += v;
            else if (layer.blend === "multiply") acc *= Math.max(0.001, v + 1);
            else acc = 2 * acc * v;
        });
        return first ? computeRawValue(noise, px, py) : acc;
    };

    const generateNoise = (targetCanvas = null, mode = "base", forcedResolution = null) => {
        const canvas = targetCanvas || canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const baseRes = forcedResolution || resolution;
        const adaptiveRes = qualityMode === "fast" || isAnimating ? Math.max(256, Math.floor(baseRes * 0.5)) : baseRes;
        const displayRes = forcedResolution ? forcedResolution : adaptiveRes;
        canvas.width = displayRes;
        canvas.height = displayRes;
        ctx.imageSmoothingEnabled = false;
        const imageData = ctx.createImageData(displayRes, displayRes);
        const data = imageData.data;
        const noise = new NoiseGenerator(seed);
        for (let y = 0; y < displayRes; y++) {
            for (let x = 0; x < displayRes; x++) {
                let px = (x / scale) * tilingX;
                let py = (y / scale) * tilingY;
                if (isAnimating) {
                    px += timeOffset;
                    py += timeOffset;
                }
                if (seamless) {
                    const s = scale / displayRes;
                    px = Math.cos(px * 2 * Math.PI * s) / (2 * Math.PI * s);
                    py = Math.cos(py * 2 * Math.PI * s) / (2 * Math.PI * s);
                }
                const raw = mixLayers(noise, px, py);
                const transformed = applyOutputType(raw, px, py);
                const normalized = Math.max(0, Math.min(1, ((transformed + 1) / 2 - 0.5) * contrast + 0.5)) * brightness;
                const clamped = Math.max(0, Math.min(1, normalized));
                const idx = (y * displayRes + x) * 4;
                if (mode === "height" || mode === "roughness") {
                    const g = Math.round(clamped * 255);
                    data[idx] = g; data[idx + 1] = g; data[idx + 2] = g; data[idx + 3] = 255;
                } else if (mode === "normal") {
                    const eps = 1 / displayRes;
                    const h = clamped;
                    const hx = Math.max(0, Math.min(1, ((applyOutputType(mixLayers(noise, px + eps, py), px + eps, py) + 1) / 2)));
                    const hy = Math.max(0, Math.min(1, ((applyOutputType(mixLayers(noise, px, py + eps), px, py + eps) + 1) / 2)));
                    const nx = (h - hx) * 5;
                    const ny = (h - hy) * 5;
                    const nz = 1;
                    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                    data[idx] = Math.round(((nx / len) + 1) * 127.5);
                    data[idx + 1] = Math.round(((ny / len) + 1) * 127.5);
                    data[idx + 2] = Math.round(((nz / len) + 1) * 127.5);
                    data[idx + 3] = 255;
                } else {
                    const c = interpolateColor(clamped, getPalette(colorPalette));
                    data[idx] = c[0]; data[idx + 1] = c[1]; data[idx + 2] = c[2]; data[idx + 3] = 255;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    useEffect(() => {
        if (isAnimating) {
            const animate = () => {
                setTimeOffset((prev) => prev + animationSpeed);
                generateNoise();
                animationRef.current = requestAnimationFrame(animate);
            };
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            generateNoise();
        }
        return () => animationRef.current && cancelAnimationFrame(animationRef.current);
    }, [isAnimating, animationSpeed, seed, noiseType, scale, octaves, persistence, lacunarity, brightness, contrast, colorPalette, resolution, outputType, turbulence, seamless, timeOffset, tilingX, tilingY, qualityMode, activeLayers]);

    const exportPng = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `perlin-noise-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const exportMapPack = async () => {
        const zip = new JSZip();
        for (const mode of ["base", "normal", "height", "roughness", "ao"]) {
            const c = document.createElement("canvas");
            if (mode === "ao") {
                generateNoise(c, "height", exportResolution);
                const ctx = c.getContext("2d");
                const img = ctx.getImageData(0, 0, c.width, c.height);
                const d = img.data;
                for (let i = 0; i < d.length; i += 4) {
                    const v = d[i] / 255;
                    const ao = Math.max(0, Math.min(1, 1 - v * 0.7));
                    const g = Math.round(ao * 255);
                    d[i] = g; d[i + 1] = g; d[i + 2] = g;
                }
                ctx.putImageData(img, 0, 0);
            } else {
                generateNoise(c, mode, exportResolution);
            }
            const blob = await (await fetch(c.toDataURL("image/png"))).blob();
            zip.file(`perlin_${mode}.png`, blob);
        }
        zip.file("manifest.json", JSON.stringify({
            seed,
            noiseType,
            outputType,
            palette: colorPalette,
            scale,
            octaves,
            persistence,
            lacunarity,
            brightness,
            contrast,
            turbulence,
            seamless,
            tilingX,
            tilingY,
            exportResolution,
            generatedAt: new Date().toISOString(),
        }, null, 2));
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `perlin-map-pack-${Date.now()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const startVideoExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `perlin-animation-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsAnimating(true);
        setTimeout(() => {
            recorder.stop();
            setIsAnimating(false);
        }, 4000);
    };

    const savePreset = () => {
        const preset = {
            name: `Preset ${savedPresets.length + 1}`,
            noiseType, scale, octaves, persistence, lacunarity, brightness, contrast, colorPalette, resolution, exportResolution, outputType, turbulence, seamless, tilingX, tilingY,
        };
        const next = [preset, ...savedPresets];
        setSavedPresets(next);
        persist("perlin_user_presets", next);
    };

    const applyPreset = (p) => {
        const n = (v, fallback) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
        setNoiseType(p.noiseType || "perlin");
        setScale(n(p.scale, 50));
        setOctaves(n(p.octaves, 4));
        setPersistence(n(p.persistence, 0.5));
        setLacunarity(n(p.lacunarity, 2));
        setBrightness(n(p.brightness, 1));
        setContrast(n(p.contrast, 1));
        setColorPalette(p.colorPalette || p.palette || "grayscale");
        setResolution(n(p.resolution, 512));
        setExportResolution(n(p.exportResolution, 2048));
        setOutputType(p.outputType || "clouds");
        setTurbulence(n(p.turbulence, 0));
        setSeamless(typeof p.seamless === "boolean" ? p.seamless : false);
        setTilingX(n(p.tilingX, 1));
        setTilingY(n(p.tilingY, 1));
    };

    const randomPalette = () => {
        const list = ["grayscale", "viridis", "plasma", "inferno", "ocean", "fire", "ice", "rainbow", "earth", "sunset"];
        setColorPalette(list[Math.floor(Math.random() * list.length)]);
    };

    const exportPaletteJSON = () => {
        const blob = new Blob([JSON.stringify({ colorPalette }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "perlin-palette.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const importPaletteJSON = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        file.text().then((txt) => {
            try {
                const obj = JSON.parse(txt);
                if (obj.colorPalette) setColorPalette(obj.colorPalette);
            } catch {}
        });
    };

    const palettes = useMemo(() => ["grayscale", "viridis", "plasma", "inferno", "ocean", "fire", "ice", "rainbow", "earth", "sunset"], []);

    return (
        <div className="perlin-tool-shell">
            <div className="perlin-tool-container">
                <Header />
                <div className="perlin-tool-grid">
                    <div className="perlin-left-col">
                        <div className="perlin-canvas-card perlin-card">
                            <div className="perlin-canvas-wrap">
                                <canvas ref={canvasRef} className="perlin-canvas-el" />
                            </div>
                        </div>
                    </div>
                    <div className="perlin-right-col">
                        <div className="perlin-controls-panel">
                            <div className="perlin-controls-title">Controls</div>
                            <div className="perlin-control-group">
                                <label className="perlin-label">Noise Type</label>
                                <div className="perlin-grid-two">
                                    {["perlin", "value", "fbm", "ridged"].map((n) => <button key={n} onClick={() => setNoiseType(n)} className={`perlin-scheme-btn ${noiseType === n ? "active" : ""}`}>{n}</button>)}
                                </div>
                                <label className="perlin-label">Output Type</label>
                                <div className="perlin-grid-two">
                                    {["clouds", "terrain", "water", "smoke", "lava", "marble", "wood", "abstract"].map((n) => <button key={n} onClick={() => setOutputType(n)} className={`perlin-scheme-btn ${outputType === n ? "active" : ""}`}>{n}</button>)}
                                </div>
                                <label className="perlin-label">Palette</label>
                                <div className="perlin-grid-two">
                                    {palettes.map((p) => <button key={p} onClick={() => setColorPalette(p)} className={`perlin-scheme-btn ${colorPalette === p ? "active" : ""}`}>{p}</button>)}
                                </div>
                            </div>
                            <div className="perlin-control-group">
                                <label className="perlin-label">Scale: {scale}</label><input type="range" min="1" max="200" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Octaves: {octaves}</label><input type="range" min="1" max="8" value={octaves} onChange={(e) => setOctaves(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Persistence: {persistence.toFixed(2)}</label><input type="range" min="0" max="1" step="0.01" value={persistence} onChange={(e) => setPersistence(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Lacunarity: {lacunarity.toFixed(2)}</label><input type="range" min="1" max="4" step="0.1" value={lacunarity} onChange={(e) => setLacunarity(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Brightness: {brightness.toFixed(2)}</label><input type="range" min="0" max="2" step="0.01" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Contrast: {contrast.toFixed(2)}</label><input type="range" min="0" max="3" step="0.01" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Turbulence: {turbulence.toFixed(2)}</label><input type="range" min="0" max="2" step="0.01" value={turbulence} onChange={(e) => setTurbulence(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Resolution: {resolution}px</label><input type="range" min="256" max="2048" step="256" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Export Resolution: {exportResolution}px</label><input type="range" min="512" max="4096" step="512" value={exportResolution} onChange={(e) => setExportResolution(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Tiling X: {tilingX.toFixed(2)}</label><input type="range" min="0.2" max="4" step="0.1" value={tilingX} onChange={(e) => setTilingX(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Tiling Y: {tilingY.toFixed(2)}</label><input type="range" min="0.2" max="4" step="0.1" value={tilingY} onChange={(e) => setTilingY(Number(e.target.value))} className="perlin-range" />
                            </div>
                            <div className="perlin-control-group">
                                <label className="perlin-check"><input type="checkbox" checked={isAnimating} onChange={(e) => setIsAnimating(e.target.checked)} className="perlin-check-input" /> Auto Animate</label>
                                <label className="perlin-check"><input type="checkbox" checked={seamless} onChange={(e) => setSeamless(e.target.checked)} className="perlin-check-input" /> Seamless</label>
                                <label className="perlin-label">Animation Speed: {animationSpeed.toFixed(3)}</label><input type="range" min="0.001" max="0.1" step="0.001" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} className="perlin-range" />
                                <label className="perlin-label">Quality Mode</label>
                                <div className="perlin-grid-two">
                                    {["fast", "high"].map((m) => <button key={m} onClick={() => setQualityMode(m)} className={`perlin-scheme-btn ${qualityMode === m ? "active" : ""}`}>{m}</button>)}
                                </div>
                                <label className="perlin-label">Layer 1 Blend</label>
                                <div className="perlin-grid-two">
                                    {["add", "multiply", "overlay"].map((m) => (
                                        <button key={m} onClick={() => setActiveLayers((l) => [{ ...l[0], blend: m }, l[1]])} className={`perlin-scheme-btn ${activeLayers[0].blend === m ? "active" : ""}`}>{m}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="perlin-control-group">
                                <label className="perlin-label">Seed</label>
                                <div className="perlin-grid-two">
                                    <input type="number" value={seed} onChange={(e) => { const s = Number(e.target.value); setSeed(s); addSeedHistory(s); }} className="perlin-select" />
                                    <button onClick={randomizeSeed} className="perlin-scheme-btn">Random Seed</button>
                                </div>
                                <div className="perlin-grid-two">
                                    <button onClick={toggleFavoriteSeed} className="perlin-scheme-btn">Favorite Seed</button>
                                    <button onClick={savePreset} className="perlin-scheme-btn">Save Preset</button>
                                </div>
                                <div className="perlin-help">History: {seedHistory.slice(0, 3).join(", ") || "none"} | Favorites: {favoriteSeeds.slice(0, 3).join(", ") || "none"}</div>
                                {savedPresets.length > 0 && (
                                    <div className="perlin-grid-two">
                                        {savedPresets.slice(0, 6).map((p, i) => <button key={`${p.name}-${i}`} onClick={() => applyPreset(p)} className="perlin-scheme-btn">{p.name}</button>)}
                                    </div>
                                )}
                            </div>
                            <div className="perlin-actions-card">
                                <div className="perlin-actions-list">
                                    <button onClick={exportPng} className="perlin-btn tool-btn-primary">Export PNG</button>
                                    <button onClick={exportMapPack} className="perlin-btn tool-btn-secondary">Export Map Pack ZIP</button>
                                    <button onClick={startVideoExport} className="perlin-btn tool-btn-secondary">Export Animation WebM</button>
                                    <button onClick={randomPalette} className="perlin-btn tool-btn-muted">Random Palette</button>
                                    <button onClick={exportPaletteJSON} className="perlin-btn tool-btn-muted">Export Palette JSON</button>
                                    <label className="perlin-btn tool-btn-muted" style={{ textAlign: "center" }}>
                                        Import Palette JSON
                                        <input type="file" accept="application/json" onChange={importPaletteJSON} style={{ display: "none" }} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="perlin-description">
                    <section className="perlin-section">
                        <div className="perlin-section-head">
                            <h2 className="perlin-section-title">How to Use</h2>
                            <p className="perlin-section-subtitle">
                                Generate procedural textures, tune controls, and export production-ready maps.
                            </p>
                        </div>
                        <div className="perlin-feature-grid">
                            <article className="perlin-feature-card">
                                <h3 className="perlin-feature-title">1. Choose Noise and Output</h3>
                                <p className="perlin-feature-text">
                                    Start with a noise algorithm and visual output mode such as clouds, terrain, water, lava, or marble.
                                </p>
                            </article>
                            <article className="perlin-feature-card">
                                <h3 className="perlin-feature-title">2. Tune Detail</h3>
                                <p className="perlin-feature-text">
                                    Use scale, octaves, persistence, lacunarity, contrast, and brightness to shape the final look.
                                </p>
                            </article>
                            <article className="perlin-feature-card">
                                <h3 className="perlin-feature-title">3. Export Assets</h3>
                                <p className="perlin-feature-text">
                                    Export PNG, map-pack ZIP, and animation output for game materials, VFX, and generative art workflows.
                                </p>
                            </article>
                        </div>
                    </section>

                    <section className="perlin-section">
                        <div className="perlin-section-head">
                            <h2 className="perlin-section-title">Features</h2>
                            <p className="perlin-section-subtitle">
                                Built for real-time experimentation and production export pipelines.
                            </p>
                        </div>
                        <div className="perlin-feature-grid">
                            <article className="perlin-feature-card">
                                <h3 className="perlin-feature-title">Procedural Noise Engine</h3>
                                <p className="perlin-feature-text">
                                    Perlin, value, FBM, and ridged generation with seed control and dynamic noise layering.
                                </p>
                            </article>
                            <article className="perlin-feature-card">
                                <h3 className="perlin-feature-title">Advanced Visual Modes</h3>
                                <p className="perlin-feature-text">
                                    Create clouds, terrain, smoke, lava, water, wood, marble, and abstract procedural patterns.
                                </p>
                            </article>
                            <article className="perlin-feature-card">
                                <h3 className="perlin-feature-title">Creator Workflow Tools</h3>
                                <p className="perlin-feature-text">
                                    Preset saving, palette import/export, seed history, favorites, adaptive preview quality, and map-pack export.
                                </p>
                            </article>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
