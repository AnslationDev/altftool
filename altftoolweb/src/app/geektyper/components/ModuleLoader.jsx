"use client";

import React, { useState, useEffect, useRef } from "react";
import { INDUSTRIAL_MATRIX } from "../data/INDUSTRIAL_MATRIX";

import MilitechUI from "./themes/MilitechUI";
import TegnioUI from "./themes/TegnioUI";
import ShieldUI from "./themes/ShieldUI";
import ApertureUI from "./themes/ApertureUI";
import MrRobotUI from "./themes/MrRobotUI";

export default function ModuleLoader({
  moduleId: initialModuleId,
  onClose,
  initialX,
  initialY,
  currentTheme = "militech",
}) {
  const [currentModuleId, setCurrentModuleId] = useState(initialModuleId);
  const [progress, setProgress] = useState(0);
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [minerLogs, setMinerLogs] = useState([]);
  const [crackLogs, setCrackLogs] = useState([]);
  const [hashRate, setHashRate] = useState(389.54);
  const [ransomwareFiles, setRansomwareFiles] = useState(0);
  const [ddosPackets, setDdosPackets] = useState(0);
  const [darkWebListings, setDarkWebListings] = useState([]);
  const [keylogs, setKeylogs] = useState([]);
  const canvasRef = useRef(null);

  const themeConfig = INDUSTRIAL_MATRIX[currentTheme] || INDUSTRIAL_MATRIX.militech;

  useEffect(() => {
    setCurrentModuleId(initialModuleId);
  }, [initialModuleId]);

  const handleMouseDown = (e) => {
    if (e.target.closest(".close-btn-action")) return;
    const startX = e.pageX - pos.x;
    const startY = e.pageY - pos.y;
    const handleMouseMove = (me) => setPos({ x: me.pageX - startX, y: me.pageY - startY });
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    setProgress(0);
    const progressTimer = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 1)), 120);

    // BITCOIN MINER
    if (currentModuleId === "miner") {
      const minerInterval = setInterval(() => {
        const timeStr = new Date().toLocaleTimeString();
        setMinerLogs((prev) => [
          `[${timeStr}] ⛏️ Share Verified // Hashrate: ${(384 + Math.random() * 12).toFixed(2)} MH/s`,
          `[${timeStr}] 💰 Block reward: ${(0.0001 + Math.random() * 0.0005).toFixed(6)} BTC`,
          ...prev.slice(0, 3),
        ]);
        setHashRate(parseFloat((384 + Math.random() * 12).toFixed(2)));
      }, 400);
      return () => clearInterval(minerInterval);
    }

    // PASSWORD CRACKER
    if (currentModuleId === "cracker") {
      const crackInterval = setInterval(() => {
        setCrackLogs((prev) => [
          `>> Hash: ${Math.random().toString(36).substring(2, 10).toUpperCase()} → ${Math.random() > 0.7 ? 'MATCH FOUND!' : 'Testing...'}`,
          ...prev.slice(0, 4),
        ]);
      }, 300);
      return () => clearInterval(crackInterval);
    }

    // RANSOMWARE
    if (currentModuleId === "ransomware") {
      const ransomInterval = setInterval(() => {
        setRansomwareFiles(prev => prev + Math.floor(Math.random() * 50));
        setProgress(p => p >= 100 ? 100 : p + Math.random() * 5);
      }, 200);
      return () => clearInterval(ransomInterval);
    }

    // DDoS ATTACK
    if (currentModuleId === "ddos") {
      const ddosInterval = setInterval(() => {
        setDdosPackets(prev => prev + Math.floor(Math.random() * 10000));
        setProgress(p => p >= 100 ? 100 : p + Math.random() * 3);
      }, 100);
      return () => clearInterval(ddosInterval);
    }

    // DARK WEB
    if (currentModuleId === "darkweb") {
      const darkwebInterval = setInterval(() => {
        const listings = [
          { item: "Stolen Database", price: "2.5 BTC", seller: "dark_market_42" },
          { item: "Zero-Day Exploit", price: "15 BTC", seller: "cyber_elite" },
          { item: "Credit Cards Pack", price: "0.5 BTC", seller: "carder_pro" },
          { item: "VPN Access Logs", price: "1.2 BTC", seller: "anon_hacker" },
        ];
        setDarkWebListings(prev => [listings[Math.floor(Math.random() * listings.length)], ...prev.slice(0, 4)]);
      }, 2000);
      return () => clearInterval(darkwebInterval);
    }

    // KEYLOGGER
    if (currentModuleId === "keylogger") {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
      const keylogInterval = setInterval(() => {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        setKeylogs(prev => [`[${new Date().toLocaleTimeString()}] Key: ${randomChar}`, ...prev.slice(0, 9)]);
      }, 150);
      return () => clearInterval(keylogInterval);
    }

    // ROOTKIT
    if (currentModuleId === "rootkit") {
      const rootkitInterval = setInterval(() => {
        setProgress(p => p >= 100 ? 100 : p + Math.random() * 8);
      }, 300);
      return () => clearInterval(rootkitInterval);
    }

    // ZERO-DAY EXPLOIT
    if (currentModuleId === "exploit") {
      const exploitInterval = setInterval(() => {
        setProgress(p => p >= 100 ? 100 : p + Math.random() * 10);
      }, 250);
      return () => clearInterval(exploitInterval);
    }

    // PHISHING
    if (currentModuleId === "phishing") {
      const phishingInterval = setInterval(() => {
        setCrackLogs((prev) => [
          `📧 Credentials harvested: ${Math.random().toString(36).substring(2, 10)}@example.com`,
          ...prev.slice(0, 4),
        ]);
        setProgress(p => p >= 100 ? 100 : p + Math.random() * 4);
      }, 500);
      return () => clearInterval(phishingInterval);
    }

    // BACKDOOR
    if (currentModuleId === "backdoor") {
      const backdoorInterval = setInterval(() => {
        setProgress(p => p >= 100 ? 100 : p + Math.random() * 6);
      }, 350);
      return () => clearInterval(backdoorInterval);
    }

    // COMPILER
    if (currentModuleId === "compiler" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 80;
      let waveOffset = 0, renderId;

      const strokeColors = {
        militech: "#00ff88",
        tegnio: "#ef4444",
        shield: "#38bdf8",
        aperture: "#22d3ee",
        mrrobot: "#f43f5e"
      };

      const renderWave = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = strokeColors[currentTheme] || "#00ff88";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        waveOffset += 0.12;

        for (let i = 0; i < canvas.width; i++) {
          const y = (canvas.height / 2) + Math.sin(i * 0.06 + waveOffset) * (10 + Math.random() * 6);
          if (i === 0) ctx.moveTo(i, y); else ctx.lineTo(i, y);
        }
        ctx.stroke();
        renderId = requestAnimationFrame(renderWave);
      };
      renderWave();
      return () => cancelAnimationFrame(renderId);
    }

    return () => clearInterval(progressTimer);
  }, [currentModuleId, currentTheme]);

  const getModuleContent = () => {
    switch(currentModuleId) {
      case 'miner':
        return {
          title: 'BITCOIN MINING ENGINE',
          icon: '₿',
          logs: minerLogs,
          progress: progress,
          extra: { hashRate }
        };
      case 'cracker':
        return {
          title: 'PASSWORD CRACKER',
          icon: '🔑',
          logs: crackLogs,
          progress: progress
        };
      case 'ransomware':
        return {
          title: 'RANSOMWARE ENCRYPTOR',
          icon: '🔒',
          description: `Encrypted Files: ${ransomwareFiles.toLocaleString()}`,
          progress: progress,
          warning: 'FILES ENCRYPTED - PAY 5 BTC TO DECRYPT'
        };
      case 'ddos':
        return {
          title: 'DDoS ATTACK ENGINE',
          icon: '💣',
          description: `Packets Sent: ${(ddosPackets / 1000000).toFixed(2)}M`,
          progress: progress,
          target: 'TARGET: 192.168.1.1:80'
        };
      case 'darkweb':
        return {
          title: 'DARK WEB MARKETPLACE',
          icon: '🕸️',
          listings: darkWebListings,
          progress: progress
        };
      case 'keylogger':
        return {
          title: 'KEYLOGGER ACTIVE',
          icon: '⌨️',
          logs: keylogs,
          progress: progress
        };
      case 'rootkit':
        return {
          title: 'ROOTKIT INSTALLER',
          icon: '👻',
          description: 'Installing kernel-level backdoor',
          progress: progress
        };
      case 'exploit':
        return {
          title: 'ZERO-DAY EXPLOIT',
          icon: '⚡',
          description: 'Exploiting unknown vulnerability',
          progress: progress
        };
      case 'phishing':
        return {
          title: 'PHISHING CAMPAIGN',
          icon: '🎣',
          logs: crackLogs,
          progress: progress
        };
      case 'backdoor':
        return {
          title: 'PERSISTENT BACKDOOR',
          icon: '🚪',
          description: 'Establishing remote access',
          progress: progress
        };
      default:
        return {
          title: 'MODULE',
          icon: '📁',
          progress: progress
        };
    }
  };

  const content = getModuleContent();

  const sharedProps = {
    moduleId: currentModuleId,
    onClose,
    handleMouseDown,
    pos,
    hashRate,
    minerLogs,
    crackLogs,
    progress,
    canvasRef,
    currentTheme,
    themes: INDUSTRIAL_MATRIX,
    onFolderSelect: (targetFolderId) => setCurrentModuleId(targetFolderId),
    moduleContent: content,
    ransomwareFiles,
    ddosPackets,
    darkWebListings,
    keylogs,
  };

  switch (currentTheme) {
    case "tegnio": return <TegnioUI {...sharedProps} />;
    case "shield": return <ShieldUI {...sharedProps} />;
    case "aperture": return <ApertureUI {...sharedProps} />;
    case "mrrobot": return <MrRobotUI {...sharedProps} />;
    default: return <MilitechUI {...sharedProps} />;
  }
}
