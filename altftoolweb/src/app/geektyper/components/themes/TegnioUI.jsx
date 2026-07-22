import React, { useRef, useEffect, useState } from "react";
import { Activity, Cpu, Zap, Shield, AlertTriangle, Target, Radio, Scan } from "lucide-react";

export default function TegnioUI({
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
  currentTheme = "tegnio",
  themes = {}
}) {
  const localBgCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  // Get theme colors from props or use defaults
  const themeConfig = themes?.tegnio || {
    primary: "#ef4444",
    secondary: "#0a0000",
    name: "TEGNIO_CRIMSON_MATRIX"
  };

  const bgColor = themeConfig.secondary || "#0a0000";
  const accentColor = themeConfig.primary || "#ef4444";

  // ⚡ MAIN BACKGROUND ANIMATION ENGINE with increased visibility
  useEffect(() => {
    const canvas = localBgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let scanLineY = 0;
    let pulseAlpha = 0.08;
    let pulseDirection = 1;
    let dataStreams = [];
    let binaryColumns = [];

    // Initialize data streams with more characters
    for (let i = 0; i < 25; i++) {
      dataStreams.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.5 + Math.random() * 2.5,
        chars: "01XO#%&@!$*+=-<>?/\\|".split(""),
        charIndex: 0
      });
    }

    // Initialize binary columns for matrix rain
    for (let i = 0; i < 40; i++) {
      binaryColumns.push({
        x: i * 18,
        y: Math.random() * 100,
        speed: 1 + Math.random() * 4,
        chars: ["0", "1", "X", "O", "#", "%", "&", "@", "!", "$", "*", "+", "="],
        length: 8 + Math.floor(Math.random() * 15)
      });
    }

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 450;
      canvas.height = canvas.parentElement?.clientHeight || 350;

      // Reinitialize binary columns on resize
      binaryColumns = [];
      for (let i = 0; i < Math.floor(canvas.width / 18); i++) {
        binaryColumns.push({
          x: i * 18,
          y: Math.random() * canvas.height,
          speed: 1 + Math.random() * 4,
          chars: ["0", "1", "X", "O", "#", "%", "&", "@", "!", "$", "*", "+", "="],
          length: 8 + Math.floor(Math.random() * 15)
        });
      }
    };
    resizeCanvas();

    // Draw brighter grid lines
    const drawGrid = () => {
      if (!ctx) return;
      ctx.strokeStyle = `rgba(239, 68, 68, 0.15)`;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
    };

    // Draw hex pattern with higher opacity
    const drawHexPattern = () => {
      if (!ctx) return;
      const hexSize = 35;
      const cols = Math.ceil(canvas.width / hexSize);
      const rows = Math.ceil(canvas.height / hexSize);

      ctx.strokeStyle = `rgba(239, 68, 68, 0.08)`;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * hexSize;
          const y = j * hexSize + (i % 2) * (hexSize / 2);

          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const angle = (k * 60) * Math.PI / 180;
            const xPos = x + hexSize / 2 + hexSize * 0.75 * Math.cos(angle);
            const yPos = y + hexSize / 2 + hexSize * 0.75 * Math.sin(angle);
            if (k === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    };

    // Enhanced data streams with brighter characters
    const drawDataStreams = () => {
      if (!ctx) return;
      ctx.font = "9px monospace";
      ctx.fillStyle = `rgba(239, 68, 68, 0.25)`;

      dataStreams.forEach(stream => {
        stream.y += stream.speed;
        if (stream.y > canvas.height) {
          stream.y = 0;
          stream.x = Math.random() * canvas.width;
        }
        const char = stream.chars[Math.floor(Math.random() * stream.chars.length)];
        ctx.fillText(char, stream.x, stream.y);
      });
    };

    // Enhanced binary rain
    const drawBinaryRain = () => {
      if (!ctx) return;
      ctx.font = "8px monospace";

      binaryColumns.forEach(col => {
        col.y += col.speed;
        if (col.y > canvas.height + col.length * 12) {
          col.y = -col.length * 12;
          col.x = Math.random() * canvas.width;
        }

        for (let i = 0; i < col.length; i++) {
          const yPos = col.y - i * 12;
          if (yPos > 0 && yPos < canvas.height) {
            const opacity = i === 0 ? 0.35 : 0.15;
            ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`;
            const char = col.chars[Math.floor(Math.random() * col.chars.length)];
            ctx.fillText(char, col.x, yPos);
          }
        }
      });
    };

    // Brighter radial threat pulse
    const drawRadialPulse = () => {
      const centerX = canvas.width * 0.7;
      const centerY = canvas.height * 0.3;
      const radius = 40 + Math.sin(time * 4) * 15;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      gradient.addColorStop(0, `rgba(239, 68, 68, 0.15)`);
      gradient.addColorStop(0.5, `rgba(239, 68, 68, 0.08)`);
      gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const renderThreatBg = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      // Dynamic pulsing overlay with higher opacity
      pulseAlpha += 0.003 * pulseDirection;
      if (pulseAlpha > 0.15 || pulseAlpha < 0.03) pulseDirection *= -1;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulseAlpha * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw all layers
      drawGrid();
      drawHexPattern();
      drawBinaryRain();
      drawDataStreams();
      drawRadialPulse();

      // Brighter scanning laser bar
      scanLineY += 2;
      if (scanLineY > canvas.height) scanLineY = 0;

      const laserGradient = ctx.createLinearGradient(0, scanLineY - 12, 0, scanLineY + 8);
      laserGradient.addColorStop(0, "transparent");
      laserGradient.addColorStop(0.5, `rgba(239, 68, 68, 0.35)`);
      laserGradient.addColorStop(1, "transparent");
      ctx.fillStyle = laserGradient;
      ctx.fillRect(0, scanLineY - 12, canvas.width, 20);

      ctx.strokeStyle = `rgba(239, 68, 68, 0.7)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(canvas.width, scanLineY);
      ctx.stroke();

      // More frequent and visible glitch effects
      if (Math.random() > 0.96) {
        ctx.fillStyle = `rgba(239, 68, 68, 0.15)`;
        ctx.fillRect(Math.random() * canvas.width, 0, 25 + Math.random() * 40, canvas.height);

        ctx.fillStyle = `rgba(255, 255, 255, 0.08)`;
        ctx.fillRect(Math.random() * canvas.width, 0, 10, canvas.height);
      }

      animationId = requestAnimationFrame(renderThreatBg);
    };

    renderThreatBg();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [moduleId]);

  // Enhanced particle system with more particles and brighter colors
  useEffect(() => {
    const particleCanvas = particleCanvasRef.current;
    if (!particleCanvas) return;
    const ctx = particleCanvas.getContext("2d");
    let animationId;
    let particles = [];

    const resizeParticleCanvas = () => {
      particleCanvas.width = particleCanvas.parentElement?.clientWidth || 450;
      particleCanvas.height = particleCanvas.parentElement?.clientHeight || 350;

      // More particles for better visibility
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * particleCanvas.width,
          y: Math.random() * particleCanvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          life: Math.random() * 100,
          size: 1 + Math.random() * 3
        });
      }
    };

    const drawParticles = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.3;

        if (p.x < 0 || p.x > particleCanvas.width || p.y < 0 || p.y > particleCanvas.height || p.life < 0) {
          p.x = Math.random() * particleCanvas.width;
          p.y = Math.random() * particleCanvas.height;
          p.life = 100;
        }

        // Brighter particles
        ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + (p.life / 100) * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    resizeParticleCanvas();
    drawParticles();
    window.addEventListener('resize', resizeParticleCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeParticleCanvas);
    };
  }, []);

  // Random glitch intensity with higher variation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchIntensity(Math.random() * 0.5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getModuleIcon = () => {
    switch(moduleId) {
      case 'miner': return <Cpu className="w-3 h-3" />;
      case 'compiler': return <Zap className="w-3 h-3" />;
      case 'cracker': return <Target className="w-3 h-3" />;
      case 'malware': return <Shield className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getModuleTitle = () => {
    switch(moduleId) {
      case 'miner': return 'CRYPTO_MINING_ENGINE // ACTIVE';
      case 'compiler': return 'TROJAN_COMPILER // BUILDING';
      case 'cracker': return 'HASH_CRACKER // BRUTE_FORCE';
      case 'malware': return 'MALWARE_DEPLOYMENT // INFECTING';
      default: return 'TEGNIO_BREACH // THREAT_CORE';
    }
  };

  return (
    <div
      className="fixed font-mono rounded-lg text-xs border-2 overflow-hidden z-30 select-none transition-all duration-300"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: moduleId === "miner" ? "580px" : "380px",
        borderColor: `rgba(239, 68, 68, 0.8)`,
        backgroundColor: bgColor,
        boxShadow: `0 0 40px ${accentColor}60, inset 0 0 30px ${accentColor}20`,
        transform: `translate(${Math.random() * glitchIntensity}px, ${Math.random() * glitchIntensity}px)`
      }}
    >
      {/* Animated Background Canvas - Higher opacity */}
      <canvas
        ref={localBgCanvasRef}
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
        style={{ opacity: 1 }}
      />

      {/* Particle Canvas - Higher opacity */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
        style={{ opacity: 0.7 }}
      />

      {/* CRT Scanlines overlay for effect */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg,
            rgba(0,0,0,0.15) 0px,
            rgba(0,0,0,0.15) 2px,
            transparent 2px,
            transparent 4px)`,
        }}
      />

      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        className="relative h-8 px-3 flex items-center justify-between cursor-grab bg-gradient-to-r from-red-950/90 to-transparent border-b z-10 select-none"
        style={{ borderColor: `${accentColor}50` }}
      >
        <div className="flex items-center gap-2 text-[10px] tracking-wider font-bold text-white uppercase">
          <div className="animate-pulse">
            {getModuleIcon()}
          </div>
          <span className="text-red-400">
            {getModuleTitle()}
          </span>
          <div className="flex gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[8px] text-red-400/80 font-mono">PID: {Math.floor(Math.random() * 9999)}</div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-600 rounded transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative p-4 z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70" />

        {renderFolderInnerContent && renderFolderInnerContent() ? (
          <div className="relative z-10 w-full">{renderFolderInnerContent()}</div>
        ) : (
          <div className="w-full space-y-3 relative z-10">
            {moduleId === "miner" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black/70 p-2 rounded border border-red-500/40">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-red-400 text-[10px] font-bold">HASHRATE:</span>
                  </div>
                  <span className="text-red-500 font-mono text-base font-bold">{hashRate || 0} MH/s</span>
                </div>
                <div className="h-32 bg-black/80 border border-red-500/30 rounded p-2 overflow-y-auto text-[10px] font-mono custom-scroll">
                  <div className="space-y-1">
                    {minerLogs?.map((l, i) => (
                      <div key={i} className="text-red-400 border-l-2 border-red-500/70 pl-2">
                        {'> '}{l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {moduleId === "compiler" && (
              <div className="space-y-3">
                <div className="bg-black/70 p-2 rounded border border-red-500/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-red-400 text-[10px] font-bold">COMPILING MALWARE BINARY...</span>
                  </div>
                  <canvas ref={canvasRef} className="w-full h-24 bg-black/80 rounded border border-red-500/30" />
                </div>
              </div>
            )}

            {moduleId === "cracker" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black/70 p-2 rounded border border-red-500/40">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span className="text-red-400 text-[10px] font-bold">PROGRESS:</span>
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="w-full h-2 bg-red-950/80 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_8px_#ef4444]" style={{ width: `${progress || 0}%` }} />
                    </div>
                  </div>
                  <span className="text-red-500 font-mono text-sm font-bold">{Math.floor(progress || 0)}%</span>
                </div>
                <div className="h-28 bg-black/80 border border-red-500/30 rounded p-2 overflow-y-auto text-[10px] font-mono custom-scroll">
                  <div className="space-y-1">
                    {crackLogs?.map((l, i) => (
                      <div key={i} className="text-yellow-500 font-mono">{'> '}{l}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {moduleId === "malware" && (
              <div className="text-center space-y-4 bg-gradient-to-br from-red-950/50 to-black/80 p-4 rounded border border-red-500/40">
                <div className="text-6xl animate-pulse">☠️</div>
                <div className="text-white font-black tracking-widest text-sm uppercase">
                  DEPLOYING TROJAN: {Math.floor(progress || 0)}%
                </div>
                <div className="w-full">
                  <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-red-500/50">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_15px_#ef4444]"
                      style={{ width: `${progress || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-[9px] text-red-400 font-mono animate-pulse">
                  Encrypting system files...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status footer - More visible */}
        <div className="mt-3 pt-2 border-t border-red-500/30 flex justify-between items-center text-[8px] text-red-400/80 font-mono font-bold">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>SECURE CHANNEL: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Scan className="w-3 h-3 animate-pulse" />
            <span>ENCRYPTION: AES-256-GCM</span>
          </div>
        </div>
      </div>

      {/* Glowing corner accents - More visible */}
      <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-red-500/50 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-red-500/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-red-500/50 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-red-500/50 rounded-br-lg" />
    </div>
  );
}
