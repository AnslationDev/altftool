

export async function getDeviceInfo() {
  // --- CPU Cores ---
  const cpuCores = navigator.hardwareConcurrency || "Unknown";

  // --- Device Memory (RAM) ---

  const deviceMemory = navigator.deviceMemory
    ? `${navigator.deviceMemory} GB`
    : "Unknown";

  // --- Platform (OS) ---
  
  const platform = navigator.platform || "Unknown";

  // --- Touch Points ---
  
  const touchPoints = navigator.maxTouchPoints ?? 0;
  const hasTouch = touchPoints > 0;

  // --- Device Pixel Ratio ---
 
  const pixelRatio = window.devicePixelRatio || 1;

  // --- Battery Status ---
 
  let battery = null;
  try {
    if ("getBattery" in navigator) {
      const bat = await navigator.getBattery();
      battery = {
        level: Math.round(bat.level * 100), 
        charging: bat.charging,
        chargingTime: bat.chargingTime,
        dischargingTime: bat.dischargingTime,
      };
    }
  } catch {
    battery = null;
  }

  // --- Connection Info ---

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const networkInfo = connection
    ? {
        effectiveType: connection.effectiveType, // "4g", "3g", "2g"
        downlink: connection.downlink,           // Mbps
        rtt: connection.rtt,                     
        saveData: connection.saveData,       
      }
    : null;

  // Combine for hashing
  const rawValue = [cpuCores, deviceMemory, platform, touchPoints, pixelRatio].join("|");

  return {
    cpuCores,
    deviceMemory,
    platform,
    touchPoints,
    hasTouch,
    pixelRatio,
    battery,
    networkInfo,
    rawValue,
  };
}