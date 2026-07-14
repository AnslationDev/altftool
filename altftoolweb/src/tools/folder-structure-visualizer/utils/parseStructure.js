// Parses textual structure input into a flat list of path entries that can be
// fed into buildTreeFromPaths. Supports three input formats:
//   1. JSON (array of paths, or nested object / map representation)
//   2. ASCII tree (box-drawing characters: │ ├ └ ─)
//   3. Simple indented list
// Throws an Error with a friendly message when input cannot be parsed.

import { buildTreeFromPaths } from "./tree";

const BOX_CHARS = /[│├└┐┌┤┬┴┼─]/g;

function stripConnectors(line) {
  return line.replace(BOX_CHARS, " ").replace(/\s+/g, " ").trim();
}

function leadingWidth(line) {
  const match = line.match(/^[ \t│├└┐┌┤┬┴┼─]*/);
  return match ? match[0].length : 0;
}

export function parseStructureToTree(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    throw new Error("Input is empty. Paste a structure or upload a folder.");
  }

  // Try JSON first.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed);
      const entries = jsonToEntries(data);
      if (entries.length === 0) {
        throw new Error("JSON had no recognizable nodes.");
      }
      return buildTreeFromPaths(entries);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON. Check brackets, quotes, and commas.");
      }
      throw err;
    }
  }

  // Otherwise parse as indented text (ASCII tree or simple list).
  const entries = parseIndented(trimmed);
  if (entries.length === 0) {
    throw new Error("No lines found. Use indentation to show nesting.");
  }
  return buildTreeFromPaths(entries);
}

function parseIndented(text) {
  const rawLines = text.split(/\r?\n/);
  const lines = [];
  rawLines.forEach((raw) => {
    if (raw.trim() === "") return;
    lines.push({ indent: leadingWidth(raw), raw });
  });
  if (lines.length === 0) return [];

  const stack = []; // { indent, path }
  const entries = [];

  lines.forEach(({ indent, raw }) => {
    const clean = stripConnectors(raw).replace(/[\/\\]$/, "");
    if (!clean) return;

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parentPath = stack.length ? stack[stack.length - 1].path : "";
    const path = parentPath ? `${parentPath}/${clean}` : clean;
    entries.push({ path, isFolder: false, size: 0 });
    stack.push({ indent, path });
  });

  // A node is a folder if another node's path starts with its path + "/".
  const folderPaths = new Set();
  entries.forEach((entry) => {
    entries.forEach((other) => {
      if (other.path !== entry.path && other.path.startsWith(`${entry.path}/`)) {
        folderPaths.add(entry.path);
      }
    });
  });
  folderPaths.forEach((p) => {
    const entry = entries.find((e) => e.path === p);
    if (entry) entry.isFolder = true;
  });

  return entries;
}

function jsonToEntries(data) {
  const entries = [];

  const recurseMap = (obj, parentPath) => {
    Object.keys(obj).forEach((key) => {
      const path = parentPath ? `${parentPath}/${key}` : key;
      const value = obj[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const hasChildren = "children" in value || hasObjectChildren(value);
        if (hasChildren) {
          entries.push({ path, isFolder: true, size: value.size || 0 });
          if (Array.isArray(value.children)) {
            recurseList(value.children, path);
          } else {
            recurseMap(value, path);
          }
        } else {
          entries.push({ path, isFolder: false, size: value.size || 0 });
        }
      } else {
        entries.push({ path, isFolder: false, size: 0 });
      }
    });
  };

  const recurseList = (list, parentPath) => {
    list.forEach((item) => {
      if (typeof item === "string") {
        const path = parentPath ? `${parentPath}/${item}` : item;
        entries.push({ path, isFolder: false, size: 0 });
        return;
      }
      if (item && typeof item === "object") {
        const name = item.name || item.path || item.title;
        if (!name) return;
        const path = parentPath ? `${parentPath}/${name}` : name;
        if (item.children) {
          entries.push({ path, isFolder: true, size: item.size || 0 });
          recurseList(item.children, path);
        } else if (item.type === "folder") {
          entries.push({ path, isFolder: true, size: item.size || 0 });
        } else {
          entries.push({ path, isFolder: false, size: item.size || 0 });
        }
      }
    });
  };

  if (Array.isArray(data)) {
    recurseList(data, "");
  } else if (data && typeof data === "object") {
    if (Array.isArray(data.children)) {
      const root = data.name || "";
      recurseList(data.children, root);
    } else {
      recurseMap(data, "");
    }
  }

  return entries;
}

function hasObjectChildren(value) {
  return Object.keys(value).some((k) => {
    const v = value[k];
    return v && typeof v === "object" && !Array.isArray(v);
  });
}
