const UNKNOWN = "Not available";

const canUseBrowser = () => typeof window !== "undefined" && typeof navigator !== "undefined";

const supported = (value) => (value ? "Supported" : "Not supported");

const formatNumber = (value, suffix = "") => {
  const number = Number(value);
  if (!Number.isFinite(number)) return UNKNOWN;
  return `${number}${suffix}`;
};

export const formatBytes = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return UNKNOWN;

  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** power;
  return `${amount.toFixed(amount >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
};

export const detectOS = () => {
  if (!canUseBrowser()) return UNKNOWN;

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iosPlatforms = ["iPhone", "iPad", "iPod"];

  if (macosPlatforms.includes(platform)) return "macOS";
  if (iosPlatforms.includes(platform)) return "iOS";
  if (windowsPlatforms.includes(platform)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Linux/i.test(platform)) return "Linux";

  return "Unknown OS";
};

export const detectBrowserDetails = () => {
  if (!canUseBrowser()) {
    return {
      name: UNKNOWN,
      version: UNKNOWN,
      engine: UNKNOWN,
    };
  }

  const userAgent = window.navigator.userAgent;
  const rules = [
    { name: "Microsoft Edge", pattern: /Edg\/([\d.]+)/ },
    { name: "Opera", pattern: /OPR\/([\d.]+)/ },
    { name: "Samsung Internet", pattern: /SamsungBrowser\/([\d.]+)/ },
    { name: "Mozilla Firefox", pattern: /Firefox\/([\d.]+)/ },
    { name: "Google Chrome", pattern: /Chrome\/([\d.]+)/ },
    { name: "Apple Safari", pattern: /Version\/([\d.]+).*Safari/ },
  ];
  const match = rules.find((rule) => rule.pattern.test(userAgent));
  const version = match ? userAgent.match(match.pattern)?.[1] : "";

  let engine = "Unknown engine";
  if (/AppleWebKit/i.test(userAgent) && /Chrome|Chromium|Edg|OPR/i.test(userAgent)) engine = "Blink";
  else if (/Gecko\/\d/i.test(userAgent) && /Firefox/i.test(userAgent)) engine = "Gecko";
  else if (/AppleWebKit/i.test(userAgent)) engine = "WebKit";
  else if (/Trident|MSIE/i.test(userAgent)) engine = "Trident";

  return {
    name: match?.name || "Unknown Browser",
    version: version || UNKNOWN,
    engine,
  };
};

export const detectBrowser = () => detectBrowserDetails().name;

export const getGPUInfo = () => {
  if (!canUseBrowser() || typeof document === "undefined") {
    return {
      webgl1: false,
      webgl2: false,
      vendor: "Restricted",
      renderer: "Restricted",
    };
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  const gl2 = canvas.getContext("webgl2");

  if (!gl) {
    return {
      webgl1: false,
      webgl2: Boolean(gl2),
      vendor: "Not exposed",
      renderer: "Not exposed",
    };
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (!debugInfo) {
    return {
      webgl1: true,
      webgl2: Boolean(gl2),
      vendor: "Hidden by browser",
      renderer: "Hidden by browser",
    };
  }

  return {
    webgl1: true,
    webgl2: Boolean(gl2),
    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || UNKNOWN,
    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || UNKNOWN,
  };
};

export const getMemoryInfo = () => {
  if (!canUseBrowser()) return UNKNOWN;
  return navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Restricted by browser";
};

export const getCpuInfo = () => {
  if (!canUseBrowser()) return UNKNOWN;
  return navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical cores` : "Restricted by browser";
};

const getDeviceType = () => {
  if (!canUseBrowser()) return UNKNOWN;

  const ua = navigator.userAgent;
  const isTablet = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  if (isTablet) return "Tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "Mobile";
  return "Desktop";
};

const getPointerProfile = () => {
  if (!canUseBrowser()) return UNKNOWN;

  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
  const fine = window.matchMedia?.("(pointer: fine)")?.matches;
  const hover = window.matchMedia?.("(hover: hover)")?.matches;

  if (coarse && hover) return "Hybrid touch + pointer";
  if (coarse) return "Touch-first";
  if (fine) return "Mouse / trackpad";
  return "Unknown pointer";
};

