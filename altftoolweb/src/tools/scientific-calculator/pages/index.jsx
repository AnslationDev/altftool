"use client";

import React, { useState, useEffect } from "react";
import { Binary, CheckCircle2, RefreshCw, Volume2, VolumeX, History, Trash2, ArrowLeft } from "lucide-react";

export default function ToolHome() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [isDegree, setIsDegree] = useState(true); // Degree vs Radian mode

  // Soft key click beep sound using Web Audio API
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Web Audio API disabled or blocked: ", e);
    }
  };

  const handleKeyPress = (key) => {
    playClickSound();

    if (shouldReset && !["+", "-", "*", "/", "^"].includes(key)) {
      setDisplay(key === "." ? "0." : key);
      setEquation("");
      setShouldReset(false);
      return;
    }
    setShouldReset(false);

    if (display === "0" && key !== "." && !["+", "-", "*", "/", "^"].includes(key)) {
      setDisplay(key);
    } else {
      setDisplay((prev) => prev + key);
    }
  };

  const handleFunction = (fn) => {
    playClickSound();
    if (shouldReset) {
      setDisplay(`${fn}(`);
      setEquation("");
      setShouldReset(false);
      return;
    }
    if (display === "0") {
      setDisplay(`${fn}(`);
    } else {
      setDisplay((prev) => prev + `${fn}(`);
    }
  };

  const handleOperator = (op) => {
    playClickSound();
    setShouldReset(false);
    
    // Check if double operator
    const lastChar = display.trim().slice(-1);
    if (["+", "-", "*", "/"].includes(lastChar)) {
      // Replace last operator
      setDisplay((prev) => prev.slice(0, -1) + op);
    } else {
      setDisplay((prev) => prev + " " + op + " ");
    }
  };

  const handleClear = () => {
    playClickSound();
    setDisplay("0");
    setEquation("");
    setShouldReset(false);
  };

  const handleBackspace = () => {
    playClickSound();
    if (display.length <= 1 || display === "Error") {
      setDisplay("0");
    } else {
      if (display.endsWith(" ")) {
        setDisplay((prev) => prev.slice(0, -3));
      } else {
        // If backspacing a function (e.g. sin(, cos(, log(), delete the whole word
        const words = ["sin(", "cos(", "tan(", "log(", "ln(", "sqrt("];
        let deletedFunc = false;
        for (const w of words) {
          if (display.endsWith(w)) {
            setDisplay((prev) => prev.slice(0, -w.length) || "0");
            deletedFunc = true;
            break;
          }
        }
        if (!deletedFunc) {
          setDisplay((prev) => prev.slice(0, -1));
        }
      }
    }
  };

  const handleToggleSign = () => {
    playClickSound();
    try {
      if (display === "0" || display === "Error") return;
      if (display.startsWith("-")) {
        setDisplay((prev) => prev.slice(1));
      } else {
        setDisplay((prev) => "-" + prev);
      }
    } catch (e) {
      setDisplay("Error");
    }
  };

  const handleEvaluate = () => {
    playClickSound();
    if (!display || display === "Error") return;

    try {
      // Clean string for javascript evaluation
      let cleanExpr = display
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sin\(/g, isDegree ? "Math.sin(Math.PI/180*" : "Math.sin(")
        .replace(/cos\(/g, isDegree ? "Math.cos(Math.PI/180*" : "Math.cos(")
        .replace(/tan\(/g, isDegree ? "Math.tan(Math.PI/180*" : "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/\^/g, "**");

      // Auto close matching parentheses
      const openBrackets = (cleanExpr.match(/\(/g) || []).length;
      const closeBrackets = (cleanExpr.match(/\)/g) || []).length;
      if (openBrackets > closeBrackets) {
        cleanExpr += ")".repeat(openBrackets - closeBrackets);
      }

      // eslint-disable-next-line no-eval
      const result = eval(cleanExpr);
      
      if (result === undefined || isNaN(result) || !isFinite(result)) {
        setDisplay("Error");
        return;
      }

      const roundedResult = Number(parseFloat(result.toFixed(8)).toString());
      setEquation(`${display} =`);
      setDisplay(String(roundedResult));
      
      const logItem = {
        expr: display,
        res: roundedResult,
        id: Date.now()
      };
      setHistory((prev) => [logItem, ...prev].slice(0, 20));
      setShouldReset(true);
    } catch (e) {
      setDisplay("Error");
    }
  };

  const handleKeyboardInput = (e) => {
    const key = e.key;
    if (/[0-9]/.test(key)) {
      handleKeyPress(key);
    } else if (key === ".") {
      handleKeyPress(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
      handleOperator(key);
    } else if (key === "(" || key === ")") {
      handleKeyPress(key);
    } else if (key === "^") {
      handleKeyPress("^");
    } else if (key === "Enter" || key === "=") {
      e.preventDefault();
      handleEvaluate();
    } else if (key === "Backspace") {
      handleBackspace();
    } else if (key === "Escape" || key === "c" || key === "C") {
      handleClear();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardInput);
    return () => {
      window.removeEventListener("keydown", handleKeyboardInput);
    };
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Binary className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Scientific Calculator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Math, Calculator
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Perform scientific computations. Support for trigonometric, logarithmic, and exponential operations, degree/radian selectors, and interactive history logs.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center shrink-0">
              
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-bold transition ${
                  soundEnabled
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-surface-soft border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <span>Click Sound: {soundEnabled ? "ON" : "OFF"}</span>
              </button>

              <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground self-start md:self-auto">
                {["Scientific", "Rad/Deg", "Equations"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {item}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          
          {/* Calculator Grid - 8 Cols */}
          <div className="lg:col-span-8 flex justify-center">
            
            {/* Wider Scientific Calculator Frame */}
            <div className="w-full bg-card border border-border rounded-3xl p-5 shadow-lg space-y-4">
              
              {/* Screen Display */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 text-right space-y-1 overflow-hidden min-h-[90px] flex flex-col justify-end">
                <div className="flex justify-between items-center text-[10px] font-bold text-primary/70 font-mono">
                  <span className="bg-primary/10 px-1.5 py-0.5 rounded uppercase">{isDegree ? "DEG" : "RAD"}</span>
                  <span className="truncate max-w-[80%]">{equation}</span>
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight truncate select-all">
                  {display}
                </div>
              </div>

              {/* Calculator Button Grid - 5 Columns */}
              <div className="grid grid-cols-5 gap-2">
                
                {/* Row 1 */}
                <button
                  onClick={() => setIsDegree(!isDegree)}
                  className="h-12 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-black transition-all"
                >
                  {isDegree ? "RAD" : "DEG"}
                </button>
                <button
                  onClick={() => handleKeyPress("(")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/80 rounded-xl text-sm font-bold transition-all"
                >
                  (
                </button>
                <button
                  onClick={() => handleKeyPress(")")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/80 rounded-xl text-sm font-bold transition-all"
                >
                  )
                </button>
                <button
                  onClick={handleClear}
                  className="h-12 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-black uppercase transition-all"
                >
                  AC
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/80 rounded-xl text-sm flex items-center justify-center transition-all"
                >
                  <ArrowLeft size={16} />
                </button>

                {/* Row 2 */}
                <button
                  onClick={() => handleFunction("sin")}
                  className="h-12 bg-surface-soft border border-border text-primary font-bold rounded-xl text-xs hover:border-primary transition-all"
                >
                  sin
                </button>
                <button
                  onClick={() => handleKeyPress("7")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  7
                </button>
                <button
                  onClick={() => handleKeyPress("8")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  8
                </button>
                <button
                  onClick={() => handleKeyPress("9")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  9
                </button>
                <button
                  onClick={() => handleOperator("/")}
                  className="h-12 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-base font-black transition-all"
                >
                  ÷
                </button>

                {/* Row 3 */}
                <button
                  onClick={() => handleFunction("cos")}
                  className="h-12 bg-surface-soft border border-border text-primary font-bold rounded-xl text-xs hover:border-primary transition-all"
                >
                  cos
                </button>
                <button
                  onClick={() => handleKeyPress("4")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  4
                </button>
                <button
                  onClick={() => handleKeyPress("5")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  5
                </button>
                <button
                  onClick={() => handleKeyPress("6")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  6
                </button>
                <button
                  onClick={() => handleOperator("*")}
                  className="h-12 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-base font-black transition-all"
                >
                  ×
                </button>

                {/* Row 4 */}
                <button
                  onClick={() => handleFunction("tan")}
                  className="h-12 bg-surface-soft border border-border text-primary font-bold rounded-xl text-xs hover:border-primary transition-all"
                >
                  tan
                </button>
                <button
                  onClick={() => handleKeyPress("1")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  1
                </button>
                <button
                  onClick={() => handleKeyPress("2")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  2
                </button>
                <button
                  onClick={() => handleKeyPress("3")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  3
                </button>
                <button
                  onClick={() => handleOperator("-")}
                  className="h-12 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-base font-black transition-all"
                >
                  -
                </button>

                {/* Row 5 */}
                <button
                  onClick={() => handleFunction("log")}
                  className="h-12 bg-surface-soft border border-border text-primary font-bold rounded-xl text-xs hover:border-primary transition-all"
                >
                  log
                </button>
                <button
                  onClick={() => handleKeyPress("0")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeyPress(".")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  .
                </button>
                <button
                  onClick={handleToggleSign}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  +/-
                </button>
                <button
                  onClick={() => handleOperator("+")}
                  className="h-12 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-base font-black transition-all"
                >
                  +
                </button>

                {/* Row 6 */}
                <button
                  onClick={() => handleFunction("ln")}
                  className="h-12 bg-surface-soft border border-border text-primary font-bold rounded-xl text-xs hover:border-primary transition-all"
                >
                  ln
                </button>
                <button
                  onClick={() => handleKeyPress("π")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  π
                </button>
                <button
                  onClick={() => handleKeyPress("e")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  e
                </button>
                <button
                  onClick={() => handleKeyPress("^")}
                  className="h-12 bg-surface-soft border border-border text-foreground hover:bg-surface-soft/85 rounded-xl text-sm font-bold transition-all"
                >
                  x^y
                </button>
                <button
                  onClick={() => handleFunction("sqrt")}
                  className="h-12 bg-surface-soft border border-border text-primary font-bold rounded-xl text-xs hover:border-primary transition-all"
                >
                  √
                </button>

              </div>

              {/* Equals block spanning full width */}
              <button
                onClick={handleEvaluate}
                className="w-full h-12 bg-primary text-white hover:brightness-110 rounded-2xl text-base font-black transition-all shadow-md mt-2"
              >
                = Evaluate Expression
              </button>

            </div>

          </div>

          {/* History Panel - 4 Cols */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} className="text-primary" />
                  Calculation Log
                </span>
                
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground italic text-center py-12">
                  No calculations registered yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setDisplay(String(item.res));
                        setEquation(`${item.expr} =`);
                      }}
                      className="p-3 bg-surface-soft border border-border/80 rounded-xl text-right font-mono text-xs cursor-pointer hover:border-primary/50 transition-all space-y-0.5"
                    >
                      <div className="text-muted-foreground text-[10px] truncate">{item.expr}</div>
                      <div className="text-foreground font-black text-sm">{item.res}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
