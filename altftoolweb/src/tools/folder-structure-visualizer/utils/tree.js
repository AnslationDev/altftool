import { nanoid } from "nanoid";

// Normalize a raw list of paths into a nested tree model.
// Each node: { id, name, type: "file" | "folder", children, size, depth, path, extension, parent }
export function buildTreeFromPaths(entries, rootName = "Project Root") {
  const root = {
    id: nanoid(8),
    name: rootName,
    type: "folder",
    children: [],
    size: 0,
    depth: 0,
    path: "",
    extension: "",
    parent: null,
  };

  if (!entries || entries.length === 0) return root;

  const folderNodes = new Map();

  const ensureFolder = (path) => {
    if (path === "" || path === "/") return root;
    if (folderNodes.has(path)) return folderNodes.get(path);
    const parts = path.replace(/\/$/, "").split("/").filter(Boolean);
    let current = root;
    let built = "";
    parts.forEach((part, index) => {
      built = built ? `${built}/${part}` : part;
      const isLast = index === parts.length - 1;
      let child = current.children.find(
        (node) => node.type === "folder" && node.name === part
      );
      if (!child) {
        child = {
          id: nanoid(8),
          name: part,
          type: "folder",
          children: [],
          size: 0,
          depth: index + 1,
          path: built,
          extension: "",
          parent: current,
        };
        current.children.push(child);
        folderNodes.set(built, child);
      }
      current = child;
      if (isLast) folderNodes.set(path, child);
    });
    return current;
  };

  entries.forEach((entry) => {
    const fullPath = (entry.path || "").replace(/^\/+/, "");
    const parts = fullPath.split("/").filter(Boolean);
    if (parts.length === 0) return;
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");
    const parent = ensureFolder(parentPath);

    if (entry.isFolder) {
      ensureFolder(fullPath);
      return;
    }
    const extension = getExtension(name);
    parent.children.push({
      id: nanoid(8),
      name,
      type: "file",
      children: [],
      size: entry.size || 0,
      depth: parts.length,
      path: fullPath,
      extension,
      parent,
    });
  });

  sortTree(root);
  assignSizes(root);
  return root;
}

function getExtension(name) {
  // A leading dot marks a dotfile (.gitignore, .env, .babelrc, .DS_Store),
  // not an extension — only a dot that isn't the first character, and isn't
  // the last character either, counts as an extension separator.
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex + 1).toLowerCase();
}

function sortTree(node) {
  if (!node.children) return;
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  node.children.forEach(sortTree);
}

function assignSizes(node) {
  if (node.type === "file") return node.size;
  let total = 0;
  node.children.forEach((child) => {
    total += assignSizes(child);
  });
  node.size = total;
  return total;
}

// Flatten visible (expanded) nodes for rendering + keyboard navigation.
// Root is included first so it can receive roving focus.
export function getVisibleNodes(root, expandedSet) {
  const out = [];
  const walk = (node) => {
    out.push(node);
    if (node.type === "folder" && expandedSet.has(node.id)) {
      node.children.forEach(walk);
    }
  };
  walk(root);
  return out;
}

// Find a node by id (deep search).
export function findNode(node, id) {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

// Compute statistics for the whole tree.
export function computeStats(root) {
  let files = 0;
  let folders = 0;
  let totalSize = 0;
  let maxDepth = 0;
  const byExtension = {};

  const walk = (node) => {
    maxDepth = Math.max(maxDepth, node.depth);
    if (node.type === "folder") {
      if (node !== root) folders += 1;
      node.children.forEach(walk);
    } else {
      files += 1;
      totalSize += node.size || 0;
      const ext = node.extension || "(none)";
      byExtension[ext] = (byExtension[ext] || 0) + 1;
    }
  };
  walk(root);

  const topExtensions = Object.entries(byExtension)
    .map(([extension, count]) => ({ extension, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { files, folders, totalSize, maxDepth, topExtensions };
}

// Collect every extension present in the tree (for filter chips).
export function collectExtensions(root) {
  const set = new Set();
  const walk = (node) => {
    if (node.type === "file" && node.extension) set.add(node.extension);
    node.children.forEach(walk);
  };
  walk(root);
  return Array.from(set).sort();
}