const getBrowserNetworkInfo = () => {
  if (!canUseBrowser()) return {};

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    online: navigator.onLine ? "Online" : "Offline",
    effectiveType: connection?.effectiveType?.toUpperCase?.() || UNKNOWN,
    type: connection?.type || UNKNOWN,
    downlink: Number.isFinite(connection?.downlink) ? `${connection.downlink} Mbps` : UNKNOWN,
    rtt: Number.isFinite(connection?.rtt) ? `${connection.rtt} ms` : UNKNOWN,
    saveData: connection?.saveData ? "Enabled" : "Disabled / unavailable",
  };
};

const readStorageSupport = (storageName) => {
  if (!canUseBrowser()) return false;

  try {
    const store = window[storageName];
    const key = "__altf_device_dashboard_test__";
    store.setItem(key, "1");
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const getStorageInfo = async () => {
  if (!canUseBrowser()) return {};

  const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : {};
  const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;

  return {
    localStorage: supported(readStorageSupport("localStorage")),
    sessionStorage: supported(readStorageSupport("sessionStorage")),
    indexedDB: supported("indexedDB" in window),
    cacheStorage: supported("caches" in window),
    quota: formatBytes(estimate.quota),
    used: formatBytes(estimate.usage),
    persisted: persisted ? "Persisted" : "Best effort",
  };
};

const getPermissionState = async (name) => {
  if (!canUseBrowser() || !navigator.permissions?.query) {
    return {
      name,
      status: "Not queryable",
      tone: "neutral",
    };
  }

  try {
    const result = await navigator.permissions.query({ name });
    const status = result.state || "unknown";
    return {
      name,
      status: status.charAt(0).toUpperCase() + status.slice(1),
      tone: status === "granted" ? "success" : status === "prompt" ? "warning" : "neutral",
    };
  } catch {
    return {
      name,
      status: "Not queryable",
      tone: "neutral",
    };
  }
};

const getPermissionsInfo = async () => {
  const names = ["geolocation", "notifications", "camera", "microphone", "clipboard-read", "clipboard-write"];
  const permissions = await Promise.all(names.map(getPermissionState));
  return permissions.map((permission) => ({
    ...permission,
    label: permission.name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));
};

const getBatteryInfo = async () => {
  if (!canUseBrowser() || !navigator.getBattery) {
    return {
      supported: false,
      level: UNKNOWN,
      charging: UNKNOWN,
      status: "Battery API not supported",
    };
  }

  try {
    const battery = await navigator.getBattery();
    return {
      supported: true,
      level: `${Math.round(battery.level * 100)}%`,
      charging: battery.charging ? "Charging" : "On battery",
      chargingTime: Number.isFinite(battery.chargingTime) ? `${battery.chargingTime}s` : UNKNOWN,
      dischargingTime: Number.isFinite(battery.dischargingTime) ? `${battery.dischargingTime}s` : UNKNOWN,
      status: battery.charging ? "Charging" : "Running on battery",
    };
  } catch {
    return {
      supported: false,
      level: UNKNOWN,
      charging: UNKNOWN,
      status: "Battery access blocked",
    };
  }
};

const getMediaInfo = async () => {
  if (!canUseBrowser() || !navigator.mediaDevices?.enumerateDevices) {
    return {
      cameras: "Not queryable",
      microphones: "Not queryable",
      speakers: "Not queryable",
      labelsVisible: "No",
    };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const microphones = devices.filter((device) => device.kind === "audioinput");
    const speakers = devices.filter((device) => device.kind === "audiooutput");

    return {
      cameras: formatNumber(cameras.length),
      microphones: formatNumber(microphones.length),
      speakers: formatNumber(speakers.length),
      labelsVisible: devices.some((device) => device.label) ? "Yes" : "Hidden until permission",
    };
  } catch {
    return {
      cameras: "Blocked",
      microphones: "Blocked",
      speakers: "Blocked",
      labelsVisible: "Blocked",
    };
  }
};

const getPerformanceInfo = () => {
  if (!canUseBrowser() || typeof performance === "undefined") return {};

  const navigation = performance.getEntriesByType?.("navigation")?.[0];
  const memory = performance.memory;

  return {
    pageLoad: Number.isFinite(navigation?.loadEventEnd)
      ? `${Math.max(0, Math.round(navigation.loadEventEnd - navigation.startTime))} ms`
      : UNKNOWN,
    domReady: Number.isFinite(navigation?.domContentLoadedEventEnd)
      ? `${Math.max(0, Math.round(navigation.domContentLoadedEventEnd - navigation.startTime))} ms`
      : UNKNOWN,
    transferSize: formatBytes(navigation?.transferSize),
    jsHeapLimit: formatBytes(memory?.jsHeapSizeLimit),
    usedJsHeap: formatBytes(memory?.usedJSHeapSize),
  };
};

const getUserAgentData = async () => {
  if (!canUseBrowser() || !navigator.userAgentData) return {};

  const basic = {
    mobile: navigator.userAgentData.mobile ? "Mobile UA" : "Desktop UA",
    platform: navigator.userAgentData.platform || UNKNOWN,
    brands: navigator.userAgentData.brands?.map((brand) => `${brand.brand} ${brand.version}`).join(", ") || UNKNOWN,
  };

  if (!navigator.userAgentData.getHighEntropyValues) return basic;

  try {
    const highEntropy = await navigator.userAgentData.getHighEntropyValues([
      "architecture",
      "bitness",
      "model",
      "platformVersion",
      "uaFullVersion",
      "fullVersionList",
    ]);

    return {
      ...basic,
      architecture: highEntropy.architecture || UNKNOWN,
      bitness: highEntropy.bitness || UNKNOWN,
      model: highEntropy.model || "Restricted / desktop",
      platformVersion: highEntropy.platformVersion || UNKNOWN,
      fullVersion: highEntropy.uaFullVersion || UNKNOWN,
      fullVersionList: highEntropy.fullVersionList?.map((brand) => `${brand.brand} ${brand.version}`).join(", ") || UNKNOWN,
    };
  } catch {
    return basic;
  }
};

const getCapabilities = (gpu) => {
  if (!canUseBrowser()) return [];

  return [
    { key: "webgl", label: "WebGL", group: "Graphics", supported: gpu.webgl1, detail: "2D/3D canvas acceleration" },
    { key: "webgl2", label: "WebGL 2", group: "Graphics", supported: gpu.webgl2, detail: "Modern GPU rendering pipeline" },
    { key: "webgpu", label: "WebGPU", group: "Graphics", supported: "gpu" in navigator, detail: "Next-gen GPU compute/render API" },
    { key: "wasm", label: "WebAssembly", group: "Runtime", supported: typeof WebAssembly === "object", detail: "Near-native browser execution" },
    { key: "worker", label: "Web Workers", group: "Runtime", supported: "Worker" in window, detail: "Background thread execution" },
    { key: "sharedWorker", label: "Shared Worker", group: "Runtime", supported: "SharedWorker" in window, detail: "Cross-tab worker sharing" },
    { key: "serviceWorker", label: "Service Worker", group: "Offline", supported: "serviceWorker" in navigator, detail: "Offline and background network layer" },
    { key: "clipboard", label: "Clipboard API", group: "Device APIs", supported: Boolean(navigator.clipboard), detail: "Copy and paste access" },
    { key: "notifications", label: "Notifications", group: "Device APIs", supported: "Notification" in window, detail: "Browser notification support" },
    { key: "geolocation", label: "Geolocation", group: "Device APIs", supported: "geolocation" in navigator, detail: "Location prompt support" },
    { key: "mediaDevices", label: "Camera / Mic", group: "Media", supported: Boolean(navigator.mediaDevices?.getUserMedia), detail: "Media capture support" },
    { key: "screenCapture", label: "Screen Capture", group: "Media", supported: Boolean(navigator.mediaDevices?.getDisplayMedia), detail: "Screen sharing capture" },
    { key: "webRTC", label: "WebRTC", group: "Media", supported: "RTCPeerConnection" in window, detail: "Peer-to-peer media/data" },
    { key: "webShare", label: "Web Share", group: "Device APIs", supported: "share" in navigator, detail: "Native share sheet" },
    { key: "payment", label: "Payment Request", group: "Commerce", supported: "PaymentRequest" in window, detail: "Native payment flow" },
    { key: "wakeLock", label: "Wake Lock", group: "Device APIs", supported: "wakeLock" in navigator, detail: "Keep screen awake support" },
    { key: "bluetooth", label: "Web Bluetooth", group: "Hardware", supported: "bluetooth" in navigator, detail: "Bluetooth device access" },
    { key: "usb", label: "Web USB", group: "Hardware", supported: "usb" in navigator, detail: "USB device access" },
    { key: "serial", label: "Web Serial", group: "Hardware", supported: "serial" in navigator, detail: "Serial device access" },
    { key: "fileSystem", label: "File System Access", group: "Files", supported: "showOpenFilePicker" in window, detail: "Local file picker/write access" },
  ];
};

const getSecurityInfo = () => {
  if (!canUseBrowser()) return {};

  return {
    secureContext: window.isSecureContext ? "Secure context" : "Not secure",
    protocol: window.location.protocol.replace(":", "").toUpperCase(),
    crossOriginIsolated: window.crossOriginIsolated ? "Enabled" : "Disabled",
    cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
    doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || "Not set",
    globalPrivacyControl: navigator.globalPrivacyControl ? "Enabled" : "Not exposed",
    referrerPolicy: document.referrerPolicy || "Browser default",
  };
};

const getFingerprintSignals = (base) => {
  const signalRules = [
    { label: "User agent string", active: Boolean(base.browser.userAgent), weight: 12, detail: "Browser and OS can be inferred from UA." },
    { label: "GPU renderer", active: base.gpu.renderer && !/hidden|restricted|not exposed/i.test(base.gpu.renderer), weight: 16, detail: "Renderer details can be a strong fingerprint signal." },
    { label: "CPU core count", active: !/restricted|unknown/i.test(base.device.cpuCores), weight: 10, detail: "Hardware concurrency is visible." },
    { label: "Device memory", active: !/restricted|unknown/i.test(base.device.ram), weight: 10, detail: "Approximate memory bucket is visible." },
    { label: "Screen and DPR", active: Boolean(base.screen.resolution), weight: 12, detail: "Screen size and pixel ratio are readable." },
    { label: "Timezone and locale", active: Boolean(base.region.timezone), weight: 10, detail: "Locale profile is readable." },
    { label: "Battery API", active: base.battery.supported, weight: 8, detail: "Battery status can change over time." },
    { label: "Network hints", active: base.network.effectiveType !== UNKNOWN || base.network.downlink !== UNKNOWN, weight: 8, detail: "Connection quality hints are available." },
    { label: "Media device counts", active: !/not queryable|blocked/i.test(String(base.media.cameras)), weight: 8, detail: "Device counts may be visible before labels." },
  ];

  const activeSignals = signalRules.filter((signal) => signal.active);
  const score = Math.min(100, activeSignals.reduce((total, signal) => total + signal.weight, 0));
  const label = score >= 65 ? "High surface" : score >= 35 ? "Medium surface" : "Low surface";

  return {
    score,
    label,
    signals: activeSignals.map(({ label: signalLabel, detail, weight }) => ({
      label: signalLabel,
      detail,
      weight,
    })),
  };
};

const buildScores = (capabilities, security, fingerprint) => {
  const supportedCount = capabilities.filter((capability) => capability.supported).length;
  const compatibility = capabilities.length ? Math.round((supportedCount / capabilities.length) * 100) : 0;
  const secure = security.secureContext === "Secure context" ? 35 : 0;
  const isolated = security.crossOriginIsolated === "Enabled" ? 15 : 0;
  const cookies = security.cookies === "Enabled" ? 10 : 0;
  const doNotTrack = String(security.doNotTrack).toLowerCase() === "1" ? 10 : 0;

  return {
    compatibility,
    supportedCapabilities: supportedCount,
    totalCapabilities: capabilities.length,
    security: Math.min(100, secure + isolated + cookies + doNotTrack + 40),
    fingerprint: fingerprint.score,
    fingerprintLabel: fingerprint.label,
  };
};

export const createEmptySnapshot = () => ({
  summary: {
    status: "Waiting to scan",
    scannedAt: "",
    scanId: "",
  },
  device: {},
  browser: {},
  screen: {},
  region: {},
  gpu: {},
  battery: {},
  network: {},
  storage: {},
  media: {},
  performance: {},
  security: {},
  userAgentData: {},
  capabilities: [],
  permissions: [],
  fingerprint: {
    score: 0,
    label: "Not scanned",
    signals: [],
  },
  scores: {
    compatibility: 0,
    security: 0,
    fingerprint: 0,
    supportedCapabilities: 0,
    totalCapabilities: 0,
  },
});

export const collectSystemData = async () => {
  if (!canUseBrowser()) return createEmptySnapshot();

  const browserDetails = detectBrowserDetails();
  const gpu = getGPUInfo();
  const capabilities = getCapabilities(gpu);
  const [
    battery,
    storage,
    permissions,
    media,
    userAgentData,
  ] = await Promise.all([
    getBatteryInfo(),
    getStorageInfo(),
    getPermissionsInfo(),
    getMediaInfo(),
    getUserAgentData(),
  ]);

  const device = {
    os: detectOS(),
    platform: navigator.platform || UNKNOWN,
    vendor: navigator.vendor || UNKNOWN,
    deviceType: getDeviceType(),
    cpuCores: getCpuInfo(),
    ram: getMemoryInfo(),
    touchSupport: navigator.maxTouchPoints > 0 ? `${navigator.maxTouchPoints} touch point(s)` : "No touch points",
    pointer: getPointerProfile(),
  };

  const browser = {
    name: browserDetails.name,
    version: browserDetails.version,
    engine: browserDetails.engine,
    userAgent: navigator.userAgent || UNKNOWN,
    appVersion: navigator.appVersion || UNKNOWN,
    product: navigator.product || UNKNOWN,
    languages: navigator.languages?.join(", ") || navigator.language || UNKNOWN,
    cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
    online: navigator.onLine ? "Online" : "Offline",
    darkMode: window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "Preferred" : "Not preferred",
  };

  const screenInfo = {
    resolution: `${window.screen.width} x ${window.screen.height}`,
    availableResolution: `${window.screen.availWidth} x ${window.screen.availHeight}`,
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    pixelRatio: `${window.devicePixelRatio || 1}x`,
    orientation: window.screen.orientation?.type || UNKNOWN,
    colorDepth: `${window.screen.colorDepth} bits`,
    aspectRatio: `${window.innerWidth}:${window.innerHeight}`,
    fullscreen: supported(Boolean(document.fullscreenEnabled)),
  };

  const region = {
    language: navigator.language || UNKNOWN,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || UNKNOWN,
    locale: Intl.DateTimeFormat().resolvedOptions().locale || UNKNOWN,
    calendar: Intl.DateTimeFormat().resolvedOptions().calendar || UNKNOWN,
    numberingSystem: Intl.DateTimeFormat().resolvedOptions().numberingSystem || UNKNOWN,
  };

  const security = getSecurityInfo();
  const base = {
    device,
    browser,
    screen: screenInfo,
    region,
    gpu,
    battery,
    network: getBrowserNetworkInfo(),
    storage,
    media,
    security,
  };
  const fingerprint = getFingerprintSignals(base);

  return {
    summary: {
      status: "Scan complete",
      scannedAt: new Date().toISOString(),
      scanId: `scan-${Date.now().toString(36)}`,
    },
    ...base,
    performance: getPerformanceInfo(),
    userAgentData,
    capabilities,
    permissions,
    fingerprint,
    scores: buildScores(capabilities, security, fingerprint),
  };
};
