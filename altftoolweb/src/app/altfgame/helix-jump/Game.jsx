'use client';

import { useRef, useEffect, useState, useLayoutEffect, useCallback } from "react";

// ==========================================
// SOUND ENGINE (Web Audio API — no deps)
// ==========================================

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterGain = null;
        this._comboNotes = [261, 294, 329, 349, 392, 440, 494, 523]; // C major scale
    }

    _getCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.35;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") this.ctx.resume();
        return this.ctx;
    }

    _play(fn) {
        if (this.muted) return;
        try { fn(this._getCtx()); } catch (e) { }
    }

    // Short tone helper
    _tone(freq, type, duration, gainVal, startTime, ctx, extraFn) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        if (extraFn) extraFn(osc, g, startTime);
        g.gain.setValueAtTime(gainVal, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.01);
    }

    // Ball passes through a hole — satisfying "whoosh + ping"
    passThrough(comboCount = 1) {
        this._play((ctx) => {
            const t = ctx.currentTime;
            const note = this._comboNotes[Math.min(comboCount - 1, 7)];
            // Ping
            this._tone(note * 2, "sine", 0.18, 0.4, t, ctx);
            // Harmonic overtone
            this._tone(note * 4, "sine", 0.12, 0.15, t + 0.02, ctx);
            // Whoosh sweep
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, t);
            osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
            g.gain.setValueAtTime(0.08, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            osc.connect(g); g.connect(this.masterGain);
            osc.start(t); osc.stop(t + 0.15);
        });
    }

    // Ball bounces off platform — thud
    bounce() {
        this._play((ctx) => {
            const t = ctx.currentTime;
            // Low thud
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(120, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
            g.gain.setValueAtTime(0.5, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.connect(g); g.connect(this.masterGain);
            osc.start(t); osc.stop(t + 0.12);
            // Snap click
            this._tone(900, "square", 0.03, 0.12, t, ctx);
        });
    }

    // Combo — ascending arp + sparkle
    combo(count) {
        this._play((ctx) => {
            const t = ctx.currentTime;
            for (let i = 0; i < Math.min(count, 5); i++) {
                const note = this._comboNotes[i % 8];
                this._tone(note * 2, "sine", 0.2, 0.3, t + i * 0.06, ctx);
                this._tone(note * 4, "triangle", 0.12, 0.1, t + i * 0.06 + 0.01, ctx);
            }
            // Final sparkle burst
            this._tone(this._comboNotes[Math.min(count, 7)] * 4, "sine", 0.3, 0.35, t + count * 0.06, ctx);
        });
    }

    // SMASH — big crunch + explosion
    smash() {
        this._play((ctx) => {
            const t = ctx.currentTime;
            // Noise burst
            const bufSize = ctx.sampleRate * 0.15;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const noiseGain = ctx.createGain();
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "bandpass";
            noiseFilter.frequency.value = 400;
            noiseGain.gain.setValueAtTime(0.6, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(this.masterGain);
            noise.start(t); noise.stop(t + 0.2);
            // Sub boom
            this._tone(55, "sine", 0.25, 0.8, t, ctx);
            this._tone(80, "sawtooth", 0.15, 0.4, t + 0.02, ctx);
            // High crack
            this._tone(1200, "square", 0.05, 0.25, t, ctx);
        });
    }

    // Game over — descending sad tones
    gameOver() {
        this._play((ctx) => {
            const t = ctx.currentTime;
            const notes = [392, 349, 294, 220];
            notes.forEach((n, i) => {
                this._tone(n, "triangle", 0.35, 0.4, t + i * 0.18, ctx);
                this._tone(n / 2, "sine", 0.3, 0.2, t + i * 0.18, ctx);
            });
            // Final low rumble
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(110, t + 0.7);
            osc.frequency.exponentialRampToValueAtTime(30, t + 1.2);
            g.gain.setValueAtTime(0.3, t + 0.7);
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(g); g.connect(this.masterGain);
            osc.start(t + 0.7); osc.stop(t + 1.3);
        });
    }

    // Level complete — triumphant fanfare
    levelComplete() {
        this._play((ctx) => {
            const t = ctx.currentTime;
            // Rising chord arp
            const melody = [523, 659, 784, 1047];
            melody.forEach((n, i) => {
                this._tone(n, "sine", 0.4, 0.35, t + i * 0.1, ctx);
                this._tone(n * 1.5, "sine", 0.2, 0.15, t + i * 0.1 + 0.05, ctx);
            });
            // Sparkle tail
            for (let i = 0; i < 6; i++) {
                const sparkFreq = 800 + Math.random() * 1200;
                this._tone(sparkFreq, "sine", 0.15, 0.1, t + 0.4 + i * 0.04, ctx);
            }
        });
    }

    // Level start — "ready" blip
    levelStart() {
        this._play((ctx) => {
            const t = ctx.currentTime;
            this._tone(440, "sine", 0.1, 0.3, t, ctx);
            this._tone(660, "sine", 0.15, 0.35, t + 0.12, ctx);
            this._tone(880, "sine", 0.2, 0.4, t + 0.24, ctx);
        });
    }

    // Trap hit warning (just before game over — instant)
    trapHit() {
        this._play((ctx) => {
            const t = ctx.currentTime;
            this._tone(200, "sawtooth", 0.05, 0.5, t, ctx);
            this._tone(150, "square", 0.05, 0.4, t + 0.02, ctx);
        });
    }

    setMuted(val) { this.muted = val; }
}

const soundEngine = new SoundEngine();

// ==========================================
// CONFIGURATION & THEMES
// ==========================================

const THEMES = [
    {
        bgTop: "#0a0a1a",
        bgBottom: "#1a0a2e",
        pole: "#4a2070",
        ball: "#ff4fa3",
        platform: "#7c3aed",
        trail: "#ff80c8",
        accent: "#c084fc",
        nebula: "#7c3aed",
    },
    {
        bgTop: "#0a1628",
        bgBottom: "#001a3a",
        pole: "#1e40af",
        ball: "#f97316",
        platform: "#0ea5e9",
        trail: "#fed7aa",
        accent: "#38bdf8",
        nebula: "#0ea5e9",
    },
    {
        bgTop: "#1a0a00",
        bgBottom: "#2d1200",
        pole: "#92400e",
        ball: "#fbbf24",
        platform: "#f97316",
        trail: "#fde68a",
        accent: "#fb923c",
        nebula: "#f97316",
    },
    {
        bgTop: "#000d1a",
        bgBottom: "#00111f",
        pole: "#064e3b",
        ball: "#34d399",
        platform: "#06b6d4",
        trail: "#6ee7b7",
        accent: "#22d3ee",
        nebula: "#34d399",
    },
    {
        bgTop: "#1a001a",
        bgBottom: "#2d002d",
        pole: "#701a75",
        ball: "#f0abfc",
        platform: "#e879f9",
        trail: "#fce7f3",
        accent: "#d946ef",
        nebula: "#e879f9",
    },
    {
        bgTop: "#0f0a00",
        bgBottom: "#1a1200",
        pole: "#713f12",
        ball: "#fb923c",
        platform: "#eab308",
        trail: "#fde047",
        accent: "#facc15",
        nebula: "#eab308",
    },
];

const getResponsiveConfig = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 400;
    const ballRadius = w < 480 ? 11 : w < 768 ? 14 : w < 1280 ? 18 : 22;
    return { ballRadius };
};

const CONFIG = {
    gravity: 0.58,
    bounceSpeed: -6.0,
    terminalVelocity: 14,
    rotationSpeed: 0.006,
    buttonRotationSpeed: 0.08,
    friction: 0.6,
    platformGap: 175,
    ballRadius: getResponsiveConfig().ballRadius,
    platformRadius: 110,
    poleRadius: 30,
    renderScaleY: 0.35,
};

// ==========================================
// ANIMATED BACKGROUND CANVAS
// ==========================================

function AnimatedBackground({ theme }) {
    const bgRef = useRef(null);
    const animRef = useRef(null);
    const starsRef = useRef([]);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = bgRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        starsRef.current = Array.from({ length: 180 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.5 + 0.3,
            pulse: Math.random() * Math.PI * 2,
            speed: 0.005 + Math.random() * 0.015,
            twinkle: 0.3 + Math.random() * 0.7,
        }));

        particlesRef.current = Array.from({ length: 8 }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 40 + Math.random() * 120,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            phase: (i / 8) * Math.PI * 2,
        }));

        let t = 0;
        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            t += 0.008;

            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, theme.bgTop);
            g.addColorStop(1, theme.bgBottom);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            particlesRef.current.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -p.r) p.x = w + p.r;
                if (p.x > w + p.r) p.x = -p.r;
                if (p.y < -p.r) p.y = h + p.r;
                if (p.y > h + p.r) p.y = -p.r;

                const alpha = 0.04 + Math.sin(t + p.phase) * 0.02;
                const og = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                og.addColorStop(
                    0,
                    theme.nebula +
                    Math.round(alpha * 255)
                        .toString(16)
                        .padStart(2, "0"),
                );
                og.addColorStop(1, "transparent");
                ctx.fillStyle = og;
                ctx.fillRect(0, 0, w, h);
            });

            starsRef.current.forEach((s) => {
                s.pulse += s.speed;
                const alpha = s.twinkle * (0.5 + 0.5 * Math.sin(s.pulse));
                const gx = ctx.createRadialGradient(
                    s.x * w, s.y * h, 0,
                    s.x * w, s.y * h, s.r * 2,
                );
                gx.addColorStop(0, `rgba(255,255,255,${alpha})`);
                gx.addColorStop(1, "transparent");
                ctx.fillStyle = gx;
                ctx.beginPath();
                ctx.arc(s.x * w, s.y * h, s.r * 2, 0, Math.PI * 2);
                ctx.fill();
            });

            const scanY = ((t * 30) % (h + 200)) - 100;
            const scanGrad = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 80);
            scanGrad.addColorStop(0, "transparent");
            scanGrad.addColorStop(0.5, theme.accent + "08");
            scanGrad.addColorStop(1, "transparent");
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 80, w, 160);

            const botGlow = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.8);
            botGlow.addColorStop(0, theme.nebula + "20");
            botGlow.addColorStop(1, "transparent");
            ctx.fillStyle = botGlow;
            ctx.fillRect(0, 0, w, h);

            animRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animRef.current);
        };
    }, [theme]);

    return (
        <canvas
            ref={bgRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    );
}

