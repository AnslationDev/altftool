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
            let acc = 0n;
            for (const c of input) {
              const i = A.indexOf(c);
              if (i < 0) return { result: "", error: `Invalid Base58 character: ${c}` };
              acc = acc * 58n + BigInt(i);
            }
            const bytes = [];
            while (acc > 0n) { bytes.unshift(Number(acc % 256n)); acc /= 256n; }
            for (const c of input) { if (c === "1") bytes.unshift(0); else break; }
            try {
              const out = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
              return { result: out, caption: "Decoded from Base58", rows: [["Output bytes", bytes.length]] };
            } catch {
              return { result: "", error: "Decoded bytes are not valid UTF-8 text" };
            }
          }
          const bytes = new TextEncoder().encode(input);
          let acc = 0n; for (const byte of bytes) acc = acc * 256n + BigInt(byte);
          let out = ""; while (acc > 0n) { out = A[Number(acc % 58n)] + out; acc /= 58n; }
          for (let i = 0; i < bytes.length && bytes[i] === 0; i++) out = "1" + out;
          return { result: out || "1", caption: "Encoded to Base58", rows: [["Input bytes", bytes.length], ["Output chars", out.length]] };
        },
};

export default spec;
