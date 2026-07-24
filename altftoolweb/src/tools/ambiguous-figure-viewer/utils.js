// src/tools/ambiguous-figure-viewer/utils.js

// --- Sound Synth Helper using Web Audio API ---
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (_) {}
  }

  playUnlock() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (_) {}
  }
}

export const soundFx = new SoundSynth();

// --- SVG Pattern Renderer Engine ---
const svgText = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const figureSvg = ({ id, title, subtitle, variant, styleMode = "default" }) => {
  const patterns = {
    duckRabbit: `
      <g transform="translate(160, 35) scale(1.1)">
        <path d="M 280,120 C 230,110 180,90 120,80 C 100,75 70,80 50,100 C 40,110 40,125 55,130 C 90,140 140,145 200,155 C 150,170 100,180 55,185 C 40,188 35,200 50,210 C 80,225 130,215 190,200 C 150,240 160,280 200,300 C 240,320 290,300 320,260 C 340,235 350,190 330,150 C 315,130 300,125 280,120 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4"/>
        <circle cx="270" cy="155" r="10" fill="#ffffff" />
        <circle cx="272" cy="155" r="5" fill="#0f172a" />
        <path d="M 120,80 C 160,110 200,135 240,145" stroke="#475569" stroke-width="3" fill="none"/>
        <path d="M 50,100 C 100,115 150,130 195,145" stroke="#475569" stroke-width="2" fill="none"/>
      </g>
    `,
    rubinVase: `
      <g transform="translate(110, 20)">
        <rect x="0" y="0" width="500" height="380" fill="#0f172a" rx="16"/>
        <path d="M 170,40 C 200,40 220,70 200,120 C 180,170 160,190 170,230 C 180,270 220,310 240,315 L 240,340 L 150,340 C 150,340 350,340 350,340 L 260,315 C 280,310 320,270 330,230 C 340,190 320,170 300,120 C 280,70 300,40 330,40 Z" fill="#ffffff"/>
      </g>
    `,
    oldYoung: `
      <g transform="translate(160, 25)">
        <rect x="0" y="0" width="400" height="370" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
        <path d="M 80,120 C 120,40 280,40 320,100 C 340,130 320,170 280,180 C 230,190 160,180 120,160 Z" fill="#334155"/>
        <path d="M 220,20 C 240,60 210,100 200,130" stroke="#0284c7" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M 170,160 C 190,190 220,200 240,190 C 260,185 270,165 260,145" fill="none" stroke="#0f172a" stroke-width="4"/>
        <path d="M 180,240 C 210,255 250,250 270,235" stroke="#dc2626" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M 240,190 C 220,220 200,240 180,270 C 170,285 160,310 190,330 C 230,340 280,310 290,260 C 300,210 280,170 260,145" fill="#e2e8f0" stroke="#0f172a" stroke-width="4"/>
        <circle cx="250" cy="170" r="4" fill="#0f172a"/>
      </g>
    `,
    neckerCube: `
      <g transform="translate(180, 40)">
        <polygon points="40,80 180,80 180,220 40,220" fill="#38bdf8" fill-opacity="0.15"/>
        <polygon points="140,40 280,40 280,180 140,180" fill="#a855f7" fill-opacity="0.15"/>
        <polygon points="40,80 140,40 280,40 180,80" fill="#14b8a6" fill-opacity="0.25"/>
        <polygon points="40,220 140,180 280,180 180,220" fill="#0284c7" fill-opacity="0.2"/>
        <path d="M 40,80 L 180,80 L 180,220 L 40,220 Z" stroke="#0f172a" stroke-width="5" fill="none"/>
        <path d="M 140,40 L 280,40 L 280,180 L 140,180 Z" stroke="#0f172a" stroke-width="5" fill="none"/>
        <line x1="40" y1="80" x2="140" y2="40" stroke="#0284c7" stroke-width="5"/>
        <line x1="180" y1="80" x2="280" y2="40" stroke="#0284c7" stroke-width="5"/>
        <line x1="180" y1="220" x2="280" y2="180" stroke="#0284c7" stroke-width="5"/>
        <line x1="40" y1="220" x2="140" y2="180" stroke="#0284c7" stroke-width="5"/>
        <circle cx="40" cy="80" r="7" fill="#14b8a6"/>
        <circle cx="180" cy="80" r="7" fill="#14b8a6"/>
        <circle cx="180" cy="220" r="7" fill="#14b8a6"/>
        <circle cx="40" cy="220" r="7" fill="#14b8a6"/>
        <circle cx="140" cy="40" r="7" fill="#a855f7"/>
        <circle cx="280" cy="40" r="7" fill="#a855f7"/>
        <circle cx="280" cy="180" r="7" fill="#a855f7"/>
        <circle cx="140" cy="180" r="7" fill="#a855f7"/>
      </g>
    `,
    spinningDancer: `
      <g transform="translate(230, 20)">
        <ellipse cx="130" cy="350" rx="100" ry="12" fill="#94a3b8" opacity="0.3"/>
        <circle cx="130" cy="50" r="22" fill="#0f172a"/>
        <path d="M 130,75 C 90,60 50,70 20,95 C 40,95 80,85 130,85 C 180,85 220,70 250,55" fill="none" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/>
        <path d="M 115,85 L 145,85 L 155,160 L 105,160 Z" fill="#0f172a"/>
        <path d="M 80,160 Q 130,195 180,160 Q 130,150 80,160 Z" fill="#0f172a"/>
        <path d="M 125,175 L 132,345" stroke="#0f172a" stroke-width="14" stroke-linecap="round"/>
        <path d="M 135,175 Q 190,220 240,260" stroke="#0f172a" stroke-width="13" stroke-linecap="round"/>
      </g>
    `,
    elephantLegs: `
      <g transform="translate(140, 35)">
        <path d="M 60,140 C 60,70 140,40 240,50 C 330,60 380,110 390,170 C 370,180 340,170 320,160 C 310,130 280,120 260,140" fill="#475569" stroke="#0f172a" stroke-width="4"/>
        <path d="M 80,140 C 40,140 10,170 20,230 C 25,260 40,270 50,250 C 60,230 50,190 70,170 Z" fill="#334155" stroke="#0f172a" stroke-width="4"/>
        <path d="M 90,160 L 90,300 M 150,160 L 150,300 M 210,160 L 210,300 M 270,160 L 270,300 M 330,160 L 330,300" stroke="#0f172a" stroke-width="5"/>
        <ellipse cx="120" cy="300" rx="20" ry="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="4"/>
        <ellipse cx="180" cy="300" rx="20" ry="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="4"/>
        <ellipse cx="240" cy="300" rx="20" ry="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="4"/>
        <ellipse cx="300" cy="300" rx="20" ry="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="4"/>
      </g>
    `,
    penroseTriangle: `
      <g transform="translate(200, 25)">
        <defs>
          <linearGradient id="p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
          <linearGradient id="p2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#7e22ce"/></linearGradient>
          <linearGradient id="p3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#0f766e"/></linearGradient>
        </defs>
        <path d="M 160,20 L 290,260 L 235,260 L 160,110 L 85,260 L 30,260 Z" fill="url(#p1)" stroke="#0f172a" stroke-width="3"/>
        <path d="M 290,260 L 30,260 L 58,315 L 262,315 L 160,110 L 160,165 Z" fill="url(#p2)" stroke="#0f172a" stroke-width="3"/>
        <path d="M 58,315 L 160,110 L 215,110 L 160,20 L 30,260 L 58,260 Z" fill="url(#p3)" stroke="#0f172a" stroke-width="3"/>
      </g>
    `,
    hermannGrid: `
      <g transform="translate(160, 30)">
        <rect x="0" y="0" width="400" height="320" fill="#0f172a" rx="16"/>
        <rect x="90" y="0" width="22" height="320" fill="#ffffff"/>
        <rect x="190" y="0" width="22" height="320" fill="#ffffff"/>
        <rect x="290" y="0" width="22" height="320" fill="#ffffff"/>
        <rect x="0" y="70" width="400" height="22" fill="#ffffff"/>
        <rect x="0" y="160" width="400" height="22" fill="#ffffff"/>
        <rect x="0" y="250" width="400" height="22" fill="#ffffff"/>
      </g>
    `,
    kanizsaTriangle: `
      <g transform="translate(180, 25)">
        <defs>
          <filter id="kanizsa-drop" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.12"/>
          </filter>
        </defs>
        <path d="M 40,70 L 80,70 A 40,40 0 1,1 40,110 Z" fill="#0f172a" transform="rotate(30 40 70)"/>
        <path d="M 320,70 L 320,110 A 40,40 0 1,1 280,70 Z" fill="#0f172a" transform="rotate(-30 320 70)"/>
        <path d="M 180,310 L 140,310 A 40,40 0 1,1 180,270 Z" fill="#0f172a" transform="rotate(180 180 310)"/>
        <path d="M 180,30 L 330,290 L 30,290 Z" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linejoin="round"/>
        <polygon points="180,330 330,70 30,70" fill="#ffffff" filter="url(#kanizsa-drop)"/>
      </g>
    `,
    rotatingSnakes: `
      <g transform="translate(180, 20)">
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="90" fill="#0284c7"/>
          <circle cx="0" cy="0" r="70" fill="#facc15"/>
          <circle cx="0" cy="0" r="50" fill="#0f172a"/>
          <circle cx="0" cy="0" r="30" fill="#ffffff"/>
          <path d="M -90,0 A 90,90 0 0,1 90,0" stroke="#ffffff" stroke-width="12" stroke-dasharray="14 14" fill="none"/>
          <path d="M -70,0 A 70,70 0 0,0 70,0" stroke="#0f172a" stroke-width="10" stroke-dasharray="12 12" fill="none"/>
        </g>
        <g transform="translate(260, 100)">
          <circle cx="0" cy="0" r="90" fill="#a855f7"/>
          <circle cx="0" cy="0" r="70" fill="#38bdf8"/>
          <circle cx="0" cy="0" r="50" fill="#0f172a"/>
          <circle cx="0" cy="0" r="30" fill="#ffffff"/>
          <path d="M -90,0 A 90,90 0 0,1 90,0" stroke="#ffffff" stroke-width="12" stroke-dasharray="14 14" fill="none"/>
        </g>
        <g transform="translate(180, 240)">
          <circle cx="0" cy="0" r="100" fill="#14b8a6"/>
          <circle cx="0" cy="0" r="75" fill="#f43f5e"/>
          <circle cx="0" cy="0" r="50" fill="#0f172a"/>
          <circle cx="0" cy="0" r="25" fill="#ffffff"/>
          <path d="M -100,0 A 100,100 0 0,1 100,0" stroke="#ffffff" stroke-width="14" stroke-dasharray="16 16" fill="none"/>
        </g>
      </g>
    `,
    checkerShadow: `
      <g transform="translate(150, 30)">
        <rect x="0" y="0" width="420" height="320" fill="#e2e8f0" rx="16"/>
        <g stroke="#cbd5e1" stroke-width="2">
          <rect x="60" y="60" width="70" height="70" fill="#334155"/>
          <rect x="200" y="60" width="70" height="70" fill="#334155"/>
          <rect x="340" y="60" width="70" height="70" fill="#334155"/>
          <rect x="130" y="130" width="70" height="70" fill="#334155"/>
          <rect x="270" y="130" width="70" height="70" fill="#334155"/>
          <rect x="60" y="200" width="70" height="70" fill="#334155"/>
          <rect x="200" y="200" width="70" height="70" fill="#707070"/>
          <rect x="340" y="200" width="70" height="70" fill="#334155"/>
        </g>
        <rect x="130" y="60" width="70" height="70" fill="#707070"/>
        <rect x="300" y="40" width="45" height="100" rx="22" fill="#10b981" stroke="#047857" stroke-width="3"/>
        <ellipse cx="322" cy="40" rx="22" ry="10" fill="#34d399"/>
        <path d="M 220,110 L 360,250 L 180,270 Z" fill="#0f172a" opacity="0.4"/>
        <text x="157" y="102" fill="#ffffff" font-size="22" font-weight="900">A</text>
        <text x="227" y="242" fill="#ffffff" font-size="22" font-weight="900">B</text>
      </g>
    `,
    cafeWall: `
      <g transform="translate(130, 35)">
        <rect x="0" y="0" width="460" height="300" fill="#cbd5e1" rx="12"/>
        <g stroke="#94a3b8" stroke-width="5">
          <rect x="20" y="20" width="70" height="50" fill="#0f172a"/>
          <rect x="160" y="20" width="70" height="50" fill="#0f172a"/>
          <rect x="300" y="20" width="70" height="50" fill="#0f172a"/>
          <rect x="60" y="85" width="70" height="50" fill="#0f172a"/>
          <rect x="200" y="85" width="70" height="50" fill="#0f172a"/>
          <rect x="340" y="85" width="70" height="50" fill="#0f172a"/>
          <rect x="100" y="150" width="70" height="50" fill="#0f172a"/>
          <rect x="240" y="150" width="70" height="50" fill="#0f172a"/>
          <rect x="380" y="150" width="70" height="50" fill="#0f172a"/>
          <rect x="50" y="215" width="70" height="50" fill="#0f172a"/>
          <rect x="190" y="215" width="70" height="50" fill="#0f172a"/>
          <rect x="330" y="215" width="70" height="50" fill="#0f172a"/>
        </g>
      </g>
    `,
    ebbinghaus: `
      <g transform="translate(100, 35)">
        <g transform="translate(140, 160)">
          <circle cx="0" cy="0" r="32" fill="#f97316"/>
          <circle cx="-90" cy="0" r="42" fill="#3b82f6"/>
          <circle cx="90" cy="0" r="42" fill="#3b82f6"/>
          <circle cx="0" cy="-90" r="42" fill="#3b82f6"/>
          <circle cx="0" cy="90" r="42" fill="#3b82f6"/>
          <circle cx="-65" cy="-65" r="42" fill="#3b82f6"/>
          <circle cx="65" cy="65" r="42" fill="#3b82f6"/>
        </g>
        <g transform="translate(380, 160)">
          <circle cx="0" cy="0" r="32" fill="#f97316"/>
          <circle cx="-48" cy="0" r="12" fill="#a855f7"/>
          <circle cx="48" cy="0" r="12" fill="#a855f7"/>
          <circle cx="0" cy="-48" r="12" fill="#a855f7"/>
          <circle cx="0" cy="48" r="12" fill="#a855f7"/>
          <circle cx="-34" cy="-34" r="12" fill="#a855f7"/>
          <circle cx="34" cy="34" r="12" fill="#a855f7"/>
          <circle cx="-34" cy="34" r="12" fill="#a855f7"/>
          <circle cx="34" cy="-34" r="12" fill="#a855f7"/>
        </g>
      </g>
    `,
    poggendorff: `
      <g transform="translate(180, 25)">
        <rect x="130" y="20" width="100" height="300" fill="#14b8a6" opacity="0.3" stroke="#0f766e" stroke-width="4"/>
        <line x1="30" y1="270" x2="130" y2="170" stroke="#a855f7" stroke-width="8" stroke-linecap="round"/>
        <line x1="230" y1="70" x2="330" y2="-30" stroke="#a855f7" stroke-width="8" stroke-linecap="round"/>
        <line x1="230" y1="90" x2="330" y2="-10" stroke="#38bdf8" stroke-width="5" stroke-dasharray="8 8"/>
      </g>
    `,
    fraserSpiral: `
      <g transform="translate(360, 180)" stroke-width="8" fill="none">
        <circle cx="0" cy="0" r="140" stroke="#0f172a"/>
        <circle cx="0" cy="0" r="105" stroke="#0284c7"/>
        <circle cx="0" cy="0" r="70" fill="none" stroke="#14b8a6"/>
        <circle cx="0" cy="0" r="35" stroke="#a855f7"/>
        <path d="M -140,0 L -120,-30 M 140,0 L 120,30 M 0,-140 L 30,-120 M 0,140 L -30,120" stroke="#f43f5e" stroke-width="5"/>
      </g>
    `,
    eskimoIndian: `
      <g transform="translate(180, 20)">
        <rect x="0" y="0" width="360" height="340" fill="#0f172a" rx="16"/>
        <path d="M 80,40 C 140,30 240,40 280,90 C 300,120 290,170 260,200 C 240,220 200,240 180,280 C 170,300 140,310 100,300 C 70,290 60,250 80,200 C 90,170 80,120 60,80 Z" fill="#ffffff"/>
        <path d="M 120,120 C 140,100 180,100 200,120 C 210,140 200,180 180,200 C 150,210 130,190 120,160 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="3"/>
      </g>
    `,
    schroderStairs: `
      <g transform="translate(160, 35)">
        <path d="M 40,240 L 90,240 L 90,190 L 140,190 L 140,140 L 190,140 L 190,90 L 240,90 L 240,40 L 320,40 L 320,280 L 40,280 Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="4"/>
        <path d="M 40,240 L 120,160 L 170,160 L 220,110 L 270,110 L 320,40" stroke="#0284c7" stroke-width="4" fill="none"/>
        <line x1="90" y1="240" x2="170" y2="160" stroke="#0f172a" stroke-width="3"/>
        <line x1="140" y1="190" x2="220" y2="110" stroke="#0f172a" stroke-width="3"/>
        <line x1="190" y1="140" x2="270" y2="60" stroke="#0f172a" stroke-width="3"/>
      </g>
    `,
    allIsVanity: `
      <g transform="translate(180, 15)">
        <rect x="0" y="0" width="360" height="350" fill="#0f172a" rx="16"/>
        <circle cx="180" cy="150" r="110" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
        <circle cx="140" cy="130" r="28" fill="#0f172a"/>
        <circle cx="220" cy="130" r="28" fill="#0f172a"/>
        <polygon points="180,175 168,205 192,205" fill="#0f172a"/>
        <rect x="120" y="240" width="120" height="35" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
        <line x1="140" y1="240" x2="140" y2="275" stroke="#0f172a" stroke-width="3"/>
        <line x1="160" y1="240" x2="160" y2="275" stroke="#0f172a" stroke-width="3"/>
        <line x1="180" y1="240" x2="180" y2="275" stroke="#0f172a" stroke-width="3"/>
        <line x1="200" y1="240" x2="200" y2="275" stroke="#0f172a" stroke-width="3"/>
        <line x1="220" y1="240" x2="220" y2="275" stroke="#0f172a" stroke-width="3"/>
      </g>
    `,
    faceCandlestick: `
      <g transform="translate(140, 20)">
        <rect x="0" y="0" width="440" height="340" fill="#030712" rx="16"/>
        <path d="M 0,0 L 140,0 C 140,50 170,70 140,110 C 120,130 110,160 140,180 C 170,200 150,240 130,270 L 0,270 Z" fill="#1e1b4b"/>
        <path d="M 440,0 L 300,0 C 300,50 270,70 300,110 C 320,130 330,160 300,180 C 270,200 290,240 310,270 L 440,270 Z" fill="#1e1b4b"/>
        <path d="M 220,40 L 250,40 L 240,90 L 260,110 L 230,170 L 260,240 L 280,280 L 160,280 L 180,240 L 210,170 L 180,110 L 200,90 Z" fill="#eab308" stroke="#ca8a04" stroke-width="3"/>
        <ellipse cx="220" cy="30" rx="12" ry="18" fill="#f97316"/>
      </g>
    `,
    ambiguousCylinder: `
      <g transform="translate(140, 25)">
        <polygon points="20,240 420,240 380,310 60,310" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="80" y="20" width="280" height="200" fill="#f1f5f9" stroke="#0284c7" stroke-width="6" rx="8"/>
        <g transform="translate(150, 160)">
          <path d="M -30,0 L -30,70 Q 0,90 30,70 L 30,0 Z" fill="#38bdf8" stroke="#0f172a" stroke-width="4"/>
          <ellipse cx="0" cy="0" rx="30" ry="16" fill="#7dd3fc" stroke="#0f172a" stroke-width="4"/>
        </g>
        <g transform="translate(250, 70)">
          <rect x="-25" y="-15" width="50" height="80" fill="#a855f7" stroke="#0f172a" stroke-width="4" rx="2"/>
          <polygon points="-25,-15 0,-25 25,-15 0,-5" fill="#c084fc" stroke="#0f172a" stroke-width="3"/>
        </g>
      </g>
    `,
    machBook: `
      <g transform="translate(180, 35)">
        <polygon points="180,40 40,90 40,270 180,230" fill="#38bdf8" fill-opacity="0.3" stroke="#0284c7" stroke-width="4"/>
        <polygon points="180,40 320,90 320,270 180,230" fill="#a855f7" fill-opacity="0.3" stroke="#7e22ce" stroke-width="4"/>
        <line x1="180" y1="40" x2="180" y2="230" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>
        <line x1="70" y1="95" x2="160" y2="70" stroke="#0284c7" stroke-width="2"/>
        <line x1="70" y1="135" x2="160" y2="110" stroke="#0284c7" stroke-width="2"/>
        <line x1="290" y1="95" x2="200" y2="70" stroke="#7e22ce" stroke-width="2"/>
        <line x1="290" y1="135" x2="200" y2="110" stroke="#7e22ce" stroke-width="2"/>
      </g>
    `,
    impossibleTrident: `
      <g transform="translate(140, 40)">
        <path d="M 40,60 L 260,60 C 290,60 320,90 320,120 L 320,140" stroke="#0f172a" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M 40,150 L 320,150" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/>
        <path d="M 40,240 L 260,240 C 290,240 320,210 320,180 L 320,160" stroke="#0f172a" stroke-width="12" fill="none" stroke-linecap="round"/>
        <line x1="300" y1="130" x2="400" y2="130" stroke="#14b8a6" stroke-width="14" stroke-linecap="round"/>
        <line x1="300" y1="170" x2="400" y2="170" stroke="#14b8a6" stroke-width="14" stroke-linecap="round"/>
        <circle cx="40" cy="60" r="16" fill="#38bdf8"/>
        <circle cx="40" cy="150" r="16" fill="#38bdf8"/>
        <circle cx="40" cy="240" r="16" fill="#38bdf8"/>
      </g>
    `,
  };

  const selectedPattern = patterns[variant] || patterns.duckRabbit;

  let bgGradient = `
    <linearGradient id="${id}-${styleMode}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>`;
  let filterAttr = "";
  let annotateOverlay = "";

  if (styleMode === "vintage") {
    bgGradient = `
      <linearGradient id="${id}-${styleMode}-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="100%" stop-color="#fde68a"/>
      </linearGradient>`;
    filterAttr = `filter="sepia(0.7) contrast(1.15)"`;
  } else if (styleMode === "minimal") {
    bgGradient = `
      <linearGradient id="${id}-${styleMode}-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>`;
    filterAttr = `filter="invert(0.9) hue-rotate(170deg)"`;
  } else if (styleMode === "annotated") {
    bgGradient = `
      <linearGradient id="${id}-${styleMode}-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f0fdf4"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>`;
    annotateOverlay = `
      <rect x="20" y="20" width="680" height="360" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="8 6" rx="12"/>
      <circle cx="360" cy="200" r="160" fill="none" stroke="#0d9488" stroke-width="2" opacity="0.4"/>
      <text x="36" y="380" fill="#0284c7" font-size="12" font-weight="900" font-family="system-ui">PERCEPTUAL MAP VARIATION</text>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" role="img" aria-label="${svgText(title)}">
      <defs>
        ${bgGradient}
      </defs>
      <rect width="720" height="400" fill="url(#${id}-${styleMode}-bg)" rx="16"/>
      <g ${filterAttr}>
        ${selectedPattern}
      </g>
      ${annotateOverlay}
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getIllusionGallery = (illusion) => {
  if (!illusion) return [];
  const variant = illusion.variant || "duckRabbit";
  return [
    {
      id: "default",
      label: "Classic Vector",
      tag: "Original Art",
      url: illusion.image,
    },
    {
      id: "vintage",
      label: "Vintage Lithograph",
      tag: "1890 Classic Print",
      url: figureSvg({ id: illusion.id, title: illusion.title, subtitle: illusion.perceptionType, variant, styleMode: "vintage" }),
    },
    {
      id: "minimal",
      label: "High Contrast Minimal",
      tag: "Neon Contrast",
      url: figureSvg({ id: illusion.id, title: illusion.title, subtitle: illusion.perceptionType, variant, styleMode: "minimal" }),
    },
    {
      id: "annotated",
      label: "Perception Blueprint",
      tag: "Analytical Overlay",
      url: figureSvg({ id: illusion.id, title: illusion.title, subtitle: illusion.perceptionType, variant, styleMode: "annotated" }),
    },
  ];
};

// --- Complete Expanded Illusion Collection (45 figures) ---
export const ILLUSIONS = [
  {
    id: "duck-rabbit",
    title: "Duck / Rabbit",
    description: "One of the most famous ambiguous figures. Can you see both the duck looking left and the rabbit looking right?",
    category: "Animals",
    difficulty: "Beginner",
    perceptionType: "Gestalt Switching",
    image: figureSvg({ id: "duck-rabbit", title: "Duck / Rabbit", subtitle: "Two meanings in one outline", variant: "duckRabbit" }),
    interpretations: [
      { id: "duck", label: "Duck", hint: "Look for the long beak pointing to the left." },
      { id: "rabbit", label: "Rabbit", hint: "Look for the long ears pointing to the left and eye on right." },
    ],
    history: "First published in Fliegende Blätter (1892) and popularized by philosopher Ludwig Wittgenstein in Philosophical Investigations.",
    psychology: "Demonstrates top-down processing where identical visual signals trigger two distinct neural conceptual representations.",
    funFact: "Studies show people perceive the duck more often in the spring (Easter) and the rabbit more often in autumn!",
    solvePercentage: 94,
    avgSolveTime: "3.2s",
    popularity: 99,
  },
  {
    id: "rubin-vase",
    title: "Rubin Vase",
    description: "A classic figure-ground illusion. Do you see an ornate vase in the center or two human profiles facing each other?",
    category: "Gestalt",
    difficulty: "Beginner",
    perceptionType: "Figure-Ground",
    image: figureSvg({ id: "rubin-vase", title: "Rubin Vase", subtitle: "Vase or two face silhouettes?", variant: "rubinVase" }),
    interpretations: [
      { id: "vase", label: "Center Vase", hint: "Focus on the bright light shape in the middle container." },
      { id: "faces", label: "Two Faces", hint: "Focus on the dark silhouettes looking inward from the sides." },
    ],
    history: "Developed around 1915 by Danish psychologist Edgar Rubin as part of his doctoral research on figure-ground perception.",
    psychology: "Your visual cortex must choose which side of the contour line owns the boundary, switching between figure and background.",
    funFact: "Rubin proved that humans remember shapes designated as 'figure' far better than shapes perceived as 'ground'.",
    solvePercentage: 91,
    avgSolveTime: "4.0s",
    popularity: 98,
  },
  {
    id: "old-young",
    title: "Old Woman / Young Lady",
    description: "Legendary illusion where a young woman's neck choker is an old woman's mouth, and her chin is a large nose.",
    category: "People",
    difficulty: "Intermediate",
    perceptionType: "Gestalt Reversal",
    image: figureSvg({ id: "old-young", title: "Old / Young Woman", subtitle: "Age transforms with mental focus", variant: "oldYoung" }),
    interpretations: [
      { id: "young", label: "Young Lady", hint: "Look for the cheek and ear of a elegant woman looking away to the left." },
      { id: "old", label: "Old Woman", hint: "Look for a big hooked nose, prominent chin, and mouth in the neck band." },
    ],
    history: "Published on an 1888 German postcard and later adapted by cartoonist W.E. Hill in 1915 as 'My Wife and My Mother-in-Law'.",
    psychology: "Demonstrates perceptual grouping and feature assignment—eyes re-interpret facial features dynamically.",
    funFact: "Younger people tend to perceive the young woman first, whereas older adults often see the old woman first!",
    solvePercentage: 84,
    avgSolveTime: "6.8s",
    popularity: 96,
  },
  {
    id: "necker-cube",
    title: "Necker Cube",
    description: "A wireframe cube with no depth cues. Your brain spontaneously flips which face appears to be in the front.",
    category: "Perspective",
    difficulty: "Intermediate",
    perceptionType: "Bistable Perception",
    image: figureSvg({ id: "necker-cube", title: "Necker Cube", subtitle: "Which square face faces front?", variant: "neckerCube" }),
    interpretations: [
      { id: "front-down", label: "Facing Down-Left", hint: "Imagine the lower-left square is closest to your eyes." },
      { id: "front-up", label: "Facing Up-Right", hint: "Imagine the upper-right square is closest to your eyes." },
    ],
    history: "Discovered in 1832 by Swiss crystallographer Louis Albert Necker while observing rhomboid crystals through a microscope.",
    psychology: "When 2D retinal projection has two equally valid 3D interpretations, neural adaptation causes automatic reversals.",
    funFact: "Staring continuously at one corner can slow down or freeze the rate of perceptual flips!",
    solvePercentage: 88,
    avgSolveTime: "5.1s",
    popularity: 92,
  },
  {
    id: "spinning-dancer",
    title: "Spinning Dancer",
    description: "A kinetic bistable illusion. Is the silhouette spinning clockwise or counter-clockwise? It depends on your perspective.",
    category: "Motion",
    difficulty: "Advanced",
    perceptionType: "Kinetic Depth",
    image: figureSvg({ id: "spinning-dancer", title: "Spinning Dancer", subtitle: "Clockwise or counter-clockwise?", variant: "spinningDancer" }),
    interpretations: [
      { id: "clockwise", label: "Clockwise Spin", hint: "Imagine looking slightly down at her outstretched leg." },
      { id: "counter", label: "Counter-Clockwise", hint: "Imagine looking slightly up from beneath her foot." },
    ],
    history: "Created in 2003 by Japanese web designer Nobuyuki Kayahara as a bistable depth animation.",
    psychology: "Due to lack of shadow and depth cues, the brain constructs height and depth from motion, choosing two rotations.",
    funFact: "It was once falsely claimed to test left-brain vs right-brain dominance, but it's actually pure visual ambiguity!",
    solvePercentage: 72,
    avgSolveTime: "9.4s",
    popularity: 95,
  },
  {
    id: "elephant-legs",
    title: "Shepard's Elephant Legs",
    description: "How many legs does this elephant have? An impossible figure where feet and legs are mismatched.",
    category: "Impossible Shapes",
    difficulty: "Advanced",
    perceptionType: "Impossible Figure",
    image: figureSvg({ id: "elephant-legs", title: "Elephant Legs", subtitle: "Four legs or five spaces?", variant: "elephantLegs" }),
    interpretations: [
      { id: "four-legs", label: "4 Legs", hint: "Count the actual feet at the bottom of the image." },
      { id: "five-legs", label: "5 Columns", hint: "Count the white cylindrical columns starting from the body." },
    ],
    history: "Created by cognitive scientist Roger Shepard in 1990 and featured in Mind Sights.",
    psychology: "The spatial contours between figure and ground are intentionally misaligned to confuse local vs global processing.",
    funFact: "It is considered one of the hardest optical illusions for neural object recognition AI algorithms to classify!",
    solvePercentage: 68,
    avgSolveTime: "11.2s",
    popularity: 91,
  },
  {
    id: "penrose-triangle",
    title: "Impossible Penrose Triangle",
    description: "A 3D impossible object consisting of three straight beams of square cross-section which meet at right angles.",
    category: "Impossible Shapes",
    difficulty: "Advanced",
    perceptionType: "Impossible Geometry",
    image: figureSvg({ id: "penrose-triangle", title: "Impossible Triangle", subtitle: "Solid geometry that cannot exist", variant: "penroseTriangle" }),
    interpretations: [
      { id: "top-corner", label: "Top Beam Front", hint: "Follow the top corner joining seamlessly to the right." },
      { id: "bottom-corner", label: "Bottom Beam Front", hint: "Follow the bottom base beam connecting backwards." },
    ],
    history: "First created by Oscar Reutersvärd in 1934 and independently popularized by Roger Penrose in 1958.",
    psychology: "Each corner is locally coherent as a 3D joint, but globally impossible in Euclidean 3D space.",
    funFact: "A physical Penrose Triangle sculpture exists in Perth, Australia—it only looks impossible from one precise angle!",
    solvePercentage: 79,
    avgSolveTime: "7.8s",
    popularity: 97,
  },
  {
    id: "hermann-grid",
    title: "Hermann Grid",
    description: "Ghostly gray spots appear at the white intersections of the grid, but vanish when you look directly at them.",
    category: "Perspective",
    difficulty: "Beginner",
    perceptionType: "Lateral Inhibition",
    image: figureSvg({ id: "hermann-grid", title: "Hermann Grid", subtitle: "Flickering ghost dots at intersections", variant: "hermannGrid" }),
    interpretations: [
      { id: "dark-dots", label: "Ghost Gray Dots", hint: "Look at the overall grid in your peripheral vision." },
      { id: "clear-intersection", label: "Pure White Intersections", hint: "Fixate your eye directly on a single intersection." },
    ],
    history: "Discovered by Ludimar Hermann in 1870 while reading a book on physics with grid diagrams.",
    psychology: "Retinal ganglion cells experience greater lateral inhibition at four-way intersections than along straight corridors.",
    funFact: "If you curve the grid lines slightly (Scintillating Grid), the dark dots flash even more intensely!",
    solvePercentage: 93,
    avgSolveTime: "2.8s",
    popularity: 90,
  },
  {
    id: "kanizsa-triangle",
    title: "Kanizsa Triangle",
    description: "You see a bright white triangle in the center even though no triangular lines are drawn!",
    category: "Negative Space",
    difficulty: "Intermediate",
    perceptionType: "Illusory Contours",
    image: figureSvg({ id: "kanizsa-triangle", title: "Kanizsa Triangle", subtitle: "Glowing white triangle created by pacmen", variant: "kanizsaTriangle" }),
    interpretations: [
      { id: "triangle-present", label: "Bright Overlay Triangle", hint: "Notice how the center area looks whiter and closer." },
      { id: "pacman-shapes", label: "3 Cut Circles", hint: "Focus purely on the three black pacman shapes." },
    ],
    history: "First described by Italian psychologist Gaetano Kanizsa in 1955.",
    psychology: "Visual area V2 fills in missing boundaries to form a cohesive foreground object (Gestalt closure).",
    funFact: "The subjective center triangle actually appears measurably brighter than the background paper!",
    solvePercentage: 86,
    avgSolveTime: "4.5s",
    popularity: 89,
  },
  {
    id: "rotating-snakes",
    title: "Rotating Snakes",
    description: "Static circular patterns appear to rotate spontaneously when you move your eyes across the image.",
    category: "Motion",
    difficulty: "Intermediate",
    perceptionType: "Peripheral Drift",
    image: figureSvg({ id: "rotating-snakes", title: "Rotating Snakes", subtitle: "Static circles that seem to spin", variant: "rotatingSnakes" }),
    interpretations: [
      { id: "moving", label: "Swirling Rings", hint: "Scan your gaze gently back and forth across the circles." },
      { id: "still", label: "Completely Still", hint: "Stare fixedly at one single center dot without blinking." },
    ],
    history: "Designed by Japanese psychologist Akiyoshi Kitaoka in 2003.",
    psychology: "Asymmetric step-gradient color sequences (black-blue-white-yellow) trick motion-sensitive V1/MT neurons.",
    funFact: "Looking at this illusion under a high-frequency strobe light freezes the apparent motion completely!",
    solvePercentage: 89,
    avgSolveTime: "3.6s",
    popularity: 94,
  },
  {
    id: "checker-shadow",
    title: "Adelson's Checker Shadow",
    description: "Square A and Square B are the exact same shade of gray, but your brain insists B is much lighter!",
    category: "Colors",
    difficulty: "Advanced",
    perceptionType: "Lightness Constancy",
    image: figureSvg({ id: "checker-shadow", title: "Checker Shadow", subtitle: "Square A and B are identical grays!", variant: "checkerShadow" }),
    interpretations: [
      { id: "different", label: "Appears Different", hint: "Look at the board with the cylinder's shadow present." },
      { id: "same", label: "Identical Shade", hint: "Cover up the surrounding squares and shadow edge with your hands." },
    ],
    history: "Created by MIT Vision Science professor Edward H. Adelson in 1995.",
    psychology: "The brain automatically subtracts shadow cast by objects to determine true surface reflectance.",
    funFact: "Even when people know the exact RGB values are identical (#707070), their visual system cannot un-see the difference!",
    solvePercentage: 75,
    avgSolveTime: "8.5s",
    popularity: 96,
  },
  {
    id: "cafe-wall",
    title: "Café Wall Illusion",
    description: "Parallel horizontal mortar lines between staggered rows of black and white tiles appear wildly tilted.",
    category: "Perspective",
    difficulty: "Intermediate",
    perceptionType: "Irradiation Illusion",
    image: figureSvg({ id: "cafe-wall", title: "Café Wall", subtitle: "Strictly parallel lines that look sloped", variant: "cafeWall" }),
    interpretations: [
      { id: "sloped", label: "Sloped Lines", hint: "Look across the horizontal mortar lines between tile rows." },
      { id: "parallel", label: "Perfectly Parallel", hint: "Use a straight ruler against the screen edge." },
    ],
    history: "Discovered by Richard Gregory in 1973 on a tiled wall of a café at St Michael's Hill, Bristol.",
    psychology: "Luminance interactions at offset corners cause misinterpretation of line angles in early visual processing.",
    funFact: "Changing the gray mortar line to solid black or white makes the illusion disappear instantly!",
    solvePercentage: 82,
    avgSolveTime: "5.8s",
    popularity: 88,
  },
  {
    id: "ebbinghaus",
    title: "Ebbinghaus / Titchener Circles",
    description: "Two orange circles of identical size look drastically different depending on surrounding circles.",
    category: "Objects",
    difficulty: "Beginner",
    perceptionType: "Relative Size Context",
    image: figureSvg({ id: "ebbinghaus", title: "Ebbinghaus Circles", subtitle: "Identical central circles look unequal", variant: "ebbinghaus" }),
    interpretations: [
      { id: "unequal", label: "Right Circle Larger", hint: "Compare the center circle surrounded by small dots." },
      { id: "equal", label: "Identical Diameters", hint: "Focus only on the central teal circles." },
    ],
    history: "Discovered by German psychologist Hermann Ebbinghaus in 1890.",
    psychology: "Visual context scales object perception in the ventral stream (what system) before reach-and-grasp motor actions.",
    funFact: "When people reach out to grab the central circle, their fingers open to the exact same width regardless of illusion!",
    solvePercentage: 90,
    avgSolveTime: "3.5s",
    popularity: 87,
  },
  {
    id: "poggendorff",
    title: "Poggendorff Illusion",
    description: "A straight line passing behind an opaque rectangle appears misaligned when exiting the other side.",
    category: "Perspective",
    difficulty: "Intermediate",
    perceptionType: "Angle Misjudgment",
    image: figureSvg({ id: "poggendorff", title: "Poggendorff Alignment", subtitle: "Which line segment connects continuously?", variant: "poggendorff" }),
    interpretations: [
      { id: "misaligned", label: "Appears Offset", hint: "Follow the purple line entry from the left." },
      { id: "continuous", label: "Collinear Path", hint: "Trace with a straight edge through the blue column." },
    ],
    history: "Discovered in 1860 by Johann Poggendorff in Johann Karl Friedrich Zöllner's drawings.",
    psychology: "The brain overestimates acute angles, causing diagonal lines entering a vertical band to appear shifted.",
    funFact: "Rotating the entire image until the diagonal line is horizontal removes most of the illusion effect!",
    solvePercentage: 80,
    avgSolveTime: "6.2s",
    popularity: 85,
  },
  {
    id: "fraser-spiral",
    title: "Fraser Spiral Illusion",
    description: "An array of overlapping arc segments forms a series of perfect concentric circles, NOT a spiral!",
    category: "Perspective",
    difficulty: "Advanced",
    perceptionType: "False Spiral",
    image: figureSvg({ id: "fraser-spiral", title: "Fraser False Spiral", subtitle: "Concentric rings that fool your eye into a spiral", variant: "fraserSpiral" }),
    interpretations: [
      { id: "spiral", label: "Continuous Spiral", hint: "Let your eyes follow the twisting pattern toward center." },
      { id: "circles", label: "Independent Circles", hint: "Trace one single ring all the way around with your finger." },
    ],
    history: "First described by British psychologist Sir James Fraser in 1908.",
    psychology: "Tilted pattern elements inside visual segments send false directional orientation signals to cortex V1.",
    funFact: "Also known as the 'twisted cord illusion' due to the rope-like pattern elements!",
    solvePercentage: 74,
    avgSolveTime: "8.9s",
    popularity: 91,
  },
  {
    id: "eskimo-indian",
    title: "Eskimo / Native American",
    description: "Do you see a lone figure clad in a heavy parka entering a cave, or a Native American profile head heavy with headdress?",
    category: "People",
    difficulty: "Intermediate",
    perceptionType: "Figure-Ground",
    image: figureSvg({ id: "eskimo-indian", title: "Eskimo / Profile", subtitle: "Cave entrance figure or face profile?", variant: "eskimoIndian" }),
    interpretations: [
      { id: "eskimo", label: "Parka Figure", hint: "Look for a person walking into a dark cavern." },
      { id: "indian", label: "Face Profile", hint: "Look at the dark shadow shape forming a face facing left." },
    ],
    history: "Popularized in perceptual psychology textbooks during the mid 20th century.",
    psychology: "Visual system assigns silhouette edges dynamically based on whether attention focuses on figure or entrance.",
    funFact: "One of the favorite figures used in cognitive psychology research to measure mental flip latencies!",
    solvePercentage: 83,
    avgSolveTime: "5.5s",
    popularity: 89,
  },
  {
    id: "schroder-stairs",
    title: "Schröder's Stairs",
    description: "A staircase drawing that can be perceived either as a staircase leading up or an upside-down staircase under a ledge.",
    category: "Perspective",
    difficulty: "Intermediate",
    perceptionType: "Perspective Shift",
    image: figureSvg({ id: "schroder-stairs", title: "Schröder Stairs", subtitle: "Stairs going up or upside down steps?", variant: "schroderStairs" }),
    interpretations: [
      { id: "upstairs", label: "Normal Staircase", hint: "See the upper flat treads as steps to climb up." },
      { id: "downstairs", label: "Inverted Staircase", hint: "Turn your mental view upside down to see underside steps." },
    ],
    history: "Published in 1858 by German natural scientist Heinrich G. F. Schröder.",
    psychology: "Demonstrates equal weight depth hypotheses—neither perspective has stronger binocular cues.",
    funFact: "Turning the drawing 180 degrees upside-down presents the exact same dual interpretation!",
    solvePercentage: 81,
    avgSolveTime: "6.0s",
    popularity: 88,
  },
  {
    id: "all-is-vanity",
    title: "All is Vanity (Skull/Woman)",
    description: "A young woman admiring herself in a vanity mirror forms the macabre composite shape of a large human skull.",
    category: "Hidden Images",
    difficulty: "Advanced",
    perceptionType: "Holistic Perception",
    image: figureSvg({ id: "all-is-vanity", title: "All is Vanity", subtitle: "Woman at vanity mirror or human skull?", variant: "allIsVanity" }),
    interpretations: [
      { id: "woman", label: "Woman at Mirror", hint: "Focus on the seated lady looking into her round mirror." },
      { id: "skull", label: "Large Skull", hint: "Step back 2 meters and view the whole composition as a skull." },
    ],
    history: "Drawn in 1892 by 18-year-old illustrator Charles Allan Gilbert.",
    psychology: "Low spatial frequency processing reveals the skull macro-structure, high frequency reveals the lady detail.",
    funFact: "Squinting your eyes or blurring your vision makes the skull interpretation instantly dominant!",
    solvePercentage: 77,
    avgSolveTime: "8.1s",
    popularity: 94,
  },
  {
    id: "face-candlestick",
    title: "Face / Candlestick",
    description: "A variation of Rubin's Vase. Do you see two faces in silhouette or an ornate golden candlestick in the middle?",
    category: "Objects",
    difficulty: "Beginner",
    perceptionType: "Figure-Ground",
    image: figureSvg({ id: "face-candlestick", title: "Face / Candlestick", subtitle: "Silhouette profiles or ornate candlestick?", variant: "faceCandlestick" }),
    interpretations: [
      { id: "faces", label: "Face Silhouettes", hint: "Focus on the dark edges looking inward." },
      { id: "candlestick", label: "Center Candlestick", hint: "Focus on the bright light central column." },
    ],
    history: "Standard demonstration figure in Gestalt psychology laboratories.",
    psychology: "Bistable figure-ground separation with high contrast boundaries.",
    funFact: "Often used as a logo for perception and neuroscience research institutes worldwide!",
    solvePercentage: 92,
    avgSolveTime: "3.8s",
    popularity: 86,
  },
  {
    id: "ambiguous-cylinder",
    title: "Ambiguous Cylinder Illusion",
    description: "A 3D object that looks rectangular from one perspective, but appears completely circular when viewed in a mirror reflection!",
    category: "Impossible Shapes",
    difficulty: "Advanced",
    perceptionType: "Geometric Perspective",
    image: figureSvg({ id: "ambiguous-cylinder", title: "Ambiguous Cylinder", subtitle: "Circle in direct view, rectangle in mirror!", variant: "ambiguousCylinder" }),
    interpretations: [
      { id: "circle", label: "Circular Top", hint: "Look at the object directly in front." },
      { id: "square", label: "Square Top", hint: "Look at the reflection in the background mirror." },
    ],
    history: "Invented in 2016 by Kokichi Sugihara, winning 2nd prize in Illusion of the Year.",
    psychology: "Exploits 2D-to-3D projection ambiguity where undulating rim heights fool human stereoscopic vision.",
    funFact: "Sugihara uses 3D printers to manufacture these optical tricks using precise mathematical curves!",
    solvePercentage: 70,
    avgSolveTime: "10.1s",
    popularity: 93,
  },
  {
    id: "mach-book",
    title: "Bistable Mach Book",
    description: "An open book folded in half that can appear to open towards you or away from you into the background.",
    category: "Perspective",
    difficulty: "Intermediate",
    perceptionType: "Perspective Reversal",
    image: figureSvg({ id: "mach-book", title: "Mach Book", subtitle: "Book opening towards you or away?", variant: "machBook" }),
    interpretations: [
      { id: "towards", label: "Opening Towards You", hint: "Imagine the central crease point is closest." },
      { id: "away", label: "Opening Away", hint: "Imagine the spine is receding into the distance." },
    ],
    history: "Described in 1886 by Austrian physicist Ernst Mach.",
    psychology: "Demonstrates shadow and perspective cues in depth perception switching.",
    funFact: "Closing one eye dramatically speeds up the frequency of perceptual flips!",
    solvePercentage: 85,
    avgSolveTime: "4.9s",
    popularity: 84,
  },
  {
    id: "impossible-trident",
    title: "Impossible Trident (Blivet)",
    description: "Has three cylindrical prongs at one end which transform into two rectangular prongs at the other end.",
    category: "Impossible Shapes",
    difficulty: "Advanced",
    perceptionType: "Impossible Object",
    image: figureSvg({ id: "impossible-trident", title: "Impossible Trident", subtitle: "Three round prongs become two square bars", variant: "impossibleTrident" }),
    interpretations: [
      { id: "three-prongs", label: "Three Round Prongs", hint: "Focus on the left tips of the fork." },
      { id: "two-prongs", label: "Two Square Bars", hint: "Focus on the solid right base block." },
    ],
    history: "Featured on the cover of Mad Magazine in March 1965 as the 'poiuyt'.",
    psychology: "Lines that form background spaces on the left become solid bar edges on the right.",
    funFact: "Engineers refer to this as a 'devil's pitchfork' because it cannot be manufactured in 3D!",
    solvePercentage: 73,
    avgSolveTime: "9.2s",
    popularity: 95,
  },
];

// --- Gamified Achievements Definitions ---
export const ACHIEVEMENTS = [
  {
    id: "first_illusion",
    name: "First Impression",
    description: "Interact with your first optical figure",
    iconKey: "Eye",
    reqCount: 1,
  },
  {
    id: "ten_solved",
    name: "Perception Explorer",
    description: "Discover both interpretations in 10 figures",
    iconKey: "Compass",
    reqCount: 10,
  },
  {
    id: "twenty_five_solved",
    name: "Mind Flexer",
    description: "Discover both interpretations in 25 figures",
    iconKey: "Zap",
    reqCount: 25,
  },
  {
    id: "fast_thinker",
    name: "Fast Thinker",
    description: "Switch interpretations in under 4 seconds",
    iconKey: "Flame",
    reqCount: 1,
    type: "speed",
  },
  {
    id: "perception_master",
    name: "Perception Master",
    description: "Reach a Brain Score of 500+",
    iconKey: "Trophy",
    reqCount: 500,
    type: "score",
  },
  {
    id: "hidden_genius",
    name: "Hidden Genius",
    description: "Solve 5 Advanced difficulty illusions",
    iconKey: "Award",
    reqCount: 5,
    type: "advanced",
  },
];
