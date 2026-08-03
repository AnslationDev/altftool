// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "strikethrough-text-generator",
  "title": "Strikethrough Text Generator",
  "description": "Add copy-paste Unicode strikethrough marks to text for posts, bios and messages.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "type",
  "iconColor": "text-pink-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "Hello World"
    }
  ],
  "presets": [
    {
      "label": "Sample",
      "values": {
        "text": "Hello World"
      }
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
          const style = "strike";
          const t = String(values.text || "");
          const off = (ch, base, Base, dbase) => { const c = ch.charCodeAt(0); if (ch >= "a" && ch <= "z") return String.fromCodePoint(base + (c - 97)); if (ch >= "A" && ch <= "Z") return String.fromCodePoint(Base + (c - 65)); if (dbase && ch >= "0" && ch <= "9") return String.fromCodePoint(dbase + (c - 48)); return ch; };
          const flip = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z" };
          const scriptEx = { B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ", e: "ℯ", g: "ℊ", o: "ℴ" };
          let out = "";
          for (const ch of t) {
            if (style === "flip") out += flip[ch.toLowerCase()] || ch;
            else if (style === "mono") out += off(ch, 0x1d68a, 0x1d670, 0x1d7f6);
            else if (style === "wide") { const c = ch.charCodeAt(0); out += ch > " " && ch <= "~" ? String.fromCodePoint(0xff00 + (c - 32)) : ch; }
            else if (style === "bold") out += off(ch, 0x1d41a, 0x1d400, 0x1d7ce);
            else if (style === "italic") out += ch === "h" ? "ℎ" : off(ch, 0x1d44e, 0x1d434, 0);
            else if (style === "script") out += scriptEx[ch] || off(ch, 0x1d4b6, 0x1d49c, 0);
            else if (style === "strike") out += ch + "̶";
            else if (style === "under") out += ch + "̲";
            else out += ch;
          }
          if (style === "flip") out = out.split("").reverse().join("");
          return { result: out || "—" };
        },
};

export default spec;
