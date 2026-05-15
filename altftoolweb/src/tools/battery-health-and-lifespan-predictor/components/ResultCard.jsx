import { useRef, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Download,
  Clock,
  Zap,
  Shield,
  BarChart3,
  Gauge,
  TrendingUp,
  Calendar,
  TrendingDown,
  Plug,
} from "lucide-react";

/* ---------- Scoped styles ---------- */
const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes batteryPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(59,130,246,0.4); }
    50% { box-shadow: 0 0 18px rgba(59,130,246,0.7); }
  }
  .pop-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .pop-card:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 24px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.1);
  }
`;

/* ---------- Particles (unchanged) ---------- */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const initParticles = (w, h) => {
      particles = [];
      const count = 60;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 5 + 2,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.6 + 0.3,
        });
      }
    };

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${p.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    };

    initParticles(canvas.offsetWidth, canvas.offsetHeight);
    draw();
    window.addEventListener("resize", () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    });
    return () => cancelAnimationFrame(animationId);
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

/* ---------- Animated Number ---------- */
function AnimatedNumber({ target, suffix = "", duration = 800 }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(interval); }
      setValue(start);
    }, duration / 30);
    return () => clearInterval(interval);
  }, [target, duration]);
  return <span className="text-2xl font-bold">{value}{suffix}</span>;
}

/* ---------- Typing Text ---------- */
function TypingText({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    let i = 0; setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  useEffect(() => {
    const blink = setInterval(() => setCursor((prev) => !prev), 500);
    return () => clearInterval(blink);
  }, []);
  return (
    <span>
      {displayed}
      <span className={`inline-block w-0.5 h-4 bg-[var(--primary)] ml-0.5 ${cursor ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  );
}

/* ---------- Staggered Fade-in ---------- */
function FadeInCard({ children, delay = 0 }) {
  return (
    <div style={{ animation: `fadeInUp 0.5s ease-out ${delay}s both` }} className="opacity-0">
      {children}
    </div>
  );
}

/* ---------- Glass Card ---------- */
function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl p-5 border bg-[var(--card)]/80 backdrop-blur-2xl border-[var(--border)] shadow-sm pop-card ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Condition Card ---------- */
function getConditionStyle(condition) {
  switch (condition) {
    case "Good": return "from-green-400/20 via-emerald-400/10 to-transparent border-green-400/30 text-green-700";
    case "Fair": return "from-yellow-400/20 via-orange-300/10 to-transparent border-yellow-400/30 text-yellow-700";
    default: return "from-red-400/20 via-pink-400/10 to-transparent border-red-400/30 text-red-700";
  }
}
function ConditionCard({ condition }) {
  const style = getConditionStyle(condition);
  return (
    <div className={`rounded-3xl p-5 border backdrop-blur-2xl shadow-lg bg-gradient-to-br ${style} pop-card`}>
      <div className="flex items-center gap-2 mb-1"><Shield className="w-5 h-5" /><p className="text-sm opacity-70">Condition</p></div>
      <p className="text-3xl font-bold mt-2">{condition}</p>
      <p className="text-xs opacity-60 mt-2">Based on age, usage, heat & charging pattern</p>
    </div>
  );
}

/* ---------- Usage Score Gauge ---------- */
function UsageScoreGauge({ score }) {
  const target = Math.round(score);
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (target === 0) { setDisplayScore(0); return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      setDisplayScore(current);
    }, 20);
    return () => clearInterval(interval);
  }, [target]);
  const angle = displayScore * 3.6;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(#3b82f6 0deg ${angle}deg, #9ca3af ${angle}deg 360deg)`,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1), 0 0 20px rgba(59,130,246,0.5)",
        }}>
        <div className="absolute inset-[10%] rounded-full bg-[var(--card)]/90 backdrop-blur-sm flex items-center justify-center">
          <span className="text-2xl font-bold">{displayScore}</span>
        </div>
      </div>
      <span className="text-lg font-medium opacity-70">/100</span>
    </div>
  );
}

