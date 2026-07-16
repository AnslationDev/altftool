/**
 * Medicine Schedule Builder Utilities
 */

export const MEDICINE_TYPES = [
  { id: "tablet", label: "Tablet", icon: "Pill" },
  { id: "capsule", label: "Capsule", icon: "Microscope" },
  { id: "syrup", label: "Syrup", icon: "FlaskConical" },
  { id: "injection", label: "Injection", icon: "Syringe" },
  { id: "drops", label: "Drops", icon: "Droplets" }
];

export const FREQUENCIES = [
  { id: "daily", label: "Once Daily" },
  { id: "twice", label: "Twice Daily" },
  { id: "thrice", label: "Three Times Daily" },
  { id: "hours", label: "Every X Hours" },
  { id: "weekly", label: "Weekly" },
  { id: "alternate", label: "Alternate Days" }
];

export const DEFAULT_TIMINGS = [
  { id: "morning", label: "Morning", time: "08:00" },
  { id: "afternoon", label: "Afternoon", time: "13:00" },
  { id: "evening", label: "Evening", time: "18:00" },
  { id: "night", label: "Night", time: "22:00" }
];

/**
 * Format time to 12-hour format
 */
export const formatTime = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

/**
 * Trigger browser notification
 */
export const triggerNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico", // Or a specific medical icon if available
      ...options
    });
    return true;
  }
  return false;
};

/**
 * Check if it's time for a medicine
 */
export const checkReminders = (medicines, lastChecked) => {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  
  // To prevent multiple triggers in the same minute
  if (lastChecked === currentTime) return null;

  const dueMedicines = medicines.filter(med => {
    return med.timings.some(t => t.time === currentTime);
  });

  return { dueMedicines, currentTime };
};

/**
 * Storage Helpers
 */
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to localStorage", e);
  }
};

export const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error loading from localStorage", e);
    return null;
  }
};
