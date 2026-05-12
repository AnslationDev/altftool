/**
 * Copies text to the clipboard.
 * Uses the modern Clipboard API with a textarea fallback for older browsers.
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} true if copy succeeded, false otherwise.
 */
export async function safeCopyText(text) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
