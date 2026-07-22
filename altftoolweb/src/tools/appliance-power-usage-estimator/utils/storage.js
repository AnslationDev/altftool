const STORAGE_KEY = "appliance_estimator_data";

export const saveToStorage = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const loadFromStorage = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const clearStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};
