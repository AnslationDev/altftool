// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "devanagari-transliteration-keyboard",
  "title": "Devanagari Transliteration Keyboard",
  "description": "Roman Hindi aur Devanagari ke beech live transliteration kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "Text & Writing",
    "India"
  ],
  "icon": "languages",
  "iconColor": "text-primary",
  "modes": [
    {
      "id": "roman-to-devanagari",
      "label": "Roman → Devanagari"
    },
    {
      "id": "devanagari-to-roman",
      "label": "Devanagari → Roman"
    }
  ],
  "fields": [
    {
      "key": "text",
      "label": "Source phrase",
      "type": "textarea",
      "default": "namaste bharat"
    },
    {
      "key": "preserve",
      "label": "Preserve punctuation",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Keep spaces, digits, and punctuation"
    }
  ],
  "presets": [
    {
      "label": "Namaste Bharat",
      "values": {
        "text": "namaste bharat",
        "preserve": true
      },
      "mode": "roman-to-devanagari"
    },
    {
      "label": "नमस्ते भारत",
      "values": {
        "text": "नमस्ते भारत",
        "preserve": true
      },
      "mode": "devanagari-to-roman"
    }
  ],
  "note": "Rule-based local transliteration for common Hindi spellings. Names, conjuncts, schwa deletion, and regional spellings may need manual correction."
},
  compute: (values, mode) => {
      const input = String(values.text || "");
      const source = values.preserve ? input : input.replace(/[^\p{L}\p{M}\s]/gu, "");
      const commonToDeva = { namaste: "नमस्ते", bharat: "भारत", hindi: "हिंदी", mera: "मेरा", naam: "नाम", hai: "है", aap: "आप", kaise: "कैसे", hain: "हैं", dhanyavaad: "धन्यवाद", shukriya: "शुक्रिया", swagat: "स्वागत", dilli: "दिल्ली", mumbai: "मुंबई", pani: "पानी", suraksha: "सुरक्षा" };
      const commonToRoman = Object.fromEntries(Object.entries(commonToDeva).map(([roman, deva]) => [deva, roman]));
      let output;
      if (mode === "devanagari-to-roman") {
        output = source.split(/(\s+|[.,!?;:]+)/).map((token) => commonToRoman[token] || token).join("");
        const letters = { "अ":"a", "आ":"aa", "इ":"i", "ई":"ii", "उ":"u", "ऊ":"uu", "ए":"e", "ऐ":"ai", "ओ":"o", "औ":"au", "क":"k", "ख":"kh", "ग":"g", "घ":"gh", "च":"ch", "ज":"j", "ट":"t", "ड":"d", "त":"t", "थ":"th", "द":"d", "ध":"dh", "न":"n", "प":"p", "फ":"ph", "ब":"b", "भ":"bh", "म":"m", "य":"y", "र":"r", "ल":"l", "व":"v", "श":"sh", "ष":"sh", "स":"s", "ह":"h", "ा":"aa", "ि":"i", "ी":"ii", "ु":"u", "ू":"uu", "े":"e", "ै":"ai", "ो":"o", "ौ":"au", "ं":"n", "ः":"h", "्":"" };
        output = [...output].map((char) => letters[char] ?? char).join("");
      } else {
        output = source.split(/(\s+|[.,!?;:]+)/).map((token) => commonToDeva[token.toLowerCase()] || token).join("");
      }
      const changed = [...input].filter((char, index) => char !== output[index]).length;
      return { result: output || "—", caption: mode === "devanagari-to-roman" ? "Devanagari to Roman" : "Roman to Devanagari", rows: [["Input characters", input.length], ["Output characters", output.length], ["Rule substitutions", changed]] };
    },
};

export default spec;
