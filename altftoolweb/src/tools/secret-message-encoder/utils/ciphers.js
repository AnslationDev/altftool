const textEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;

const MORSE_MAP = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....",
  7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
  "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
  "+": ".-.-.", "-": "-....-", "_": "..--.-", "\"": ".-..-.", "$": "...-..-", "@": ".--.-.",
};

const REVERSE_MORSE_MAP = Object.fromEntries(Object.entries(MORSE_MAP).map(([letter, code]) => [code, letter]));

const bytesToBase64 = (bytes) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64ToBytes = (value) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

export const caesarCipher = (text, shift, decode = false) => {
  if (!text) return "";
  const safeShift = Number.isFinite(Number(shift)) ? Number(shift) : 0;
  const offset = decode ? (26 - (safeShift % 26)) % 26 : safeShift % 26;

  return text
    .split("")
    .map((char) => {
      if (/[a-z]/i.test(char)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + offset) % 26) + base);
      }
      return char;
    })
    .join("");
};

export const rot13Cipher = (text) => caesarCipher(text, 13);

export const atbashCipher = (text) => {
  if (!text) return "";
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) return String.fromCharCode(122 - (char.charCodeAt(0) - 97));
      if (/[A-Z]/.test(char)) return String.fromCharCode(90 - (char.charCodeAt(0) - 65));
      return char;
    })
    .join("");
};

export const base64Transform = (text, decode = false) => {
  if (!text) return "";
  if (decode) return textDecoder.decode(base64ToBytes(text.trim()));
  return bytesToBase64(textEncoder.encode(text));
};

export const urlTransform = (text, decode = false) => {
  if (!text) return "";
  return decode ? decodeURIComponent(text) : encodeURIComponent(text);
};

export const binaryTransform = (text, decode = false) => {
  if (!text) return "";

  if (decode) {
    const bytes = text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((chunk) => parseInt(chunk, 2));

    if (bytes.some((byte) => Number.isNaN(byte) || byte < 0 || byte > 255)) {
      throw new Error("Binary input must contain 8-bit chunks separated by spaces.");
    }

    return textDecoder.decode(Uint8Array.from(bytes));
  }

  return Array.from(textEncoder.encode(text))
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(" ");
};

export const morseTransform = (text, decode = false) => {
  if (!text) return "";

  if (decode) {
    return text
      .trim()
      .split(" / ")
      .map((word) =>
        word
          .split(/\s+/)
          .map((code) => REVERSE_MORSE_MAP[code] || "")
          .join("")
      )
      .join(" ");
  }

  return text
    .toUpperCase()
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((char) => MORSE_MAP[char] || "")
        .filter(Boolean)
        .join(" ")
    )
    .join(" / ");
};

export const createChecksum = (text) => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8).toUpperCase();
};

export const getTextStats = (text) => {
  const trimmed = text.trim();
  return {
    characters: text.length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
    bytes: textEncoder ? textEncoder.encode(text).length : text.length,
    checksum: createChecksum(text),
  };
};

export const deriveAesKey = async (password, salt) => {
  if (!crypto?.subtle) throw new Error("Web Crypto is not available in this browser.");
  if (!password) throw new Error("Password is required for AES-GCM.");

  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const aesEncrypt = async (text, password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(text)
  );

  return JSON.stringify({
    v: 1,
    alg: "AES-GCM-256",
    kdf: "PBKDF2-SHA256",
    iter: 120000,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  });
};

export const aesDecrypt = async (payload, password) => {
  const parsed = JSON.parse(payload);
  if (parsed.alg !== "AES-GCM-256") throw new Error("Unsupported AES payload.");

  const salt = base64ToBytes(parsed.salt);
  const iv = base64ToBytes(parsed.iv);
  const encrypted = base64ToBytes(parsed.data);
  const key = await deriveAesKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);

  return textDecoder.decode(decrypted);
};

export const transformMessage = async ({ text, algorithm, mode, shift, password }) => {
  const decode = mode === "decode";

  if (algorithm === "caesar") return caesarCipher(text, shift, decode);
  if (algorithm === "rot13") return rot13Cipher(text);
  if (algorithm === "atbash") return atbashCipher(text);
  if (algorithm === "base64") return base64Transform(text, decode);
  if (algorithm === "url") return urlTransform(text, decode);
  if (algorithm === "binary") return binaryTransform(text, decode);
  if (algorithm === "morse") return morseTransform(text, decode);
  if (algorithm === "aes") return decode ? aesDecrypt(text, password) : aesEncrypt(text, password);

  return text;
};
