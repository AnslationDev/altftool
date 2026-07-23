"use client";

import { useState, useEffect, useRef } from "react";

const COLORS = {
  Crimson:   { r: 220, g: 50,  b: 80,  label: "Crimson",  hex: "#DC3250" },
  Cobalt:    { r: 40,  g: 90,  b: 200, label: "Cobalt",   hex: "#285AC8" },
  Amber:     { r: 240, g: 170, b: 20,  label: "Amber",    hex: "#F0AA14" },
  Emerald:   { r: 30,  g: 160, b: 100, label: "Emerald",  hex: "#1EA064" },
  Violet:    { r: 140, g: 50,  b: 180, label: "Violet",   hex: "#8C32B4" },
  Ivory:     { r: 240, g: 230, b: 200, label: "Ivory",    hex: "#F0E6C8" },
};

const LEVELS = [
  {
    name: "Sunrise Blush",
    hint: "Mix warm hues of the dawn",
    target: { r: 230, g: 110, b: 50 },
    recipe: ["Crimson", "Amber"],
    maxStrokes: 4,
  },
  {
    name: "Twilight Mist",
    hint: "Blend the colors of dusk",
    target: { r: 130, g: 70, b: 190 },
    recipe: ["Cobalt", "Violet", "Crimson"],
    maxStrokes: 5,
  },
  {
    name: "Sea Foam",
    hint: "A whisper of ocean calm",
    target: { r: 60, g: 170, b: 160 },
    recipe: ["Cobalt", "Emerald"],
    maxStrokes: 4,
  },
  {
    name: "Golden Meadow",
    hint: "Sunlit grass and petals",
    target: { r: 160, g: 190, b: 40 },
    recipe: ["Amber", "Emerald"],
    maxStrokes: 4,
  },
  {
    name: "Royal Plum",
    hint: "Deep and rich like velvet",
    target: { r: 100, g: 30, b: 130 },
    recipe: ["Violet", "Cobalt", "Crimson"],
    maxStrokes: 5,
  },
];

function blendColors(strokes) {
  if (!strokes.length) return { r: 245, g: 240, b: 225 };
  const avg = { r: 0, g: 0, b: 0 };
  strokes.forEach(c => {
    avg.r += c.r; avg.g += c.g; avg.b += c.b;
  });
  return {
    r: Math.round(avg.r / strokes.length),
    g: Math.round(avg.g / strokes.length),
    b: Math.round(avg.b / strokes.length),
  };
}

function colorDistance(a, b) {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  );
}

function scoreAccuracy(dist) {
  if (dist < 20) return 100;
  if (dist < 45) return Math.round(85 - (dist - 20) * 0.8);
  if (dist < 80) return Math.round(65 - (dist - 45) * 0.8);
  if (dist < 130) return Math.round(40 - (dist - 80) * 0.5);
  return Math.max(0, Math.round(15 - (dist - 130) * 0.2));
}

function rgbStr(c) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function WaterBlob({ color, size = 120, wobble = false }) {
  const style = {
    width: size, height: size,
    background: `radial-gradient(circle at 38% 38%, rgba(255,255,255,0.35) 0%, ${rgbStr(color)} 55%, rgba(0,0,0,0.12) 100%)`,
    borderRadius: wobble
      ? "60% 40% 55% 45% / 45% 55% 40% 60%"
      : "63% 37% 54% 46% / 55% 48% 52% 45%",
    boxShadow: `0 8px 32px rgba(${color.r},${color.g},${color.b},0.35), inset 0 2px 8px rgba(255,255,255,0.2)`,
    transition: "all 0.5s cubic-bezier(.4,1.6,.6,1)",
    animation: wobble ? "wobble 2.5s ease-in-out infinite" : "none",
  };
  return <div style={style} />;
}

function Ripple({ x, y, color }) {
  return (
    <div style={{
      position: "absolute", left: x - 30, top: y - 30,
      width: 60, height: 60, borderRadius: "50%",
      border: `3px solid ${color}`,
      animation: "rippleOut 0.7s ease-out forwards",
      pointerEvents: "none",
      zIndex: 10,
    }} />
  );
}

