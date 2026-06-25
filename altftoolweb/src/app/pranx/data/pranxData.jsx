import {
  Bug,
  Clapperboard,
  Code2,
  Cpu,
  Eye,
  Folder,
  Gamepad2,
  Ghost,
  Grid3X3,
  HardDrive,
  Keyboard,
  Laptop,
  MessageCircle,
  Monitor,
  MousePointer2,
  RefreshCw,
  ShieldAlert,
  Terminal,
  Volume2,
  Wifi,
} from "lucide-react";

export const navGroups = [
  {
    label: "Simulators",
    icon: Cpu,
    items: ["hacker", "bios", "google-terminal", "fake-dos", "norton-commander", "winxp", "jurassic-park"],
  },
  {
    label: "Fake Updates",
    icon: Monitor,
    items: ["mac-update", "windows-update", "fake-update", "bsod"],
  },
  {
    label: "Animations",
    icon: Clapperboard,
    items: ["dvd-bounce", "pipes", "matrix-code-rain", "static-tv", "fake-virus", "fbi-warning"],
  },
  {
    label: "More...",
    icon: Gamepad2,
    items: ["chat-screenshot-generator", "soundboard", "maze", "minesweeper", "tetris", "trollface"],
  },
];

export const pranks = [
  { slug: "hacker", title: "Hacker Typer", category: "Terminal", icon: Keyboard, description: "Mash keys and generate dramatic terminal code with access logs, warnings, and fake breach status.", component: "hacker" },
  { slug: "matrix-code-rain", title: "Matrix Code Rain", category: "Canvas", icon: Code2, description: "Animated green code rain with speed, density, glow, and fullscreen controls.", component: "matrix" },
  { slug: "bsod", title: "Blue Screen Simulator", category: "Screen", icon: Monitor, description: "A safe fake crash screen with progress, stop code, restart controls, and fullscreen mode.", component: "bsod" },
  { slug: "pipes", title: "Pipes Screensaver", category: "Canvas", icon: Cpu, description: "Classic 3D-style pipe screensaver using live canvas rendering and color controls.", component: "pipes" },
  { slug: "dvd-bounce", title: "DVD Bounce", category: "Canvas", icon: Clapperboard, description: "A bouncing DVD logo simulator with collision colors, trail mode, and speed settings.", component: "dvd" },
  { slug: "fake-virus", title: "Fake Virus Scanner", category: "Prank", icon: Bug, description: "Safe fake scan workflow with alerts, quarantine messages, and panic button.", component: "virus" },
  { slug: "fbi-warning", title: "FBI Warning", category: "Screen", icon: ShieldAlert, description: "A cinematic warning screen with pulsing seal, scan lines, and fullscreen launch.", component: "fbi" },
  { slug: "google-terminal", title: "Google Terminal", category: "Terminal", icon: Terminal, description: "Retro DOS-inspired Google terminal screen with boot sequence, fake search prompt, ads panel, and keyboard-style footer.", component: "google-terminal" },
  { slug: "fake-dos", title: "Fake DOS Terminal", category: "Terminal", icon: Terminal, description: "Interactive DOS-style command prompt with prank commands and live output.", component: "dos" },
  { slug: "bios", title: "BIOS Simulator", category: "System", icon: HardDrive, description: "Keyboard-friendly BIOS setup simulation with boot order, time, and hardware panels.", component: "bios" },
  { slug: "norton-commander", title: "Norton Commander", category: "System", icon: Folder, description: "Dual-pane retro file manager with keyboard navigation, panels, and command line.", component: "norton" },
  { slug: "winxp", title: "WinXP Simulator", category: "Desktop", icon: Laptop, description: "A tiny desktop playground with start menu, draggable windows, and nostalgic UI.", component: "winxp" },
  { slug: "jurassic-park", title: "Jurassic Park Control", category: "Terminal", icon: Eye, description: "A Jurassic-style security map with fence alerts, vehicle status, console links, and dramatic sound cues.", component: "jurassic" },
  { slug: "jurassic-park/console", title: "Jurassic Park Console", category: "Terminal", icon: Terminal, description: "A retro Central Park console screen with noisy desktop, command prompt, access logs, and fullscreen controls.", component: "jurassic-console" },
  { slug: "fake-update", title: "Fake Update Screens", category: "Screen", icon: RefreshCw, description: "Windows, macOS, Android, and generic update screens with progress controls.", component: "update" },
  { slug: "windows-update", title: "Windows Update", category: "Screen", icon: RefreshCw, description: "A Windows-style fake update screen with adjustable progress.", component: "update" },
  { slug: "mac-update", title: "macOS Update", category: "Screen", icon: RefreshCw, description: "A macOS-style fake update screen with clean progress animation.", component: "update" },
  { slug: "minesweeper", title: "Minesweeper", category: "Game", icon: Grid3X3, description: "Fully playable minesweeper with flags, timer, reset, and win/loss state.", component: "minesweeper" },
  { slug: "tetris", title: "Tetris Blocks", category: "Game", icon: Gamepad2, description: "Keyboard-controlled falling block game with score, levels, line clears, and pause.", component: "tetris" },
  { slug: "maze", title: "Maze Runner", category: "Game", icon: MousePointer2, description: "Generate mazes and guide the player to the exit with arrow keys or touch buttons.", component: "maze" },
  { slug: "soundboard", title: "Prank Soundboard", category: "Audio", icon: Volume2, description: "Browser-side soundboard using Web Audio beeps, alarms, sweeps, and glitch sounds.", component: "soundboard" },
  { slug: "chat-screenshot-generator", title: "Chat Screenshot Generator", category: "Creator", icon: MessageCircle, description: "Build safe fictional chat mockups and export them as PNG without external assets.", component: "chat" },
  { slug: "static-tv", title: "Static TV Noise", category: "Canvas", icon: Wifi, description: "Canvas TV static with noise intensity, scan lines, and color bars.", component: "static" },
  { slug: "trollface", title: "TrollFace Eyes", category: "Interactive", icon: Ghost, description: "A playful face whose eyes follow your cursor across the screen.", component: "troll" },
];

