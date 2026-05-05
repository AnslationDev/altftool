/**
 * webglFingerprint.js
 *
 * HOW IT WORKS:
 * WebGL exposes the GPU vendor and renderer string.
 * Every GPU model gives a different string — extremely unique.
 * We also collect rendering capabilities like max texture size.
 *
 * WHY: GPU identity is nearly unique per machine.
 * Anti-bot systems (Cloudflare, PerimeterX) use this heavily.
 */

export function getWebGLFingerprint() {
  try {
    const canvas = document.createElement("canvas");

    // Try WebGL2 first, fall back to WebGL1
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      return {
        vendor: "Not supported",
        renderer: "Not supported",
        version: "Not supported",
        shadingLanguageVersion: "Not supported",
        maxTextureSize: null,
        extensions: [],
        rawValue: "webgl-not-supported",
      };
    }

    // WEBGL_debug_renderer_info gives us the real GPU name
    // Without this extension, we only get generic strings
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);

    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    const version = gl.getParameter(gl.VERSION);
    const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    // Collect supported extensions list (also unique per GPU/driver)
    const extensions = gl.getSupportedExtensions() || [];

    // Combine all into raw value for hashing
    const rawValue = [vendor, renderer, version, shadingLanguageVersion, maxTextureSize].join("~");

    return {
      vendor,
      renderer,
      version,
      shadingLanguageVersion,
      maxTextureSize,
      extensions,
      rawValue,
    };
  } catch (error) {
    return {
      vendor: "Blocked",
      renderer: "Blocked",
      version: "Blocked",
      shadingLanguageVersion: "Blocked",
      maxTextureSize: null,
      extensions: [],
      rawValue: "webgl-blocked",
    };
  }
}