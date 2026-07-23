// RFC 4648 Base32 encoder. Input is treated as UTF-8 (TextEncoder), so
// multi-byte characters and emoji encode correctly.

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function encodeBase32(text, { lowercase = false, padding = true, lineLength = 0 } = {}) {
  const bytes = new TextEncoder().encode(text);
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }

  let paddingCount = 0;
  if (padding) {
    while (output.length % 8 !== 0) {
      output += "=";
      paddingCount += 1;
    }
  }

  if (lowercase) output = output.toLowerCase();

  const encodedLength = output.length;
  if (lineLength > 0) {
    output = output.replace(new RegExp(`(.{1,${lineLength}})`, "g"), "$1\n").trimEnd();
  }

  return {
    output,
    encodedLength,
    paddingCount,
    byteLength: bytes.length,
    // Size change of the encoded text vs the raw input characters.
    ratioPercent: text.length ? ((encodedLength / text.length) - 1) * 100 : 0,
  };
}
