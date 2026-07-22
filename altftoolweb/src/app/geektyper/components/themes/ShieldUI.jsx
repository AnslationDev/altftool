// src/app/geek2/components/themes/ShieldUI.jsx - WITH RADAR BACKGROUND
import React, { useRef, useEffect, useState } from "react";
import { Shield, Radio, ShieldCheck, Lock, Eye, Activity, Zap, Key, Skull, Bomb, Network, Keyboard, Ghost, Fish, DoorOpen, Cpu, Scan, Wifi, Server, Database, Radar, Target } from "lucide-react";

export default function ShieldUI({
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
  currentTheme = "shield",
  themes = {},
}) {
  const bgCanvasRef = useRef(null);
  const radarCanvasRef = useRef(null);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [scanLinePos, setScanLinePos] = useState(0);

  const themeConfig = {
    primary: "#38bdf8",
    secondary: "#010b14",
    accent: "#0ea5e9",
    glow: "rgba(56,189,248,0.3)",
    name: "SHIELD_PROXY_CORE"
  };

  const accentColor = themeConfig.primary;
  const bgColor = themeConfig.secondary;

  // ============================================================
  // RADAR BACKGROUND ANIMATION
  // ============================================================
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let radarAngle = 0;
    let scanProgress = 0;
    let particles = [];
    let binaryDrops = [];
    let blips = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 400;

      // Initialize particles
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 1 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.3,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3
        });
      }

      // Initialize binary drops
      const columns = Math.floor(canvas.width / 20);
      binaryDrops = Array(columns).fill(1);

      // Initialize radar blips
      for (let i = 0; i < 8; i++) {
        blips.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 2 + Math.random() * 4,
          alpha: 0.3 + Math.random() * 0.5,
          pulse: 0
        });
      }
    };
    resizeCanvas();

    // Draw cyber grid background
    const drawCyberGrid = () => {
      if (!ctx) return;
      ctx.strokeStyle = `rgba(56, 189, 248, 0.06)`;
      ctx.lineWidth = 0.5;

      // Horizontal lines
      for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Vertical lines
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
    };

    // Draw hexagon pattern
    const drawHexPattern = () => {
      const hexSize = 35;
      const cols = Math.ceil(canvas.width / hexSize);
      const rows = Math.ceil(canvas.height / hexSize);

      ctx.strokeStyle = `rgba(56, 189, 248, 0.04)`;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * hexSize;
          const y = j * hexSize + (i % 2) * (hexSize / 2);

          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const angle = (k * 60) * Math.PI / 180;
            const xPos = x + hexSize / 2 + hexSize * 0.65 * Math.cos(angle);
            const yPos = y + hexSize / 2 + hexSize * 0.65 * Math.sin(angle);
            if (k === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    // Draw binary rain
    const drawBinaryRain = () => {
      ctx.font = "8px monospace";

      for (let i = 0; i < binaryDrops.length; i++) {
        const char = Math.random() > 0.7 ? (Math.random() > 0.5 ? "1" : "0") : String.fromCharCode(0x30A0 + Math.random() * 96);
        ctx.fillStyle = `rgba(56, 189, 248, 0.06)`;
        ctx.fillText(char, i * 20, binaryDrops[i] * 15);

        if (binaryDrops[i] * 15 > canvas.height && Math.random() > 0.975) {
          binaryDrops[i] = 0;
        }
        binaryDrops[i]++;
      }
    };

    // Draw particles
    const drawParticles = () => {
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * 0.3})`;
        ctx.fill();
      });
    };

    // Draw MAIN RADAR (Center Screen)
    const drawMainRadar = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

      // Radar outer rings
      for (let i = 1; i <= 3; i++) {
        const radius = maxRadius * (i / 3);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 + i * 0.05})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Radar crosshairs (horizontal and vertical lines)
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.strokeStyle = `rgba(56, 189, 248, 0.15)`;
      ctx.stroke();

      // Diagonal crosshairs
      const diagonal = maxRadius * 0.7;
      ctx.beginPath();
      ctx.moveTo(centerX - diagonal, centerY - diagonal);
      ctx.lineTo(centerX + diagonal, centerY + diagonal);
      ctx.moveTo(centerX + diagonal, centerY - diagonal);
      ctx.lineTo(centerX - diagonal, centerY + diagonal);
      ctx.stroke();

      // Animated radar sweep line
      const rad = (radarAngle * Math.PI) / 180;
      const endX = centerX + Math.cos(rad) * maxRadius;
      const endY = centerY + Math.sin(rad) * maxRadius;

      // Sweep gradient
      const sweepGradient = ctx.createLinearGradient(centerX, centerY, endX, endY);
      sweepGradient.addColorStop(0, `rgba(56, 189, 248, 0.4)`);
      sweepGradient.addColorStop(1, `rgba(56, 189, 248, 0)`);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(centerX + Math.cos(rad + Math.PI/4) * maxRadius * 0.3, centerY + Math.sin(rad + Math.PI/4) * maxRadius * 0.3);
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(56, 189, 248, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Radar blips (targets)
      blips.forEach(blip => {
        const dx = blip.x - centerX;
        const dy = blip.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxRadius) {
          blip.pulse = (blip.pulse + 0.05) % (Math.PI * 2);
          const pulseRadius = 3 + Math.sin(blip.pulse) * 2;

          ctx.beginPath();
          ctx.arc(blip.x, blip.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, 0.8)`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(blip.x, blip.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, 1)`;
          ctx.fill();
        }
      });

      // Random blip generation
      if (Math.random() > 0.98) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * maxRadius;
        const newBlip = {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          radius: 2,
          alpha: 0.8,
          pulse: 0
        };
        blips.push(newBlip);
        if (blips.length > 12) blips.shift();
      }

      radarAngle = (radarAngle + 2.5) % 360;
    };

    // Draw scanning line (horizontal)
    const drawScanLine = () => {
      const scanY = scanLinePos;
      const gradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(0.5, `rgba(56, 189, 248, 0.1)`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      ctx.strokeStyle = `rgba(56, 189, 248, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();
    };

    // Draw corner radar mini displays
    const drawMiniRadars = () => {
      // Top-left mini radar
      drawMiniRadar(50, 50, 40);
      // Bottom-right mini radar
      drawMiniRadar(canvas.width - 50, canvas.height - 50, 40);
    };

    const drawMiniRadar = (cx, cy, radius) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, 0.2)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      const angle = (Date.now() * 0.003) % 360;
      const rad = (angle * Math.PI) / 180;
      const endX = cx + Math.cos(rad) * radius;
      const endY = cy + Math.sin(rad) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(56, 189, 248, 0.4)`;
      ctx.stroke();

      // Random blip
      if (Math.random() > 0.99) {
        const blipAngle = Math.random() * Math.PI * 2;
        const blipDist = Math.random() * radius;
        const blipX = cx + Math.cos(blipAngle) * blipDist;
        const blipY = cy + Math.sin(blipAngle) * blipDist;
        ctx.beginPath();
        ctx.arc(blipX, blipY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, 0.7)`;
        ctx.fill();
      }
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      // Dark base with slight transparency
      ctx.fillStyle = "rgba(1, 11, 20, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all layers
      drawCyberGrid();
      drawHexPattern();
      drawBinaryRain();
      drawParticles();
      drawMainRadar();
      drawMiniRadars();
      drawScanLine();

      // Random glitch effect
      if (Math.random() > 0.99) {
        ctx.fillStyle = `rgba(56, 189, 248, 0.06)`;
        ctx.fillRect(Math.random() * canvas.width, 0, 30 + Math.random() * 50, canvas.height);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resizeCanvas);

    // Animate scan line
    const scanInterval = setInterval(() => {
      setScanLinePos(prev => (prev >= canvas.height ? 0 : prev + 2));
    }, 25);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(scanInterval);
    };
  }, []);

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchIntensity(Math.random() * 0.3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getModuleIcon = () => {
    const icons = {
      miner: <Cpu className="w-3.5 h-3.5" />,
      compiler: <Zap className="w-3.5 h-3.5" />,
      cracker: <Key className="w-3.5 h-3.5" />,
      malware: <Skull className="w-3.5 h-3.5" />,
      ransomware: <Lock className="w-3.5 h-3.5" />,
      ddos: <Bomb className="w-3.5 h-3.5" />,
      darkweb: <Network className="w-3.5 h-3.5" />,
      keylogger: <Keyboard className="w-3.5 h-3.5" />,
      rootkit: <Ghost className="w-3.5 h-3.5" />,
      exploit: <Activity className="w-3.5 h-3.5" />,
      phishing: <Fish className="w-3.5 h-3.5" />,
      backdoor: <DoorOpen className="w-3.5 h-3.5" />
    };
    return icons[moduleId] || <Shield className="w-3.5 h-3.5" />;
  };

  const getModuleTitle = () => {
    const titles = {
      miner: 'SECURE_MINER // PROXY_TUNNEL',
      compiler: 'SECURE_COMPILER // SANDBOX',
      cracker: 'SECURE_CRACKER // DECRYPT',
      malware: 'SECURE_SCAN // THREAT_DETECT',
      ransomware: 'SECURE_BLOCK // RANSOM_DEFEND',
      ddos: 'SECURE_SHIELD // DDoS_PROTECT',
      darkweb: 'SECURE_BROWSER // TOR_PROXY',
      keylogger: 'SECURE_MONITOR // KEY_SCAN',
      rootkit: 'SECURE_KERNEL // ROOT_SCAN',
      exploit: 'SECURE_PATCH // ZERO_DAY',
      phishing: 'SECURE_EMAIL // PHISH_FILTER',
      backdoor: 'SECURE_GATEWAY // BACKDOOR_BLOCK'
    };
    return titles[moduleId] || 'SHIELD_PROXY_CORE';
  };

  const renderModuleContent = () => {
    switch(moduleId) {
      case "miner":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}20` }}>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-pulse" style={{ color: accentColor }} />
                <span className="text-[10px] font-bold">PROXY TUNNEL HASHRATE</span>
              </div>
              <span className="text-lg font-bold" style={{ color: accentColor }}>{hashRate || 342.89} MH/s</span>
            </div>
            <div className="h-28 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll p-2 rounded-lg" style={{ backgroundColor: `${accentColor}05`, border: `1px solid ${accentColor}15` }}>
              <div className="text-[8px] opacity-50 mb-1">{"// SECURE_MINING_LOG"}</div>
              {minerLogs?.slice(0, 6).map((l, i) => (
                <div key={i} className="border-l-2 pl-2" style={{ borderColor: `${accentColor}40` }}>{l}</div>
              ))}
            </div>
          </div>
        );

      case "cracker":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
              <span className="text-[9px] font-bold">DECRYPTION PROGRESS</span>
              <span style={{ color: accentColor }}>{Math.floor(progress || 0)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
            </div>
            <div className="h-28 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll p-2 rounded-lg" style={{ backgroundColor: `${accentColor}05`, border: `1px solid ${accentColor}15` }}>
              {crackLogs?.slice(0, 5).map((l, i) => (
                <div key={i} className="text-yellow-500">› {l}</div>
              ))}
            </div>
          </div>
        );

      case "compiler":
        return (
          <div className="space-y-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}05`, border: `1px solid ${accentColor}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                <span className="text-[9px] font-bold uppercase" style={{ color: accentColor }}>Secure Compilation in Progress</span>
              </div>
              <canvas ref={canvasRef} className="w-full h-20 rounded-lg" style={{ backgroundColor: `${accentColor}05` }} />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
            <div className="text-4xl mb-2 animate-pulse">{getModuleIcon()}</div>
            <div className="font-bold text-sm uppercase">{getModuleTitle()}</div>
            <div className="text-[9px] opacity-70 mt-2">Secure module is active</div>
            <div className="w-full h-1.5 mt-3 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed font-mono rounded-lg overflow-hidden z-30 select-none transition-all duration-300"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: moduleId === "miner" ? "520px" : "400px",
        backgroundColor: bgColor,
        border: `1px solid ${accentColor}40`,
        boxShadow: `0 0 30px ${accentColor}25, inset 0 0 20px ${accentColor}05`,
        transform: `translate(${glitchIntensity}px, ${glitchIntensity / 2}px)`
      }}
    >
      {/* Animated Radar Background Canvas */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 pointer-events-none z-0 w-full h-full" style={{ opacity: 0.9 }} />

      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_2px,transparent_2px,transparent_4px)]" />

      {/* Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="relative h-9 px-4 flex items-center justify-between cursor-grab border-b z-10"
        style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}30` }}
      >
        <div className="flex items-center gap-2 text-[10px] tracking-wider font-bold uppercase">
          <div className="animate-pulse" style={{ color: accentColor }}>
            <Radar className="w-3.5 h-3.5" />
          </div>
          <span className="text-white/90">{getModuleTitle()}</span>
          <div className="flex gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: "0.3s" }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: "0.6s" }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-red-400 animate-pulse" />
            <span className="text-[7px] text-red-400 font-mono">TRACKING</span>
          </div>
          <button
            onClick={onClose}
            className="close-btn-action w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer text-sm font-bold hover:bg-red-600 hover:text-white"
            style={{ color: accentColor }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative p-4 z-10">
        {/* Status Line */}
        <div className="flex justify-between items-center text-[8px] uppercase tracking-wider mb-3 pb-2 border-b" style={{ color: `${accentColor}60`, borderColor: `${accentColor}20` }}>
          <div className="flex items-center gap-2">
            <Radar className="w-2.5 h-2.5 animate-pulse" />
            <span>RADAR::ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-2.5 h-2.5" />
            <span>ENCRYPTED::AES256</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-2.5 h-2.5" />
            <span>STEALTH::ACTIVE</span>
          </div>
        </div>

        {renderFolderInnerContent && renderFolderInnerContent() ? (
          <div className="relative z-10 w-full">{renderFolderInnerContent()}</div>
        ) : (
          renderModuleContent()
        )}

        {/* Footer */}
        <div className="mt-3 pt-2 border-t flex justify-between items-center text-[7px] uppercase tracking-wider" style={{ color: `${accentColor}50`, borderColor: `${accentColor}15` }}>
          <div className="flex items-center gap-2">
            <Radar className="w-2.5 h-2.5 animate-pulse" />
            <span>RADAR_SWEEP</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-2.5 h-2.5 animate-pulse" />
            <span>SIGNAL_STRONG</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span>TRACKING_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: `${accentColor}40` }} />
    </div>
  );
}
