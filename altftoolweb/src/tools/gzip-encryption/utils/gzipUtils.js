import pako from 'pako';

// String.fromCharCode.apply(null, bytes) spreads the whole byte array as
// individual call arguments, which blows the JS engine's max-arguments limit
// once the compressed payload gets into the ~150-200KB range (RangeError:
// Maximum call stack size exceeded). Converting in fixed-size chunks avoids
// that limit for inputs of any size.
const CHUNK_SIZE = 0x8000;

function uint8ArrayToBinaryString(bytes) {
  let result = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    result += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK_SIZE));
  }
  return result;
}

export function compressToGzip(text) {
  try {
    if (!text) return '';
    const compressed = pako.gzip(text);
    return btoa(uint8ArrayToBinaryString(compressed));
  } catch (error) {
    throw new Error('Compression failed: ' + error.message);
  }
}

export function decompressFromGzip(gzipBase64) {
  try {
    if (!gzipBase64) return '';
    // Strip any whitespaces or newlines
    const cleaned = gzipBase64.trim().replace(/\s/g, '');
    const binaryString = atob(cleaned);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decompressed = pako.ungzip(bytes);
    return new TextDecoder().decode(decompressed);
  } catch (error) {
    throw new Error('Invalid Gzip Base64 data. Please ensure you are pasting a valid Gzip compressed Base64 string.');
  }
}

export function getSampleText() {
  return `This is a sample text for gzip compression and decompression demonstration. You can paste any text here to compress it or decompress gzip data!`;
}

export function getSampleGzip() {
  return `H4sIAAAAAAAAE03NMQ6DQAxE0asMF+A0NJQj1gFLrL2yHYnk9CmQItpfvL8cmtAEkezjFJRchZcH9q8ObN5HSKa6gdbQ5FmadLesYKnbjNXf2GgYzBLQPjd2SAjK/xa04PGg7lVjcfoBznTaIY8AAAA=`;
}

export function analyzeText(text) {
  return {
    characters: text.length,
    lines: text ? text.split(/\n/).length : 0,
    bytes: new Blob([text]).size,
  };
}

export function analyzeCompressed(gzipBase64) {
  return {
    characters: gzipBase64.length,
    lines: 1,
    bytes: Math.ceil((gzipBase64.length * 6) / 8),
  };
}