// ==========================================
// MAIN GAME COMPONENT
// ==========================================

export default function HelixLevels() {
    const [gameState, setGameState] = useState("MENU");
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
    const [comboMessage, setComboMessage] = useState(null);
    const [levelAnim, setLevelAnim] = useState(false);
    const [soundMuted, setSoundMuted] = useState(false);

    const canvasRef = useRef(null);
    const loopRef = useRef(null);
    const drawRef = useRef(null);
    const updateRef = useRef(null);

    const game = useRef({
        ball: { y: 0, velocity: 0, trail: [] },
        cameraY: 0,
        towerRotation: 0,
        rotVelocity: 0,
        platforms: [],
        particles: [],
        floatingTexts: [],
        levelHeight: 0,
        score: 0,
        combo: 0,
        lastTime: 0,
        isRunning: false,
    });

    const input = useRef({
        dragging: false,
        lastX: 0,
        holdingLeft: false,
        holdingRight: false,
    });

    useEffect(() => {
        soundEngine.setMuted(soundMuted);
    }, [soundMuted]);

    const toggleMute = useCallback(() => {
        setSoundMuted(prev => {
            soundEngine.setMuted(!prev);
            return !prev;
        });
    }, []);

    useEffect(() => {
        const savedBest = localStorage.getItem("helix-card-best");
        if (savedBest) setHighScore(parseInt(savedBest, 10));
        const savedLevel = localStorage.getItem("helix-card-level");
        if (savedLevel) setLevel(Math.min(parseInt(savedLevel, 10), 50));
    }, []);

    useEffect(() => {
        const themeIndex = Math.floor((level - 1) / 5) % THEMES.length;
        setCurrentTheme(THEMES[themeIndex]);
    }, [level]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== "PLAYING") return;
            if (e.key === "ArrowLeft") input.current.holdingLeft = true;
            if (e.key === "ArrowRight") input.current.holdingRight = true;
        };
        const handleKeyUp = (e) => {
            if (e.key === "ArrowLeft") input.current.holdingLeft = false;
            if (e.key === "ArrowRight") input.current.holdingRight = false;
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [gameState]);

    useEffect(() => {
        return () => {
            if (game.current) {
                game.current.isRunning = false;
            }
            soundEngine.setMuted(true);
            if (soundEngine.ctx && soundEngine.ctx.state === "running") {
                soundEngine.ctx.suspend().catch(() => { });
            }
        };
    }, []);

    const startLevel = (lvl) => {
        const platformCount = 25 + lvl * 4;
        const holeSize = Math.max(0.35, 0.65 - lvl * 0.01);
        const trapChance = Math.min(0.9, 0.1 + lvl * 0.04);

        game.current.ball = { y: -50, velocity: 0, trail: [] };
        game.current.cameraY = -250;
        game.current.towerRotation = 0;
        game.current.rotVelocity = 0;
        game.current.particles = [];
        game.current.floatingTexts = [];
        game.current.platforms = [];
        game.current.combo = 0;
        game.current.score = 0;
        game.current.lastTime = performance.now();
        game.current.accumulator = 0;
        game.current.levelHeight = platformCount * CONFIG.platformGap;
        input.current.holdingLeft = false;
        input.current.holdingRight = false;

        for (let i = 0; i <= platformCount; i++) {
            const isFirst = i === 0;
            const isLast = i === platformCount;
            const y = i * CONFIG.platformGap;
            let type = "NORMAL";
            if (isFirst) type = "START";
            if (isLast) type = "GOAL";

            let holeAngle = Math.random() * Math.PI * 2;
            if (!isFirst && !isLast) {
                const prevHole = game.current.platforms[i - 1].holeAngle;
                const minDiff = lvl > 10 ? 2.0 : 1.5;
                if (Math.abs(holeAngle - prevHole) < minDiff) {
                    holeAngle = (holeAngle + Math.PI) % (Math.PI * 2);
                }
            }

            const traps = [];
            if (!isFirst && !isLast && Math.random() < trapChance) {
                const isDoubleTrap = lvl > 5 && Math.random() > 0.4;
                const trapSize = 0.45;
                const addTrap = (offset) => {
                    const angle = (holeAngle + offset) % (Math.PI * 2);
                    traps.push({ start: angle - trapSize, end: angle + trapSize });
                };
                const safeZone = holeSize + 0.6;
                const randomOffset =
                    safeZone + Math.random() * (Math.PI * 2 - safeZone * 2);
                addTrap(randomOffset);
                if (isDoubleTrap) addTrap(randomOffset + Math.PI);
            }

            game.current.platforms.push({
                y,
                holeAngle: isFirst ? Math.PI : holeAngle,
                holeSize,
                type,
                traps,
                passed: false,
                shatter: false,
                color: type === "GOAL" ? "#f1c40f" : isFirst ? "#bdc3c7" : null,
            });
        }

        setScore(0);
        game.current.isRunning = true;
        setGameState("PLAYING");
        soundEngine.levelStart();
        setTimeout(() => {
            requestAnimationFrame((ts) => loopRef.current && loopRef.current(ts));
        }, 0);
    };

    const nextLevel = () => {
        if (level >= 50) {
            setGameState("VICTORY");
        } else {
            const next = level + 1;
            setLevel(next);
            localStorage.setItem("helix-card-level", next);
            startLevel(next);
        }
    };

    const retryLevel = () => startLevel(level);

    const createParticles = (y, color, count = 6, speedMult = 1) => {
        for (let i = 0; i < count; i++) {
            game.current.particles.push({
                y,
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() * 0.15 + 0.05) * speedMult,
                life: 1.0,
                color,
                vy: (Math.random() - 0.5) * 0.1,
                radius: 6,
            });
        }
    };

    const addFloatingText = (text, y, color = "#fff") => {
        game.current.floatingTexts.push({ y, text, life: 1.0, color });
    };

    const FIXED_STEP = 16;
    const loop = (timestamp) => {
        if (!game.current.isRunning) return;
        const raw = timestamp - game.current.lastTime;
        game.current.lastTime = timestamp;
        game.current.accumulator =
            (game.current.accumulator || 0) + Math.min(raw, 50);
        if (game.current.accumulator >= FIXED_STEP) {
            updateRef.current(FIXED_STEP);
            game.current.accumulator -= FIXED_STEP;
        }
        drawRef.current();
        requestAnimationFrame((ts) => loopRef.current && loopRef.current(ts));
    };

    const update = (dt) => {
        const g = game.current;
        const inp = input.current;

        if (!inp.dragging) {
            if (inp.holdingLeft) g.rotVelocity = -CONFIG.buttonRotationSpeed;
            else if (inp.holdingRight) g.rotVelocity = CONFIG.buttonRotationSpeed;
            else {
                g.rotVelocity *= CONFIG.friction;
                if (Math.abs(g.rotVelocity) < 0.0001) g.rotVelocity = 0;
            }
        }
        const speedMult = window.innerWidth >= 768 ? 3.2 : 1.8;
        g.towerRotation += g.rotVelocity * speedMult;
        g.ball.velocity += CONFIG.gravity * speedMult;
        if (g.ball.velocity > CONFIG.terminalVelocity * speedMult)
            g.ball.velocity = CONFIG.terminalVelocity * speedMult;
        g.ball.trail.push({ y: g.ball.y, rot: g.towerRotation });
        if (g.ball.trail.length > 8) g.ball.trail.shift();

        const moveStep = g.ball.velocity;
        const nextY = g.ball.y + moveStep;

        let hitPlatform = null;
        let hitTrap = false;
        let levelComplete = false;
        const nearPlatforms = g.platforms.filter(
            (p) => Math.abs(p.y - g.ball.y) < CONFIG.platformGap + 50,
        );

        for (let p of nearPlatforms) {
            if (p.shatter) continue;
            if (
                g.ball.y <= p.y - CONFIG.ballRadius &&
                nextY >= p.y - CONFIG.ballRadius
            ) {
                let relAngle =
                    (((Math.PI / 2 - g.towerRotation) % (Math.PI * 2)) + Math.PI * 4) %
                    (Math.PI * 2);

                if (p.type === "GOAL") {
                    levelComplete = true;
                    hitPlatform = p;
                    break;
                }

                const hStart = p.holeAngle - p.holeSize / 2;
                const hEnd = p.holeAngle + p.holeSize / 2;
                const isAngleInSector = (a, s, e) => {
                    const ss = ((s % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2);
                    const ee = ((e % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2);
                    if (ss < ee) return a > ss && a < ee;
                    return a > ss || a < ee;
                };

                if (isAngleInSector(relAngle, hStart, hEnd)) {
                    if (!p.passed) {
                        p.passed = true;
                        g.combo++;
                        const points = 10 * g.combo;
                        g.score += points;
                        setScore(g.score);
                        if (g.combo > 1) {
                            addFloatingText(`COMBO x${g.combo}`, p.y, currentTheme.accent);
                            setComboMessage(g.combo);
                            setTimeout(() => setComboMessage(null), 800);
                            soundEngine.combo(g.combo);
                        } else {
                            addFloatingText(`+${points}`, p.y, currentTheme.accent);
                            soundEngine.passThrough(g.combo);
                        }
                        createParticles(p.y, currentTheme.platform, 4);
                    }
                } else {
                    if (g.combo >= 3 && p.type !== "START") {
                        p.shatter = true;
                        p.passed = true;
                        g.score += 50;
                        setScore(g.score);
                        addFloatingText("SMASH!", p.y, "#ff4757");
                        createParticles(p.y, currentTheme.platform, 18, 2.5);
                        soundEngine.smash();
                        g.combo = 0;
                        continue;
                    }

                    for (let t of p.traps) {
                        if (isAngleInSector(relAngle, t.start, t.end)) hitTrap = true;
                    }

                    if (hitTrap) {
                        soundEngine.trapHit();
                        gameOver();
                        return;
                    } else hitPlatform = p;
                }
            }
        }

        if (levelComplete) {
            g.ball.y = hitPlatform.y - CONFIG.ballRadius;
            completeLevel();
            return;
        }

        if (hitPlatform) {
            g.ball.y = hitPlatform.y - CONFIG.ballRadius;
            g.ball.velocity =
                CONFIG.bounceSpeed * (window.innerWidth >= 768 ? 2.8 : 1.8);
            g.combo = 0;
            soundEngine.bounce();
            createParticles(
                hitPlatform.y,
                hitPlatform.color || currentTheme.platform,
                4,
            );
        } else {
            g.ball.y = nextY;
        }

        const targetCamY = g.ball.y - 200;
        g.cameraY += (targetCamY - g.cameraY) * 0.1;
        const progressPerc = Math.min(1, Math.max(0, g.ball.y / g.levelHeight));
        setProgress(progressPerc);

        g.particles.forEach((p) => {
            p.life -= 0.02;
            p.y += p.vy;
            p.radius = p.life * 6;
        });
        g.particles = g.particles.filter((p) => p.life > 0);
        g.floatingTexts.forEach((t) => {
            t.life -= 0.02;
            t.y -= 0.5;
        });
        g.floatingTexts = g.floatingTexts.filter((t) => t.life > 0);
    };

    const gameOver = () => {
        game.current.isRunning = false;
        createParticles(game.current.ball.y, currentTheme.ball, 30, 2.5);
        soundEngine.gameOver();
        if (game.current.score > highScore) {
            setHighScore(game.current.score);
            localStorage.setItem("helix-card-best", game.current.score);
        }
        setGameState("GAMEOVER");
    };

    const completeLevel = () => {
        game.current.isRunning = false;
        const newScore = game.current.score + 100 * level;
        setScore(newScore);
        soundEngine.levelComplete();
        if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("helix-card-best", newScore);
        }
        setGameState("LEVEL_COMPLETE");
        setLevelAnim(true);
        setTimeout(() => setLevelAnim(false), 1000);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        const cx = w / 2;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, currentTheme.bgTop);
        bgGrad.addColorStop(1, currentTheme.bgBottom);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        const poleGrad = ctx.createLinearGradient(
            cx - CONFIG.poleRadius, 0,
            cx + CONFIG.poleRadius, 0,
        );
        poleGrad.addColorStop(0, currentTheme.bgBottom);
        poleGrad.addColorStop(0.3, currentTheme.pole + "aa");
        poleGrad.addColorStop(0.5, currentTheme.accent + "55");
        poleGrad.addColorStop(0.7, currentTheme.pole + "aa");
        poleGrad.addColorStop(1, currentTheme.bgBottom);
        ctx.fillStyle = poleGrad;
        ctx.fillRect(cx - CONFIG.poleRadius, 0, CONFIG.poleRadius * 2, h);

        ctx.shadowBlur = 15;
        ctx.shadowColor = currentTheme.accent + "66";
        ctx.fillStyle = currentTheme.accent + "22";
        ctx.fillRect(cx - CONFIG.poleRadius, 0, 2, h);
        ctx.fillRect(cx + CONFIG.poleRadius - 2, 0, 2, h);
        ctx.shadowBlur = 0;

        const visible = game.current.platforms
            .filter(
                (p) =>
                    !p.shatter &&
                    p.y > game.current.cameraY - 150 &&
                    p.y < game.current.cameraY + h + 250,
            )
            .sort((a, b) => b.y - a.y);

        visible.forEach((p) => {
            const screenY = p.y - game.current.cameraY;
            ctx.save();
            ctx.translate(cx, screenY);
            ctx.scale(1, CONFIG.renderScaleY);
            ctx.rotate(game.current.towerRotation);

            const baseColor = p.color || currentTheme.platform;

            ctx.shadowBlur = 20;
            ctx.shadowColor = baseColor + "88";

            ctx.beginPath();
            if (p.type === "GOAL") {
                ctx.arc(0, 0, CONFIG.platformRadius, 0, Math.PI * 2);
            } else {
                const start = p.holeAngle + p.holeSize / 2;
                const end = p.holeAngle - p.holeSize / 2 + Math.PI * 2;
                ctx.arc(0, 0, CONFIG.platformRadius, start, end, false);
                ctx.lineTo(0, 0);
            }

            const platGrad = ctx.createRadialGradient(0, -20, 10, 0, 0, CONFIG.platformRadius);
            platGrad.addColorStop(0, baseColor + "ee");
            platGrad.addColorStop(0.6, baseColor + "cc");
            platGrad.addColorStop(1, baseColor + "88");
            ctx.fillStyle = platGrad;
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.stroke();

            ctx.save();
            ctx.clip();
            const shineGrad = ctx.createLinearGradient(
                0, -CONFIG.platformRadius,
                0, -CONFIG.platformRadius + 15,
            );
            shineGrad.addColorStop(0, "rgba(255,255,255,0.25)");
            shineGrad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = shineGrad;
            ctx.fillRect(-CONFIG.platformRadius, -CONFIG.platformRadius, CONFIG.platformRadius * 2, 15);
            ctx.restore();

            if (p.traps && p.traps.length > 0) {
                p.traps.forEach((t) => {
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.arc(0, 0, CONFIG.platformRadius - 1, t.start, t.end, false);
                    const trapGrad = ctx.createRadialGradient(0, 0, 30, 0, 0, CONFIG.platformRadius);
                    trapGrad.addColorStop(0, "#ff4757cc");
                    trapGrad.addColorStop(1, "#ff1a2bff");
                    ctx.fillStyle = trapGrad;
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = "#ff000088";
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }

            if (p.type === "GOAL") {
                ctx.rotate(-game.current.towerRotation);
                ctx.scale(1, 1 / CONFIG.renderScaleY);
                ctx.fillStyle = "#fff";
                ctx.shadowBlur = 10;
                ctx.shadowColor = "#fff";
                ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("GOAL", 0, -20);
                ctx.shadowBlur = 0;
            }

            ctx.restore();
        });

        game.current.particles.forEach((p) => {
            const visualOffset = CONFIG.platformRadius * CONFIG.renderScaleY;
            const pY = p.y - game.current.cameraY + visualOffset;
            ctx.save();
            ctx.translate(cx, pY);
            const spread = (1 - p.life) * 55;
            ctx.translate(
                Math.cos(p.angle) * spread,
                Math.sin(p.angle) * spread * CONFIG.renderScaleY,
            );
            const r = isFinite(p.radius) && p.radius > 0 ? p.radius : 1;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            const pGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
            pGrad.addColorStop(0, p.color);
            pGrad.addColorStop(1, p.color + "00");
            ctx.fillStyle = pGrad;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.restore();
        });

        if (game.current.isRunning || gameState === "LEVEL_COMPLETE") {
            const visualOffset = CONFIG.platformRadius * CONFIG.renderScaleY;

            if (game.current.ball.trail.length > 1) {
                const trail = game.current.ball.trail;
                for (let i = 1; i < trail.length; i++) {
                    const t0 = trail[i - 1];
                    const t1 = trail[i];
                    const progress = i / trail.length;
                    const tY0 = t0.y - game.current.cameraY + visualOffset;
                    const tY1 = t1.y - game.current.cameraY + visualOffset;
                    ctx.beginPath();
                    ctx.moveTo(cx, tY0);
                    ctx.lineTo(cx, tY1);
                    ctx.lineWidth = CONFIG.ballRadius * 1.8 * progress;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = currentTheme.trail;
                    ctx.globalAlpha = 0.3 * progress;
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
            }

            const by = game.current.ball.y - game.current.cameraY + visualOffset;

            const glowGrad = ctx.createRadialGradient(cx, by, 0, cx, by, CONFIG.ballRadius * 4);
            glowGrad.addColorStop(0, currentTheme.ball + "88");
            glowGrad.addColorStop(1, "transparent");
            ctx.fillStyle = glowGrad;
            ctx.fillRect(
                cx - CONFIG.ballRadius * 4,
                by - CONFIG.ballRadius * 4,
                CONFIG.ballRadius * 8,
                CONFIG.ballRadius * 8,
            );

            ctx.save();
            ctx.translate(cx, by);

            const ballGrad = ctx.createRadialGradient(-3, -4, 1, 0, 0, CONFIG.ballRadius);
            ballGrad.addColorStop(0, "#ffffff");
            ballGrad.addColorStop(0.3, currentTheme.ball);
            ballGrad.addColorStop(1, currentTheme.ball + "bb");
            ctx.shadowBlur = 15;
            ctx.shadowColor = currentTheme.ball;
            ctx.beginPath();
            ctx.arc(0, 0, CONFIG.ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = ballGrad;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.beginPath();
            ctx.arc(-3, -3.5, 3.5, 0, Math.PI * 2);
            ctx.fill();

            if (game.current.combo >= 2) {
                ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.015) * 0.2;
                const fireGrad = ctx.createRadialGradient(0, -8, 2, 0, -4, CONFIG.ballRadius + 6);
                fireGrad.addColorStop(0, "#ffffff");
                fireGrad.addColorStop(0.3, currentTheme.accent);
                fireGrad.addColorStop(1, "transparent");
                ctx.fillStyle = fireGrad;
                ctx.beginPath();
                ctx.arc(0, -5, CONFIG.ballRadius + 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            ctx.restore();
        }

        game.current.floatingTexts.forEach((t) => {
            const visualOffset = CONFIG.platformRadius * CONFIG.renderScaleY;
            const ty = t.y - game.current.cameraY + visualOffset - 40;
            ctx.save();
            ctx.translate(cx, ty);
            ctx.shadowBlur = 8;
            ctx.shadowColor = t.color;
            ctx.fillStyle = t.color;
            ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
            ctx.textAlign = "center";
            ctx.globalAlpha = t.life;
            ctx.fillText(t.text, 0, 0);
            ctx.shadowBlur = 0;
            ctx.restore();
        });
    };

    useLayoutEffect(() => {
        loopRef.current = loop;
        drawRef.current = draw;
        updateRef.current = update;
    });

    const handleStart = (e) => {
        if (e.target.tagName === "BUTTON") return;
        input.current.dragging = true;
        input.current.lastX = e.clientX || (e.touches && e.touches[0].clientX);
        game.current.rotVelocity = 0;
    };
    const handleMove = (e) => {
        if (!input.current.dragging) return;
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        if (!x) return;
        const delta = x - input.current.lastX;
        input.current.lastX = x;
        game.current.towerRotation += delta * CONFIG.rotationSpeed;
        game.current.rotVelocity = delta * CONFIG.rotationSpeed;
    };
    const handleEnd = () => {
        input.current.dragging = false;
    };

    useLayoutEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                canvasRef.current.width = window.innerWidth * dpr;
                canvasRef.current.height = window.innerHeight * dpr;
                const ctx = canvasRef.current.getContext("2d");
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                CONFIG.ballRadius = getResponsiveConfig().ballRadius;
                if (gameState !== "PLAYING") draw();
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [currentTheme, gameState]);

    return (
        <div
            className="w-full h-full overflow-hidden relative select-none"
            style={{ touchAction: "none", fontFamily: "'Trebuchet MS', 'Lucida Grande', sans-serif" }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            {/* Animated starfield background */}
            <AnimatedBackground theme={currentTheme} />

            {/* Game canvas */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={{ zIndex: 1 }}
            />

            {/* UI LAYER */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                        className="h-full transition-[width] duration-100 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            background: `linear-gradient(90deg, ${currentTheme.platform}, ${currentTheme.accent}, ${currentTheme.ball})`,
                            boxShadow: `0 0 12px ${currentTheme.accent}`,
                        }}
                    />
                </div>

                {/* Level Badge */}
                <div
                    className="absolute top-5 right-5 px-5 py-2 rounded-full font-black text-base tracking-widest"
                    style={{
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: currentTheme.accent,
                        border: `1px solid ${currentTheme.accent}44`,
                        boxShadow: `0 0 20px ${currentTheme.accent}33, inset 0 1px 0 rgba(255,255,255,0.1)`,
                        textShadow: `0 0 10px ${currentTheme.accent}`,
                    }}
                >
                    LVL {level}
                </div>

                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className="absolute top-5 right-[120px] w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 pointer-events-auto"
                    style={{
                        background: soundMuted ? "rgba(255,60,60,0.18)" : "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: `1px solid ${soundMuted ? "#ff4757" : currentTheme.accent}44`,
                        color: soundMuted ? "#ff4757" : currentTheme.accent,
                        boxShadow: soundMuted
                            ? "0 0 14px #ff475744"
                            : `0 0 14px ${currentTheme.accent}33`,
                    }}
                    title={soundMuted ? "Unmute" : "Mute"}
                >
                    {soundMuted ? "🔇" : "🔊"}
                </button>

                {/* Score Display */}
                <div className="absolute top-[18px] left-5">
                    <div
                        className="text-5xl text-white font-black leading-none tracking-tight"
                        style={{ textShadow: `0 0 20px ${currentTheme.accent}aa, 0 2px 4px rgba(0,0,0,0.5)` }}
                    >
                        {score.toLocaleString()}
                    </div>
                    <div
                        className="text-[11px] font-bold tracking-[3px] mt-0.5"
                        style={{ color: currentTheme.accent + "aa" }}
                    >
                        BEST{" "}
                        {highScore > score
                            ? highScore.toLocaleString()
                            : score.toLocaleString()}
                    </div>
                </div>

                {/* Combo Flash */}
                {comboMessage && (
                    <div
                        className="absolute top-[30%] left-1/2 text-[52px] font-black -tracking-tight"
                        style={{
                            transform: "translate(-50%, -50%)",
                            color: currentTheme.accent,
                            textShadow: `0 0 30px ${currentTheme.accent}, 0 0 60px ${currentTheme.accent}88`,
                            animation: "pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
                        }}
                    >
                        ×{comboMessage} COMBO
                    </div>
                )}

                {/* Control Buttons */}
                {gameState === "PLAYING" && (
                    <div className="absolute bottom-10 w-full flex justify-center gap-6 pointer-events-auto">
                        <ControlBtn
                            symbol="◀️"
                            onDown={() => (input.current.holdingLeft = true)}
                            onUp={() => (input.current.holdingLeft = false)}
                            theme={currentTheme}
                        />
                        <ControlBtn
                            symbol="▶️"
                            onDown={() => (input.current.holdingRight = true)}
                            onUp={() => (input.current.holdingRight = false)}
                            theme={currentTheme}
                        />
                    </div>
                )}

                {/* MODALS */}
                {gameState !== "PLAYING" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full max-w-[360px] pointer-events-auto">
                        {gameState === "MENU" && (
                            <Modal theme={currentTheme}>
                                <LogoBadge theme={currentTheme} />
                                <h1 className="m-0 mb-2 text-white text-2xl font-black tracking-[2px]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                                    HELIX JOURNEY
                                </h1>
                                <p className="text-[13px] text-white/45 mb-6 text-center leading-relaxed tracking-[0.3px]">
                                    Navigate through gaps · Combo x3 = Smash!
                                </p>
                                <ActionButton onClick={() => startLevel(level)} theme={currentTheme}>
                                    START LEVEL {level}
                                </ActionButton>
                                {level > 1 && (
                                    <GhostButton
                                        onClick={() => {
                                            setLevel(1);
                                            localStorage.setItem("helix-card-level", 1);
                                            startLevel(1);
                                        }}
                                        theme={currentTheme}
                                    >
                                        Reset to Level 1
                                    </GhostButton>
                                )}
                            </Modal>
                        )}

                        {gameState === "GAMEOVER" && (
                            <Modal theme={currentTheme} shake>
                                <EmojiIcon emoji="💥" color="#ff4757" />
                                <h1 className="m-0 mb-2 text-white text-2xl font-black tracking-[2px]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                                    GAME OVER
                                </h1>
                                <ScoreBadge score={score} theme={currentTheme} />
                                <ActionButton onClick={retryLevel} theme={currentTheme}>
                                    TRY AGAIN
                                </ActionButton>
                            </Modal>
                        )}

                        {gameState === "LEVEL_COMPLETE" && (
                            <Modal theme={currentTheme} glow={currentTheme.accent}>
                                <EmojiIcon emoji="⭐" color="#fbbf24" />
                                <h1 className="m-0 mb-2 text-white text-2xl font-black tracking-[2px]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                                    LEVEL {level} CLEAR
                                </h1>
                                <ScoreBadge score={score} theme={currentTheme} />
                                <ActionButton onClick={nextLevel} theme={currentTheme}>
                                    NEXT LEVEL →
                                </ActionButton>
                            </Modal>
                        )}

                        {gameState === "VICTORY" && (
                            <Modal theme={currentTheme} glow={currentTheme.accent}>
                                <EmojiIcon emoji="👑" color="#fbbf24" />
                                <h1 className="m-0 mb-2 text-white text-2xl font-black tracking-[2px]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                                    MASTER!
                                </h1>
                                <p className="text-[13px] text-white/45 mb-6 text-center leading-relaxed tracking-[0.3px]">
                                    You conquered all 50 levels.
                                </p>
                                <ScoreBadge score={score} theme={currentTheme} />
                                <ActionButton
                                    onClick={() => { setLevel(1); startLevel(1); }}
                                    theme={currentTheme}
                                >
                                    PLAY AGAIN
                                </ActionButton>
                            </Modal>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes pop {
          0% { transform: translate(-50%,-50%) scale(0.4) rotate(-5deg); opacity:0; }
          60% { transform: translate(-50%,-50%) scale(1.15) rotate(2deg); opacity:1; }
          100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes modalIn {
          from { opacity:0; transform: translateY(30px) scale(0.95); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 30px var(--glow), 0 25px 50px rgba(0,0,0,0.4); }
          50%     { box-shadow: 0 0 50px var(--glow), 0 25px 50px rgba(0,0,0,0.4); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }
      `}</style>
        </div>
    );
}

// ==========================================
// UI COMPONENTS
// ==========================================

function Modal({ children, theme, shake, glow }) {
    return (
        <div
            className="flex flex-col items-center w-[90%] rounded-[28px] px-10 py-11"
            style={{
                background: "rgba(8,8,20,0.85)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: `1px solid ${theme.accent}33`,
                "--glow": glow ? glow + "66" : "transparent",
                boxShadow: `0 0 40px ${theme.accent}22, 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
                animation: shake
                    ? "modalIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards, shake 0.5s ease-out 0.3s"
                    : "modalIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
            }}
        >
            {children}
        </div>
    );
}

function LogoBadge({ theme }) {
    return (
        <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-[38px] font-black text-white mb-[22px]"
            style={{
                background: `radial-gradient(circle at 35% 35%, ${theme.accent}, ${theme.platform})`,
                boxShadow: `0 0 30px ${theme.accent}88, 0 10px 20px rgba(0,0,0,0.3)`,
                animation: "float 3s ease-in-out infinite",
            }}
        >
            ◎
        </div>
    );
}

function EmojiIcon({ emoji, color }) {
    return (
        <div
            className="text-6xl mb-4"
            style={{
                filter: `drop-shadow(0 0 15px ${color})`,
                animation: "float 2s ease-in-out infinite",
            }}
        >
            {emoji}
        </div>
    );
}

function ScoreBadge({ score, theme }) {
    return (
        <div
            className="rounded-2xl px-[30px] py-[14px] mb-6 text-center"
            style={{
                background: `linear-gradient(135deg, ${theme.platform}33, ${theme.accent}22)`,
                border: `1px solid ${theme.accent}44`,
            }}
        >
            <div
                className="text-[11px] font-bold tracking-[3px] mb-1"
                style={{ color: theme.accent }}
            >
                SCORE
            </div>
            <div
                className="text-white text-4xl font-black -tracking-[1px]"
                style={{ textShadow: `0 0 15px ${theme.accent}` }}
            >
                {score.toLocaleString()}
            </div>
        </div>
    );
}

function ActionButton({ children, onClick, theme }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="border-0 px-11 py-4 text-white text-[15px] rounded-full cursor-pointer font-black tracking-[2px] w-full transition-all duration-200"
            style={{
                background: hovered
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.platform})`
                    : `linear-gradient(135deg, ${theme.platform}, ${theme.accent}dd)`,
                boxShadow: `0 0 25px ${theme.accent}66, 0 10px 25px rgba(0,0,0,0.3)`,
                transform: hovered ? "scale(1.03) translateY(-2px)" : "scale(1)",
                fontFamily: "inherit",
            }}
        >
            {children}
        </button>
    );
}

function GhostButton({ children, onClick, theme }) {
    return (
        <button
            onClick={onClick}
            className="bg-transparent border-0 cursor-pointer text-[13px] font-semibold tracking-[1px] mt-[14px] no-underline px-3 py-1.5 transition-colors duration-200"
            style={{ color: theme.accent + "88", fontFamily: "inherit" }}
        >
            {children}
        </button>
    );
}

function ControlBtn({ symbol, onDown, onUp, theme }) {
    const [pressed, setPressed] = useState(false);
    return (
        <button
            onMouseDown={() => { setPressed(true); onDown(); }}
            onMouseUp={() => { setPressed(false); onUp(); }}
            onMouseLeave={() => { setPressed(false); onUp(); }}
            onTouchStart={(e) => { e.preventDefault(); setPressed(true); onDown(); }}
            onTouchEnd={() => { setPressed(false); onUp(); }}
            className="w-[72px] h-[72px] rounded-full text-[22px] cursor-pointer flex items-center justify-center transition-all duration-100"
            style={{
                background: pressed
                    ? `radial-gradient(circle, ${theme.accent}55, ${theme.platform}44)`
                    : "rgba(255,255,255,0.07)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: `1px solid ${theme.accent}44`,
                color: theme.accent,
                boxShadow: pressed
                    ? `0 0 20px ${theme.accent}88, inset 0 2px 4px rgba(0,0,0,0.3)`
                    : `0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
                transform: pressed ? "scale(0.93)" : "scale(1)",
                fontFamily: "inherit",
            }}
        >
            {symbol}
        </button>
    );
}
