// Local browser-based cryptographic hashing utility (SHA-1, SHA-256, SHA-512, MD5, CRC32)

function crc32(buffer) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff];
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

// Simple fast JS MD5 implementation for local verification
function md5(buffer) {
  const bytes = new Uint8Array(buffer);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;

  const len = bytes.length;
  const bitLen = len * 8;
  const padLen = (len % 64 < 56 ? 56 : 120) - (len % 64);
  const padded = new Uint8Array(len + padLen + 8);
  padded.set(bytes);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen & 0xffffffff, true);
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);

  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  const r = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const leftRotate = (x, c) => (x << c) | (x >>> (32 - c));

  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, true);
    }
    let a = h0, b = h1, c = h2, d = h3;

    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }
      const temp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + k[j] + w[g]) >>> 0, r[j])) >>> 0;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
  }

  const toHex = (n) => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return s;
  };

  return (toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3)).toUpperCase();
}

export async function calculateDocumentHashes(bufferOrText) {
  let buffer;
  if (typeof bufferOrText === "string") {
    buffer = new TextEncoder().encode(bufferOrText).buffer;
  } else if (bufferOrText instanceof ArrayBuffer) {
    buffer = bufferOrText;
  } else if (bufferOrText?.buffer instanceof ArrayBuffer) {
    buffer = bufferOrText.buffer;
  } else {
    buffer = new Uint8Array(0).buffer;
  }

  const crc32Hash = crc32(buffer);
  const md5Hash = md5(buffer);

  let sha1Hash = "N/A";
  let sha256Hash = "N/A";
  let sha512Hash = "N/A";

  try {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const s1 = await window.crypto.subtle.digest("SHA-1", buffer);
      sha1Hash = Array.from(new Uint8Array(s1))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      const s256 = await window.crypto.subtle.digest("SHA-256", buffer);
      sha256Hash = Array.from(new Uint8Array(s256))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();

      const s512 = await window.crypto.subtle.digest("SHA-512", buffer);
      sha512Hash = Array.from(new Uint8Array(s512))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
    }
  } catch (err) {
    console.warn("Subtle Crypto hash calculation fallback used:", err);
  }

  return {
    crc32: crc32Hash,
    md5: md5Hash,
    sha1: sha1Hash,
    sha256: sha256Hash,
    sha512: sha512Hash,
  };
}
