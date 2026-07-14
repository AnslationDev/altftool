// Human-readable byte formatting.
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${units[exponent]}`;
}

export function formatCount(count) {
  if (count === null || count === undefined) return "0";
  return new Intl.NumberFormat().format(count);
}

export function extensionLabel(extension) {
  if (!extension || extension === "(none)") return "—";
  return `.${extension}`;
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural || `${singular}s`;
}
