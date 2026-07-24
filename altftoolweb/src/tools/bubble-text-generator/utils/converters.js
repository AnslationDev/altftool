// src/tools/bubble-text-generator/utils/converters.js

export const BUBBLE_STYLES = [
  { id: "classicBubble", label: "Classic Bubble", icon: "ⓐ", category: "Standard", description: "Classic outline circled letters" },
  { id: "darkBubble", label: "Dark / Filled Bubble", icon: "🅐", category: "Filled", description: "Solid black filled circle characters" },
  { id: "bubbleUpper", label: "Bubble Uppercase", icon: "Ⓐ", category: "Standard", description: "Capital circled letters" },
  { id: "bubbleLower", label: "Bubble Lowercase", icon: "ⓐ", category: "Standard", description: "Lowercase circled letters" },
  { id: "squaredBubble", label: "Squared Bubble", icon: "🄰", category: "Squared", description: "Square outline boxed text" },
  { id: "negativeSquared", label: "Negative Squared", icon: "🅰", category: "Squared", description: "Solid filled square boxes" },
  { id: "parenthesisBubble", label: "Parenthesis Bubble", icon: "⒜", category: "Brackets", description: "Characters enclosed in parentheses" },
  { id: "circledNumbers", label: "Circled Numbers", icon: "①", category: "Numbers", description: "Numerals in outline circles" },
  { id: "darkCircledNumbers", label: "Dark Circled Numbers", icon: "❶", category: "Numbers", description: "Numerals in solid dark circles" },
  { id: "tinyText", label: "Tiny Text", icon: "ᵀᵉˣᵗ", category: "Micro", description: "Subscript and superscript tiny letters" },
  { id: "subscriptBubble", label: "Subscript Bubble", icon: "ₐ", category: "Micro", description: "Subscript baseline text" },
  { id: "fullWidth", label: "Full Width Vaporwave", icon: "Ｆ", category: "Vaporwave", description: "Spaced fullwidth Unicode" },
  { id: "doubleStruck", label: "Double Struck / Outline", icon: "𝕒", category: "Decorative", description: "Math double-struck font" },
  { id: "boldBubble", label: "Bold Bubble", icon: "𝗮", category: "Bold", description: "Heavy bold sans serif font" },
  { id: "italicBubble", label: "Italic Bubble", icon: "𝘢", category: "Stylized", description: "Slanted italic letters" },
  { id: "cursiveScript", label: "Cursive Script", icon: "𝒶", category: "Script", description: "Elegant handwritten cursive script" },
  { id: "gothicBubble", label: "Gothic Fraktur", icon: "𝖆", category: "Gothic", description: "Old World gothic fraktur lettering" },
  { id: "strikethroughBubble", label: "Strikethrough Bubble", icon: "a̶", category: "Decorative", description: "Strikethrough line effect" },
  { id: "underlineBubble", label: "Underline Bubble", icon: "a̲", category: "Decorative", description: "Underlined text effect" },
  { id: "sparkleBubble", label: "Sparkle Emoji Bubble", icon: "✨", category: "Emoji", description: "Embellished with sparkle stars" },
  { id: "balloonBubble", label: "Balloon Emoji Bubble", icon: "🎈", category: "Emoji", description: "Framed with festive party balloons" },
  { id: "stickerBox", label: "Sticker Tag", icon: "🏷️", category: "Sticker", description: "Label tag styled characters" },
];

export const GOOGLE_BUBBLE_FONTS = [
  { name: "Bubblegum Sans", family: "'Bubblegum Sans', cursive", category: "Playful", desc: "Sweet, bouncy rounded letters" },
  { name: "Fredoka", family: "'Fredoka', sans-serif", category: "Modern Rounded", desc: "Clean, ultra-friendly rounded sans" },
  { name: "Baloo 2", family: "'Baloo 2', display", category: "Soft Rounded", desc: "Warm and cheerful bubble curve font" },
  { name: "Chewy", family: "'Chewy', cursive", category: "Comic", desc: "Big, chunky comic book bubble font" },
  { name: "Pacifico", family: "'Pacifico', cursive", category: "Brush Script", desc: "Flowing 1950s surf script" },
  { name: "Titan One", family: "'Titan One', display", category: "Heavy Display", desc: "Bold, punchy cartoon headline font" },
  { name: "Lilita One", family: "'Lilita One', display", category: "Fat Rounded", desc: "Soft 3D-styled display font" },
  { name: "Comfortaa", family: "'Comfortaa', display", category: "Geometric", desc: "Ultra-clean geometric rounded sans" },
  { name: "Bungee", family: "'Bungee', display", category: "Urban Signage", desc: "Heavy blocky urban marquee font" },
  { name: "Nunito", family: "'Nunito', sans-serif", category: "Clean Sans", desc: "Popular well-balanced rounded sans" },
  { name: "Righteous", family: "'Righteous', display", category: "Futuristic", desc: "Retro-futuristic rounded font" },
];

