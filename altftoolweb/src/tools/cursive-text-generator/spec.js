// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "cursive-text-generator",
  "title": "Cursive Text Generator",
  "description": "Turn your text into stylish Unicode letters for bios, posts and usernames.",
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
  ],
  "confirmReset": "Reset and clear the pasted text back to the default sample? This cannot be undone.",
  "exportResultOnly": true
},
  compute: (values) => {
          const t = String(values.text || "");
          const off = (ch, base, Base, dbase) => { const c = ch.charCodeAt(0); if (ch >= "a" && ch <= "z") return String.fromCodePoint(base + (c - 97)); if (ch >= "A" && ch <= "Z") return String.fromCodePoint(Base + (c - 65)); if (dbase && ch >= "0" && ch <= "9") return String.fromCodePoint(dbase + (c - 48)); return ch; };
          const scriptEx = { B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ", e: "ℯ", g: "ℊ", o: "ℴ" };
          let out = "";
          for (const ch of t) {
            out += scriptEx[ch] || off(ch, 0x1d4b6, 0x1d49c, 0);
          }
          return { result: out || "—" };
        },
};

export default spec;
