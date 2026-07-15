export function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function addToHistory(item, maxItems = 20) {
  const history = loadFromStorage('altft-passport-history', []);
  const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, maxItems);
  saveToStorage('altft-passport-history', updated);
  return updated;
}

export function toggleFavorite(item, favoritesKey = 'altft-passport-favorites') {
  const favorites = loadFromStorage(favoritesKey, []);
  const exists = favorites.findIndex(f => f.id === item.id);
  let updated;
  if (exists >= 0) {
    updated = favorites.filter(f => f.id !== item.id);
  } else {
    updated = [...favorites, item];
  }
  saveToStorage(favoritesKey, updated);
  return updated;
}

export function clearStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // unavailable
  }
}
