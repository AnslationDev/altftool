"use client";

/**
 * Pantry Expiry Tracker - Utility Helpers
 */

export const STORAGE_KEY = "pantry_expiry_tracker_data";

export const CATEGORIES = [
  { id: "vegetables", label: "Vegetables", icon: "carrot" },
  { id: "fruits", label: "Fruits", icon: "apple" },
  { id: "dairy", label: "Dairy", icon: "milk" },
  { id: "meat", label: "Meat & Poultry", icon: "beef" },
  { id: "frozen", label: "Frozen Food", icon: "ice-cream" },
  { id: "snacks", label: "Snacks", icon: "cookie" },
  { id: "beverages", label: "Beverages", icon: "coffee" },
  { id: "pantry", label: "Pantry Staples", icon: "box" },
  { id: "spices", label: "Spices & Herbs", icon: "leaf" },
  { id: "custom", label: "Other", icon: "package" },
];

export const UNITS = ["kg", "g", "l", "ml", "pcs", "packet", "bottle", "box", "can"];

export const LOCATIONS = [
  { id: "fridge", label: "Fridge" },
  { id: "freezer", label: "Freezer" },
  { id: "shelf", label: "Kitchen Shelf" },
  { id: "pantry", label: "Pantry" },
  { id: "counter", label: "Countertop" },
];

export const INITIAL_DATA = {
  items: [],
  settings: {
    notificationsEnabled: false,
    reminderDays: 3, // Default reminder 3 days before
  }
};

/**
 * Calculate the status of a pantry item based on expiry date and quantity
 */
export const calculateExpiryStatus = (expiryDate, quantity) => {
  if (quantity <= 0) return { label: "Restock Needed", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
  
  if (!expiryDate) return { label: "No Expiry", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Expired", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", days: diffDays };
  } else if (diffDays <= 3) {
    return { label: "Expiring Soon", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", days: diffDays };
  } else if (diffDays <= 7) {
    return { label: "Use Soon", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", days: diffDays };
  } else {
    return { label: "Fresh", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", days: diffDays };
  }
};

/**
 * Get overall pantry analytics
 */
export const getAnalytics = (items) => {
  if (!items || items.length === 0) {
    return {
      total: 0,
      expired: 0,
      expiringSoon: 0,
      fresh: 0,
      restock: 0,
      freshnessScore: 100,
    };
  }

  const stats = items.reduce((acc, item) => {
    const status = calculateExpiryStatus(item.expiryDate, item.quantity);
    acc.total++;
    if (status.label === "Expired") acc.expired++;
    else if (status.label === "Expiring Soon") acc.expiringSoon++;
    else if (status.label === "Restock Needed") acc.restock++;
    else if (status.label === "Fresh" || status.label === "Use Soon" || status.label === "No Expiry") acc.fresh++;
    return acc;
  }, { total: 0, expired: 0, expiringSoon: 0, fresh: 0, restock: 0 });

  const freshnessScore = Math.round(((stats.fresh + stats.expiringSoon * 0.5) / stats.total) * 100);

  return { ...stats, freshnessScore };
};

/**
 * Local Storage Helpers
 */
export const loadPantryData = () => {
  if (typeof window === "undefined") return INITIAL_DATA;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : INITIAL_DATA;
};

export const savePantryData = (data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Notification Helpers
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const triggerNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
