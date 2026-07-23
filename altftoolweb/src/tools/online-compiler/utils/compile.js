"use client";

import { buildBridgeScript } from "./consoleBridge";

// Combine the three editors into a single self-contained HTML document that
// runs inside a sandboxed iframe. `html` is treated as body markup (CodePen
// style), `css` goes into a <style> tag, and `js` runs in a <script>.
export function buildSrcDoc({ html, css, js, bridgeToken }) {
  const bridge = `<script>${buildBridgeScript(bridgeToken)}<\/script>`;
  // Prevent a stray closing-script inside user JS from breaking the document.
  const safeJs = String(js).replace(/<\/script>/gi, "<\\/script>");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${css}</style>
${bridge}
</head>
<body>
${html}
<script>${safeJs}<\/script>
</body>
</html>`;
}
