"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Copy, Check, RotateCcw, Sparkles } from "lucide-react";

const EMOJI_MAP = {
  hello: "👋", hi: "👋", hey: "✋", greetings: "🤝",
  goodbye: "👋", bye: "👋", later: "🖐️",
  yes: "👍", yeah: "👍", yep: "👍", sure: "👌",
  no: "👎", nope: "👎", nah: "👎",
  please: "🙏", thanks: "🙏", thank: "🙏", welcome: "🤗",
  sorry: "😔", pardon: "🙏", excuse: "🙇",
  happy: "😊", smile: "😊", smiling: "😊", laugh: "😂",
  laughing: "😂", lol: "😂", haha: "😂", funny: "🤣",
  sad: "😢", crying: "😭", unhappy: "😞", upset: "😟",
  angry: "😡", mad: "😤", furious: "🤬", annoyed: "😠",
  love: "❤️", loved: "❤️", loving: "💕", lovely: "🥰",
  heart: "💖", hearts: "💗", hug: "🤗", hugs: "🤗",
  kiss: "😘", kisses: "😘", blowing: "😗",
  cool: "😎", awesome: "🔥", amazing: "⭐", great: "👏",
  fantastic: "🎉", wonderful: "🌟", perfect: "💯",
  wow: "😮", omg: "😱", damn: "😲", oh: "😮",
  fire: "🔥", pizza: "🍕", dog: "🐶", cat: "🐱",
  car: "🚗", music: "🎵", sun: "☀️", moon: "🌙",
  star: "⭐", rainbow: "🌈", rocket: "🚀", money: "💰",
  party: "🎉", gift: "🎁", cake: "🎂", coffee: "☕",
  beer: "🍺", wine: "🍷", taco: "🌮", burger: "🍔",
  fries: "🍟", ice: "🍦", donut: "🍩", apple: "🍎",
  banana: "🍌", grape: "🍇", peach: "🍑", flower: "🌸",
  tree: "🌳", bird: "🐦", fish: "🐟", lion: "🦁",
  tiger: "🐯", bear: "🐻", panda: "🐼", fox: "🦊",
  rabbit: "🐰", horse: "🐴", cow: "🐮", pig: "🐷",
  frog: "🐸", unicorn: "🦄", ghost: "👻", alien: "👽",
  robot: "🤖", clown: "🤡", devil: "😈", angel: "😇",
  king: "👑", queen: "👸", baby: "👶", family: "👪",
  friend: "🤝", friends: "👥", wave: "👋", clap: "👏",
  ok: "👌", point: "👉", pray: "🙏", muscle: "💪",
  brain: "🧠", eye: "👁️", ear: "👂", nose: "👃",
  water: "💧", wind: "🌬️", earth: "🌍", snow: "❄️",
  rain: "🌧️", cloud: "☁️", bolt: "⚡", tornado: "🌪️",
  volcano: "🌋", island: "🏝️", globe: "🌍", map: "🗺️",
  flag: "🚩", house: "🏠", home: "🏠", school: "🏫",
  castle: "🏰", phone: "📱", computer: "💻", camera: "📷",
  video: "📹", tv: "📺", radio: "📻", book: "📖",
  books: "📚", pen: "✏️", letter: "✉️", mail: "📧",
  lock: "🔒", key: "🔑", bulb: "💡", battery: "🔋",
  clock: "⏰", bell: "🔔", ring: "💍", watch: "⌚",
  plane: "✈️", train: "🚂", bike: "🚲", bus: "🚌",
  boat: "⛵", truck: "🚚", game: "🎮", dice: "🎲",
  puzzle: "🧩", ball: "⚽", pizza: "🍕", pasta: "🍝",
  bread: "🍞", cheese: "🧀", meat: "🥩", chicken: "🍗",
  salad: "🥗", soup: "🍜", sushi: "🍣", candy: "🍬",
  cookie: "🍪", chocolate: "🍫", milk: "🥛", juice: "🧃",
  tea: "🍵", honey: "🍯", morning: "🌅", night: "🌃",
  dawn: "🌄", dusk: "🌆", spring: "🌸", summer: "☀️",
  autumn: "🍂", winter: "❄️",
  yum: "😋", hungry: "🤤", sleep: "😴", tired: "🥱",
  hot: "🥵", cold: "🥶", scared: "😨", shock: "😱",
  think: "🤔", thinking: "🤔", wink: "😉", sweat: "😅",
  zombie: "🧟", vampire: "🧛", fairy: "🧚", dragon: "🐉",
  owl: "🦉", eagle: "🦅", shark: "🦈", whale: "🐋",
  dolphin: "🐬", octopus: "🐙", snail: "🐌", butterfly: "🦋",
  bee: "🐝", dinosaur: "🦕", christmas: "🎄", halloween: "🎃",
  birthday: "🎂", wedding: "💒",
  i: "👤", you: "👉", we: "👥", they: "👥",
  he: "👨", she: "👩", it: "📌", me: "🙋",
  my: "🤚", your: "👉", our: "👥", their: "👥",
  good: "✅", bad: "❌", big: "🐘", small: "🐭",
  fast: "🏃", slow: "🐢", strong: "💪", weak: "🦋",
  new: "🆕", old: "👴", young: "👶", rich: "💰",
  poor: "😢", smart: "🧠", brave: "🦁", cute: "🥰",
  run: "🏃", walk: "🚶", fly: "✈️", swim: "🏊",
  eat: "🍽️", drink: "🥤", cook: "👨‍🍳", read: "📖",
  write: "✍️", draw: "🎨", sing: "🎤", dance: "💃",
  play: "🎮", work: "💼", study: "📚", teach: "👨‍🏫",
  learn: "🧠", build: "🔨", fix: "🛠️", help: "🆘",
  give: "🎁", take: "✋", make: "🔧", find: "🔍",
  see: "👁️", hear: "👂", speak: "🗣️", talk: "💬",
  listen: "🎧", watch: "👀", look: "👀", go: "🏃",
  come: "🚶", stay: "🏠", eat: "🍽️", sleep: "😴",
  wake: "⏰", rise: "🌅", rest: "🛌", travel: "✈️",
  drive: "🚗", ride: "🚲", climb: "🧗", jump: "🤸",
  today: "📅", tomorrow: "📅", yesterday: "🗓️", now: "⏰",
  soon: "⏳", later: "🕐", always: "♾️", never: "🚫",
  maybe: "🤔", often: "🔄", sometimes: "⏳",
  one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣",
  five: "5️⃣", six: "6️⃣", seven: "7️⃣", eight: "8️⃣",
  nine: "9️⃣", ten: "🔟",
  world: "🌍", earth: "🌍", planet: "🪐", space: "🚀",
  sky: "☁️", ocean: "🌊", mountain: "⛰️", forest: "🌲",
  desert: "🏜️", river: "🏞️", lake: "🏞️", sea: "🌊",
  city: "🏙️", town: "🏘️", village: "🏡", road: "🛣️",
  bridge: "🌉", building: "🏢", park: "🏞️", garden: "🌺",
  sun: "☀️", moon: "🌙", star: "⭐", cloud: "☁️",
  rain: "🌧️", snow: "❄️", wind: "🌬️", fog: "🌫️",
  storm: "⛈️", lightning: "⚡", rainbow: "🌈", tornado: "🌪️",
  hot: "🥵", cold: "🥶", warm: "☀️", cool: "😎",
  happy: "😊", sad: "😢", angry: "😡", love: "❤️",
  great: "👍", good: "✅", bad: "❌", wow: "😮",
  yum: "😋", hungry: "🤤", sleepy: "😴", tired: "🥱",
  sick: "🤒", hurt: "🤕", dead: "💀", alive: "✨",
  born: "👶", die: "💀", life: "🌱", death: "💀",
  food: "🍽️", drink: "🥤", fruit: "🍎", vegetable: "🥦",
  meat: "🥩", fish: "🐟", bread: "🍞", rice: "🍚",
  breakfast: "🥞", lunch: "🥪", dinner: "🍝", dessert: "🍰",
  sweet: "🍬", sour: "🍋", salty: "🧂", bitter: "☕",
  spicy: "🌶️", delicious: "😋", yummy: "😋", tasty: "👅",
  hungry: "🤤", thirsty: "🥤", full: "😋", empty: "📭",
  mom: "👩‍👧", mother: "👩‍👧", dad: "👨‍👦", father: "👨‍👦",
  sister: "👧", brother: "👦", grandma: "👵", grandpa: "👴",
  aunt: "👩", uncle: "👨", cousin: "👦", son: "👦",
  daughter: "👧", wife: "👰", husband: "🤵",
};

