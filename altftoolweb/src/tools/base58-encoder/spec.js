// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "base58-encoder",
  "title": "Base58 Encoder",
  "description": "Encode text to Base58 (Bitcoin alphabet) or decode it back.",
  "badge": "Developer",
  "category": [
    "Developer"
  ],
  "icon": "binary",
  "iconColor": "text-amber-600",
  "fields": [
    {
      "key": "input",
      "label": "Input",
      "type": "textarea",
      "default": "Hello"
    },
    {
      "key": "mode",
      "label": "Mode",
      "type": "select",
      "default": "encode",
      "choices": [
        {
          "value": "encode",
          "label": "Encode to Base58"
        },
        {
          "value": "decode",
          "label": "Decode from Base58"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Encode Hello",
      "values": {
        "input": "Hello",
        "mode": "encode"
      }
    }
  ],
  "note": "Uses the Base58 (Bitcoin) alphabet. Runs in your browser."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
          const A = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
          const input = values.input || "";
          if (!input) return { result: "", caption: "Enter some text" };
          if (values.mode === "decode") {
            let acc = 0n; for (const c of input) { const i = A.indexOf(c); if (i < 0) continue; acc = acc * 58n + BigInt(i); }
            let hex = acc.toString(16); if (hex.length % 2) hex = "0" + hex; let out = "";
            for (let i = 0; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            for (const c of input) { if (c === "1") out = "\0" + out; else break; }
            return { result: out.replace(/^\0+/, ""), caption: "Decoded from Base58" };
          }
          let acc = 0n; for (let i = 0; i < input.length; i++) acc = acc * 256n + BigInt(input.charCodeAt(i));
          let out = ""; while (acc > 0n) { out = A[Number(acc % 58n)] + out; acc /= 58n; }
          for (let i = 0; i < input.length && input[i] === "\0"; i++) out = "1" + out;
          return { result: out || "1", caption: "Encoded to Base58", rows: [["Input bytes", input.length], ["Output chars", out.length]] };
        },
};

export default spec;
