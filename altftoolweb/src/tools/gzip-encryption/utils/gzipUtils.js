import pako from 'pako';

export function compressToGzip(text) {
  try {
    if (!text) return '';
    const compressed = pako.gzip(text);
    return btoa(String.fromCharCode.apply(null, compressed));
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

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
