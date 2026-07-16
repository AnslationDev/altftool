export function downloadGO(content, filename = "struct.go") {
  const blob = new Blob([content], { type: "text/x-go;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".go") ? filename : `${filename}.go`;
  link.click();
  URL.revokeObjectURL(url);
}
