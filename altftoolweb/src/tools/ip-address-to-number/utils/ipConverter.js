export function ipToNumber(ip) {
  if (!ip) return null;

  const parts = ip.trim().split('.');

  if (parts.length !== 4) return null;

  for (let part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
  }

  const [a, b, c, d] = parts.map(part => parseInt(part, 10));
  return (a << 24) + (b << 16) + (c << 8) + d;
}

export function numberToIp(num) {
  if (num === null || num === undefined || num === '') return null;

  const n = parseInt(num, 10);

  if (isNaN(n) || n < 0 || n > 4294967295) return null;

  const a = (n >>> 24) & 0xFF;
  const b = (n >>> 16) & 0xFF;
  const c = (n >>> 8) & 0xFF;
  const d = n & 0xFF;

  return `${a}.${b}.${c}.${d}`;
}

export function isValidIp(ip) {
  if (!ip) return false;
  const parts = ip.trim().split('.');

  if (parts.length !== 4) return false;

  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
}

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getSampleIp() {
  return '192.168.1.1';
}

export function analyzeBinary(num) {
  const binary = num.toString(2).padStart(32, '0');
  const hex = num.toString(16).toUpperCase().padStart(8, '0');

  return {
    binary,
    hex,
    decimal: num,
    dotted: numberToIp(num)
  };
}
