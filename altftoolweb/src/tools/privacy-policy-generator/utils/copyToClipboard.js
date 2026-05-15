export async function copyToClipboard(text) {
  if (!text) return false;
  await navigator.clipboard.writeText(text);
  return true;
}