export const convertText = (text, styleId = "classicBubble") => {
  if (!text) return "";

  const convertChar = (ch) => {
    const code = ch.charCodeAt(0);

    switch (styleId) {
      case "classicBubble":
      case "bubbleLower": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x24d0 + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x24b6 + (code - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2460 + (code - 49));
        if (ch === "0") return "⓪";
        return ch;
      }
      case "bubbleUpper": {
        const upper = ch.toUpperCase();
        const uCode = upper.charCodeAt(0);
        if (upper >= "A" && upper <= "Z") return String.fromCodePoint(0x24b6 + (uCode - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2460 + (code - 49));
        if (ch === "0") return "⓪";
        return ch;
      }
      case "darkBubble": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1F150 + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x1F150 + (code - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x278A + (code - 49));
        if (ch === "0") return "⓿";
        return ch;
      }
      case "squaredBubble": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1F130 + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x1F130 + (code - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2460 + (code - 49));
        if (ch === "0") return "⓪";
        return ch;
      }
      case "negativeSquared": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1F170 + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x1F170 + (code - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x278A + (code - 49));
        if (ch === "0") return "⓿";
        return ch;
      }
      case "parenthesisBubble": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x249c + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x249c + (code - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2474 + (code - 49));
        if (ch === "0") return "(0)";
        return ch;
      }
      case "circledNumbers": {
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2460 + (code - 49));
        if (ch === "0") return "⓪";
        return ch;
      }
      case "darkCircledNumbers": {
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x278A + (code - 49));
        if (ch === "0") return "⓿";
        return ch;
      }
      case "tinyText": {
        const tinyMap = {
          a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ",
          n: "ⁿ", o: "ᵒ", p: "ᵖ", q: "ᑫ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
          A: "ᴀ", B: "ʙ", C: "ᴄ", D: "ᴅ", E: "ᴇ", F: "ғ", G: "ɢ", H: "ʜ", I: "ɪ", J: "ᴊ", K: "ᴋ", L: "ʟ", M: "ᴍ",
          N: "ɴ", O: "ᴏ", P: "ᴘ", Q: "ǫ", R: "ʀ", S: "s", T: "ᴛ", U: "ᴜ", V: "ᴠ", W: "ᴡ", X: "x", Y: "ʏ", Z: "ᴢ",
          0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹"
        };
        return tinyMap[ch] || ch;
      }
      case "subscriptBubble": {
        const subMap = {
          a: "ₐ", e: "ₑ", h: "ₕ", i: "ᵢ", j: "ⱼ", k: "ₖ", l: "ₗ", m: "ₘ", n: "ₙ", o: "ₒ", p: "ₚ", r: "ᵣ", s: "ₛ", t: "ₜ", u: "ᵤ", v: "ᵥ", x: "ₓ",
          0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉"
        };
        return subMap[ch] || ch;
      }
      case "fullWidth": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0xFF41 + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0xFF21 + (code - 65));
        if (ch >= "0" && ch <= "9") return String.fromCodePoint(0xFF10 + (code - 48));
        if (ch === " ") return "  ";
        return ch;
      }
      case "doubleStruck": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1D552 + (code - 97));
        if (ch >= "A" && ch <= "Z") {
          // Special math exceptions for C, H, N, P, Q, R, Z
          const exceptions = { C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ" };
          return exceptions[ch] || String.fromCodePoint(0x1D538 + (code - 65));
        }
        if (ch >= "0" && ch <= "9") return String.fromCodePoint(0x1D7D8 + (code - 48));
        return ch;
      }
      case "boldBubble": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1D586 + (code - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x1D56C + (code - 65));
        if (ch >= "0" && ch <= "9") return String.fromCodePoint(0x1D7CE + (code - 48));
        return ch;
      }
      case "italicBubble": {
        if (ch >= "a" && ch <= "z") {
          if (ch === "h") return "ℎ";
          return String.fromCodePoint(0x1D4EA + (code - 97));
        }
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x1D4D0 + (code - 65));
        return ch;
      }
      case "cursiveScript": {
        if (ch >= "a" && ch <= "z") {
          const scriptEx = { e: "ℯ", g: "ℊ", o: "ℴ" };
          return scriptEx[ch] || String.fromCodePoint(0x1D4B6 + (code - 97));
        }
        if (ch >= "A" && ch <= "Z") {
          const scriptExUpper = { B: "ℬ", E: "ℰ", F: "ℱ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ" };
          return scriptExUpper[ch] || String.fromCodePoint(0x1D49C + (code - 65));
        }
        return ch;
      }
      case "gothicBubble": {
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x1D586 + (code - 97));
        if (ch >= "A" && ch <= "Z") {
          const frakEx = { C: "ℭ", H: "ℌ", I: "ℑ", R: "ℜ", Z: "ℨ" };
          return frakEx[ch] || String.fromCodePoint(0x1D56C + (code - 65));
        }
        return ch;
      }
      case "strikethroughBubble": {
        return ch !== " " ? ch + "\u0336" : ch;
      }
      case "underlineBubble": {
        return ch !== " " ? ch + "\u0332" : ch;
      }
      case "sparkleBubble": {
        return ch !== " " ? `✨${ch}` : ch;
      }
      case "balloonBubble": {
        return ch !== " " ? `🎈${ch}` : ch;
      }
      case "stickerBox": {
        return ch !== " " ? `[${ch}]` : ch;
      }
      default:
        return ch;
    }
  };

  const converted = Array.from(text).map(convertChar).join("");

  if (styleId === "sparkleBubble") return `${converted}✨`;
  if (styleId === "balloonBubble") return `${converted}🎈`;
  if (styleId === "stickerBox") return `🏷️ ${converted}`;

  return converted;
};