export const assetPath = (path) => `/pranx-assets/${path}`;
export const logoImage = assetPath("pranxhub-logo.svg");
export const mascotImage = assetPath("download-6.png");
export const f11Image = assetPath("download.jpg");
export const spriteImage = assetPath("download-3.png");

export const sliderImages = [
  assetPath("slider/download.jpg"),
  assetPath("slider/download-1.jpg"),
  assetPath("slider/download-2.jpg"),
];

const svgThumb = (accent, art, background = "#102033", wash = "#2f7080") => {
  const svg = `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${background}" />
          <stop offset="0.58" stop-color="#152236" />
          <stop offset="1" stop-color="${wash}" />
        </linearGradient>
        <radialGradient id="halo" cx="72%" cy="24%" r="68%">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.32" />
          <stop offset="0.52" stop-color="${accent}" stop-opacity="0.08" />
          <stop offset="1" stop-color="#020617" stop-opacity="0" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="13" flood-color="#020617" flood-opacity="0.42" />
        </filter>
      </defs>
      <rect width="600" height="400" rx="22" fill="url(#bg)" />
      <rect width="600" height="400" rx="22" fill="url(#halo)" />
      <circle cx="112" cy="330" r="170" fill="#ffffff" opacity="0.045" />
      <circle cx="486" cy="88" r="132" fill="#ffffff" opacity="0.055" />
      ${art}
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const windowDots = `
  <circle cx="0" cy="0" r="7" fill="#ff5f57" />
  <circle cx="24" cy="0" r="7" fill="#ffbd2e" />
  <circle cx="48" cy="0" r="7" fill="#28c840" />
`;

const terminalArt = (accent = "#54e88f") => `
  <g filter="url(#shadow)">
    <rect x="94" y="82" width="412" height="236" rx="22" fill="#07111f" stroke="${accent}" stroke-opacity="0.42" stroke-width="3" />
    <g transform="translate(126 115)">${windowDots}</g>
    <text x="128" y="178" fill="#ffd166" font-size="24" font-family="monospace" font-weight="800">&gt; prank --safe</text>
    <rect x="128" y="205" width="94" height="9" rx="4" fill="${accent}" />
    <rect x="128" y="232" width="185" height="9" rx="4" fill="${accent}" opacity="0.9" />
    <rect x="128" y="259" width="278" height="9" rx="4" fill="${accent}" opacity="0.82" />
    <rect x="128" y="286" width="148" height="9" rx="4" fill="${accent}" opacity="0.72" />
  </g>
`;

const updateArt = (accent = "#4ade80") => `
  <g filter="url(#shadow)">
    <rect x="96" y="88" width="408" height="224" rx="22" fill="#0b1628" stroke="#f8fafc" stroke-opacity="0.1" stroke-width="3" />
    <g transform="translate(126 120)">${windowDots}</g>
    <g transform="translate(300 184)">
      <circle r="39" fill="none" stroke="#94a3b8" stroke-width="16" stroke-dasharray="74 44" />
      <circle r="39" fill="none" stroke="#e2e8f0" stroke-width="16" stroke-dasharray="34 84" transform="rotate(70)" />
    </g>
    <rect x="188" y="254" width="224" height="18" rx="9" fill="#1e293b" />
    <rect x="188" y="254" width="138" height="18" rx="9" fill="${accent}" />
    <rect x="222" y="292" width="156" height="16" rx="8" fill="${accent}" opacity="0.62" />
  </g>
`;

const thumbArt = {
  soundboard: `
    <g filter="url(#shadow)">
      <rect x="98" y="86" width="404" height="228" rx="22" fill="#091527" stroke="#76e4f7" stroke-opacity="0.24" stroke-width="3" />
      <g transform="translate(128 120)">${windowDots}</g>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => `<rect x="${142 + bar * 33}" y="${230 - ((bar * 37) % 118)}" width="18" height="${78 + ((bar * 29) % 92)}" rx="9" fill="${bar % 2 ? "#38bdf8" : "#4ade80"}" />`).join("")}
      <path d="M292 198 L354 160 L354 286 L292 248 L262 248 L262 198 Z" fill="#f8fafc" />
    </g>
  `,
  hacker: terminalArt("#4ade80"),
  "google-terminal": terminalArt("#38bdf8"),
  "fake-dos": `
    <g filter="url(#shadow)">
      <rect x="82" y="74" width="436" height="252" rx="10" fill="#050505" stroke="#facc15" stroke-opacity="0.52" stroke-width="3" />
      <text x="118" y="130" fill="#facc15" font-size="26" font-family="monospace" font-weight="800">C:\\PRANX&gt; DIR</text>
      <text x="118" y="176" fill="#34d399" font-size="22" font-family="monospace">MATRIX.BAT</text>
      <text x="118" y="214" fill="#34d399" font-size="22" font-family="monospace">SAFE.COM</text>
      <text x="118" y="252" fill="#34d399" font-size="22" font-family="monospace">SYSTEM32_OK</text>
      <rect x="118" y="284" width="160" height="10" fill="#facc15" />
    </g>
  `,
  bios: `
    <g filter="url(#shadow)">
      <rect x="78" y="62" width="444" height="276" rx="8" fill="#102a5c" stroke="#bfdbfe" stroke-width="4" />
      <rect x="78" y="62" width="444" height="44" fill="#bfdbfe" opacity="0.16" />
      <text x="102" y="94" fill="#e0f2fe" font-size="22" font-family="monospace" font-weight="800">BIOS SETUP UTILITY</text>
      <rect x="106" y="136" width="178" height="150" fill="#0f172a" opacity="0.45" />
      <rect x="316" y="136" width="178" height="150" fill="#0f172a" opacity="0.45" />
      <rect x="124" y="160" width="118" height="9" fill="#93c5fd" />
      <rect x="124" y="194" width="138" height="9" fill="#facc15" />
      <rect x="334" y="160" width="126" height="9" fill="#93c5fd" />
      <rect x="334" y="194" width="88" height="9" fill="#93c5fd" />
      <rect x="334" y="228" width="144" height="9" fill="#93c5fd" />
    </g>
  `,
  "norton-commander": `
    <g filter="url(#shadow)">
      <rect x="74" y="70" width="452" height="260" rx="10" fill="#04131f" stroke="#38bdf8" stroke-width="3" />
      <rect x="94" y="104" width="194" height="176" fill="#123b69" />
      <rect x="312" y="104" width="194" height="176" fill="#123b69" />
      ${[0, 1, 2, 3, 4].map((row) => `<rect x="112" y="${126 + row * 28}" width="${112 + row * 12}" height="9" fill="${row === 1 ? "#fde047" : "#dbeafe"}" /><rect x="330" y="${126 + row * 28}" width="${132 - row * 8}" height="9" fill="${row === 2 ? "#fde047" : "#dbeafe"}" />`).join("")}
      <rect x="94" y="296" width="412" height="18" fill="#0f172a" />
    </g>
  `,
  winxp: `
    <g filter="url(#shadow)">
      <rect x="90" y="72" width="420" height="256" rx="16" fill="#0b63ce" />
      <path d="M90 236 C184 130 282 156 510 86 L510 328 L90 328 Z" fill="#34d399" />
      <path d="M90 284 C190 206 322 220 510 170 L510 328 L90 328 Z" fill="#1d4ed8" opacity="0.68" />
      <rect x="90" y="292" width="420" height="36" fill="#0756b8" />
      <rect x="108" y="299" width="92" height="22" rx="11" fill="#22c55e" />
      <rect x="340" y="106" width="118" height="82" rx="10" fill="#f8fafc" opacity="0.88" />
    </g>
  `,
  "jurassic-park": `
    <g filter="url(#shadow)">
      <rect x="88" y="76" width="424" height="248" rx="18" fill="#15210f" stroke="#84cc16" stroke-width="3" />
      <path d="M150 274 C190 156 278 152 326 92 C384 160 430 206 456 278" fill="none" stroke="#facc15" stroke-width="8" stroke-linecap="round" />
      <path d="M132 256 L470 138" stroke="#22c55e" stroke-width="5" stroke-dasharray="14 14" />
      <path d="M168 126 L472 282" stroke="#22c55e" stroke-width="5" stroke-dasharray="14 14" />
      <circle cx="326" cy="92" r="14" fill="#ef4444" />
      <circle cx="150" cy="274" r="12" fill="#facc15" />
      <circle cx="456" cy="278" r="12" fill="#facc15" />
    </g>
  `,
  "jurassic-park/console": terminalArt("#84cc16"),
  "fake-virus": `
    <g filter="url(#shadow)">
      <rect x="88" y="82" width="424" height="236" rx="22" fill="#170a15" stroke="#ef4444" stroke-opacity="0.62" stroke-width="3" />
      <g transform="translate(126 116)">${windowDots}</g>
      <path d="M300 136 L392 282 H208 Z" fill="#facc15" stroke="#7f1d1d" stroke-width="8" />
      <rect x="292" y="184" width="16" height="54" rx="8" fill="#7f1d1d" />
      <circle cx="300" cy="258" r="9" fill="#7f1d1d" />
    </g>
  `,
  "fbi-warning": `
    <g filter="url(#shadow)">
      <rect x="80" y="70" width="440" height="260" rx="16" fill="#13070a" stroke="#dc2626" stroke-width="4" />
      <circle cx="300" cy="194" r="78" fill="#7f1d1d" stroke="#fca5a5" stroke-width="6" />
      <path d="M300 124 L320 172 L372 176 L332 208 L346 260 L300 232 L254 260 L268 208 L228 176 L280 172 Z" fill="#facc15" />
      <rect x="214" y="286" width="172" height="18" rx="9" fill="#fca5a5" />
    </g>
  `,
  bsod: `
    <g filter="url(#shadow)">
      <rect x="92" y="82" width="416" height="236" rx="14" fill="#1d62dc" />
      <text x="132" y="154" fill="#f8fafc" font-size="58" font-family="Arial, sans-serif">:(</text>
      <rect x="132" y="204" width="290" height="12" rx="6" fill="#bfdbfe" />
      <rect x="132" y="242" width="218" height="12" rx="6" fill="#bfdbfe" />
      <rect x="132" y="280" width="122" height="12" rx="6" fill="#bfdbfe" />
    </g>
  `,
  pipes: `
    <g filter="url(#shadow)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M112 282 H230 V190 H318 V116 H468" stroke="#14b8a6" stroke-width="34" />
      <path d="M158 116 H240 V222 H366 V302" stroke="#86efac" stroke-width="30" />
      <path d="M112 282 H230 V190 H318 V116 H468" stroke="#083344" stroke-width="10" opacity="0.36" />
      <path d="M158 116 H240 V222 H366 V302" stroke="#064e3b" stroke-width="9" opacity="0.32" />
    </g>
  `,
  "dvd-bounce": `
    <g filter="url(#shadow)">
      <rect x="96" y="88" width="408" height="224" rx="22" fill="#091527" stroke="#38bdf8" stroke-width="3" />
      <path d="M204 182 L300 116 L396 182 L300 248 Z" fill="#f472b6" />
      <path d="M228 244 H372 L330 286 H270 Z" fill="#67e8f9" />
      <text x="250" y="206" fill="#0f172a" font-size="48" font-family="Arial, sans-serif" font-weight="900">DVD</text>
    </g>
  `,
  "matrix-code-rain": `
    <g filter="url(#shadow)">
      <rect x="82" y="64" width="436" height="272" rx="18" fill="#03110b" stroke="#22c55e" stroke-opacity="0.4" stroke-width="3" />
      ${Array.from({ length: 13 }, (_, col) => Array.from({ length: 7 }, (_, row) => `<text x="${112 + col * 32}" y="${104 + row * 33}" fill="#4ade80" opacity="${0.35 + ((col + row) % 5) * 0.12}" font-size="21" font-family="monospace">${(col * 7 + row) % 2 ? "1" : "0"}</text>`).join("")).join("")}
      <rect x="156" y="210" width="288" height="10" rx="5" fill="#86efac" />
      <rect x="188" y="250" width="224" height="10" rx="5" fill="#22c55e" />
    </g>
  `,
  "static-tv": `
    <g filter="url(#shadow)">
      <rect x="88" y="82" width="424" height="236" rx="24" fill="#0f172a" stroke="#94a3b8" stroke-opacity="0.2" stroke-width="3" />
      ${Array.from({ length: 72 }, (_, i) => `<rect x="${104 + ((i * 53) % 380)}" y="${104 + ((i * 31) % 172)}" width="${8 + (i % 5) * 6}" height="3" fill="${["#f8fafc", "#38bdf8", "#f472b6", "#22c55e"][i % 4]}" opacity="${0.35 + (i % 4) * 0.13}" />`).join("")}
      <rect x="118" y="126" width="364" height="16" fill="#64748b" opacity="0.18" />
      <rect x="118" y="246" width="364" height="14" fill="#64748b" opacity="0.16" />
    </g>
  `,
  "fake-update": updateArt("#a78bfa"),
  "windows-update": updateArt("#22c55e"),
  "mac-update": `
    <g filter="url(#shadow)">
      <rect x="122" y="76" width="356" height="248" rx="28" fill="#f8fafc" />
      <rect x="162" y="126" width="276" height="18" rx="9" fill="#dbeafe" />
      <rect x="162" y="176" width="232" height="18" rx="9" fill="#bbf7d0" />
      <rect x="162" y="226" width="260" height="18" rx="9" fill="#fde68a" />
      <circle cx="204" cy="284" r="11" fill="#94a3b8" />
      <circle cx="244" cy="284" r="11" fill="#94a3b8" />
      <circle cx="284" cy="284" r="11" fill="#94a3b8" />
    </g>
  `,
  minesweeper: `
    <g filter="url(#shadow)">
      <rect x="110" y="70" width="380" height="260" rx="18" fill="#102033" stroke="#67e8f9" stroke-opacity="0.22" stroke-width="3" />
      ${Array.from({ length: 8 }, (_, row) => Array.from({ length: 10 }, (_, col) => `<rect x="${144 + col * 30}" y="${104 + row * 24}" width="20" height="18" rx="3" fill="${["#22c55e", "#38bdf8", "#f59e0b", "#ef4444", "#e2e8f0"][(row + col) % 5]}" />`).join("")).join("")}
      <circle cx="422" cy="286" r="18" fill="#38bdf8" />
      <circle cx="384" cy="286" r="18" fill="#f59e0b" />
    </g>
  `,
  tetris: `
    <g filter="url(#shadow)">
      <rect x="142" y="54" width="316" height="292" rx="16" fill="#08111f" stroke="#94a3b8" stroke-opacity="0.18" stroke-width="3" />
      ${[
        [204, 92, "#f97316"], [236, 92, "#f97316"], [268, 92, "#f97316"], [268, 124, "#f97316"],
        [332, 108, "#22c55e"], [364, 108, "#22c55e"], [300, 140, "#22c55e"], [332, 140, "#22c55e"],
        [204, 188, "#38bdf8"], [236, 188, "#38bdf8"], [204, 220, "#38bdf8"], [236, 220, "#38bdf8"],
        [300, 236, "#a78bfa"], [332, 236, "#a78bfa"], [364, 236, "#a78bfa"], [332, 268, "#a78bfa"]
      ].map(([x, y, fill]) => `<rect x="${x}" y="${y}" width="30" height="30" rx="5" fill="${fill}" />`).join("")}
    </g>
  `,
  maze: `
    <g filter="url(#shadow)">
      <rect x="86" y="70" width="428" height="260" rx="18" fill="#0f172a" />
      <path d="M128 116 H274 V166 H190 V218 H348 V128 H474 V284 H128 Z" fill="none" stroke="#e2e8f0" stroke-width="18" stroke-linejoin="round" />
      <path d="M164 282 H254 V250 H430" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" />
      <circle cx="134" cy="284" r="18" fill="#f59e0b" />
      <circle cx="470" cy="284" r="18" fill="#38bdf8" />
    </g>
  `,
  "chat-screenshot-generator": `
    <g filter="url(#shadow)">
      <rect x="134" y="66" width="332" height="268" rx="30" fill="#f8fafc" />
      <rect x="178" y="116" width="160" height="22" rx="11" fill="#dbeafe" />
      <rect x="236" y="172" width="178" height="22" rx="11" fill="#bbf7d0" />
      <rect x="178" y="228" width="222" height="22" rx="11" fill="#fde68a" />
      <circle cx="210" cy="292" r="11" fill="#94a3b8" />
      <circle cx="250" cy="292" r="11" fill="#94a3b8" />
      <circle cx="290" cy="292" r="11" fill="#94a3b8" />
    </g>
  `,
  trollface: `
    <g filter="url(#shadow)">
      <circle cx="300" cy="198" r="112" fill="#f8fafc" stroke="#0f172a" stroke-width="8" />
      <circle cx="258" cy="164" r="13" fill="#0f172a" />
      <circle cx="342" cy="164" r="13" fill="#0f172a" />
      <path d="M218 224 C252 286 360 286 394 224" fill="none" stroke="#0f172a" stroke-width="15" stroke-linecap="round" />
      <path d="M238 238 H362" stroke="#0f172a" stroke-width="8" />
    </g>
  `,
};

const makeThumb = (key, accent = "#67e8f9", background = "#102033", wash = "#2f7080") => (
  svgThumb(accent, thumbArt[key] || terminalArt(accent), background, wash)
);

export const prankImages = {
  hacker: makeThumb("hacker", "#4ade80", "#08111f", "#166534"),
  "matrix-code-rain": makeThumb("matrix-code-rain", "#22c55e", "#03110b", "#064e3b"),
  bsod: makeThumb("bsod", "#60a5fa", "#102a5c", "#1d4ed8"),
  pipes: makeThumb("pipes", "#14b8a6", "#102033", "#0f766e"),
  "dvd-bounce": makeThumb("dvd-bounce", "#f472b6", "#111827", "#0891b2"),
  "fake-virus": makeThumb("fake-virus", "#ef4444", "#170a15", "#7f1d1d"),
  "fbi-warning": makeThumb("fbi-warning", "#facc15", "#13070a", "#450a0a"),
  "google-terminal": makeThumb("google-terminal", "#38bdf8", "#07111f", "#075985"),
  "fake-dos": makeThumb("fake-dos", "#facc15", "#050505", "#365314"),
  bios: makeThumb("bios", "#93c5fd", "#0b1f4d", "#1d4ed8"),
  "norton-commander": makeThumb("norton-commander", "#38bdf8", "#04131f", "#1e3a8a"),
  winxp: makeThumb("winxp", "#22c55e", "#0b63ce", "#15803d"),
  "jurassic-park": makeThumb("jurassic-park", "#84cc16", "#101909", "#3f6212"),
  "jurassic-park/console": makeThumb("jurassic-park/console", "#84cc16", "#08111f", "#365314"),
  "fake-update": makeThumb("fake-update", "#a78bfa", "#111827", "#4c1d95"),
  "windows-update": makeThumb("windows-update", "#22c55e", "#0f172a", "#075985"),
  "mac-update": makeThumb("mac-update", "#fde68a", "#334155", "#0f766e"),
  minesweeper: makeThumb("minesweeper", "#38bdf8", "#102033", "#0f766e"),
  tetris: makeThumb("tetris", "#a78bfa", "#111827", "#4c1d95"),
  maze: makeThumb("maze", "#f59e0b", "#0f172a", "#0e7490"),
  soundboard: makeThumb("soundboard", "#76e4f7", "#170a15", "#7f1d1d"),
  "chat-screenshot-generator": makeThumb("chat-screenshot-generator", "#bbf7d0", "#334155", "#0f766e"),
  "static-tv": makeThumb("static-tv", "#f472b6", "#0f172a", "#312e81"),
  trollface: makeThumb("trollface", "#f8fafc", "#111827", "#475569"),
};

export const getPrankImage = (item) => prankImages[item.slug] || assetPath("thumbs/download-3.jpg");

export const showcaseTiles = [
  { title: "Sound Board", slug: "soundboard", image: prankImages.soundboard, badge: "New" },
  { title: "Hacker Typer Simulator", slug: "hacker", image: prankImages.hacker },
  { title: "Win XP Simulator", slug: "winxp", image: prankImages.winxp },
  { title: "Chat Screenshot", slug: "chat-screenshot-generator", image: prankImages["chat-screenshot-generator"] },
  { title: "Scare Maze", slug: "maze", image: prankImages.maze },
  { title: "Fake Virus", slug: "fake-virus", image: prankImages["fake-virus"] },
  { title: "FBI Lock", slug: "fbi-warning", image: prankImages["fbi-warning"] },
  { title: "Google Terminal", slug: "google-terminal", image: prankImages["google-terminal"] },
  { title: "Cracked Screen", slug: "bsod", image: prankImages.bsod },
  { title: "DVD Bounce", slug: "dvd-bounce", image: prankImages["dvd-bounce"] },
  { title: "Tetris Blocks", slug: "tetris", image: prankImages.tetris },
  { title: "Windows 10", slug: "windows-update", image: prankImages["windows-update"] },
  { title: "Apple iOS", slug: "mac-update", image: prankImages["mac-update"] },
  { title: "Matrix Code Rain", slug: "matrix-code-rain", image: prankImages["matrix-code-rain"] },
  { title: "Pipes Screensaver", slug: "pipes", image: prankImages.pipes },
  { title: "TV Noise", slug: "static-tv", image: prankImages["static-tv"] },
  { title: "BIOS Simulator", slug: "bios", image: prankImages.bios },
  { title: "DOS Simulator", slug: "fake-dos", image: prankImages["fake-dos"] },
  { title: "Norton Commander", slug: "norton-commander", image: prankImages["norton-commander"] },
  { title: "Jurassic Security", slug: "jurassic-park", image: prankImages["jurassic-park"] },
];

export const aliases = {
  "hacker-typer": "hacker",
  "matrix": "matrix-code-rain",
  "matrix-rain": "matrix-code-rain",
  "pipes-screensaver": "pipes",
  "dvd": "dvd-bounce",
  "dvd-bounce-screen": "dvd-bounce",
  "bouncing-dvd-screensaver": "dvd-bounce",
  "virus": "fake-virus",
  "hacked-screen": "fake-virus",
  "hack-prank": "hacker",
  "fbi-lock": "fbi-warning",
  "fake-bios": "bios",
  "bios-cmos": "bios",
  "google-terminal": "google-terminal",
  "windows-xp": "winxp",
  "windows-xp-simulator": "winxp",
  "xp-update": "windows-update",
  "windows7-update": "windows-update",
  "windows10-update": "windows-update",
  "apple-update": "mac-update",
  "jurassic-park-terminal": "jurassic-park/console",
  "jurassic-console": "jurassic-park/console",
  "jurassic-park-security": "jurassic-park",
  "system-update": "fake-update",
  "android-update": "fake-update",
  "tv-noise-static": "static-tv",
  "funny-soundboard": "soundboard",
  "chat-screenshot": "chat-screenshot-generator",
};

export const findPrank = (slug) => {
  const resolved = aliases[slug] || slug;
  return pranks.find((item) => item.slug === resolved);
};

export const standalonePrankComponents = new Set(["hacker", "bios", "google-terminal", "dos", "norton", "winxp", "jurassic", "jurassic-console", "dvd", "pipes"]);
