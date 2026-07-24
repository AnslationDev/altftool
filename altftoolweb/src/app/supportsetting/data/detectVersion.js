// Best-effort OS version parse from the user agent string — exactly what
// the browser actually reports, never fabricated. Shared by SystemOverview
// and the home dashboard's Current Device card so both show the same,
// single source of truth.
export function detectVersion(platform) {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";

  if (platform === "windows") {
    const m = ua.match(/Windows NT (\d+\.\d+)/);
    if (!m) return "Unknown";
    const map = { "10.0": "Windows 10 / 11", "6.3": "Windows 8.1", "6.2": "Windows 8", "6.1": "Windows 7" };
    return map[m[1]] || `Windows NT ${m[1]}`;
  }
  if (platform === "macos") {
    const m = ua.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/);
    return m ? `macOS ${m[1].replace(/_/g, ".")}` : "Unknown";
  }
  if (platform === "android") {
    const m = ua.match(/Android (\d+(?:\.\d+)?)/);
    return m ? `Android ${m[1]}` : "Unknown";
  }
  if (platform === "ios") {
    const m = ua.match(/OS (\d+[_.]\d+(?:[_.]\d+)?) like Mac OS X/);
    return m ? `iOS ${m[1].replace(/_/g, ".")}` : "Unknown";
  }
  return "Unknown";
}
