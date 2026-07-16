export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text", error);
    return false;
  }
};

export const downloadTXT = (text, fileName) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatCommandCheatSheet = (commands, title = "LINUX COMMAND CHEAT SHEET") => {
  const lines = [title, "=".repeat(title.length), ""];

  commands.forEach((command) => {
    lines.push(`${command.name} - ${command.description}`);
    lines.push(`Category: ${command.category}`);
    lines.push(`Syntax: ${command.syntax}`);
    lines.push("Examples:");
    command.examples.forEach((example) => lines.push(`  ${example}`));
    lines.push(`Related: ${command.related.join(", ")}`);
    lines.push("");
  });

  return lines.join("\n");
};