// Export PNG Canvas renderer
export const renderToPng = (text, options = {}) => {
  const {
    fontFamily = "sans-serif",
    fontSize = 32,
    color = "#0f172a",
    bgColor = "transparent",
    align = "center"
  } = options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = Math.max(text.length * fontSize * 0.75 + 80, 400);
  canvas.height = Math.max(fontSize * 2.5, 140);

  if (bgColor && bgColor !== "transparent") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  const xPos = align === "left" ? 40 : align === "right" ? canvas.width - 40 : canvas.width / 2;
  ctx.fillText(text, xPos, canvas.height / 2);

  return canvas.toDataURL("image/png");
};

// Export SVG generator
export const renderToSvg = (text, options = {}) => {
  const {
    fontFamily = "sans-serif",
    fontSize = 32,
    color = "#0f172a",
    bgColor = "transparent",
  } = options;

  const width = Math.max(text.length * fontSize * 0.75 + 80, 400);
  const height = Math.max(fontSize * 2.5, 140);

  const bgRect = bgColor && bgColor !== "transparent" ? `<rect width="${width}" height="${height}" fill="${bgColor}" rx="16"/>` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${bgRect}
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="bold">${text}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const QUICK_EXAMPLES = [
  "Hello World",
  "Bubble Text",
  "Copy & Paste",
  "Instagram Bio",
  "Gaming Pro 🎮",
  "Discord Tag",
];

export const PLATFORMS = [
  { name: "Instagram", desc: "Bio, Highlights, Captions", color: "from-pink-500 to-rose-500" },
  { name: "TikTok", desc: "Usernames, Comments, Captions", color: "from-purple-500 to-pink-500" },
  { name: "Discord", desc: "Server Channels, Tags, Nicknames", color: "from-indigo-500 to-purple-600" },
  { name: "WhatsApp", desc: "Status, About, Group Titles", color: "from-emerald-500 to-teal-500" },
  { name: "Facebook", desc: "Posts, Comments, Page Names", color: "from-blue-500 to-cyan-500" },
  { name: "Twitter / X", desc: "Display Names, Tweets", color: "from-sky-500 to-blue-600" },
  { name: "YouTube", desc: "Video Titles, Descriptions", color: "from-red-500 to-rose-600" },
  { name: "Gaming Platforms", desc: "Steam, Roblox, PUBG, Fortnite", color: "from-cyan-500 to-teal-500" },
];

export const FAQS = [
  {
    q: "Is this Bubble Text Generator 100% free?",
    a: "Yes! Our Bubble Text Generator is completely free to use without registration, hidden fees, or limits. You can generate, copy, and download unlimited bubble font styles and transparent PNG images."
  },
  {
    q: "Does bubble text work on iPhone and Android?",
    a: "Yes! Since bubble characters are standard Unicode symbols (Enclosed Alphanumerics), they render natively across iOS, iPadOS, Android, Windows, macOS, and Linux without requiring font installation."
  },
  {
    q: "How do I copy and paste bubble letters to Instagram or Discord?",
    a: "Simply type your desired text in the input box, click the 'Copy' button on your favorite bubble style card, and paste (Ctrl+V or long-press paste) directly into your Instagram bio, Discord username, or WhatsApp chat."
  },
  {
    q: "Can I download transparent PNG or SVG images of bubble text?",
    a: "Absolutely! Click the 'PNG' or 'SVG' export buttons on any generated card to download crisp, high-resolution transparent image files perfect for graphic designs, logos, and thumbnails."
  },
  {
    q: "Why do some bubble letters appear as empty boxes on older devices?",
    a: "Extremely old operating systems or outdated web browsers may lack updated Unicode font support. However, 99.9% of modern smartphones, tablets, and computers fully support all bubble Unicode characters."
  },
  {
    q: "What is the difference between Unicode Bubble Text and Google Fonts?",
    a: "Unicode Bubble Text converts plain ASCII characters into special enclosed Unicode symbols that can be copied as raw text anywhere. Google Bubble Fonts are visual web typography styles used for web designs, graphic branding, and image downloads."
  }
];
