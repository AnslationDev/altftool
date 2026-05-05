import LZString from "lz-string";

// ✅ encode
export const encodeForm = (data) => {
  try {
    if (!data) return null;

    const json = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(json);

    console.log("ENCODED:", compressed);
    console.log("origin:", window.location.origin);
console.log("pathname:", window.location.pathname);
// console.log("encoded:", encoded);

    return compressed;
  } catch (e) {
    console.error("Encode error", e);
    return null;
  }
};

// ✅ decode
export const decodeForm = (encoded) => {
  try {
    if (!encoded) return null;

    const decompressed =
      LZString.decompressFromEncodedURIComponent(encoded);

    if (!decompressed) return null;

    console.log("DECODED:", decompressed);

    return JSON.parse(decompressed);
  } catch (e) {
    console.error("Decode error", e);
    return null;
  }
};