export default function WatercolorGame() {
  const [level, setLevel] = useState(0);
  const [strokes, setStrokes] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [phase, setPhase] = useState("play"); // play | result | win
  const [scores, setScores] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);

  const currentLevel = LEVELS[level];
  const mixed = blendColors(strokes);
  const maxStrokes = currentLevel.maxStrokes;
  const strokesLeft = maxStrokes - strokes.length;

  // Paint canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!strokes.length) return;

    strokes.forEach((color, i) => {
      const x = 60 + Math.random() * 80;
      const y = 60 + Math.random() * 80;
      const r = 30 + Math.random() * 30;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0.7)`);
      grad.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });
  }, [strokes]);

  function addStroke(colorKey, e) {
    if (strokesLeft <= 0 || submitted) return;
    const color = COLORS[colorKey];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples(r => [...r, { id: Date.now(), x, y, color: color.hex }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== Date.now())), 700);
    setStrokes(s => [...s, color]);
  }

  function handleSubmit() {
    setSubmitted(true);
    const dist = colorDistance(mixed, currentLevel.target);
    const sc = scoreAccuracy(dist);
    setScores(s => [...s, sc]);
    setPhase("result");
    if (sc >= 70) spawnParticles();
  }

  function spawnParticles() {
    const ps = Array.from({ length: 18 }, (_, i) => ({
      id: i, x: 45 + Math.random() * 10, y: 50,
      vx: (Math.random() - 0.5) * 4,
      vy: -2 - Math.random() * 3,
      color: Object.values(COLORS)[Math.floor(Math.random() * 6)].hex,
      life: 1,
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 2000);
  }

  function nextLevel() {
    if (level + 1 >= LEVELS.length) {
      setPhase("win");
    } else {
      setLevel(l => l + 1);
      setStrokes([]);
      setSubmitted(false);
      setPhase("play");
    }
  }

  function undoStroke() {
    if (!strokes.length || submitted) return;
    setStrokes(s => s.slice(0, -1));
  }

  function restart() {
    setLevel(0); setStrokes([]); setScores([]);
    setSubmitted(false); setPhase("play");
  }

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const avgScore = scores.length ? Math.round(totalScore / scores.length) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f5ede0", fontFamily: "'Lora', Georgia, serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,700;1,500&display=swap');

        * { box-sizing: border-box; }

        @keyframes wobble {
          0%,100% { border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%; }
          33% { border-radius: 45% 55% 42% 58% / 60% 40% 60% 40%; }
          66% { border-radius: 55% 45% 60% 40% / 40% 60% 42% 58%; }
        }
        @keyframes rippleOut {
          0% { transform: scale(0.2); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splat {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 0; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes paperGrain {
          0%,100% { opacity: 0.04; }
          50% { opacity: 0.06; }
        }
        @keyframes drip {
          0% { height: 0; opacity: 0.7; }
          80% { opacity: 0.5; }
          100% { height: 40px; opacity: 0; }
        }
        .color-btn {
          cursor: pointer; border: none; background: none; padding: 0;
          transition: transform 0.18s cubic-bezier(.4,1.8,.6,1);
          animation: float 3s ease-in-out infinite;
        }
        .color-btn:hover { transform: scale(1.13) translateY(-4px) !important; }
        .color-btn:active { transform: scale(0.95) !important; }
        .color-btn:disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }

        .submit-btn {
          background: linear-gradient(135deg, #2d5a3d, #4a8c5c);
          color: #e8f5ec; border: none; border-radius: 50px;
          padding: 14px 40px; font-size: 1.05rem; font-family: 'Lora', serif;
          cursor: pointer; letter-spacing: 0.05em;
          box-shadow: 0 6px 24px rgba(45,90,61,0.35);
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(45,90,61,0.4); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .next-btn {
          background: linear-gradient(135deg, #7a3d8c, #a055c4);
          color: #f0e6f8; border: none; border-radius: 50px;
          padding: 14px 40px; font-size: 1.05rem; font-family: 'Lora', serif;
          cursor: pointer; letter-spacing: 0.05em;
          box-shadow: 0 6px 24px rgba(122,61,140,0.35);
          transition: all 0.2s;
        }
        .next-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(122,61,140,0.45); }

        .undo-btn {
          background: rgba(100,60,20,0.12); color: #6b3a1f;
          border: 1.5px solid rgba(100,60,20,0.25); border-radius: 50px;
          padding: 8px 22px; font-size: 0.88rem; font-family: 'Lora', serif;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em;
        }
        .undo-btn:hover { background: rgba(100,60,20,0.2); }
        .undo-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .paper-texture {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }

        .watermark-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 20% 20%, rgba(180,210,230,0.18) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 80% at 85% 75%, rgba(230,180,200,0.15) 0%, transparent 55%),
                      radial-gradient(ellipse 70% 50% at 60% 10%, rgba(200,230,180,0.12) 0%, transparent 50%);
        }
      `}</style>

      <div className="paper-texture" />
      <div className="watermark-bg" />

      {/* Decorative drips */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          position: "fixed", top: 0,
          left: `${15 + i * 22}%`,
          width: 6, height: 0,
          background: `linear-gradient(to bottom, ${Object.values(COLORS)[i].hex}88, transparent)`,
          borderRadius: "0 0 4px 4px",
          animation: `drip ${2 + i * 0.8}s ${i * 1.2}s ease-in forwards`,
          pointerEvents: "none", zIndex: 1,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28, animation: "fadeUp 0.7s ease both" }}>
          <div style={{ fontSize: "0.78rem", letterSpacing: "0.18em", color: "#9a6b3a", textTransform: "uppercase", marginBottom: 4 }}>
            ✦ A Watercolor Studio ✦
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontStyle: "italic",
            fontSize: "clamp(2rem, 5vw, 2.8rem)", color: "#3a2010",
            margin: 0, lineHeight: 1.1,
          }}>
            Palette & Pigment
          </h1>
          <p style={{ color: "#7a5030", fontSize: "0.9rem", margin: "6px 0 0", fontStyle: "italic" }}>
            Blend colours to match the canvas
          </p>
        </div>

        {phase === "win" ? (
          <WinScreen scores={scores} avgScore={avgScore} onRestart={restart} />
        ) : (
          <>
            {/* Progress */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              {LEVELS.map((l, i) => (
                <div key={i} style={{
                  width: i === level ? 28 : 10, height: 10,
                  borderRadius: 5,
                  background: i < level ? "#4a8c5c" : i === level ? "#8c6a2a" : "rgba(100,60,20,0.2)",
                  transition: "all 0.4s ease",
                }} />
              ))}
            </div>

            {/* Level card */}
            <div style={{
              background: "rgba(255,250,240,0.85)", backdropFilter: "blur(8px)",
              borderRadius: 28, padding: "28px 24px",
              boxShadow: "0 12px 60px rgba(100,60,20,0.12), 0 2px 0 rgba(255,255,255,0.8) inset",
              border: "1px solid rgba(200,160,100,0.3)",
              animation: "fadeUp 0.5s ease both 0.1s",
            }}>

              {/* Level info */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "#9a6b3a", textTransform: "uppercase" }}>
                  Level {level + 1} of {LEVELS.length}
                </div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.5rem", color: "#3a2010", margin: "4px 0 2px"
                }}>
                  {currentLevel.name}
                </h2>
                <p style={{ color: "#9a7050", fontSize: "0.88rem", fontStyle: "italic", margin: 0 }}>
                  {currentLevel.hint}
                </p>
              </div>

              {/* Target vs Mixed */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 28 }}>
                {/* Target */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", color: "#9a6b3a", textTransform: "uppercase", marginBottom: 8 }}>
                    Target
                  </div>
                  <WaterBlob color={currentLevel.target} size={110} wobble />
                  <div style={{
                    marginTop: 8, fontSize: "0.78rem", color: "#7a5030", fontStyle: "italic",
                    background: "rgba(200,160,100,0.12)", borderRadius: 20, padding: "2px 10px",
                  }}>
                    Match this!
                  </div>
                </div>

                {/* Arrow + hint */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: "1.4rem", color: "#c8a060" }}>⟵</div>
                  <div style={{ fontSize: "0.7rem", color: "#b09060", textAlign: "center", maxWidth: 60 }}>
                    blend to match
                  </div>
                  <div style={{ fontSize: "1.4rem", color: "#c8a060" }}>⟶</div>
                </div>

                {/* Mixed */}
                <div style={{ textAlign: "center", position: "relative" }}>
                  <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", color: "#9a6b3a", textTransform: "uppercase", marginBottom: 8 }}>
                    Your Mix
                  </div>
                  <div style={{ position: "relative" }}>
                    <WaterBlob color={mixed} size={110} wobble />
                    {ripples.map(r => <Ripple key={r.id} x={55} y={55} color={r.color} />)}
                  </div>
                  <div style={{
                    marginTop: 8, fontSize: "0.78rem", color: "#7a5030",
                    background: "rgba(200,160,100,0.12)", borderRadius: 20, padding: "2px 10px",
                  }}>
                    {strokes.length ? `${strokes.length} stroke${strokes.length > 1 ? "s" : ""}` : "empty"}
                  </div>
                </div>
              </div>

              {/* Score result */}
              {phase === "result" && (
                <ResultBanner score={scores[scores.length - 1]} onNext={nextLevel} isLast={level + 1 >= LEVELS.length} />
              )}

              {/* Strokes counter */}
              {phase === "play" && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {Array.from({ length: maxStrokes }).map((_, i) => (
                      <div key={i} style={{
                        width: 12, height: 12, borderRadius: "50%",
                        background: i < strokes.length ? "#8c6a2a" : "rgba(140,106,42,0.2)",
                        border: "1.5px solid rgba(140,106,42,0.35)",
                        transition: "all 0.3s",
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#9a7050", marginTop: 4 }}>
                    {strokesLeft > 0 ? `${strokesLeft} stroke${strokesLeft !== 1 ? "s" : ""} remaining` : "Canvas full!"}
                  </div>
                </div>
              )}

              {/* Color palette */}
              {phase === "play" && (
                <>
                  <div style={{ textAlign: "center", marginBottom: 12, fontSize: "0.78rem", color: "#9a7050", fontStyle: "italic" }}>
                    — Tap a pigment to add it to your mix —
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 20 }}>
                    {Object.entries(COLORS).map(([key, color], idx) => (
                      <div key={key} style={{ textAlign: "center" }}>
                        <button
                          className="color-btn"
                          disabled={strokesLeft <= 0}
                          onClick={e => addStroke(key, e)}
                          style={{ animationDelay: `${idx * 0.18}s` }}
                        >
                          <div style={{
                            width: 68, height: 68,
                            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, ${color.hex} 50%, rgba(0,0,0,0.15) 100%)`,
                            borderRadius: "58% 42% 60% 40% / 50% 55% 45% 50%",
                            boxShadow: `0 6px 20px ${color.hex}55, 0 2px 6px rgba(0,0,0,0.1)`,
                            transition: "box-shadow 0.2s",
                          }} />
                        </button>
                        <div style={{ fontSize: "0.7rem", color: "#7a5030", marginTop: 4, fontStyle: "italic" }}>
                          {color.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <button className="undo-btn" onClick={undoStroke} disabled={!strokes.length}>
                      ↩ Undo Stroke
                    </button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={!strokes.length}>
                      Paint & Judge ✓
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Stroke history pills */}
            {strokes.length > 0 && phase === "play" && (
              <div style={{
                display: "flex", justifyContent: "center", flexWrap: "wrap",
                gap: 6, marginTop: 16, animation: "fadeUp 0.4s ease both"
              }}>
                {strokes.map((c, i) => (
                  <div key={i} style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgb(${c.r},${c.g},${c.b}))`,
                    boxShadow: `0 3px 10px rgba(${c.r},${c.g},${c.b},0.5)`,
                    border: "2px solid rgba(255,255,255,0.6)",
                  }} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Score tray */}
        {scores.length > 0 && phase !== "win" && (
          <div style={{
            display: "flex", justifyContent: "center", gap: 8, marginTop: 20,
            animation: "fadeUp 0.4s ease both",
          }}>
            {scores.map((s, i) => (
              <div key={i} style={{
                fontSize: "0.75rem", fontStyle: "italic", color: "#7a5030",
                background: "rgba(255,250,240,0.8)", border: "1px solid rgba(200,160,100,0.3)",
                borderRadius: 20, padding: "3px 12px",
              }}>
                L{i + 1}: {s}%
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function ResultBanner({ score, onNext, isLast }) {
  const great = score >= 80, good = score >= 55;
  const emoji = great ? "🎨" : good ? "✨" : "🖌️";
  const msg = great
    ? "Masterpiece! Your eye for colour is extraordinary."
    : good
    ? "Lovely blend! A painter's intuition blooms in you."
    : "A bold attempt! Colour is a lifelong study.";

  const clr = great ? "#2d5a3d" : good ? "#7a5030" : "#8c3a2a";

  return (
    <div style={{
      background: `linear-gradient(135deg, ${clr}11, ${clr}22)`,
      border: `1.5px solid ${clr}40`,
      borderRadius: 20, padding: "18px 24px", marginBottom: 20, textAlign: "center",
      animation: "fadeUp 0.5s ease both",
    }}>
      <div style={{ fontSize: "2.2rem", marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: clr, fontWeight: 700 }}>
        {score}%
      </div>
      <div style={{ color: clr + "cc", fontStyle: "italic", fontSize: "0.9rem", marginBottom: 14 }}>
        {msg}
      </div>
      <button className="next-btn" onClick={onNext}>
        {isLast ? "See Final Results →" : "Next Colour →"}
      </button>
    </div>
  );
}

function WinScreen({ scores, avgScore, onRestart }) {
  const grade = avgScore >= 85 ? "Master Colourist" : avgScore >= 65 ? "Journeyman Painter" : "Apprentice Artist";
  const quote = avgScore >= 85
    ? '"Colour is the keyboard, the eyes are the harmonies." — Kandinsky'
    : avgScore >= 65
    ? '"Every artist dips his brush in his own soul." — Henry Ward Beecher'
    : '"The painter has the Universe in his mind and hands." — Leonardo da Vinci';

  return (
    <div style={{
      background: "rgba(255,250,240,0.92)", backdropFilter: "blur(8px)",
      borderRadius: 28, padding: "36px 28px", textAlign: "center",
      boxShadow: "0 12px 60px rgba(100,60,20,0.15)",
      border: "1px solid rgba(200,160,100,0.3)",
      animation: "fadeUp 0.6s ease both",
    }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎨</div>
      <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#9a6b3a", textTransform: "uppercase", marginBottom: 4 }}>
        Studio Session Complete
      </div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif", fontStyle: "italic",
        fontSize: "2rem", color: "#3a2010", margin: "0 0 4px"
      }}>
        {grade}
      </h2>
      <div style={{ fontSize: "2.8rem", fontWeight: 700, color: "#7a3d1a", margin: "10px 0" }}>
        {avgScore}%
      </div>
      <div style={{ fontStyle: "italic", color: "#9a7050", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.5, maxWidth: 340, margin: "0 auto 24px" }}>
        {quote}
      </div>

      {/* Score breakdown */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {scores.map((s, i) => (
          <div key={i} style={{
            background: s >= 80 ? "rgba(45,90,61,0.12)" : s >= 55 ? "rgba(140,106,42,0.12)" : "rgba(140,58,42,0.12)",
            borderRadius: 16, padding: "8px 16px", minWidth: 72,
            border: `1.5px solid ${s >= 80 ? "rgba(45,90,61,0.3)" : s >= 55 ? "rgba(140,106,42,0.3)" : "rgba(140,58,42,0.3)"}`,
          }}>
            <div style={{ fontSize: "0.65rem", color: "#9a7050", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {LEVELS[i].name.split(" ")[0]}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#3a2010" }}>
              {s}%
            </div>
          </div>
        ))}
      </div>

      <button className="submit-btn" onClick={onRestart}>
        Paint Again ↺
      </button>
    </div>
  );
}
