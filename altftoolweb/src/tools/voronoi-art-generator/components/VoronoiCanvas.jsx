"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const VoronoiCanvas = forwardRef(
    (
        {
            pointCount,
            colorScheme,
            cellBorder,
            borderColor,
            borderWidth,
            animationSpeed,
            useGradient,
            seed,
            cellOpacity = 1,
            pixelSize = 2,
            showSeedPoints = true,
            interactiveSeeds = true,
            borderSensitivity = 2,
            borderLimit = 8,
            symmetryMode = false,
            gradientColorStart = "#3b82f6",
            gradientColorEnd = "#ec4899",
            seedPointColor = "#ffffff",
            seedPointSize = 4,
            symmetryAxis = "vertical",
            showSymmetryAxisLine = true,
        },
        ref
    ) => {
        const internalRef = useRef(null);
        const animationRef = useRef(null);
        const pointsRef = useRef([]);
        const seedRef = useRef(seed);
        const dragStateRef = useRef({
            isDragging: false,
            dragPointId: null,
        });

        // Seeded random number generator for reproducibility
        const seededRandom = (seedValue) => {
            const x = Math.sin(seedValue) * 10000;
            return x - Math.floor(x);
        };

        const generatePoints = () => {
            const canvas = internalRef.current;
            if (!canvas) return;

            const points = [];
            const { width, height } = canvas;

            for (let i = 0; i < pointCount; i++) {
                const randomX = seededRandom(seedRef.current + i);
                const randomY = seededRandom(seedRef.current + i + 1000);

                points.push({
                    x: randomX * width,
                    y: randomY * height,
                    id: i,
                });
            }

            pointsRef.current = points;
        };

        const getColorScheme = () => {
            const schemes = {
                rainbow: [
                    "#FF0000",
                    "#FF7F00",
                    "#FFFF00",
                    "#00FF00",
                    "#0000FF",
                    "#4B0082",
                    "#9400D3",
                ],
                pastel: [
                    "#FFB3BA",
                    "#FFCCCB",
                    "#FFFFBA",
                    "#BAE1FF",
                    "#BAC2F0",
                    "#E0BBE4",
                    "#FFDFD3",
                ],
                dark: [
                    "#1a1a2e",
                    "#16213e",
                    "#0f3460",
                    "#533483",
                    "#2d1b4e",
                    "#1f0f3d",
                    "#4a0e4e",
                ],
                neon: [
                    "#FF006E",
                    "#FB5607",
                    "#FFBE0B",
                    "#8338EC",
                    "#3A86FF",
                    "#06FFA5",
                    "#FF006E",
                ],
                sunset: [
                    "#FF6B6B",
                    "#FFA06B",
                    "#FFD06B",
                    "#FFEB6B",
                    "#D4A574",
                    "#C08147",
                    "#A0522D",
                ],
                ocean: [
                    "#001F3F",
                    "#003D82",
                    "#0066CC",
                    "#0099FF",
                    "#00D4FF",
                    "#00E6FF",
                    "#66FFFF",
                ],
                forest: [
                    "#1a3a1a",
                    "#2d5a2d",
                    "#3d7a3d",
                    "#4a9d4a",
                    "#5fbf5f",
                    "#7fd87f",
                    "#9ddb9d",
                ],
                candy: [
                    "#FF69B4",
                    "#FFB6D9",
                    "#FFD9E6",
                    "#FFC0CB",
                    "#FF1493",
                    "#FF69B4",
                    "#FFB6C1",
                ],
                arctic: [
                    "#E0F7FF",
                    "#B3E5FC",
                    "#81D4FA",
                    "#4FC3F7",
                    "#29B6F6",
                    "#03A9F4",
                    "#039BE5",
                ],
                volcano: [
                    "#000000",
                    "#330000",
                    "#660000",
                    "#990000",
                    "#CC0000",
                    "#FF3300",
                    "#FF6600",
                    "#FF9900",
                    "#FFCC00",
                ],
                cyberpunk: [
                    "#00FFFF",
                    "#FF00FF",
                    "#00FF00",
                    "#FFFF00",
                    "#FF0080",
                    "#00FFFF",
                    "#FF00FF",
                ],
                vintage: [
                    "#8B7355",
                    "#A0826D",
                    "#BC9A6A",
                    "#CD853F",
                    "#DAA520",
                    "#D2B48C",
                    "#DEB887",
                ],
            };

            return schemes[colorScheme] || schemes.rainbow;
        };

        const getColorForPoint = (pointIndex) => {
            const colors = getColorScheme();
            return colors[pointIndex % colors.length];
        };

        const distance = (p1, p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const getPointerPosition = (event, canvas) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: ((event.clientX - rect.left) * canvas.width) / rect.width,
                y: ((event.clientY - rect.top) * canvas.height) / rect.height,
            };
        };

        const findClosestPointIndex = (x, y) => {
            let closestIndex = -1;
            let closestDistance = Number.POSITIVE_INFINITY;
            for (let i = 0; i < pointsRef.current.length; i++) {
                const d = distance({ x, y }, pointsRef.current[i]);
                if (d < closestDistance) {
                    closestDistance = d;
                    closestIndex = i;
                }
            }
            return { closestIndex, closestDistance };
        };

        const getWorkingPoints = (canvas) => {
            if (!symmetryMode) return pointsRef.current;
            const mirrored = pointsRef.current.map((point) => {
                if (symmetryAxis === "horizontal") {
                    return {
                        x: point.x,
                        y: canvas.height - point.y,
                        id: `m-${point.id}`,
                    };
                }
                return {
                    x: canvas.width - point.x,
                    y: point.y,
                    id: `m-${point.id}`,
                };
            });
            return [...pointsRef.current, ...mirrored];
        };

        useImperativeHandle(ref, () => ({
            toDataURL: (type = "image/png", quality) => {
                if (!internalRef.current) return null;
                return internalRef.current.toDataURL(type, quality);
            },
            relaxSeeds: (iterations = 1) => {
                const canvas = internalRef.current;
                if (!canvas || pointsRef.current.length === 0) return false;

                const { width, height } = canvas;
                const sampleStep = Math.max(6, pixelSize * 3);

                for (let step = 0; step < iterations; step++) {
                    const accum = new Map();
                    pointsRef.current.forEach((point) => {
                        accum.set(point.id, { sumX: 0, sumY: 0, count: 0 });
                    });

                    for (let x = 0; x < width; x += sampleStep) {
                        for (let y = 0; y < height; y += sampleStep) {
                            let closestPoint = pointsRef.current[0];
                            let closestDistance = distance({ x, y }, closestPoint);

                            for (let i = 1; i < pointsRef.current.length; i++) {
                                const d = distance({ x, y }, pointsRef.current[i]);
                                if (d < closestDistance) {
                                    closestDistance = d;
                                    closestPoint = pointsRef.current[i];
                                }
                            }

                            const bucket = accum.get(closestPoint.id);
                            if (!bucket) continue;
                            bucket.sumX += x;
                            bucket.sumY += y;
                            bucket.count += 1;
                        }
                    }

                    pointsRef.current = pointsRef.current.map((point) => {
                        const bucket = accum.get(point.id);
                        if (!bucket || bucket.count === 0) return point;
                        return {
                            ...point,
                            x: bucket.sumX / bucket.count,
                            y: bucket.sumY / bucket.count,
                        };
                    });
                }

                return true;
            },
        }));

        const drawVoronoi = () => {
            const canvas = internalRef.current;
            if (!canvas) return;
            if (pointsRef.current.length === 0) return;

            const ctx = canvas.getContext("2d");
            const { width, height } = canvas;
            const workingPoints = getWorkingPoints(canvas);
            if (workingPoints.length === 0) return;

            // Clear canvas
            ctx.fillStyle = useGradient ? "#f3f4f6" : "#ffffff";
            ctx.fillRect(0, 0, width, height);

            // Add gradient background if enabled
            if (useGradient) {
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, gradientColorStart);
                gradient.addColorStop(0.5, "#ffffff");
                gradient.addColorStop(1, gradientColorEnd);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            // Draw Voronoi cells
            for (let x = 0; x < width; x += pixelSize) {
                for (let y = 0; y < height; y += pixelSize) {
                    let closestPoint = workingPoints[0];
                    let closestDistance = distance({ x, y }, closestPoint);

                    // Find closest point
                    for (let i = 1; i < workingPoints.length; i++) {
                        const d = distance({ x, y }, workingPoints[i]);
                        if (d < closestDistance) {
                            closestDistance = d;
                            closestPoint = workingPoints[i];
                        }
                    }

                    const color = getColorForPoint(closestPoint.id);
                    // Convert hex to RGB
                    const hexToRgb = (hex) => {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                        return result ? [
                            parseInt(result[1], 16),
                            parseInt(result[2], 16),
                            parseInt(result[3], 16)
                        ] : [255, 255, 255];
                    };
                    const rgb = hexToRgb(color);
                    ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${cellOpacity})`;
                    ctx.fillRect(x, y, pixelSize, pixelSize);
                }
            }

            // Draw cell borders
            if (cellBorder) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;

                for (let x = 0; x < width; x += 3) {
                    for (let y = 0; y < height; y += 3) {
                        let closestPoint = workingPoints[0];
                        let closestDistance = distance({ x, y }, closestPoint);
                        for (let i = 1; i < workingPoints.length; i++) {
                            const d = distance({ x, y }, workingPoints[i]);
                            if (d < closestDistance) {
                                closestDistance = d;
                                closestPoint = workingPoints[i];
                            }
                        }

                        let isBorder = false;
                        for (let i = 0; i < workingPoints.length; i++) {
                            const point = workingPoints[i];
                            if (point.id === closestPoint.id) continue;

                            const d = distance({ x, y }, point);
                            if (Math.abs(d - closestDistance) < borderSensitivity) {
                                isBorder = true;
                                break;
                            }
                        }

                        if (isBorder && closestDistance < borderLimit) {
                            ctx.fillStyle = borderColor;
                            ctx.fillRect(x, y, 3, 3);
                        }
                    }
                }
            }

            // Apply a visible tint overlay so gradient mode is clearly noticeable.
            if (useGradient) {
                const overlay = ctx.createLinearGradient(0, 0, width, height);
                overlay.addColorStop(0, `${gradientColorStart}33`);
                overlay.addColorStop(0.5, "rgba(16,185,129,0.10)");
                overlay.addColorStop(1, `${gradientColorEnd}33`);
                ctx.fillStyle = overlay;
                ctx.fillRect(0, 0, width, height);
            }

            if (showSeedPoints) {
                workingPoints.forEach((point) => {
                    ctx.fillStyle = seedPointColor;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, seedPointSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(0,0,0,0.75)";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                });
            }

            if (symmetryMode && showSymmetryAxisLine) {
                ctx.save();
                ctx.setLineDash([6, 6]);
                ctx.strokeStyle = "rgba(0,0,0,0.45)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                if (symmetryAxis === "horizontal") {
                    ctx.moveTo(0, height / 2);
                    ctx.lineTo(width, height / 2);
                } else {
                    ctx.moveTo(width / 2, 0);
                    ctx.lineTo(width / 2, height);
                }
                ctx.stroke();
                ctx.restore();
            }
        };

        const animate = () => {
            drawVoronoi();

            if (animationSpeed > 0) {
                // Add animation logic if needed
                pointsRef.current.forEach((point) => {
                    point.x += (Math.random() - 0.5) * animationSpeed;
                    point.y += (Math.random() - 0.5) * animationSpeed;

                    // Keep points in bounds
                    point.x = Math.max(0, Math.min(internalRef.current.width, point.x));
                    point.y = Math.max(0, Math.min(internalRef.current.height, point.y));
                });
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        useEffect(() => {
            seedRef.current = seed;
            generatePoints();
        }, [pointCount, seed]);

        useEffect(() => {
            const canvas = internalRef.current;
            if (!canvas || !interactiveSeeds) return undefined;

            const dragHitRadius = 14;
            const removeHitRadius = 18;

            const onPointerDown = (event) => {
                const pos = getPointerPosition(event, canvas);
                const { closestIndex, closestDistance } = findClosestPointIndex(pos.x, pos.y);

                if (closestIndex !== -1 && closestDistance <= dragHitRadius) {
                    dragStateRef.current.isDragging = true;
                    dragStateRef.current.dragPointId = pointsRef.current[closestIndex].id;
                    canvas.style.cursor = "grabbing";
                    return;
                }

                const nextId = pointsRef.current.length
                    ? Math.max(...pointsRef.current.map((p) => p.id)) + 1
                    : 0;
                pointsRef.current.push({ x: pos.x, y: pos.y, id: nextId });
            };

            const onPointerMove = (event) => {
                if (!dragStateRef.current.isDragging) return;
                const pos = getPointerPosition(event, canvas);
                const target = pointsRef.current.find(
                    (point) => point.id === dragStateRef.current.dragPointId
                );
                if (!target) return;
                target.x = Math.max(0, Math.min(canvas.width, pos.x));
                target.y = Math.max(0, Math.min(canvas.height, pos.y));
            };

            const onPointerUp = () => {
                dragStateRef.current.isDragging = false;
                dragStateRef.current.dragPointId = null;
                canvas.style.cursor = "crosshair";
            };

            const onContextMenu = (event) => {
                event.preventDefault();
                const pos = getPointerPosition(event, canvas);
                const { closestIndex, closestDistance } = findClosestPointIndex(pos.x, pos.y);

                if (
                    closestIndex !== -1 &&
                    closestDistance <= removeHitRadius &&
                    pointsRef.current.length > 1
                ) {
                    pointsRef.current.splice(closestIndex, 1);
                }
            };

            canvas.style.cursor = "crosshair";
            canvas.addEventListener("pointerdown", onPointerDown);
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
            canvas.addEventListener("contextmenu", onContextMenu);

            return () => {
                canvas.removeEventListener("pointerdown", onPointerDown);
                window.removeEventListener("pointermove", onPointerMove);
                window.removeEventListener("pointerup", onPointerUp);
                canvas.removeEventListener("contextmenu", onContextMenu);
                canvas.style.cursor = "";
            };
        }, [interactiveSeeds, symmetryMode]);

        useEffect(() => {
            const canvas = internalRef.current;
            if (!canvas) return;

            // Set canvas size to match container
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = Math.min(600, rect.height);

            generatePoints();
            animate();

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }, []);

        useEffect(() => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            animate();
        }, [
            colorScheme,
            cellBorder,
            borderColor,
            borderWidth,
            useGradient,
            pointCount,
            pixelSize,
            cellOpacity,
            animationSpeed,
            seed,
            showSeedPoints,
            borderSensitivity,
            borderLimit,
            gradientColorStart,
            gradientColorEnd,
            seedPointColor,
            seedPointSize,
            symmetryAxis,
            showSymmetryAxisLine,
        ]);

        return (
            <div className="voronoi-canvas-wrap">
                <canvas ref={internalRef} className="voronoi-canvas-el" />
            </div>
        );
    }
);

VoronoiCanvas.displayName = "VoronoiCanvas";

export default VoronoiCanvas;
