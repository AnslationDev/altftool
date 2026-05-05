import { extensionMap } from "../src/data/extensions.js";
import fs from "fs";

const extensions = Object.entries(extensionMap).map(([slug, data]) => ({
  id: slug,
  slug,
  ...data,
  hasChromeStore: data.chromeUrl && data.chromeUrl !== "#"
}));

fs.writeFileSync(
  "./extensions-firestore-import.json",
  JSON.stringify(extensions, null, 2)
);

console.log("Extensions JSON ready for Firestore import ✅");