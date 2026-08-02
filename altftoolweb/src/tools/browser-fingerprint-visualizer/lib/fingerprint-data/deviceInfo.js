"use client";



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
  // Same "Unknown when the probe never ran" contract as cpuCores/deviceMemory
  // above: 0 is a real, disclosed value (a non-touch device), so only a
  // missing API (not a falsy reading) should fall back to "Unknown".
  const touchPoints = typeof navigator.maxTouchPoints === "number" ? navigator.maxTouchPoints : "Unknown";
  const hasTouch = typeof touchPoints === "number" && touchPoints > 0;

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