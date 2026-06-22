"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { 
  Download, Music, RefreshCw, Play, Volume2, RotateCcw, Camera, Search, Grid, List, Smartphone,
  ChevronLeft, MoreVertical, Phone, Video, Send, Smile, Paperclip, MoreHorizontal, ShieldAlert,
  Wifi, Battery, Check, CheckCheck, Trash2, Plus, Image as ImageIcon, Eye
} from "lucide-react";
import { useInterval } from "../hooks/useInterval";
import { openFullscreen } from "../lib/fullscreen";
import { inputClass, panelClass, primaryButton, secondaryButton } from "../components/uiClasses";
import { toPng } from "html-to-image";

export function FakeUpdate({ slug }) {
  const initial = slug === "mac-update" ? "macOS" : slug === "windows-update" ? "Windows" : "Windows";
  const [os, setOs] = useState(initial);
  const [progress, setProgress] = useState(33);
  const ref = useRef(null);
  useInterval(() => setProgress((value) => (value >= 99 ? 99 : value + 1)), 1800);
  const isMac = os === "macOS";
  return (
    <section ref={ref} className={`grid min-h-[650px] place-items-center rounded-[2rem] p-6 text-center ${isMac ? "bg-slate-100 text-slate-950" : "bg-[#005a9e] text-white"}`}>
      <div className="max-w-3xl">
        <select value={os} onChange={(event) => setOs(event.target.value)} className="mb-8 rounded-xl border px-4 py-3 text-slate-950">
          {["Windows", "macOS", "Android", "Generic"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <RefreshCw className={`mx-auto h-16 w-16 ${isMac ? "text-slate-700" : "text-white"} animate-spin`} />
        <h2 className="mt-8 text-3xl font-semibold">{os} is updating</h2>
        <p className="mt-4 text-xl">Please keep this screen open. {progress}% complete.</p>
        <div className="mx-auto mt-8 h-3 max-w-xl overflow-hidden rounded-full bg-black/20">
          <div className={`${isMac ? "bg-slate-950" : "bg-white"} h-full`} style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => setProgress(0)} className={isMac ? "rounded-xl bg-slate-950 px-5 py-3 font-black text-white" : "rounded-xl bg-white px-5 py-3 font-black text-[#005a9e]"}>Reset</button>
          <button onClick={() => openFullscreen(ref)} className={isMac ? "rounded-xl border border-slate-300 px-5 py-3 font-black" : "rounded-xl border border-white/50 px-5 py-3 font-black"}>Fullscreen</button>
        </div>
      </div>
    </section>
  );
}

// PREMIUM SOUNDBOARD REDESIGN
export function Soundboard() {
  const [search, setSearch] = useState("");
  const [volume, setVolume] = useState(0.6);
  const [viewType, setViewType] = useState("grid"); // "grid" | "list"
  const [orderBy, setOrderBy] = useState("name"); // "name" | "emoji"
  const [loopSound, setLoopSound] = useState(false);
  const [activePlay, setActivePlay] = useState(null);

  const play = (type) => {
    setActivePlay(type);
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(volume, ctx.currentTime);
    mainGain.connect(ctx.destination);
    const t = ctx.currentTime;

    const runPlay = () => {
      // White noise generator helper
      const playNoise = (duration, filterFreq, filterType = "lowpass", startGain = 0.2, endGain = 0.001) => {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(filterFreq, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(startGain, t);
        g.gain.exponentialRampToValueAtTime(endGain, t + duration);
        noise.connect(filter);
        filter.connect(g);
        g.connect(mainGain);
        noise.start(t);
        noise.stop(t + duration);
        return { noise, filter, gain: g };
      };

      // Simple oscillator helper
      const playOsc = (oscType, freqStart, freqEnd, duration, startGain = 0.15, endGain = 0.001) => {
        const osc = ctx.createOscillator();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freqStart, t);
        if (freqEnd !== freqStart) {
          osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
        }
        const g = ctx.createGain();
        g.gain.setValueAtTime(startGain, t);
        g.gain.exponentialRampToValueAtTime(endGain, t + duration - 0.01);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        osc.stop(t + duration);
        return { osc, gain: g };
      };

      const speakLine = (text, { pitch = 1, rate = 1, volumeScale = 1 } = {}) => {
        if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return false;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = Math.max(0, Math.min(1, volume * volumeScale));
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return true;
      };

      // Categorised Synthesis Switch Case
      if (type.startsWith("fart")) {
        const duration = type === "fart_long" ? 0.75 : 0.25;
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(30, t + duration);
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(30, t);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(40, t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(350, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.connect(filter);
        filter.connect(g);
        g.connect(mainGain);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + duration);
        lfo.stop(t + duration);
      } else if (type === "potty_voice") {
        speakLine("Potty break. Emergency mode activated.", { pitch: 0.72, rate: 0.9, volumeScale: 0.9 });
        playOsc("sawtooth", 120, 42, 0.34, 0.18);
        playNoise(0.38, 180, "lowpass", 0.16);
        [0, 1, 2, 3].forEach((step) => {
          setTimeout(() => {
            playOsc("sine", 180 + step * 36, 105 + step * 18, 0.08, 0.08);
          }, 90 + step * 85);
        });
      } else if (type === "burp") {
        playOsc("sawtooth", 90, 50, 0.45, 0.25);
        playNoise(0.4, 250, "lowpass", 0.15);
      } else if (type === "snore") {
        playOsc("triangle", 110, 105, 0.95, 0.15);
        playNoise(0.9, 150, "lowpass", 0.08);
      } else if (type === "sneeze") {
        playNoise(0.25, 2000, "bandpass", 0.35);
        playOsc("sine", 600, 200, 0.2, 0.15);
      } else if (type === "hiccup") {
        playOsc("sine", 650, 950, 0.08, 0.2);
      } else if (type === "giggle") {
        for (let i = 0; i < 4; i++) {
          const delay = i * 0.12;
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(500, t + delay);
          osc.frequency.exponentialRampToValueAtTime(900, t + delay + 0.09);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.12, t + delay);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);
          osc.connect(g);
          g.connect(mainGain);
          osc.start(t + delay);
          osc.stop(t + delay + 0.1);
        }
      } else if (type === "screaming") {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.85);
        const mod = ctx.createOscillator();
        mod.frequency.value = 15;
        const modGain = ctx.createGain();
        modGain.gain.value = 50;
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1500, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
        osc.connect(filter);
        filter.connect(g);
        g.connect(mainGain);
        osc.start(t);
        mod.start(t);
        osc.stop(t + 0.9);
        mod.stop(t + 0.9);
      } else if (type === "crickets") {
        for (let chirp = 0; chirp < 3; chirp++) {
          const chirpTime = t + chirp * 0.28;
          for (let pulse = 0; pulse < 4; pulse++) {
            const pulseTime = chirpTime + pulse * 0.04;
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(4500, pulseTime);
            osc.frequency.exponentialRampToValueAtTime(4000, pulseTime + 0.03);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.08, pulseTime);
            g.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.03);
            osc.connect(g);
            g.connect(mainGain);
            osc.start(pulseTime);
            osc.stop(pulseTime + 0.04);
          }
        }
      } else if (type === "slide_whistle") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.45);
        osc.frequency.linearRampToValueAtTime(300, t + 0.9);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        osc.stop(t + 0.95);
      } else if (type === "boo") {
        playNoise(0.95, 280, "bandpass", 0.25);
        playOsc("sine", 180, 130, 0.9, 0.15);
      } else if (type === "laugh_track") {
        playNoise(1.4, 450, "bandpass", 0.22);
        for (let i = 0; i < 6; i++) {
          const delay = i * 0.18;
          playOsc("triangle", 250 + i * 30, 180, 0.8, 0.08);
        }
      } else if (type === "sigh") {
        playNoise(0.85, 300, "bandpass", 0.18);
      } else if (type === "cough") {
        playNoise(0.12, 500, "bandpass", 0.28);
        playNoise(0.16, 400, "bandpass", 0.24);
      } else if (type === "yawn") {
        playOsc("triangle", 400, 180, 0.85, 0.15);
      } else if (type === "bruh" || type === "emotional_bruh") {
        const startFreq = type === "emotional_bruh" ? 220 : 130;
        const endFreq = type === "emotional_bruh" ? 170 : 80;
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.42);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(filter);
        filter.connect(g);
        g.connect(mainGain);
        osc.start(t);
        osc.stop(t + 0.46);
      } else if (type === "emotional_damage") {
        [293.66, 349.23, 440.00, 587.33].forEach((f, idx) => {
          playOsc("sawtooth", f, f - 10, 0.95, 0.06);
        });
      } else if (type === "airhorn") {
        [233.08, 277.18, 349.23].forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(f, t);
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 45;
          const lf = ctx.createGain();
          lf.gain.value = 4;
          lfo.connect(lf);
          lf.connect(osc.frequency);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.72);
          osc.connect(g);
          g.connect(mainGain);
          osc.start(t);
          lfo.start(t);
          osc.stop(t + 0.75);
          lfo.stop(t + 0.75);
        });
      } else if (type === "wow") {
        playOsc("sine", 620, 880, 0.35, 0.16);
        playOsc("triangle", 620, 880, 0.35, 0.12);
      } else if (type === "nani") {
        playOsc("square", 820, 1100, 0.1, 0.1);
        playOsc("sine", 820, 1100, 0.1, 0.12);
      } else if (type === "what_dog") {
        playOsc("sine", 220, 350, 0.22, 0.14);
        playOsc("sine", 320, 220, 0.25, 0.12);
      } else if (type === "sad_violin") {
        [196.00, 293.66, 349.23, 440.00].forEach((f) => {
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.value = f;
          const vib = ctx.createOscillator();
          vib.frequency.value = 6.5;
          const vg = ctx.createGain();
          vg.gain.value = 4;
          vib.connect(vg);
          vg.connect(osc.frequency);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.06, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 1.25);
          osc.connect(g);
          g.connect(mainGain);
          osc.start(t);
          vib.start(t);
          osc.stop(t + 1.3);
          vib.stop(t + 1.3);
        });
      } else if (type === "rickroll") {
        const chords = [
          [233.08, 293.66, 349.23],
          [261.63, 329.63, 392.00],
          [220.00, 261.63, 329.63],
          [293.66, 349.23, 440.00]
        ];
        chords.forEach((chord, chordIdx) => {
          const delay = chordIdx * 0.25;
          chord.forEach((f) => {
            playOsc("triangle", f, f, 0.24, 0.08);
          });
        });
      } else if (type === "coffin_dance") {
        const melody = [587.33, 587.33, 1174.66, 1046.50, 987.77, 880.00];
        const times = [0, 0.12, 0.24, 0.36, 0.48, 0.6];
        melody.forEach((f, idx) => {
          const timeOffset = times[idx];
          playOsc("square", f, f, 0.11, 0.1);
        });
      } else if (type === "illuminati") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.linearRampToValueAtTime(1600, t + 0.9);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 5.5;
        const lg = ctx.createGain();
        lg.gain.value = 15;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + 0.95);
        lfo.stop(t + 0.95);
      } else if (type === "oof") {
        playOsc("sine", 120, 280, 0.18, 0.22);
      } else if (type === "metal_pipe") {
        [1500, 1850, 2200, 3100].forEach((f, i) => {
          playOsc("sawtooth", f, f - 200, 0.8, 0.04);
        });
        playNoise(0.65, 800, "bandpass", 0.25);
      } else if (type === "vine_boom") {
        playOsc("sine", 95, 35, 0.72, 0.45);
        playOsc("triangle", 95, 35, 0.72, 0.25);
      } else if (type === "wasted") {
        playOsc("sine", 120, 40, 1.25, 0.28);
        playNoise(1.2, 100, "lowpass", 0.2);
      } else if (type === "yeet") {
        playOsc("sine", 120, 920, 0.35, 0.16);
      } else if (type === "sheesh") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(2200, t);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 22;
        const lg = ctx.createGain();
        lg.gain.value = 80;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + 0.45);
        lfo.stop(t + 0.45);
      } else if (type === "tuturu") {
        playOsc("sine", 587.33, 783.99, 0.15, 0.16);
        playOsc("sine", 783.99, 987.77, 0.15, 0.14);
      } else if (type === "bonk") {
        playOsc("triangle", 220, 110, 0.14, 0.35);
      } else if (type === "skibidi_voice") {
        speakLine("Skibidi toilet alert.", { pitch: 1.24, rate: 1.08, volumeScale: 0.85 });
        [392.00, 523.25, 659.25, 523.25, 392.00].forEach((f, idx) => {
          setTimeout(() => {
            playOsc(idx % 2 ? "square" : "sine", f, f + 18, 0.09, 0.11);
          }, idx * 92);
        });
      } else if (type === "what_sigma_voice") {
        speakLine("Erm, what the sigma?", { pitch: 0.92, rate: 0.88, volumeScale: 0.9 });
        playOsc("triangle", 260, 190, 0.28, 0.18);
        setTimeout(() => {
          playOsc("sine", 980, 680, 0.16, 0.12);
        }, 260);
      } else if (type === "rizz_check_voice") {
        speakLine("Rizz check passed.", { pitch: 1.08, rate: 1.04, volumeScale: 0.9 });
        [659.25, 783.99, 987.77].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("sine", f, f, 0.14, 0.09);
          }, idx * 85);
        });
      } else if (type === "npc_loop_voice") {
        speakLine("NPC loop engaged.", { pitch: 0.78, rate: 0.78, volumeScale: 0.9 });
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            playOsc("square", i % 2 ? 220 : 176, i % 2 ? 220 : 176, 0.05, 0.09);
          }, i * 120);
        }
      } else if (type === "aura_farm_voice") {
        speakLine("Aura points rising.", { pitch: 0.95, rate: 0.92, volumeScale: 0.9 });
        [246.94, 329.63, 493.88, 659.25].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("triangle", f, f * 1.04, 0.32, 0.06);
          }, idx * 105);
        });
      } else if (type === "ohio_alert_voice") {
        speakLine("Only in Ohio.", { pitch: 1.16, rate: 0.94, volumeScale: 0.9 });
        playOsc("sawtooth", 640, 90, 0.42, 0.18);
        setTimeout(() => {
          playNoise(0.16, 700, "bandpass", 0.15);
        }, 250);
      } else if (type === "no_cap_voice") {
        speakLine("No cap. That's wild.", { pitch: 1.06, rate: 1.08, volumeScale: 0.9 });
        playOsc("sine", 880, 880, 0.07, 0.1);
        setTimeout(() => {
          playOsc("sine", 1320, 1120, 0.12, 0.1);
        }, 95);
      } else if (type === "coin") {
        playOsc("sine", 987.77, 987.77, 0.08, 0.12);
        setTimeout(() => {
          playOsc("sine", 1318.51, 1318.51, 0.22, 0.12);
        }, 80);
      } else if (type === "powerup") {
        [261.63, 329.63, 392.00, 523.25].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("sine", f, f, 0.15, 0.1);
          }, idx * 60);
        });
      } else if (type === "gameover") {
        [392.00, 349.23, 311.13, 261.63].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("triangle", f, f - 20, 0.25, 0.14);
          }, idx * 160);
        });
      } else if (type === "laser") {
        playOsc("sawtooth", 1200, 80, 0.32, 0.2);
      } else if (type === "jump") {
        playOsc("triangle", 150, 680, 0.16, 0.18);
      } else if (type === "fireball") {
        playNoise(0.45, 450, "bandpass", 0.35);
      } else if (type === "level_up") {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("sine", f, f, 0.22, 0.1);
          }, idx * 90);
        });
      } else if (type === "defeat") {
        [293.66, 277.18, 261.63, 220.00].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("sawtooth", f, f, 0.3, 0.12);
          }, idx * 180);
        });
      } else if (type === "victory") {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
          playOsc("triangle", f, f, 0.85, 0.08);
        });
      } else if (type === "combo") {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            playOsc("sine", 600 + i * 150, 600 + i * 150, 0.08, 0.12);
          }, i * 70);
        }
      } else if (type === "retro_hit") {
        playNoise(0.12, 800, "bandpass", 0.3);
      } else if (type === "teleport") {
        playOsc("sine", 1200, 2000, 0.6, 0.15);
        playOsc("square", 100, 900, 0.6, 0.05);
      } else if (type === "retro_unpause") {
        playOsc("sine", 880, 1760, 0.08, 0.14);
      } else if (type === "meow") {
        playOsc("triangle", 650, 750, 0.22, 0.14);
        setTimeout(() => {
          playOsc("triangle", 750, 480, 0.25, 0.12);
        }, 210);
      } else if (type === "bark") {
        playOsc("sawtooth", 220, 110, 0.12, 0.26);
        playNoise(0.12, 450, "lowpass", 0.12);
      } else if (type === "quack") {
        playOsc("sawtooth", 450, 320, 0.16, 0.24);
      } else if (type === "moo") {
        playOsc("triangle", 150, 110, 0.68, 0.16);
      } else if (type === "roar") {
        playNoise(0.6, 120, "lowpass", 0.42);
        playOsc("sawtooth", 90, 40, 0.55, 0.22);
      } else if (type === "chicken") {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            playOsc("sawtooth", 920, 800, 0.07, 0.18);
          }, i * 90);
        }
      } else if (type === "sheep") {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(293.66, t);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 16;
        const lg = ctx.createGain();
        lg.gain.value = 25;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + 0.5);
        lfo.stop(t + 0.5);
      } else if (type === "snake_hiss") {
        playNoise(0.65, 4800, "highpass", 0.24);
      } else if (type === "owl") {
        playOsc("sine", 320, 290, 0.22, 0.16);
        setTimeout(() => {
          playOsc("sine", 320, 270, 0.28, 0.14);
        }, 280);
      } else if (type === "frog") {
        for (let i = 0; i < 2; i++) {
          setTimeout(() => {
            playOsc("square", 75, 65, 0.11, 0.28);
          }, i * 180);
        }
      } else if (type === "horse") {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, t);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 22;
        const lg = ctx.createGain();
        lg.gain.value = 120;
        lfo.connect(lg);
        lg.connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        lfo.start(t);
        osc.stop(t + 0.68);
        lfo.stop(t + 0.68);
      } else if (type === "wolf") {
        playOsc("sine", 350, 720, 0.85, 0.18);
      } else if (type === "bee") {
        playOsc("sawtooth", 135, 140, 0.95, 0.16);
        playOsc("square", 137, 133, 0.95, 0.08);
      } else if (type === "bird") {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            playOsc("sine", 2500, 3100, 0.06, 0.12);
          }, i * 110);
        }
      } else if (type === "elephant") {
        playOsc("sawtooth", 620, 880, 0.42, 0.15);
        playNoise(0.42, 2800, "bandpass", 0.22);
      } else if (type === "monkey") {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            playOsc("sine", 900 + (i % 2) * 500, 1600, 0.08, 0.16);
          }, i * 90);
        }
      } else if (type === "siren_police") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.linearRampToValueAtTime(1100, t + 0.42);
        osc.frequency.linearRampToValueAtTime(650, t + 0.85);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.88);
        osc.connect(g);
        g.connect(mainGain);
        osc.start(t);
        osc.stop(t + 0.9);
      } else if (type === "alarm_clock") {
        for (let r = 0; r < 4; r++) {
          const delay = r * 0.22;
          setTimeout(() => {
            playOsc("square", 1200, 1200, 0.09, 0.12);
          }, delay * 1000);
        }
      } else if (type === "nuclear") {
        playOsc("sawtooth", 140, 95, 0.95, 0.28);
      } else if (type === "smoke_detector") {
        playOsc("sine", 3200, 3200, 0.14, 0.3);
      } else if (type === "text_message") {
        playOsc("sine", 880, 880, 0.06, 0.14);
        setTimeout(() => {
          playOsc("sine", 1320, 1320, 0.12, 0.12);
        }, 70);
      } else if (type === "doorbell") {
        playOsc("sine", 659.25, 659.25, 0.35, 0.18);
        setTimeout(() => {
          playOsc("sine", 523.25, 523.25, 0.52, 0.18);
        }, 220);
      } else if (type === "car_lock") {
        playOsc("sine", 2100, 2100, 0.04, 0.18);
        setTimeout(() => {
          playOsc("sine", 2100, 2100, 0.04, 0.18);
        }, 90);
      } else if (type === "low_battery") {
        playOsc("sine", 680, 680, 0.1, 0.16);
        setTimeout(() => {
          playOsc("sine", 510, 510, 0.18, 0.14);
        }, 110);
      } else if (type === "door_knock") {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            playOsc("triangle", 110, 85, 0.08, 0.28);
          }, i * 180);
        }
      } else if (type === "radar_sweep") {
        playOsc("sine", 1800, 1500, 0.45, 0.14);
      } else if (type === "sonar_ping") {
        playOsc("sine", 2500, 2500, 0.12, 0.18);
        const osc = playOsc("sine", 2500, 2500, 1.25, 0.12);
        osc.gain.gain.setValueAtTime(0.12, t);
        osc.gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      } else if (type === "bass_drop") {
        playOsc("sine", 120, 20, 1.15, 0.45);
      } else if (type === "synth_lead") {
        [261.63, 329.63, 392.00, 523.25].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("sawtooth", f, f, 0.2, 0.08);
          }, idx * 110);
        });
      } else if (type === "bell_crystal") {
        [2500, 3700, 4800].forEach((f) => {
          playOsc("sine", f, f, 0.95, 0.04);
        });
      } else if (type === "chord_major") {
        [261.63, 329.63, 392.00, 523.25].forEach((f) => {
          playOsc("triangle", f, f, 0.95, 0.08);
        });
      } else if (type === "chord_minor") {
        [220.00, 261.63, 329.63, 440.00].forEach((f) => {
          playOsc("sawtooth", f, f, 1.1, 0.05);
        });
      } else if (type === "arpeggio") {
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((f, idx) => {
          setTimeout(() => {
            playOsc("sine", f, f, 0.14, 0.1);
          }, idx * 70);
        });
      } else if (type === "bell_chime") {
        [987.77, 1318.51, 1567.98].forEach((f) => {
          playOsc("sine", f, f, 0.72, 0.06);
        });
      } else if (type === "gong_strike") {
        playOsc("sawtooth", 90, 85, 1.25, 0.18);
        playOsc("sine", 95, 95, 1.25, 0.16);
      } else if (type === "drum_kick") {
        playOsc("sine", 130, 40, 0.09, 0.45);
      } else if (type === "drum_snare") {
        playNoise(0.08, 1200, "bandpass", 0.35);
        playOsc("triangle", 180, 120, 0.07, 0.22);
      } else if (type === "click") {
        playOsc("sine", 1600, 1600, 0.02, 0.15);
      } else if (type === "glass_shatter") {
        [1500, 2400, 3500].forEach((f) => {
          playOsc("sine", f, f - 100, 0.38, 0.05);
        });
        playNoise(0.38, 3000, "highpass", 0.26);
      } else if (type === "keyboard_type") {
        playOsc("sine", 850, 750, 0.03, 0.14);
        playNoise(0.02, 1800, "bandpass", 0.16);
      } else if (type === "camera_click") {
        playNoise(0.07, 1200, "bandpass", 0.28);
        setTimeout(() => {
          playNoise(0.09, 900, "bandpass", 0.18);
        }, 60);
      } else if (type === "cash_reg") {
        playOsc("sine", 1950, 1950, 0.22, 0.18);
        setTimeout(() => {
          playNoise(0.24, 600, "bandpass", 0.14);
        }, 110);
      } else if (type === "punch_hit") {
        playOsc("triangle", 130, 40, 0.14, 0.32);
      } else if (type === "whip_crack") {
        playNoise(0.18, 900, "bandpass", 0.26);
        playOsc("sine", 1200, 300, 0.14, 0.14);
      } else if (type === "snare_roll") {
        for (let i = 0; i < 18; i++) {
          setTimeout(() => {
            playNoise(0.03, 1100, "bandpass", 0.08 + (i === 17 ? 0.22 : 0));
          }, i * 40);
        }
      } else if (type === "clock_tick") {
        playOsc("sine", 1850, 1850, 0.01, 0.18);
      } else if (type === "gunshot_blast") {
        playNoise(0.38, 550, "lowpass", 0.48);
      } else if (type === "car_crash") {
        playNoise(0.85, 140, "lowpass", 0.38);
        playNoise(0.55, 1200, "bandpass", 0.24);
      } else if (type === "bubble_pop") {
        playOsc("sine", 750, 1100, 0.05, 0.16);
      } else if (type === "zipper") {
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            playOsc("sine", 950 + i * 45, 950 + i * 45, 0.015, 0.08);
          }, i * 22);
        }
      } else if (type === "thunder") {
        playNoise(1.25, 60, "lowpass", 0.46);
      } else if (type === "rain") {
        playNoise(1.15, 800, "bandpass", 0.16);
      } else if (type === "wind") {
        const osc = playOsc("sine", 250, 380, 1.25, 0.04);
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 1.2;
        const lg = ctx.createGain();
        lg.gain.value = 60;
        lfo.connect(lg);
        lg.connect(osc.osc.frequency);
        lfo.start(t);
        lfo.stop(t + 1.25);
        playNoise(1.25, 450, "bandpass", 0.12);
      } else if (type === "footsteps") {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            playOsc("triangle", 90, 60, 0.09, 0.14);
            playNoise(0.08, 120, "lowpass", 0.08);
          }, i * 380);
        }
      } else if (type === "scratch") {
        playOsc("sine", 450, 1200, 0.16, 0.18);
        setTimeout(() => {
          playOsc("sine", 1200, 350, 0.22, 0.16);
        }, 160);
      } else if (type === "laser_sweep") {
        playOsc("sawtooth", 900, 150, 0.42, 0.18);
      }
    };

    runPlay();
    setTimeout(() => {
      setActivePlay(null);
    }, 1000);
  };

  const pads = useMemo(() => [
    // Classic Pranks
    { type: "fart_short", label: "Short Fart", emoji: "💩", desc: "Quick funny flatulence" },
    { type: "fart_long", label: "Wet Fart", emoji: "💨", desc: "Extended bubbly flatulence" },
    { type: "potty_voice", label: "Potty Voice", emoji: "🚽", desc: "Talking potty emergency gag" },
    { type: "burp", label: "Loud Burp", emoji: "🗣️", desc: "Guttural deep burp sound" },
    { type: "snore", label: "Heavy Snore", emoji: "😴", desc: "Deep sleep breathing cycle" },
    { type: "giggle", label: "Baby Giggle", emoji: "👶", desc: "Cute pitch-modulated giggle" },
    { type: "screaming", label: "Horror Scream", emoji: "😱", desc: "High pitch modulated scream" },
    { type: "crickets", label: "Crickets", emoji: "🦗", desc: "Awkward cricket chirps" },
    { type: "slide_whistle", label: "Slide Whistle", emoji: "🛝", desc: "Classic comic slide up/down" },
    { type: "boo", label: "Crowd Boo", emoji: "👎", desc: "Disappointed crowd booing" },
    { type: "laugh_track", label: "Laugh Track", emoji: "🎭", desc: "Classic sitcom crowd laughter" },
    { type: "sigh", label: "Deep Sigh", emoji: "😔", desc: "Exasperated breath release" },
    { type: "cough", label: "Dry Cough", emoji: "😷", desc: "Staccato throat clearing" },
    { type: "yawn", label: "Big Yawn", emoji: "🥱", desc: "Slow sleepy pitch sweep" },
    { type: "sneeze", label: "Ah-Choo!", emoji: "🤧", desc: "Explosive sneeze burst" },
    { type: "hiccup", label: "Hiccup", emoji: "🥤", desc: "Sharp staccato throat click" },

    // Meme Sounds
    { type: "bruh", label: "Bruh Moment", emoji: "😑", desc: "Standard deep voice effect" },
    { type: "emotional_bruh", label: "Bruh (High)", emoji: "🤦", desc: "High pitched squeaking meme sound" },
    { type: "emotional_damage", label: "Emotional Damage", emoji: "💔", desc: "Shattered heart chord effect" },
    { type: "airhorn", label: "MLG Airhorn", emoji: "📯", desc: "Triple sawtooth stadium horn" },
    { type: "wow", label: "Anime Wow", emoji: "✨", desc: "Sparkling high pitched wow" },
    { type: "nani", label: "Nani?!", emoji: "❓", desc: "Inquisitive retro synth ping" },
    { type: "what_dog", label: "What the Dog Doin", emoji: "🐕", desc: "Confused canine sequence" },
    { type: "sad_violin", label: "Sad Violin", emoji: "🎻", desc: "Tragic strings ensemble chord" },
    { type: "rickroll", label: "Never Gonna...", emoji: "🕺", desc: "Iconic 80s synth chords" },
    { type: "coffin_dance", label: "Coffin Dance", emoji: "⚰️", desc: "Electro EDM synth sequence" },
    { type: "illuminati", label: "Illuminati", emoji: "👁️", desc: "Mysterious whistle vibrato" },
    { type: "oof", label: "Roblox Oof", emoji: "💀", desc: "Classic blocky death sound" },
    { type: "metal_pipe", label: "Metal Pipe", emoji: "🔩", desc: "Loud resonant metallic drop" },
    { type: "vine_boom", label: "Vine Boom", emoji: "💥", desc: "Dramatic bass sweep impact" },
    { type: "wasted", label: "GTA Wasted", emoji: "🎮", desc: "Retro slow motion game over" },
    { type: "yeet", label: "Yeet Throw", emoji: "☄️", desc: "Whooshing pitch projection" },
    { type: "sheesh", label: "Sheesh!", emoji: "🥶", desc: "Pulsing high whistle blast" },
    { type: "tuturu", label: "Tuturu!", emoji: "🌸", desc: "Cute upbeat anime greet chime" },
    { type: "bonk", label: "Doggo Bonk", emoji: "🔨", desc: "Hollow woodblock bonk hit" },

    // Trending Voices
    { type: "skibidi_voice", label: "Skibidi Voice", emoji: "🚽", desc: "Spoken skibidi toilet alert" },
    { type: "what_sigma_voice", label: "What Sigma", emoji: "🧠", desc: "Deadpan what-the-sigma voice" },
    { type: "rizz_check_voice", label: "Rizz Check", emoji: "😎", desc: "Smooth passed-the-vibe voice" },
    { type: "npc_loop_voice", label: "NPC Loop", emoji: "🤖", desc: "Robotic repeating voice cue" },
    { type: "aura_farm_voice", label: "Aura Farm", emoji: "✨", desc: "Slow aura-points voice rise" },
    { type: "ohio_alert_voice", label: "Ohio Alert", emoji: "📍", desc: "Only-in-Ohio voice sting" },
    { type: "no_cap_voice", label: "No Cap", emoji: "🧢", desc: "Quick spoken no-cap reaction" },

    // Gaming & Retro
    { type: "coin", label: "Retro Coin", emoji: "🪙", desc: "8-bit double chime ping" },
    { type: "powerup", label: "Power Up", emoji: "⚡", desc: "Rising arpeggio arcade boost" },
    { type: "gameover", label: "Game Over", emoji: "📉", desc: "Sad descending 8-bit scale" },
    { type: "laser", label: "Arcade Laser", emoji: "🔫", desc: "Retro arcade frequency zap" },
    { type: "jump", label: "Super Jump", emoji: "🦘", desc: "8-bit upward spring sound" },
    { type: "fireball", label: "Fireball", emoji: "🔥", desc: "Whooshing fire spell cast" },
    { type: "level_up", label: "Level Up!", emoji: "🆙", desc: "Triumphant arcade fanfare" },
    { type: "defeat", label: "Defeat Screen", emoji: "☠️", desc: "Gloomy minor scale chime" },
    { type: "victory", label: "Victory!", emoji: "🏆", desc: "Grand major chord fanfare" },
    { type: "combo", label: "Combo Hit", emoji: "🔢", desc: "Sequenced high-pitch hit pings" },
    { type: "retro_hit", label: "Retro Hit", emoji: "💥", desc: "Staccato noise crash hit" },
    { type: "teleport", label: "Teleport", emoji: "🌀", desc: "Phased electronic frequency fade" },
    { type: "retro_unpause", label: "Unpause Click", emoji: "▶️", desc: "8-bit clean menu unpause ping" },

    // Animals
    { type: "meow", label: "Cute Meow", emoji: "🐱", desc: "Sliding triangle meow sound" },
    { type: "bark", label: "Dog Bark", emoji: "🐶", desc: "Staccato pitch-modulated bark" },
    { type: "quack", label: "Duck Quack", emoji: "🦆", desc: "Nasal sawtooth quack wave" },
    { type: "moo", label: "Cow Moo", emoji: "🐮", desc: "Low resonant sliding hum" },
    { type: "roar", label: "Lion Roar", emoji: "🦁", desc: "Guttural filtered noise sweep" },
    { type: "chicken", label: "Chicken Cluck", emoji: "🐔", desc: "High pitched staccato chirping" },
    { type: "sheep", label: "Sheep Bleat", emoji: "🐑", desc: "Vibrato sawtooth bleating" },
    { type: "snake_hiss", label: "Snake Hiss", emoji: "🐍", desc: "High-pass filtered noise hiss" },
    { type: "owl", label: "Owl Hoot", emoji: "🦉", desc: "Dual hoot low sine waves" },
    { type: "frog", label: "Frog Croak", emoji: "🐸", desc: "Low pulse frequency croaks" },
    { type: "horse", label: "Horse Neigh", emoji: "🐴", desc: "High pitch frequency vibrato" },
    { type: "wolf", label: "Wolf Howl", emoji: "🐺", desc: "Ascending sine whistle sweep" },
    { type: "bee", label: "Bee Buzz", emoji: "🐝", desc: "Continuous saw/square buzz" },
    { type: "bird", label: "Bird Chirp", emoji: "🐦", desc: "Sweet staccato bird whistles" },
    { type: "elephant", label: "Elephant", emoji: "🐘", desc: "High trumpet noise screech" },
    { type: "monkey", label: "Monkey", emoji: "🐵", desc: "Rapid high pitch screech chatter" },

    // Alarms & Alerts
    { type: "siren_police", label: "Police Siren", emoji: "🚔", desc: "Wailing emergency siren sweep" },
    { type: "alarm_clock", label: "Alarm Clock", emoji: "🚨", desc: "Ringing electronic alert bell" },
    { type: "nuclear", label: "Nuclear Alert", emoji: "⚠️", desc: "Deep sweeping warning horn" },
    { type: "smoke_detector", label: "Smoke Alert", emoji: "🧯", desc: "High pitch staccato beep sequence" },
    { type: "text_message", label: "Text Ping", emoji: "💬", desc: "Friendly double digital notification" },
    { type: "doorbell", label: "Doorbell Ding", emoji: "🔔", desc: "Classic Ding-Dong dual tone" },
    { type: "car_lock", label: "Car Lock Beep", emoji: "🔑", desc: "Short high pitch double beep" },
    { type: "low_battery", label: "Low Battery", emoji: "🔋", desc: "Descending dual beep alert" },
    { type: "door_knock", label: "Door Knock", emoji: "🚪", desc: "Three staccato wood knocks" },
    { type: "radar_sweep", label: "Radar Sweep", emoji: "📡", desc: "Sweeping pulse echo ping" },
    { type: "sonar_ping", label: "Sonar Ping", emoji: "🛳️", desc: "Submarine sonar echo beep" },

    // Instruments & Synths
    { type: "bass_drop", label: "Bass Drop", emoji: "🔉", desc: "Sub-bass exponential frequency slide" },
    { type: "synth_lead", label: "Synth Solo", emoji: "🎹", desc: "Classic analog synth lead phrase" },
    { type: "bell_crystal", label: "Crystal Bell", emoji: "🔮", desc: "Pure high resonant bell tone" },
    { type: "chord_major", label: "Happy Chord", emoji: "🎼", desc: "Warm major triad chord chime" },
    { type: "chord_minor", label: "Spooky Chord", emoji: "🪐", desc: "Dark minor triad chord sustain" },
    { type: "arpeggio", label: "Arpeggio Rise", emoji: "📈", desc: "Ascending digital arpeggiator" },
    { type: "bell_chime", label: "Bell Chime", emoji: "🔔", desc: "High pitched resonant bell sweep" },
    { type: "gong_strike", label: "Gong Strike", emoji: "⛩️", desc: "Heavy resonant metal gong strike" },
    { type: "drum_kick", label: "Drum Kick", emoji: "🥁", desc: "Punchy low-end kick transient" },
    { type: "drum_snare", label: "Drum Snare", emoji: "🥁", desc: "Crisp snappy snare drum strike" },

    // Everyday & Random
    { type: "click", label: "Digital Click", emoji: "🖱️", desc: "Clean staccato button click" },
    { type: "glass_shatter", label: "Glass Shatter", emoji: "🥛", desc: "Resonant glass breaking noise" },
    { type: "keyboard_type", label: "Keyboard Type", emoji: "⌨️", desc: "Mechanical keyboard clicky keystrokes" },
    { type: "camera_click", label: "Camera Shutter", emoji: "📸", desc: "Shutter click and film advance" },
    { type: "cash_reg", label: "Cash Register", emoji: "💰", desc: "Chime bell and paper slide" },
    { type: "punch_hit", label: "Punch Hit", emoji: "🥊", desc: "Low impact physical strike" },
    { type: "whip_crack", label: "Whip Crack", emoji: "🤠", desc: "Friction white noise crack whip" },
    { type: "snare_roll", label: "Drumroll Roll", emoji: "🥁", desc: "Snare drumroll sequence" },
    { type: "clock_tick", label: "Clock Tick", emoji: "⏰", desc: "Staccato mechanical second hand" },
    { type: "gunshot_blast", label: "Gunshot Blast", emoji: "💥", desc: "High volume filtered white noise explosion" },
    { type: "car_crash", label: "Car Crash", emoji: "🚗", desc: "Heavy metallic crunch and scrape" },
    { type: "bubble_pop", label: "Bubble Pop", emoji: "🧼", desc: "Short high pitch bubble burst" },
    { type: "zipper", label: "Zipper Slide", emoji: "🤐", desc: "High frequency modulated friction" },
    { type: "thunder", label: "Thunder Rumble", emoji: "⚡", desc: "Deep low frequency rumbling noise" },
    { type: "rain", label: "Rain Whispers", emoji: "🌧️", desc: "Steady gentle bandpass white noise" },
    { type: "wind", label: "Howling Wind", emoji: "💨", desc: "Pulsing bandpass whistle draft" },
    { type: "footsteps", label: "Footsteps", emoji: "👣", desc: "Alternating muffled low-mid beats" },
    { type: "scratch", label: "DJ Scratch", emoji: "💿", desc: "Pitch sweep record scratching" },
    { type: "laser_sweep", label: "Laser Sweep", emoji: "📡", desc: "Analog frequency modulation sweep" },
  ], []);

  const filteredPads = useMemo(() => {
    let list = pads.filter((p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase())
    );
    if (orderBy === "emoji") {
      list.sort((a, b) => a.emoji.localeCompare(b.emoji));
    } else {
      list.sort((a, b) => a.label.localeCompare(b.label));
    }
    return list;
  }, [search, orderBy, pads]);

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr] bg-[#eef3f7] text-[#2f3e46] p-6 rounded-3xl border-4 border-slate-300 shadow-2xl">
      {/* LEFT SIDEBAR (Volume & Global Controls) */}
      <aside className="flex flex-col items-center justify-between bg-white/70 p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-full">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-900 grid place-items-center mb-4 text-white shadow-lg animate-pulse">
            <Music className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Funny Soundboard</h2>
          <p className="text-xs font-bold text-slate-500 mt-1">Interactive local sound synthesis</p>

          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Master Volume</span>
            <div className="flex items-center gap-3 w-full">
              <Volume2 className="h-5 w-5 text-slate-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-black w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="w-full mt-10 grid gap-3">
          <button
            onClick={() => play(filteredPads[0]?.type || "beep")}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-black shadow-md hover:shadow-lg transform active:scale-95 transition"
          >
            <Play className="h-5 w-5 fill-white" /> Quick Play
          </button>

          <button
            onClick={() => setLoopSound(!loopSound)}
            className={`flex items-center justify-center gap-2 w-full py-3.5 border-2 rounded-xl font-black transition ${
              loopSound
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-slate-300 hover:bg-slate-50 text-slate-600"
            }`}
          >
            <RotateCcw className="h-5 w-5" /> Loop sound: {loopSound ? "ON" : "OFF"}
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL */}
      <section className="flex flex-col bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* Top filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
          <div className="relative flex-1 min-w-[15rem]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sounds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-slate-500">Sort:</span>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white font-black text-sm outline-none cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="emoji">Emoji Category</option>
            </select>

            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 ${viewType === "grid" ? "bg-slate-200" : "bg-white hover:bg-slate-50"}`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-2 ${viewType === "list" ? "bg-slate-200" : "bg-white hover:bg-slate-50"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sounds List */}
        {viewType === "grid" ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredPads.map((pad) => (
              <button
                key={pad.type}
                onClick={() => play(pad.type)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition duration-300 ${
                  activePlay === pad.type
                    ? "bg-indigo-600 text-white border-indigo-600 scale-95 shadow-inner"
                    : "bg-[#f8f9fa] border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                <span className="text-4xl mb-3">{pad.emoji}</span>
                <span className="font-black text-sm text-center line-clamp-1">{pad.label}</span>
                <span className={`text-[10px] mt-1 font-bold ${activePlay === pad.type ? "text-indigo-200" : "text-slate-400"} line-clamp-1`}>
                  {pad.desc}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredPads.map((pad) => (
              <button
                key={pad.type}
                onClick={() => play(pad.type)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition ${
                  activePlay === pad.type
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-[#f8f9fa] border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{pad.emoji}</span>
                  <div>
                    <p className="font-black text-base">{pad.label}</p>
                    <p className={`text-xs ${activePlay === pad.type ? "text-indigo-200" : "text-slate-400"}`}>{pad.desc}</p>
                  </div>
                </div>
                <Play className={`h-5 w-5 ${activePlay === pad.type ? "fill-white text-white" : "text-slate-400"}`} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// PREMIUM ONLINE CHAT SCREENSHOT GENERATOR
export function ChatGenerator() {
  const [platform, setPlatform] = useState("whatsapp"); // "whatsapp", "imessage", "instagram", "telegram", "x", "tinder"
  const [darkMode, setDarkMode] = useState(false);
  const [contactName, setContactName] = useState("Sarah Jenkins");
  const [statusText, setStatusText] = useState("online");
  const [avatar, setAvatar] = useState("");
  const [statusBarTime, setStatusBarTime] = useState("09:41");
  const [connectionType, setConnectionType] = useState("wifi"); // "wifi", "5g", "lte"
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, side: "other", text: "Hey! Are you free to talk?", time: "09:38 AM", status: "read", image: "" },
    { id: 2, side: "me", text: "Yeah! Just finished checking out AltFTools. The chat generator looks insane.", time: "09:40 AM", status: "read", image: "" },
    { id: 3, side: "other", text: "Wow, show me a screenshot of how real it looks!", time: "09:40 AM", status: "read", image: "" },
  ]);

  const [newMessageText, setNewMessageText] = useState("");
  const [newMessageImage, setNewMessageImage] = useState("");

  const themeColors = useMemo(() => {
    const isDark = darkMode;
    const colors = {
      whatsapp: {
        headerBg: isDark ? "#1f2c34" : "#f0f2f5",
        headerText: isDark ? "#e9edef" : "#111b21",
        chatBg: isDark ? "#0b141a" : "#efeae2",
        inputBg: isDark ? "#1f2c34" : "#f0f2f5",
        inputText: isDark ? "#e9edef" : "#111b21",
        border: isDark ? "#2f3c44" : "#e9edef",
      },
      imessage: {
        headerBg: isDark ? "#121212" : "#f6f6f6",
        headerText: isDark ? "#ffffff" : "#000000",
        chatBg: isDark ? "#000000" : "#ffffff",
        inputBg: isDark ? "#000000" : "#ffffff",
        inputText: isDark ? "#ffffff" : "#000000",
        border: isDark ? "#262629" : "#e9e9eb",
      },
      instagram: {
        headerBg: isDark ? "#000000" : "#ffffff",
        headerText: isDark ? "#ffffff" : "#000000",
        chatBg: isDark ? "#000000" : "#ffffff",
        inputBg: isDark ? "#000000" : "#ffffff",
        inputText: isDark ? "#ffffff" : "#000000",
        border: isDark ? "#262626" : "#efefef",
      },
      telegram: {
        headerBg: isDark ? "#182533" : "#527fa6",
        headerText: "#ffffff",
        chatBg: isDark ? "#0f172a" : "#e7ebf0",
        inputBg: isDark ? "#182533" : "#ffffff",
        inputText: isDark ? "#ffffff" : "#000000",
        border: isDark ? "#111b21" : "#d1d5db",
      },
      x: {
        headerBg: isDark ? "#000000" : "#ffffff",
        headerText: isDark ? "#ffffff" : "#0f1419",
        chatBg: isDark ? "#000000" : "#ffffff",
        inputBg: isDark ? "#000000" : "#ffffff",
        inputText: isDark ? "#ffffff" : "#0f1419",
        border: isDark ? "#2f3336" : "#e7e9ea",
      },
      tinder: {
        headerBg: isDark ? "#111418" : "#ffffff",
        headerText: isDark ? "#ffffff" : "#111418",
        chatBg: isDark ? "#111418" : "#ffffff",
        inputBg: isDark ? "#111418" : "#ffffff",
        inputText: isDark ? "#ffffff" : "#111418",
        border: isDark ? "#21262d" : "#f0f2f4",
      },
    };
    return colors[platform] || colors.whatsapp;
  }, [platform, darkMode]);

  const phoneRef = useRef(null);
  const avatarInputRef = useRef(null);
  const msgImageInputRef = useRef(null);

  const platforms = [
    { id: "whatsapp", label: "WhatsApp", icon: "💬" },
    { id: "imessage", label: "iMessage", icon: "🍎" },
    { id: "instagram", label: "Instagram", icon: "📸" },
    { id: "telegram", label: "Telegram", icon: "✈️" },
    { id: "x", label: "X.com", icon: "𝕏" },
    { id: "tinder", label: "Tinder", icon: "🔥" },
  ];

  const emojis = ["👍", "😂", "😉", "😭", "😮", "😘", "😍", "❤️", "🔥", "✨", "💩", "😎", "🤔", "😅", "🙏", "💯", "🎉", "👀", "✅", "❌"];

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMsgImageUpload = (e, msgId = null) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (msgId) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, image: ev.target.result } : m))
          );
        } else {
          setNewMessageImage(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addMessage = (side) => {
    if (!newMessageText.trim() && !newMessageImage) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newMsg = {
      id: Date.now(),
      side,
      text: newMessageText,
      time: now,
      status: "read",
      image: newMessageImage,
    };
    setMessages((current) => [...current, newMsg]);
    setNewMessageText("");
    setNewMessageImage("");
    if (msgImageInputRef.current) msgImageInputRef.current.value = "";
  };

  const deleteMessage = (id) => {
    setMessages((current) => current.filter((m) => m.id !== id));
  };

  const updateMessageField = (id, field, value) => {
    setMessages((current) =>
      current.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const exportHighResPng = () => {
    const node = phoneRef.current;
    if (!node) return;
    
    toPng(node, {
      cacheBust: true,
      pixelRatio: 3, // Premium retina-scale screenshot
      style: {
        transform: "scale(1)",
        borderRadius: "0px",
        boxShadow: "none",
        border: "none",
      },
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `chat-${platform}-${darkMode ? "dark" : "light"}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Failed to render mockup image", err);
      });
  };

  // Keyboard Rows Simulated Layout
  const keyboardRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["123", "space", "return"]
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_26rem] bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl text-white">
      
      {/* LEFT MOCKUP CONTAINER */}
      <section className="flex flex-col items-center bg-slate-950/40 p-6 rounded-2xl border border-white/5 shadow-inner">
        
        {/* PLATFORM NAV SELECTOR */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 border-b border-white/5 pb-5 w-full">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition transform active:scale-95 ${
                platform === p.id
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* CONTROLS BAR FOR PREVIEW */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 w-full max-w-[400px]">
          {/* Light/Dark Toggle */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-xs font-black transition border border-white/5"
          >
            <span>{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>

          {/* Keyboard Toggle */}
          <button
            onClick={() => setShowKeyboard((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition border border-white/5 ${
              showKeyboard ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400" : "bg-slate-800/80 hover:bg-slate-750 text-slate-300"
            }`}
          >
            <span>⌨️ Keyboard: {showKeyboard ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* IPHONE MOCKUP FRAME */}
        <div 
          ref={phoneRef}
          className="w-full max-w-[390px] aspect-[9/19.5] rounded-[3.25rem] border-8 border-slate-900 overflow-hidden shadow-2xl relative flex flex-col justify-between select-none"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            backgroundColor: themeColors.chatBg,
            color: themeColors.headerText
          }}
        >
          {/* TOP SCREEN AREA: Notch/Island & Status Bar */}
          <div className="pt-2 z-20" style={{ backgroundColor: themeColors.headerBg }}>
            {/* Dynamic Island */}
            <div className="w-28 h-6.5 bg-black rounded-full mx-auto mb-1 flex items-center justify-between px-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
              <span className="h-2 w-2 rounded-full bg-slate-900" />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-6 py-1.5 text-[11px] font-bold" style={{ color: themeColors.headerText }}>
              <span>{statusBarTime}</span>
              <div className="flex items-center gap-1.5">
                {connectionType === "wifi" && <Wifi className="h-3 w-3 stroke-[2.5]" />}
                {connectionType === "5g" && <span className="text-[9px] font-extrabold tracking-tighter">5G</span>}
                {connectionType === "lte" && <span className="text-[9px] font-extrabold tracking-tighter">LTE</span>}
                
                {/* Battery icon */}
                <div className="flex items-center gap-0.5">
                  <span className="text-[8px] font-extrabold">{batteryLevel}%</span>
                  <div className="relative w-5 h-2.5 rounded-[3px] border flex items-center p-[1px]" style={{ borderColor: themeColors.headerText }}>
                    <div 
                      className={`h-full rounded-[1px] ${
                        batteryLevel <= 20 
                          ? "bg-red-500" 
                          : batteryLevel <= 50 
                          ? "bg-amber-400" 
                          : themeColors.headerText === "#ffffff" 
                          ? "bg-white" 
                          : "bg-slate-800"
                      }`} 
                      style={{ width: `${batteryLevel}%` }}
                    />
                    <div className="absolute -right-[2.5px] top-[2.5px] w-[1.5px] h-[3px] rounded-r-[1px]" style={{ backgroundColor: themeColors.headerText }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT CONTAINER: PLATFORM DEPENDENT HEADER & BUBBLES */}
          <div className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: themeColors.chatBg }}>
            
            {/* WHATSAPP HEADER */}
            {platform === "whatsapp" && (
              <div 
                className="px-3.5 py-2.5 flex items-center justify-between border-b"
                style={{ backgroundColor: themeColors.headerBg, borderColor: themeColors.border, color: themeColors.headerText }}
              >
                <div className="flex items-center gap-2 text-left">
                  <ChevronLeft className="h-5 w-5 cursor-pointer text-[#00a884] stroke-[2.5]" />
                  {avatar ? (
                    <img src={avatar} alt="" className="h-9.5 w-9.5 rounded-full object-cover border border-black/10" />
                  ) : (
                    <div className="h-9.5 w-9.5 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-sm">
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-[14px] leading-tight truncate">{contactName}</h4>
                    {statusText && <p className="text-[10px] text-emerald-500 font-medium">{statusText}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#00a884]">
                  <Video className="h-4.5 w-4.5" />
                  <Phone className="h-4.5 w-4.5" />
                  <MoreVertical className="h-4.5 w-4.5 text-slate-400" />
                </div>
              </div>
            )}

            {/* IMESSAGE HEADER */}
            {platform === "imessage" && (
              <div 
                className="px-4 py-2 flex flex-col items-center border-b text-center"
                style={{ backgroundColor: themeColors.headerBg, borderColor: themeColors.border, color: themeColors.headerText }}
              >
                <div className="flex w-full justify-between items-center text-[13px] text-[#007aff] font-semibold">
                  <div className="flex items-center gap-1">
                    <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                    <span>Back</span>
                  </div>
                  <div className="flex flex-col items-center">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover shadow-sm mb-1" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-500 text-white flex items-center justify-center font-bold text-base mb-1">
                        {contactName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[12px] font-semibold tracking-tight" style={{ color: themeColors.headerText }}>{contactName}</span>
                  </div>
                  <MoreHorizontal className="h-5 w-5 stroke-[2] text-[#007aff]" />
                </div>
              </div>
            )}

            {/* INSTAGRAM HEADER */}
            {platform === "instagram" && (
              <div 
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ backgroundColor: themeColors.headerBg, borderColor: themeColors.border, color: themeColors.headerText }}
              >
                <div className="flex items-center gap-3 text-left">
                  <ChevronLeft className="h-6 w-6 stroke-[2]" />
                  {avatar ? (
                    <img src={avatar} alt="" className="h-8.5 w-8.5 rounded-full object-cover border border-black/5" />
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[14px] leading-tight">{contactName}</h4>
                    {statusText && <p className="text-[9px] text-slate-400 font-medium">{statusText}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4.5">
                  <Phone className="h-5 w-5 stroke-[2]" />
                  <Video className="h-5 w-5 stroke-[2]" />
                  <MoreHorizontal className="h-5 w-5 stroke-[2]" />
                </div>
              </div>
            )}

            {/* TELEGRAM HEADER */}
            {platform === "telegram" && (
              <div 
                className="px-3 py-2 flex items-center justify-between border-b"
                style={{ backgroundColor: themeColors.headerBg, borderColor: themeColors.border, color: themeColors.headerText }}
              >
                <div className="flex items-center gap-2 text-left">
                  <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                  {avatar ? (
                    <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-400 text-white flex items-center justify-center font-bold text-sm">
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[14px] leading-none">{contactName}</h4>
                    {statusText && <p className="text-[10px] opacity-80 mt-1">{statusText}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4.5 w-4.5" />
                  <MoreVertical className="h-4.5 w-4.5" />
                </div>
              </div>
            )}

            {/* X.COM HEADER */}
            {platform === "x" && (
              <div 
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{ backgroundColor: themeColors.headerBg, borderColor: themeColors.border, color: themeColors.headerText }}
              >
                <div className="flex items-center gap-3 text-left">
                  <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                  {avatar ? (
                    <img src={avatar} alt="" className="h-8.5 w-8.5 rounded-full object-cover border border-black/5" />
                  ) : (
                    <div className="h-8.5 w-8.5 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-xs">
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[14px] leading-tight flex items-center gap-0.5">{contactName}</h4>
                    <p className="text-[9px] text-slate-500 font-medium">@{contactName.toLowerCase().replace(/\s/g, "")}</p>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5" />
              </div>
            )}

            {/* TINDER HEADER */}
            {platform === "tinder" && (
              <div 
                className="px-4 py-3.5 flex items-center justify-between border-b"
                style={{ backgroundColor: themeColors.headerBg, borderColor: themeColors.border, color: themeColors.headerText }}
              >
                <ChevronLeft className="h-6 w-6 text-slate-400" />
                <div className="flex flex-col items-center">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center font-black text-[10px] text-slate-650">
                      {contactName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[10px] font-black tracking-tight text-rose-500 mt-1 uppercase">Match with {contactName}</span>
                </div>
                <ShieldAlert className="h-5 w-5 text-rose-500" />
              </div>
            )}

            {/* CHAT MESSAGES BODY */}
            <div 
              className="flex-1 p-4 space-y-3.5 overflow-y-auto"
              style={{ backgroundColor: themeColors.chatBg }}
            >
              {/* Optional WhatsApp chat background pattern layer */}
              {platform === "whatsapp" && (
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
              )}

              {messages.map((msg) => {
                const isMe = msg.side === "me";

                // WhatsApp bubble styling
                if (platform === "whatsapp") {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}>
                      <div className={`max-w-[80%] rounded-[10px] px-3 py-2 shadow-sm text-[13px] relative ${
                        isMe
                          ? darkMode 
                            ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" 
                            : "bg-[#dcf8c6] text-[#111b21] rounded-tr-none"
                          : darkMode
                          ? "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                          : "bg-white text-[#111b21] rounded-tl-none border border-slate-200/40"
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-lg max-w-full mb-1.5 max-h-[160px] object-cover" />
                        )}
                        <p className="break-words font-medium whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[8.5px] text-slate-400 font-medium">
                          <span>{msg.time}</span>
                          {isMe && (
                            msg.status === "read" ? (
                              <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                            ) : msg.status === "delivered" ? (
                              <CheckCheck className="h-3 w-3 text-slate-400" />
                            ) : (
                              <Check className="h-3 w-3 text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // iMessage bubble styling
                if (platform === "imessage") {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}>
                      <div className={`max-w-[75%] rounded-[1.25rem] px-3.5 py-2.5 text-[14px] leading-snug shadow-sm ${
                        isMe
                          ? "bg-[#007aff] text-white rounded-br-none"
                          : darkMode
                          ? "bg-[#262629] text-white rounded-bl-none"
                          : "bg-[#e9e9eb] text-black rounded-bl-none"
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-xl max-w-full mb-1.5 max-h-[160px] object-cover" />
                        )}
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                        <span className="block text-[8px] text-right mt-1 opacity-60 font-semibold">{msg.time}</span>
                      </div>
                    </div>
                  );
                }

                // Instagram bubble styling
                if (platform === "instagram") {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}>
                      <div className={`max-w-[75%] rounded-[1.5rem] px-4 py-2.5 text-[13.5px] shadow-sm ${
                        isMe
                          ? "bg-gradient-to-r from-[#8a3ab9] to-[#e95950] text-white rounded-br-sm"
                          : darkMode
                          ? "bg-[#262626] text-white rounded-bl-sm"
                          : "bg-[#efefef] text-black rounded-bl-sm"
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-xl max-w-full mb-1.5 max-h-[160px] object-cover" />
                        )}
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                        <span className="block text-[8px] text-right mt-1 opacity-60 font-semibold">{msg.time}</span>
                      </div>
                    </div>
                  );
                }

                // Telegram bubble styling
                if (platform === "telegram") {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}>
                      <div className={`max-w-[78%] rounded-[12px] px-3.5 py-2 text-[13.5px] shadow-sm ${
                        isMe
                          ? darkMode 
                            ? "bg-[#2b5278] text-[#ffffff] rounded-tr-none" 
                            : "bg-[#eeffde] text-[#000000] rounded-tr-none"
                          : darkMode
                          ? "bg-[#182533] text-[#ffffff] rounded-tl-none"
                          : "bg-white text-[#000000] rounded-tl-none"
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-lg max-w-full mb-1 max-h-[160px] object-cover" />
                        )}
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[8px] opacity-60">
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                }

                // X.com bubble styling
                if (platform === "x") {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}>
                      <div className={`max-w-[70%] rounded-[18px] px-4 py-2.5 text-[13.5px] ${
                        isMe
                          ? "bg-[#1d9bf0] text-white rounded-br-none"
                          : darkMode
                          ? "bg-[#2f3336] text-white rounded-bl-none"
                          : "bg-[#e7e9ea] text-slate-900 rounded-bl-none"
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-xl max-w-full mb-1.5 max-h-[160px] object-cover" />
                        )}
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                        <span className="block text-[8px] text-right mt-1 opacity-50">{msg.time}</span>
                      </div>
                    </div>
                  );
                }

                // Tinder bubble styling
                if (platform === "tinder") {
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10`}>
                      <div className={`max-w-[75%] rounded-[20px] px-4.5 py-2.5 text-[13px] font-semibold ${
                        isMe
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-sm"
                          : darkMode
                          ? "bg-[#21262d] text-white rounded-bl-sm"
                          : "bg-[#f0f2f4] text-slate-800 rounded-bl-sm"
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="rounded-xl max-w-full mb-1.5 max-h-[160px] object-cover" />
                        )}
                        <p className="break-words whitespace-pre-wrap text-left">{msg.text}</p>
                        <span className="block text-[8px] text-right mt-1 opacity-55">{msg.time}</span>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* CHAT INPUT BAR AT THE BOTTOM */}
            <div 
              className="px-4 py-3 border-t z-10 relative"
              style={{ backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.inputText }}
            >
              
              {/* WhatsApp bottom input */}
              {platform === "whatsapp" && (
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#00a884] stroke-[2.5]" />
                  <div 
                    className="flex-1 flex items-center px-3 py-1.5 rounded-full border text-[13px]"
                    style={{ backgroundColor: darkMode ? "#2a3942" : "#ffffff", borderColor: themeColors.border }}
                  >
                    <Smile className="h-5 w-5 text-slate-400 mr-1.5" />
                    <span className="opacity-40">Type a message</span>
                  </div>
                  <Camera className="h-5 w-5 text-slate-400" />
                  <span className="p-2 rounded-full bg-[#00a884] text-white">
                    <Send className="h-3.5 w-3.5 fill-white" />
                  </span>
                </div>
              )}

              {/* iMessage bottom input */}
              {platform === "imessage" && (
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-slate-400" />
                  <div 
                    className="flex-1 flex items-center px-4 py-1.5 rounded-full border text-[13px]"
                    style={{ backgroundColor: darkMode ? "#1c1c1e" : "#ffffff", borderColor: themeColors.border }}
                  >
                    <span className="opacity-40">iMessage</span>
                  </div>
                  <span className="h-6 w-6 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-xs">↑</span>
                </div>
              )}

              {/* Instagram bottom input */}
              {platform === "instagram" && (
                <div className="flex items-center gap-3">
                  <Smile className="h-5.5 w-5.5" />
                  <div 
                    className="flex-1 flex items-center px-4 py-2 rounded-full border text-[13px]"
                    style={{ backgroundColor: darkMode ? "#000000" : "#ffffff", borderColor: themeColors.border }}
                  >
                    <span className="opacity-40">Message...</span>
                  </div>
                  <ImageIcon className="h-5.5 w-5.5" />
                </div>
              )}

              {/* Telegram bottom input */}
              {platform === "telegram" && (
                <div className="flex items-center gap-3.5">
                  <Paperclip className="h-5 w-5" />
                  <div className="flex-1 flex items-center text-[13px] text-left">
                    <Smile className="h-5.5 w-5.5 mr-2 inline-block align-middle" />
                    <span className="opacity-40">Message</span>
                  </div>
                  <Send className="h-5 w-5" />
                </div>
              )}

              {/* X.com bottom input */}
              {platform === "x" && (
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-[#1d9bf0]" />
                  <div 
                    className="flex-1 flex items-center px-4.5 py-1.5 rounded-full border text-[13px]"
                    style={{ backgroundColor: darkMode ? "#16181c" : "#f0f2f5", borderColor: themeColors.border }}
                  >
                    <span className="opacity-40">Start a message</span>
                  </div>
                </div>
              )}

              {/* Tinder bottom input */}
              {platform === "tinder" && (
                <div className="flex items-center gap-3.5">
                  <div 
                    className="flex-1 flex items-center px-4 py-2 rounded-full border text-[13.5px]"
                    style={{ backgroundColor: darkMode ? "#21262d" : "#f0f2f4", borderColor: "transparent" }}
                  >
                    <span className="opacity-40">Type a message...</span>
                  </div>
                  <span className="text-xs font-black uppercase text-rose-500">Send</span>
                </div>
              )}

            </div>

            {/* OPTIONAL NATIVE KEYBOARD OVERLAY */}
            {showKeyboard && (
              <div 
                className="border-t p-2 transition-all duration-300 z-30"
                style={{ 
                  backgroundColor: darkMode ? "#151515" : "#d1d5db", 
                  borderColor: themeColors.border, 
                  color: darkMode ? "#ffffff" : "#000000" 
                }}
              >
                <div className="grid gap-1.5 max-w-[370px] mx-auto text-sm">
                  {keyboardRows.map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center gap-1">
                      {row.map((key) => {
                        const isSpecial = key === "shift" || key === "backspace" || key === "123" || key === "return";
                        const isSpace = key === "space";
                        return (
                          <div
                            key={key}
                            className={`h-9.5 rounded-[5px] grid place-items-center font-bold text-center select-none shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:opacity-60 transition ${
                              isSpace
                                ? "flex-1 bg-white text-black"
                                : isSpecial
                                ? `text-xs px-2.5 ${
                                    darkMode 
                                      ? "bg-zinc-700 text-white" 
                                      : "bg-slate-400 text-black"
                                  }`
                                : darkMode
                                ? "bg-zinc-800 text-white w-8"
                                : "bg-white text-black w-8"
                            }`}
                          >
                            {key === "shift" ? "⇧" : key === "backspace" ? "⌫" : key}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HOME INDICATOR LINE (iOS standard style) */}
            <div className="py-1.5 z-20" style={{ backgroundColor: themeColors.chatBg }}>
              <div 
                className="w-32 h-1 rounded-full mx-auto" 
                style={{ backgroundColor: themeColors.headerText === "#ffffff" ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.35)" }}
              />
            </div>

          </div>

        </div>

      </section>

      {/* RIGHT SIDE INPUT & MESSAGE CONTROLS */}
      <aside className="flex flex-col gap-5 max-w-full overflow-hidden">
        
        {/* PLATFORM CONFIG SECTION */}
        <div className={panelClass}>
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3.5">1. Profile Settings</h3>
          <div className="grid gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={inputClass}
                placeholder="Sarah Jenkins"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subtext Status</label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className={inputClass}
                placeholder="online, typing..., or active 2h ago"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Avatar</label>
              <div className="flex gap-2.5">
                <button
                  onClick={() => avatarInputRef.current.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs transition border border-white/5"
                >
                  <Camera className="h-3.5 w-3.5 text-indigo-400" /> Upload Avatar
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  accept="image/*"
                />
                {avatar && (
                  <button
                    onClick={() => setAvatar("")}
                    className="px-3.5 py-2 bg-red-950/20 hover:bg-red-950/45 border border-red-500/20 text-red-400 rounded-xl font-bold text-xs transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STATUS BAR CONFIG SECTION */}
        <div className={panelClass}>
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3.5">2. Device Status Bar</h3>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bar Clock Time</label>
              <input
                type="text"
                value={statusBarTime}
                onChange={(e) => setStatusBarTime(e.target.value)}
                className={inputClass}
                placeholder="09:41"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Signal Type</label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className={inputClass}
              >
                <option value="wifi">Wi-Fi Network</option>
                <option value="5g">5G Connection</option>
                <option value="lte">LTE Connection</option>
              </select>
            </div>
          </div>
          <div className="mt-3.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              <span>Battery Level</span>
              <span className="text-white font-mono">{batteryLevel}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* ADD MESSAGE PANEL */}
        <div className={panelClass}>
          <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3.5">3. Add Chat Bubble</h3>
          <div>
            <textarea
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Write a message bubble content..."
              className={`${inputClass} h-20 resize-none mb-3`}
            />

            {/* Quick Emoji Helper */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewMessageText((prev) => prev + emoji)}
                  className="h-7 w-7 bg-slate-800 hover:bg-slate-700 text-sm rounded-lg flex items-center justify-center transition"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Message Image Attachment */}
            <div className="mb-4">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message Image Attachment</label>
              <div className="flex gap-2">
                <button
                  onClick={() => msgImageInputRef.current.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs font-bold transition border border-white/5"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                  {newMessageImage ? "Change Image" : "Attach Image"}
                </button>
                <input
                  ref={msgImageInputRef}
                  type="file"
                  onChange={handleMsgImageUpload}
                  className="hidden"
                  accept="image/*"
                />
                {newMessageImage && (
                  <button
                    onClick={() => setNewMessageImage("")}
                    className="px-2 py-1 bg-red-950/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-950/45 transition border border-red-500/20"
                  >
                    Remove
                  </button>
                )}
              </div>
              {newMessageImage && (
                <div className="mt-2 relative inline-block">
                  <img src={newMessageImage} alt="" className="h-14 w-14 object-cover rounded-lg border border-white/10" />
                </div>
              )}
            </div>

            {/* Add Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addMessage("other")}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-xs transition active:scale-95 border border-white/5"
              >
                ← Add Left (Other)
              </button>
              <button
                onClick={() => addMessage("me")}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition active:scale-95 shadow-md shadow-indigo-950/25"
              >
                Add Right (Me) →
              </button>
            </div>
          </div>
        </div>

        {/* MANAGE MESSAGES LIST */}
        <div className={panelClass}>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">4. Manage Chat Dialog</h3>
            <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{messages.length} Bubbles</span>
          </div>
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${m.side === "me" ? "bg-indigo-500" : "bg-emerald-500"}`} />
                    <span className="font-extrabold text-slate-400 uppercase text-[9px]">{m.side === "me" ? "Right (Me)" : "Left (Other)"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMessageField(m.id, "side", m.side === "me" ? "other" : "me")}
                      className="text-[9px] font-black text-indigo-300 hover:underline"
                    >
                      Swap Side
                    </button>
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Text and Time Editors */}
                <div className="grid gap-2">
                  <textarea
                    value={m.text}
                    onChange={(e) => updateMessageField(m.id, "text", e.target.value)}
                    className={`${inputClass} text-xs py-1.5 h-12 resize-none`}
                  />
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Time</span>
                      <input
                        type="text"
                        value={m.time}
                        onChange={(e) => updateMessageField(m.id, "time", e.target.value)}
                        className={`${inputClass} text-xs py-1 px-2.5`}
                      />
                    </div>
                    
                    {/* Read Status for WhatsApp/Telegram */}
                    {(platform === "whatsapp" || platform === "telegram") && m.side === "me" && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Read</span>
                        <select
                          value={m.status || "read"}
                          onChange={(e) => updateMessageField(m.id, "status", e.target.value)}
                          className={`${inputClass} text-[10px] py-1 px-1 flex-1`}
                        >
                          <option value="sent">✓ Sent</option>
                          <option value="delivered">✓✓ Deliv</option>
                          <option value="read">✓✓ Read</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Msg Image Editor */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-2">
                      {m.image ? (
                        <>
                          <img src={m.image} alt="" className="h-7 w-7 object-cover rounded" />
                          <button
                            onClick={() => updateMessageField(m.id, "image", "")}
                            className="text-[9px] text-red-400 hover:underline"
                          >
                            Remove Photo
                          </button>
                        </>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-bold italic">No Photo Attachment</span>
                      )}
                    </div>
                    <label className="text-[9px] text-indigo-400 hover:underline cursor-pointer font-bold">
                      Attach Image
                      <input
                        type="file"
                        onChange={(e) => handleMsgImageUpload(e, m.id)}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DOWNLOAD ACTION */}
        <button 
          onClick={exportHighResPng} 
          className="flex items-center justify-center gap-2 py-4 bg-emerald-650 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition transform active:scale-95 shadow-lg shadow-emerald-950/20"
        >
          <Download className="h-4.5 w-4.5 stroke-[2.5]" /> Export Chat Screenshot (PNG)
        </button>

      </aside>

    </div>
  );
}
