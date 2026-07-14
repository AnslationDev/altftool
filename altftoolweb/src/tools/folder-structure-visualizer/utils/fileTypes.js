import {
  Folder,
  File,
  FileCode,
  FileText,
  FileJson,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileType,
  FileCog,
} from "lucide-react";

const CODE_EXTS = new Set([
  "js", "jsx", "ts", "tsx", "mjs", "cjs", "py", "rb", "go", "rs", "java",
  "c", "cpp", "h", "hpp", "cs", "php", "swift", "kt", "scala", "sh", "bash",
  "zsh", "pl", "lua", "r", "dart", "vue", "svelte", "sql", "graphql", "gql",
]);

const TEXT_EXTS = new Set([
  "txt", "md", "mdx", "markdown", "log", "csv", "tsv", "rst", "adoc", "org",
  "tex", "rtf", "conf", "ini", "env", "yaml", "yml", "toml",
]);

const JSON_EXTS = new Set(["json", "jsonc", "ndjson", "geojson"]);

const IMAGE_EXTS = new Set([
  "png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico", "avif", "tiff",
  "heic", "raw",
]);

const VIDEO_EXTS = new Set([
  "mp4", "mov", "webm", "avi", "mkv", "m4v", "wmv", "flv", "ogg",
]);

const AUDIO_EXTS = new Set([
  "mp3", "wav", "flac", "aac", "m4a", "wma", "aiff", "opus",
]);

const ARCHIVE_EXTS = new Set([
  "zip", "tar", "gz", "bz2", "7z", "rar", "xz", "tgz", "zst",
]);

const SPREADSHEET_EXTS = new Set([
  "xls", "xlsx", "ods", "numbers", "csv",
]);

const TYPE_EXTS = new Set([
  "ttf", "otf", "woff", "woff2", "eot", "fon",
]);

const CONFIG_EXTS = new Set([
  "config", "lock", "yaml", "yml", "toml", "xml", "plist", "editorconfig",
]);

export function getFileCategory(node) {
  if (node.type === "folder") return "folder";
  const ext = node.extension || "";
  if (CODE_EXTS.has(ext)) return "code";
  if (JSON_EXTS.has(ext)) return "json";
  if (IMAGE_EXTS.has(ext)) return "image";
  if (VIDEO_EXTS.has(ext)) return "video";
  if (AUDIO_EXTS.has(ext)) return "audio";
  if (ARCHIVE_EXTS.has(ext)) return "archive";
  if (SPREADSHEET_EXTS.has(ext)) return "spreadsheet";
  if (TYPE_EXTS.has(ext)) return "font";
  if (CONFIG_EXTS.has(ext)) return "config";
  if (TEXT_EXTS.has(ext)) return "text";
  return "file";
}

export function getFileGlyph(node) {
  if (node.type === "folder") return <Folder className="h-4 w-4" strokeWidth={1.75} />;
  const category = getFileCategory(node);
  switch (category) {
    case "code":
      return <FileCode className="h-4 w-4" strokeWidth={1.75} />;
    case "json":
      return <FileJson className="h-4 w-4" strokeWidth={1.75} />;
    case "image":
      return <FileImage className="h-4 w-4" strokeWidth={1.75} />;
    case "video":
      return <FileVideo className="h-4 w-4" strokeWidth={1.75} />;
    case "audio":
      return <FileAudio className="h-4 w-4" strokeWidth={1.75} />;
    case "archive":
      return <FileArchive className="h-4 w-4" strokeWidth={1.75} />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />;
    case "font":
      return <FileType className="h-4 w-4" strokeWidth={1.75} />;
    case "config":
      return <FileCog className="h-4 w-4" strokeWidth={1.75} />;
    case "text":
      return <FileText className="h-4 w-4" strokeWidth={1.75} />;
    default:
      return <File className="h-4 w-4" strokeWidth={1.75} />;
  }
}
