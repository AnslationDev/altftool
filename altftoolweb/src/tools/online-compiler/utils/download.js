import { saveAs } from "file-saver";
import JSZip from "jszip";

export function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  saveAs(blob, filename);
}

export async function downloadProjectZip(name, { html, css, js }) {
  const zip = new JSZip();
  const safe = (name || "project").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
  zip.file("index.html", html);
  zip.file("style.css", css);
  zip.file("script.js", js);
  zip.file(
    "README.txt",
    `Project: ${name}\nOpen index.html in a browser to run.\n`
  );
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${safe}.zip`);
}

// Read a single uploaded File as text.
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function baseName(file) {
  return file.name.toLowerCase();
}

// Accept multiple files (html/css/js) or a single .zip project archive.
// Returns { html, css, js, name } where available.
export async function parseUploadedFiles(fileList) {
  const files = Array.from(fileList);
  const result = { html: "", css: "", js: "", name: "" };
  const zipFile = files.find((f) => baseName(f).endsWith(".zip"));

  if (zipFile) {
    const zip = await JSZip.loadAsync(zipFile);
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;
      const lower = path.toLowerCase();
      const text = await entry.async("string");
      if (lower.endsWith(".html") || lower.endsWith(".htm")) result.html = text;
      else if (lower.endsWith(".css")) result.css = text;
      else if (lower.endsWith(".js")) result.js = text;
    }
    result.name = zipFile.name.replace(/\.zip$/i, "");
    return result;
  }

  for (const f of files) {
    const lower = baseName(f);
    const text = await readFile(f);
    if (lower.endsWith(".html") || lower.endsWith(".htm")) result.html = text;
    else if (lower.endsWith(".css")) result.css = text;
    else if (lower.endsWith(".js")) result.js = text;
  }
  return result;
}
