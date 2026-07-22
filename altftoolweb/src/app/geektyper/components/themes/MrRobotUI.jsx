// src/app/geek2/components/themes/MrRobotUI.jsx - MR. ROBOT HACKER THEME
import React, { useRef, useEffect, useState } from "react";
import { Terminal as TerminalIcon, Shield, Zap, Key, Skull, Radio, Scan, Eye, Lock, Activity } from "lucide-react";

export default function MrRobotUI({
  moduleId,
  onClose,
  handleMouseDown,
  pos,
  hashRate,
  minerLogs,
  crackLogs,
  progress,
  canvasRef,
  renderFolderInnerContent,
  currentTheme = "mrrobot",
  themes = {},
}) {
  const localBgCanvasRef = useRef(null);
  const staticCanvasRef = useRef(null);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [staticNoise, setStaticNoise] = useState(0);

  // Get theme colors
  const themeConfig = themes?.mrrobot || {
    primary: "#f43f5e",
    secondary: "#0a0507",
    name: "F_SOCIETY_GRID"
  };

  const bgColor = themeConfig.secondary || "#0a0507";
  const accentColor = themeConfig.primary || "#f43f5e";

  // Main Background Animation with multiple layers
  useEffect(() => {
    const canvas = localBgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let binaryDrops = [];
    let gridOffset = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 450;
      canvas.height = canvas.parentElement?.clientHeight || 350;

      // Initialize matrix drops
      const columns = Math.floor(canvas.width / 18);
      binaryDrops = Array(columns).fill(1);
    };
    resizeCanvas();

    const drawBackground = () => {
      if (!ctx) return;

      // Dark base layer with gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#0a0507");
      gradient.addColorStop(1, "#14080a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.02;
      gridOffset += 0.5;

      // 1. CYBERPUNK GRID
      ctx.strokeStyle = `rgba(244, 63, 94, 0.06)`;
      ctx.lineWidth = 0.5;

      // Horizontal grid lines
      for (let i = 0; i < canvas.height; i += 25) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Vertical grid lines with perspective effect
      for (let i = 0; i < canvas.width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + Math.sin(gridOffset + i * 0.02) * 3, canvas.height);
        ctx.stroke();
      }

      // 2. BINARY RAIN (Matrix effect)
      ctx.fillStyle = `rgba(244, 63, 94, 0.12)`;
      ctx.font = "7px 'Courier New', monospace";

      for (let i = 0; i < binaryDrops.length; i++) {
        const char = Math.random() > 0.7 ?
          (Math.random() > 0.5 ? "1" : "0") :
          String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillText(char, i * 18, binaryDrops[i] * 12);

        if (binaryDrops[i] * 12 > canvas.height && Math.random() > 0.98) {
          binaryDrops[i] = 0;
        }
        binaryDrops[i]++;
      }

      // 3. SCANNING LINE (Radar effect)
      const scanLine = (time * 80) % canvas.height;
      const scanGradient = ctx.createLinearGradient(0, scanLine - 15, 0, scanLine + 15);
      scanGradient.addColorStop(0, "transparent");
      scanGradient.addColorStop(0.5, `rgba(244, 63, 94, 0.12)`);
      scanGradient.addColorStop(1, "transparent");
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLine - 15, canvas.width, 30);

      ctx.strokeStyle = `rgba(244, 63, 94, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanLine);
      ctx.lineTo(canvas.width, scanLine);
      ctx.stroke();

      // 4. RADIAL PULSE (Threat indicator)
      const pulseRadius = 30 + Math.sin(time * 5) * 10;
      const centerX = canvas.width * 0.3;
      const centerY = canvas.height * 0.7;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 63, 94, 0.03)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 63, 94, 0.05)`;
      ctx.fill();

      // 5. HEXAGONAL PATTERN (Background decoration)
      const hexSize = 35;
      const cols = Math.ceil(canvas.width / hexSize);
      const rows = Math.ceil(canvas.height / hexSize);

      ctx.strokeStyle = `rgba(244, 63, 94, 0.03)`;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * hexSize;
          const y = j * hexSize + (i % 2) * (hexSize / 2);

          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const angle = (k * 60) * Math.PI / 180;
            const xPos = x + hexSize / 2 + hexSize * 0.7 * Math.cos(angle);
            const yPos = y + hexSize / 2 + hexSize * 0.7 * Math.sin(angle);
            if (k === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // 6. DATA STREAMS (Floating code)
      ctx.fillStyle = `rgba(244, 63, 94, 0.1)`;
      ctx.font = "6px monospace";
      for (let i = 0; i < 15; i++) {
        const x = (Math.sin(time * 0.5 + i) * 20 + i * 30) % canvas.width;
        const y = (time * 20 + i * 25) % canvas.height;
        const code = ["0x7F", "0x3A", "0xFF", "0x00", "0xDE", "0xAD", "0xBE", "0xEF"][Math.floor(Math.random() * 8)];
        ctx.fillText(code, x, y);
      }

      // 7. GLITCH EFFECT (Random screen distortion)
      if (Math.random() > 0.97) {
        const glitchX = Math.random() * canvas.width;
        const glitchWidth = 20 + Math.random() * 50;
        ctx.fillStyle = `rgba(255, 255, 255, 0.08)`;
        ctx.fillRect(glitchX, 0, glitchWidth, canvas.height);

        ctx.fillStyle = `rgba(244, 63, 94, 0.1)`;
        ctx.fillRect(glitchX + glitchWidth / 2, 0, 5, canvas.height);
      }

      animationId = requestAnimationFrame(drawBackground);
    };

    drawBackground();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Static Noise Effect
  useEffect(() => {
    const staticCanvas = staticCanvasRef.current;
    if (!staticCanvas) return;
    const ctx = staticCanvas.getContext("2d");
    let animationId;

    const resizeStatic = () => {
      staticCanvas.width = staticCanvas.parentElement?.clientWidth || 450;
      staticCanvas.height = staticCanvas.parentElement?.clientHeight || 350;
    };
    resizeStatic();

    const drawStatic = () => {
      if (!ctx) return;
      const imageData = ctx.createImageData(staticCanvas.width, staticCanvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 30;
        data[i] = noise;     // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = 10 + Math.random() * 20; // Alpha
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(drawStatic);
    };

    drawStatic();
    window.addEventListener('resize', resizeStatic);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeStatic);
    };
  }, []);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchIntensity(Math.random() * 0.3);
      setStaticNoise(Math.random() * 0.15);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const getModuleIcon = () => {
    switch(moduleId) {
      case 'miner': return <Zap className="w-3 h-3" />;
      case 'compiler': return <Radio className="w-3 h-3" />;
      case 'cracker': return <Key className="w-3 h-3" />;
      case 'malware': return <Skull className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  const getModuleTitle = () => {
    switch(moduleId) {
      case 'miner': return 'CRYPTO_MINER // POOL_ACTIVE';
      case 'compiler': return 'WAVE_COMPILER // ASSEMBLING';
      case 'cracker': return 'PASSWORD_CRACKER // BRUTE_FORCE';
      case 'malware': return 'MALWARE_DEPLOY // INFECTING';
      default: return 'F_SOCIETY // CORE_SHELL';
    }
  };

  return (
    <div
      className="fixed font-mono rounded-md overflow-hidden z-30 select-none backdrop-blur-[1px]"
      style={{
        left: pos.x,
        top: pos.y,
        width: moduleId === "miner" ? "560px" : "380px",
        backgroundColor: bgColor,
        border: `1px solid ${accentColor}40`,
        boxShadow: `0 0 40px ${accentColor}25, inset 0 0 30px ${accentColor}08`,
        transform: `translate(${glitchIntensity}px, ${glitchIntensity / 2}px)`
      }}
    >
      {/* Animated Background Layer */}
      <canvas
        ref={localBgCanvasRef}
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />

      {/* Static Noise Layer */}
      <canvas
        ref={staticCanvasRef}
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
        style={{ opacity: staticNoise }}
      />

      {/* CRT Scanlines Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg,
            rgba(0,0,0,0.3) 0px,
            rgba(0,0,0,0.3) 2px,
            transparent 2px,
            transparent 4px)`,
          opacity: 0.4
        }}
      />

      {/* Vignette Effect */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle at center, transparent 40%, ${bgColor} 100%)`,
          opacity: 0.6
        }}
      />

      {/* Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="relative h-8 px-3 flex items-center justify-between cursor-grab border-b z-10"
        style={{
          backgroundColor: `${accentColor}15`,
          borderColor: `${accentColor}30`,
          backdropFilter: "blur(2px)"
        }}
      >
        <div className="flex items-center gap-2 text-[10px] tracking-wider font-bold uppercase">
          <div className="animate-pulse" style={{ color: accentColor }}>
            {getModuleIcon()}
          </div>
          <span className="text-white/90">{getModuleTitle()}</span>
          <div className="flex gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: "0.3s" }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: "0.6s" }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[8px] font-mono opacity-40" style={{ color: accentColor }}>PID: {Math.floor(Math.random() * 9999)}</div>
          <button
            onClick={onClose}
            className="close-btn-action w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer text-sm font-bold"
            style={{ color: accentColor }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${accentColor}30`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative p-4 z-10">
        {/* Status Line */}
        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: `${accentColor}70`, borderColor: `${accentColor}20` }}>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>[ f_society::operational ]</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            <span>stealth_mode::active</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3" />
            <span>encrypted::aes256</span>
          </div>
        </div>

        {renderFolderInnerContent && renderFolderInnerContent() ? (
          <div className="relative z-10 w-full">{renderFolderInnerContent()}</div>
        ) : (
          <div className="w-full space-y-3">

            {/* MINER MODULE */}
            {moduleId === "miner" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}20` }}>
                    <div className="text-[8px] opacity-50 uppercase">Pool Hashrate</div>
                    <div className="text-sm font-bold" style={{ color: accentColor }}>{hashRate || 342.89} MH/s</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}20` }}>
                    <div className="text-[8px] opacity-50 uppercase">Accepted Shares</div>
                    <div className="text-sm font-bold text-white">{Math.floor(Math.random() * 1000)}</div>
                  </div>
                </div>

                <div className="h-28 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll" style={{ color: `${accentColor}90` }}>
                  <div className="text-[8px] opacity-50 mb-1">{"// MINING_LOG_STREAM"}</div>
                  {minerLogs?.map((l, i) => (
                    <div key={i} className="border-l-2 pl-2" style={{ borderColor: `${accentColor}50` }}>
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPILER MODULE */}
            {moduleId === "compiler" && (
              <div className="space-y-3">
                <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                    <span className="text-[9px] font-bold uppercase" style={{ color: accentColor }}>Live Waveform Analysis</span>
                  </div>
                  <canvas ref={canvasRef} className="w-full h-20 rounded" style={{ backgroundColor: `${accentColor}05` }} />
                </div>
                <div className="text-[9px] text-center animate-pulse" style={{ color: `${accentColor}70` }}>
                  [+] Compiling polymorphic payload...
                </div>
              </div>
            )}

            {/* CRACKER MODULE */}
            {moduleId === "cracker" && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span>Decryption Progress</span>
                    <span style={{ color: accentColor }}>{Math.floor(progress || 0)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                  </div>
                </div>

                <div className="h-24 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll" style={{ color: `${accentColor}80` }}>
                  <div className="text-[8px] opacity-50 mb-1">{"// BRUTE_FORCE_LOG"}</div>
                  {crackLogs?.map((l, i) => (
                    <div key={i} className="font-mono">› {l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* MALWARE MODULE */}
            {moduleId === "malware" && (
              <div className="space-y-4 text-center">
                <div className="text-5xl animate-pulse" style={{ color: accentColor }}>☠️</div>
                <div className="font-black tracking-widest text-sm uppercase" style={{ color: accentColor }}>
                  Deploying RAT • {Math.floor(progress || 0)}%
                </div>
                <div className="w-full">
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress || 0}%`,
                        backgroundColor: accentColor,
                        boxShadow: `0 0 15px ${accentColor}`
                      }}
                    />
                  </div>
                </div>
                <div className="text-[8px] animate-pulse" style={{ color: `${accentColor}60` }}>
                  Establishing C2 channel • Encrypting local files
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Status */}
        <div className="mt-4 pt-2 border-t flex justify-between items-center text-[7px] uppercase tracking-wider" style={{ color: `${accentColor}50`, borderColor: `${accentColor}15` }}>
          <div className="flex items-center gap-2">
            <Radio className="w-2.5 h-2.5" />
            <span>TOR_NETWORK::CONNECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Scan className="w-2.5 h-2.5 animate-pulse" />
            <span>ACTIVE_SCAN::ON</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span>STATUS::ROOT</span>
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br" style={{ borderColor: `${accentColor}40` }} />
    </div>
  );
}
