// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bubble-text-generator",
  "title": "Bubble Text Generator",
  "description": "Turn your text into Ⓑⓤⓑⓑⓛⓔ circled letters for bios and posts.",
  "badge": "Fun",
  "category": [
    "Fun"
  ],
  "icon": "circle",
  "iconColor": "text-pink-600",
  "fields": [
    {
      "key": "text",
      "label": "Text",
      "type": "textarea",
      "default": "bubble text"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const map = (ch) => {
        const c = ch.charCodeAt(0);
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x24d0 + (c - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x24b6 + (c - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2460 + (c - 49));
        if (ch === "0") return "⓪";
        return ch;
      };
      const out = String(values.text).split("").map(map).join("");
      return { result: out || "—" };
    },
};

export default spec;
