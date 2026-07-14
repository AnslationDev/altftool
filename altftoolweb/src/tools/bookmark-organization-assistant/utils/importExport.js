import { saveAs } from "file-saver";

// Import / export helpers. Validation lives here so the hook stays lean.

export function exportToJson(data, filename = "bookmarks.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  saveAs(blob, filename);
}

function isBookmarkRecord(record) {
  return (
    record &&
    typeof record === "object" &&
    typeof record.id === "string" &&
    typeof record.url === "string"
  );
}

function isFolderRecord(record) {
  return (
    record &&
    typeof record === "object" &&
    typeof record.id === "string" &&
    typeof record.name === "string"
  );
}

// Parse an uploaded JSON file. Returns { bookmarks, folders } or throws.
export async function parseJsonImport(file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }

  const rawBookmarks = Array.isArray(parsed)
    ? parsed
    : parsed && Array.isArray(parsed.bookmarks)
      ? parsed.bookmarks
      : null;

  if (!rawBookmarks) {
    throw new Error("No bookmarks array found in file.");
  }

  const bookmarks = rawBookmarks
    .filter(isBookmarkRecord)
    .map((record) => ({
      id: record.id,
      title: typeof record.title === "string" ? record.title : record.url,
      url: record.url,
      description:
        typeof record.description === "string" ? record.description : "",
      folderId: typeof record.folderId === "string" ? record.folderId : "default",
      tags: Array.isArray(record.tags)
        ? record.tags.filter((tag) => typeof tag === "string")
        : [],
      favorite: Boolean(record.favorite),
      useCount: typeof record.useCount === "number" ? record.useCount : 0,
      createdAt:
        typeof record.createdAt === "number" ? record.createdAt : Date.now(),
      updatedAt:
        typeof record.updatedAt === "number" ? record.updatedAt : Date.now(),
    }));

  const rawFolders = parsed && Array.isArray(parsed.folders) ? parsed.folders : [];
  const folders = rawFolders
    .filter(isFolderRecord)
    .map((record) => ({ id: record.id, name: record.name }));

  return { bookmarks, folders };
}

// Bonus: parse a Netscape bookmarks HTML export into bookmark records.
export function parseNetscapeHtml(text, nanoid) {
  const anchors = text.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  const results = [];
  for (const anchor of anchors) {
    const hrefMatch = anchor.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const url = hrefMatch[1];
    if (!/^https?:\/\//i.test(url)) continue;
    const tagMatch = anchor.match(/tags\s*=\s*["']([^"']*)["']/i);
    const tags = tagMatch
      ? tagMatch[1]
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const labelMatch = anchor.match(/>([\s\S]*?)<\/a>/i);
    const title = (labelMatch ? labelMatch[1] : url)
      .replace(/<[^>]+>/g, "")
      .trim() || url;
    const addDateMatch = anchor.match(/add_date\s*=\s*["']([^"']+)["']/i);
    const createdAt = addDateMatch
      ? Number(addDateMatch[1]) * 1000 || Date.now()
      : Date.now();
    results.push({
      id: nanoid(),
      title,
      url,
      description: "",
      folderId: "default",
      tags,
      favorite: false,
      useCount: 0,
      createdAt,
      updatedAt: createdAt,
    });
  }
  return results;
}