export default function ToolHome() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [live, setLive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const textareaRef = useRef(null);

  const translate = useCallback((text) => {
    const words = text.split(/(\s+)/);
    return words.map((word) => {
      const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!cleaned) return word;
      const punct = word.replace(/[a-zA-Z0-9]/g, "");
      const emoji = EMOJI_MAP[cleaned];
      if (emoji) return emoji + punct;
      return word;
    }).join("");
  }, []);

  const doTranslate = useCallback(() => {
    const result = translate(input);
    setOutput(result);
    if (live) {
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
    }
  }, [input, live, translate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setFlash(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Free Emoji Translator",
            "description": "Discover the best free emoji translator online. Convert text to emoji symbols instantly for fun messages, bios, and social media posts.",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="heading mb-2">Emoji Translator</h1>
          <p className="description">Convert normal text into emoji-rich text</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-6 border surface-card">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Input Text</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Live</span>
                <button
                  onClick={() => setLive(!live)}
                  className="w-10 h-5 rounded-full relative transition-colors"
                  style={{ background: live ? "var(--primary)" : "var(--border)" }}
                  aria-label="Toggle live translation"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${live ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);
                if (live) setOutput(translate(val));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  doTranslate();
                }
              }}
              placeholder="Type something here..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,.24)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                {input.length} character{input.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={!input}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-40"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <RotateCcw size={14} /> Clear
                </button>
                <button
                  onClick={doTranslate}
                  disabled={!input}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
                  style={{ background: flash ? "#0D9488" : "var(--primary)" }}
                >
                  <Sparkles size={14} /> {flash ? "Translated!" : "Translate"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 border surface-card">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Translated Output</label>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: copied ? "var(--primary)" : "transparent",
                    color: copied ? "#fff" : "var(--muted-foreground)",
                    border: `1px solid ${copied ? "var(--primary)" : "var(--border)"}`,
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div
              className="w-full min-h-[100px] px-4 py-3 rounded-xl border text-xl leading-relaxed break-all transition-colors"
              style={{
                background: "var(--background)",
                borderColor: flash ? "var(--primary)" : "var(--border)",
                color: "var(--foreground)",
              }}
            >
              {output ? (
                output
              ) : (
                <span style={{ color: "var(--muted-foreground)" }}>Your emoji translation will appear here...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
