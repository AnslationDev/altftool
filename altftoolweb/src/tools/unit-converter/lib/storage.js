"use client";

const HISTORY_KEY = "uc_history";
const MAX_HISTORY_ITEMS = 10;

export function getHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    // Sort by timestamp, newest first
    return history.sort((a, b) => b.ts - a.ts);
  } catch {
    return [];
  }
}

export function pushHistory(item) {
  try {
    const arr = getHistory();

    // Check if this exact conversion already exists in recent history (last 5 items)
    const isDuplicate = arr
      .slice(0, 5)
      .some(
        (existing) =>
          existing.category === item.category &&
          existing.fromUnit === item.fromUnit &&
          existing.toUnit === item.toUnit &&
          Math.abs(existing.fromValue - item.fromValue) < 0.0001,
      );

    if (!isDuplicate) {
      arr.unshift({ ...item, id: Date.now() + Math.random() });
      const capped = arr.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
      return true;
    }
    return false; // Duplicate not saved
  } catch (error) {
    console.error("Failed to save to history:", error);
    return false;
  }
}

export function removeHistoryItem(id) {
  try {
    const arr = getHistory();
    const filtered = arr.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to remove history item:", error);
    return false;
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear history:", error);
    return false;
  }
}