/* ---------- Smart Review / Recommendation ---------- */
function SmartReview({ health }) {
  const isGood = health > 80, isFair = health > 60;
  const text = isGood ? "Your battery is in excellent condition with minimal degradation." : isFair ? "Your battery is showing moderate wear but still stable." : "Your battery is degrading faster than normal usage patterns.";
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2"><ThumbsUp className="w-5 h-5 text-[var(--primary)]" /><p className="text-sm opacity-70">Smart Review</p></div>
      <p className="font-semibold text-lg"><TypingText text={text} speed={25} /></p>
    </GlassCard>
  );
}
function Recommendation({ health }) {
  const text = health > 80 ? "Continue normal usage. Maintain current charging habits." : health > 60 ? "Avoid heat exposure and reduce fast charging frequency." : "Consider battery replacement or professional inspection soon.";
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5 text-yellow-500" /><p className="text-sm opacity-70">Recommendation</p></div>
      <p className="font-semibold text-lg"><TypingText text={text} speed={20} /></p>
    </GlassCard>
  );
}

/* ---------- PDF Download ---------- */
async function downloadPDF(result, reportRef, setDownloadState) {
  if (!reportRef.current) return;
  setDownloadState("loading");
  try {
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`battery-report-${result.device || "device"}.pdf`);
    setDownloadState("success");
    setTimeout(() => setDownloadState("idle"), 2000);
  } catch {
    setDownloadState("error");
    setTimeout(() => setDownloadState("idle"), 1500);
  }
}

/* ================================================================
   CLEAN HORIZONTAL BATTERY BAR – fills smoothly, looks like a battery
================================================================ */
function BatteryBar({ value }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(0);
    const timer = setTimeout(() => setWidth(value), 50);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val) => {
    if (val > 80) return "linear-gradient(180deg, rgba(34,197,94,0.85), rgba(34,197,94,0.6))";
    if (val > 60) return "linear-gradient(180deg, rgba(234,179,8,0.85), rgba(234,179,8,0.6))";
    if (val > 40) return "linear-gradient(180deg, rgba(249,115,22,0.85), rgba(249,115,22,0.6))";
    return "linear-gradient(180deg, rgba(239,68,68,0.85), rgba(239,68,68,0.6))";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center">
        {/* Battery body */}
        <div
          className="relative w-64 h-12 border-2 border-gray-400/60 rounded-xl overflow-hidden bg-[var(--card)]"
          style={{ animation: "batteryPulse 2s infinite" }}
        >
          {/* Fill */}
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{
              width: `${width}%`,
              background: getColor(value),
            }}
          />
          {/* Cell dividers */}
          <div className="absolute inset-0 flex justify-evenly pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-px h-full bg-gray-400/20" />
            ))}
          </div>
          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold tracking-wider">
            {width}%
          </div>
        </div>
        {/* Terminal */}
        <div className="w-4 h-8 bg-gray-400/60 rounded-r-lg ml-1.5" />
      </div>
    </div>
  );
}

