// src/app/geek2/components/themes/MilitechUI.jsx - MILITECH THEME WITH ALL FEATURES
import React from "react";
import { ShieldAlert, Cpu, Zap, Key, Skull, Lock, Bomb, Network, Keyboard, Ghost, Zap as Exploit, Fish, DoorOpen, Activity, Radio, Scan, Eye } from "lucide-react";

export default function MilitechUI({
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
  currentTheme = "militech",
  themes = {},
  ransomwareFiles = 0,
  ddosPackets = 0,
  darkWebListings = [],
  keylogs = [],
}) {
  const themeConfig = themes?.militech || {
    primary: "#00ff88",
    secondary: "#0a0f0a",
    name: "MILITECH_CENTRAL_FRAME"
  };

  const bgColor = themeConfig.secondary || "#0a0f0a";
  const accentColor = themeConfig.primary || "#00ff88";

  const getModuleIcon = () => {
    switch(moduleId) {
      case 'miner': return <Cpu className="w-3.5 h-3.5" />;
      case 'compiler': return <Zap className="w-3.5 h-3.5" />;
      case 'cracker': return <Key className="w-3.5 h-3.5" />;
      case 'malware': return <Skull className="w-3.5 h-3.5" />;
      case 'ransomware': return <Lock className="w-3.5 h-3.5" />;
      case 'ddos': return <Bomb className="w-3.5 h-3.5" />;
      case 'darkweb': return <Network className="w-3.5 h-3.5" />;
      case 'keylogger': return <Keyboard className="w-3.5 h-3.5" />;
      case 'rootkit': return <Ghost className="w-3.5 h-3.5" />;
      case 'exploit': return <Exploit className="w-3.5 h-3.5" />;
      case 'phishing': return <Fish className="w-3.5 h-3.5" />;
      case 'backdoor': return <DoorOpen className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const getModuleTitle = () => {
    const titles = {
      miner: 'BITCOIN_MINER // ASIC_ACTIVE',
      compiler: 'TROJAN_COMPILER // BUILDING',
      cracker: 'HASH_CRACKER // BRUTE_FORCE',
      malware: 'MALWARE_DEPLOY // INFECTING',
      ransomware: 'RANSOMWARE // ENCRYPTING',
      ddos: 'DDoS_ATTACK // FLOODING',
      darkweb: 'DARK_WEB // TOR_CONNECTED',
      keylogger: 'KEYLOGGER // CAPTURING',
      rootkit: 'ROOTKIT // HIDING',
      exploit: 'ZERO_DAY // EXPLOITING',
      phishing: 'PHISHING // HARVESTING',
      backdoor: 'BACKDOOR // PERSISTENT'
    };
    return titles[moduleId] || 'MILITECH_NODE_CORE';
  };

  const getModuleSubtitle = () => {
    const subtitles = {
      miner: `Hashrate: ${hashRate || 342.89} MH/s • Pool: militech.btc-pool.com`,
      compiler: 'Compiling polymorphic payload • Obfuscating code',
      cracker: 'Dictionary attack • Rainbow tables • Brute forcing',
      malware: 'Deploying remote access trojan • Spreading',
      ransomware: `${ransomwareFiles.toLocaleString()} files encrypted • Ransom: 5 BTC`,
      ddos: `${(ddosPackets / 1000000).toFixed(2)}M packets sent • Target: Overwhelmed`,
      darkweb: `${darkWebListings.length} active listings • Anonymous browsing`,
      keylogger: `${keylogs.length} keystrokes captured • Clipboard monitoring`,
      rootkit: 'Kernel-level persistence • Stealth mode active',
      exploit: 'Unknown vulnerability • Privilege escalation',
      phishing: `${crackLogs?.length || 0} credentials harvested • Fake pages active`,
      backdoor: 'Remote access ready • Firewall bypassed'
    };
    return subtitles[moduleId] || 'Secure channel active';
  };

  return (
    <div
      className="fixed font-mono rounded-none text-xs border-2 overflow-hidden z-30 select-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: moduleId === "miner" || moduleId === "ddos" ? "560px" : "400px",
        borderColor: accentColor,
        backgroundColor: bgColor,
        color: accentColor,
        boxShadow: `0 0 35px ${accentColor}25, inset 0 0 20px ${accentColor}08`
      }}
    >
      {/* Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="h-8 px-3 flex items-center justify-between cursor-grab border-b"
        style={{
          backgroundColor: `${accentColor}10`,
          borderColor: `${accentColor}30`
        }}
      >
        <div className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase">
          <div className="animate-pulse">{getModuleIcon()}</div>
          <span className="text-white/90">{getModuleTitle()}</span>
          <div className="flex gap-1 ml-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: "0.3s" }} />
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: "0.6s" }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-[8px] opacity-40 font-mono">PID: {Math.floor(Math.random() * 9999)}</div>
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
      <div className="p-4 space-y-3" style={{ background: `radial-gradient(circle at center, ${accentColor}05 0%, transparent 100%)` }}>

        {/* Status Bar */}
        <div className="flex justify-between items-center text-[8px] uppercase tracking-wider border-b pb-1.5" style={{ color: `${accentColor}60`, borderColor: `${accentColor}20` }}>
          <div className="flex items-center gap-2">
            <Activity className="w-2.5 h-2.5" />
            <span>[ OPERATIONAL_STATUS::ACTIVE ]</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-2.5 h-2.5" />
            <span>stealth_mode::on</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            <span>encrypted::aes256</span>
          </div>
        </div>

        {/* Dynamic Content Based on Module */}
        {renderFolderInnerContent && renderFolderInnerContent() ? (
          <div className="relative z-10 w-full">{renderFolderInnerContent()}</div>
        ) : (
          <div className="w-full space-y-3">

            {/* BITCOIN MINER */}
            {moduleId === "miner" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                    <div className="text-[8px] opacity-60 uppercase">Pool Hashrate</div>
                    <div className="text-sm font-bold" style={{ color: accentColor }}>{hashRate || 342.89} MH/s</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                    <div className="text-[8px] opacity-60 uppercase">Accepted Shares</div>
                    <div className="text-sm font-bold text-white">{Math.floor(Math.random() * 1000)}</div>
                  </div>
                </div>
                <div className="h-28 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll" style={{ color: `${accentColor}80` }}>
                  <div className="text-[8px] opacity-50 mb-1">{"// MINING_LOG_STREAM"}</div>
                  {minerLogs?.map((l, i) => (
                    <div key={i} className="border-l-2 pl-2" style={{ borderColor: `${accentColor}40` }}>{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* PASSWORD CRACKER */}
            {moduleId === "cracker" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/40 p-2 rounded" style={{ border: `1px solid ${accentColor}20` }}>
                  <span className="text-[9px] font-bold">PROGRESS:</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold">{Math.floor(progress || 0)}%</span>
                </div>
                <div className="h-28 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll" style={{ color: `${accentColor}70` }}>
                  <div className="text-[8px] opacity-50 mb-1">{"// BRUTE_FORCE_LOG"}</div>
                  {crackLogs?.map((l, i) => (
                    <div key={i} className="font-mono">› {l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPILER */}
            {moduleId === "compiler" && (
              <div className="space-y-3">
                <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}05`, border: `1px solid ${accentColor}20` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                    <span className="text-[9px] font-bold uppercase">Live Waveform Analysis</span>
                  </div>
                  <canvas ref={canvasRef} className="w-full h-20 rounded" style={{ backgroundColor: `${accentColor}05` }} />
                </div>
                <div className="text-[9px] text-center animate-pulse" style={{ color: `${accentColor}70` }}>[+] Compiling polymorphic payload...</div>
              </div>
            )}

            {/* MALWARE */}
            {moduleId === "malware" && (
              <div className="text-center space-y-3">
                <div className="text-5xl animate-pulse">☠️</div>
                <div className="font-black tracking-widest text-sm uppercase">DEPLOYING TROJAN: {Math.floor(progress || 0)}%</div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                </div>
              </div>
            )}

            {/* RANSOMWARE */}
            {moduleId === "ransomware" && (
              <div className="space-y-3">
                <div className="text-center p-3 rounded" style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30` }}>
                  <div className="text-4xl mb-2">🔒</div>
                  <div className="text-red-400 font-bold text-sm">RANSOMWARE ACTIVE</div>
                  <div className="text-xs mt-1">{ransomwareFiles.toLocaleString()} files encrypted</div>
                  <div className="text-yellow-500 text-[10px] mt-2 animate-pulse">⚠️ PAY 5 BTC TO DECRYPT ⚠️</div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                </div>
              </div>
            )}

            {/* DDoS ATTACK */}
            {moduleId === "ddos" && (
              <div className="space-y-3">
                <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold">🎯 TARGET:</span>
                    <span className="font-mono text-xs">192.168.1.1:80</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold">📦 PACKETS:</span>
                    <span className="font-mono text-xs text-red-400">{(ddosPackets / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-bold">⚡ BANDWIDTH:</span>
                    <span className="font-mono text-xs">{Math.floor(Math.random() * 100) + 50} Gbps</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                </div>
              </div>
            )}

            {/* DARK WEB */}
            {moduleId === "darkweb" && (
              <div className="space-y-3">
                <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                  <div className="text-[9px] font-bold mb-2">🕸️ TOR NETWORK: CONNECTED</div>
                  <div className="text-[8px] opacity-60 mb-2">LATEST LISTINGS:</div>
                  <div className="space-y-1">
                    {darkWebListings.slice(0, 4).map((listing, i) => (
                      <div key={i} className="flex justify-between text-[9px] border-b pb-1" style={{ borderColor: `${accentColor}15` }}>
                        <span className="text-white/80">{listing.item}</span>
                        <span className="text-yellow-500">{listing.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* KEYLOGGER */}
            {moduleId === "keylogger" && (
              <div className="space-y-3">
                <div className="h-32 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll p-2 rounded" style={{ backgroundColor: `${accentColor}05`, border: `1px solid ${accentColor}20` }}>
                  <div className="text-[8px] opacity-50 mb-1">{"// KEYSTROKE_CAPTURE_LOG"}</div>
                  {keylogs?.slice(0, 10).map((log, i) => (
                    <div key={i} className="font-mono text-cyan-400">› {log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* ROOTKIT */}
            {moduleId === "rootkit" && (
              <div className="text-center space-y-3 p-3 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                <div className="text-4xl animate-pulse">👻</div>
                <div className="font-bold text-sm uppercase">ROOTKIT INSTALLATION</div>
                <div className="text-[10px] opacity-70">Hiding in kernel • Stealth mode: ACTIVE</div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                </div>
              </div>
            )}

            {/* ZERO-DAY EXPLOIT */}
            {moduleId === "exploit" && (
              <div className="space-y-3 p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                <div className="flex items-center gap-2">
                  <Exploit className="w-4 h-4 text-yellow-500 animate-pulse" />
                  <span className="text-yellow-500 font-bold text-xs">ZERO-DAY VULNERABILITY DETECTED</span>
                </div>
                <div className="text-[9px]">CVE-2024-{Math.floor(Math.random() * 9999)} • Critical severity</div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${accentColor}20` }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress || 0}%`, backgroundColor: accentColor }} />
                </div>
              </div>
            )}

            {/* PHISHING */}
            {moduleId === "phishing" && (
              <div className="space-y-3">
                <div className="p-2 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Fish className="w-4 h-4 text-blue-400" />
                    <span className="text-[9px] font-bold">PHISHING CAMPAIGN ACTIVE</span>
                  </div>
                  <div className="h-24 overflow-y-auto text-[9px] font-mono space-y-1 custom-scroll">
                    {crackLogs?.slice(0, 5).map((l, i) => (
                      <div key={i} className="text-yellow-500">📧 {l}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BACKDOOR */}
            {moduleId === "backdoor" && (
              <div className="text-center space-y-3 p-3 rounded" style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
                <div className="text-4xl animate-pulse">🚪</div>
                <div className="font-bold text-sm uppercase">PERSISTENT BACKDOOR</div>
                <div className="text-[10px]">Remote access: ENABLED • Port: 4444</div>
                <div className="text-green-500 text-[9px] animate-pulse">✓ SHELL ACCESS GRANTED</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2 border-t flex justify-between items-center text-[7px] uppercase tracking-wider" style={{ color: `${accentColor}50`, borderColor: `${accentColor}15` }}>
          <div className="flex items-center gap-2">
            <span>🔒 SECURE_CHANNEL</span>
          </div>
          <div className="flex items-center gap-2">
            <Scan className="w-2.5 h-2.5" />
            <span>ACTIVE_MONITORING</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span>{getModuleSubtitle()}</span>
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br" style={{ borderColor: `${accentColor}40` }} />
    </div>
  );
}
