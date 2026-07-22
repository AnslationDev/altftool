export const INDUSTRIAL_MATRIX = {
  militech: {
    id: "militech",
    name: "MILITECH_CENTRAL_FRAME",
    primary: "#00ff88",
    secondary: "#0a0f0a",
    bgEngine: "binary-grid",
    canvasAlpha: 0.1,
  },
  tegnio: {
    id: "tegnio",
    name: "TEGNIO_CRIMSON_MATRIX",
    primary: "#ef4444",
    secondary: "#0a0000",
    bgEngine: "quantum-wave",
    canvasAlpha: 0.15,
  },
  shield: {
    id: "shield",
    name: "SHIELD_RECON_GRID",
    primary: "#38bdf8",
    secondary: "#0a0a1a",
    bgEngine: "radar-circles",
    canvasAlpha: 0.12,
  },
  aperture: {
    id: "aperture",
    name: "APERTURE_LABS_CORE",
    primary: "#22d3ee",
    secondary: "#051418",
    bgEngine: "aperture-grid",
    canvasAlpha: 0.08,
  },
  mrrobot: {
    id: "mrrobot",
    name: "F_SOCIETY_GRID",
    primary: "#f43f5e",
    secondary: "#0a0507",
    bgEngine: "binary-grid",
    canvasAlpha: 0.15,
  }
};

export const GEEK_COMPONENTS_REGISTRY = [
  { id: "miner", label: "Bitcoin Miner", marker: "₿", icon: "₿", desc: "ASIC array clusters hashing engine..." },
  { id: "compiler", label: "Compiler Engine", marker: "🔧", icon: "🔧", desc: "Compiling low level kernel binaries..." },
  { id: "cracker", label: "Password Cracker", marker: "🔑", icon: "🔑", desc: "Running brute-force password decrypt matrices..." },
  { id: "malware", label: "Malware Installer", marker: "☠️", icon: "☠️", desc: "Deploying remote execution payloads..." },
  // 🆕 NEW FEATURES
  { id: "ransomware", label: "Ransomware", marker: "🔒", icon: "🔒", desc: "Encrypting files • Demanding ransom" },
  { id: "ddos", label: "DDoS Attack", marker: "💣", icon: "💣", desc: "Overwhelming target servers" },
  { id: "darkweb", label: "Dark Web", marker: "🕸️", icon: "🕸️", desc: "Accessing hidden marketplace" },
  { id: "keylogger", label: "Keylogger", marker: "⌨️", icon: "⌨️", desc: "Recording keystrokes" },
  { id: "rootkit", label: "Rootkit", marker: "👻", icon: "👻", desc: "Hiding deep in system kernel" },
  { id: "exploit", label: "Zero-Day", marker: "⚡", icon: "⚡", desc: "Exploiting unknown vulnerabilities" },
  { id: "phishing", label: "Phishing", marker: "🎣", icon: "🎣", desc: "Harvesting credentials" },
  { id: "backdoor", label: "Backdoor", marker: "🚪", icon: "🚪", desc: "Persistent remote access" }
];

export const RAW_CODE_STREAM = `
/* =====================================================================
 * TACTICAL CYBERNETIC OVERRIDE SECURE CHANNEL v3.0 // GEEK2_EXCLUSIVE
 * ===================================================================== */
[SYSTEM] Initializing advanced threat modules...
[LOADER] Bitcoin Miner v2.4.7 - ASIC optimized
[LOADER] Ransomware Engine - AES-256 encryption ready
[LOADER] DDoS Framework - Layer 7 attack vectors loaded
[LOADER] Dark Web Bridge - Tor network established
[STATUS] All systems operational. Ready for deployment.
`;