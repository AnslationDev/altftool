export const LINKS_KEY = "altftool_link_organizer_data";
export const LINK_GROUPS_KEY = "altftool_link_organizer_groups";

export const DEFAULT_GROUPS = [
  "Daily Reads",
  "Dev Resources",
  "Design Inspiration",
  "Work",
];

export function getLinks() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LINKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load links", e);
    return [];
  }
}

export function saveLinks(links) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  } catch (e) {
    console.error("Failed to save links", e);
  }
}

export function getGroups() {
  if (typeof window === "undefined") return DEFAULT_GROUPS;
  try {
    const stored = localStorage.getItem(LINK_GROUPS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_GROUPS;
  } catch (e) {
    console.error("Failed to load groups", e);
    return DEFAULT_GROUPS;
  }
}

export function saveGroups(groups) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LINK_GROUPS_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error("Failed to save groups", e);
  }
}

export function createLink({ url, title, group = "Daily Reads" }) {
  const newLink = {
    id: Date.now().toString(),
    url,
    title: title || url,
    group,
    isFavorite: false,
    dateAdded: new Date().toISOString(),
  };
  const links = getLinks();
  saveLinks([newLink, ...links]);
  return newLink;
}

export function updateLink(id, updates) {
  const links = getLinks();
  const index = links.findIndex((l) => l.id === id);
  if (index !== -1) {
    links[index] = { ...links[index], ...updates };
    saveLinks(links);
    return links[index];
  }
  return null;
}

export function deleteLink(id) {
  const links = getLinks();
  const updated = links.filter((l) => l.id !== id);
  saveLinks(updated);
}

export function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return "";
  }
}
