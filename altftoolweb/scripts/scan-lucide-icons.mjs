import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traversePkg from "@babel/traverse";

const traverse = traversePkg.default;

const ROOT_DIR = "src";
const OUTPUT_FILE = "scripts/lucide-icons.json";

const icons = new Set();

function scanFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch {
    return;
  }

  traverse(ast, {
    ImportDeclaration(p) {
      if (p.node.source.value !== "lucide-react") return;

      for (const specifier of p.node.specifiers) {
        if (specifier.type === "ImportSpecifier") {
          icons.add(specifier.imported.name);
        }
      }
    },
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (
        entry === "node_modules" ||
        entry === ".next" ||
        entry === "dist"
      )
        continue;
      walk(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry)) {
      scanFile(fullPath);
    }
  }
}

walk(ROOT_DIR);

const result = {
  icons: Array.from(icons).sort(),
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

console.log(
  `✅ Found ${result.icons.length} lucide icons → ${OUTPUT_FILE}`
);