/* =========================== MAIN RESULT CARD =========================== */
export default function ResultCard({ result }) {
  const reportRef = useRef(null);
  const [downloadState, setDownloadState] = useState("idle");

  if (!result) return null;

  const breakdown = result.breakdown || {};
  const futureHealth = result.chartData?.[3]?.value ?? 0;
  const cyclesUsed = result.cyclesUsed ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative" ref={reportRef}>
      <style>{styles}</style>

      <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
        <Particles />
      </div>

      {/* ---- Battery Health + Download ---- */}
      <FadeInCard delay={0}>
        <GlassCard>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold opacity-80">Battery Report</h2>
            </div>
            <button
              onClick={() => downloadPDF(result, reportRef, setDownloadState)}
              disabled={downloadState === "loading"}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-[transform,box-shadow] duration-300 flex items-center gap-1 ${
                downloadState === "success"
                  ? "bg-green-500 text-white"
                  : downloadState === "error"
                  ? "bg-red-500 text-white"
                  : "bg-[var(--primary)] text-white hover:opacity-90"
              }`}
            >
              <Download className="w-4 h-4" />
              {downloadState === "loading" ? "Generating..." : downloadState === "success" ? "✓ Downloaded" : downloadState === "error" ? "✗ Failed" : "Download PDF"}
            </button>
          </div>
          <BatteryBar value={result.health} />
          <p className="text-center mt-2 text-sm font-medium opacity-80">Battery Health</p>
        </GlassCard>
      </FadeInCard>

      {/* ---- Top Stats ---- */}
      <FadeInCard delay={0.1}>
        <div className="grid md:grid-cols-3 gap-4">
          <ConditionCard condition={result.condition} />
          <GlassCard>
            <div className="flex items-center gap-2 mb-2"><Gauge className="w-5 h-5 text-[var(--primary)]" /><p className="text-sm opacity-70">Usage Score</p></div>
            <UsageScoreGauge score={result.usageScore} />
          </GlassCard>

          {/* Life Left with calendar icon beside the value */}
          <GlassCard className="flex flex-col items-center justify-center min-h-[120px]">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-[var(--primary)]" /><p className="text-sm opacity-70">Life Left</p></div>
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-[var(--primary)]/70" />
              <div>
                <span className="text-2xl font-bold">{result.monthsLeft}</span>
                <span className="text-sm opacity-70 ml-1">months</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </FadeInCard>

      {/* ---- Insights ---- */}
      <FadeInCard delay={0.2}>
        <div className="grid md:grid-cols-2 gap-4">
          <SmartReview health={result.health} />
          <Recommendation health={result.health} />
        </div>
      </FadeInCard>

      {/* ---- Tips ---- */}
      {result.tips && result.tips.length > 0 && (
        <FadeInCard delay={0.3}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-2"><Lightbulb className="w-5 h-5 text-yellow-400" /><h3 className="font-semibold opacity-80">Personalised Tips</h3></div>
            <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
              {result.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          </GlassCard>
        </FadeInCard>
      )}

      {/* ---- Degradation Breakdown ---- */}
      {Object.keys(breakdown).length > 0 && (
        <FadeInCard delay={0.4}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-orange-400" /><h3 className="font-semibold opacity-80">What's Draining Your Battery?</h3></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(breakdown).map(([key, val]) => (
                <div key={key} className="flex justify-between px-3 py-1 rounded-lg bg-white/5">
                  <span className="opacity-70 capitalize">{key}</span>
                  <span className="font-medium">-{Math.round(val)}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </FadeInCard>
      )}

      {/* ---- Forecast + Stats ---- */}
      <FadeInCard delay={0.5}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-4 md:w-1/3">
            {/* 12-Month Health with down arrow */}
            <GlassCard className="flex-1 flex flex-col items-center justify-center min-h-[120px]">
              <h3 className="text-sm font-semibold opacity-70 mb-2 flex items-center gap-1">
                12‑Month Health
                <TrendingDown className="w-4 h-4 text-red-400" />
              </h3>
              <AnimatedNumber target={futureHealth} suffix="%" />
            </GlassCard>

            {/* Charge Cycles with plug icon beside */}
            <GlassCard className="flex-1 flex flex-col items-center justify-center min-h-[120px]">
              <h3 className="text-sm font-semibold opacity-70 mb-2">Charge Cycles</h3>
              <div className="flex items-center gap-3">
                <Plug className="w-12 h-12 text-[var(--primary)]/70" />
                <div className="text-center">
                  <AnimatedNumber target={cyclesUsed} />
                  <p className="text-xs opacity-50 mt-1">total used</p>
                </div>
              </div>
            </GlassCard>
          </div>
          <GlassCard className="md:w-2/3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="font-semibold opacity-80">Forecast: Current vs. Optimized</h3>
            </div>
            <div className="h-64 md:h-72 w-full">
              {result.optimizedChart && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={result.chartData.map((d, i) => ({ ...d, optimized: result.optimizedChart[i]?.value }))}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="var(--secondary-foreground)" />
                    <YAxis stroke="var(--secondary-foreground)" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Your Battery" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="optimized" name="Optimized Habits" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>
      </FadeInCard>
    </div>
  );
}
