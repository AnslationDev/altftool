// Tools whose workspace genuinely benefits from more than the default 72rem
// (1152px) — two-pane editors, canvas image/PDF editors, diagram and video
// workspaces. On these the tool detail page drops the ad rails and lifts the
// width cap so the tool gets the full viewport.
//
// This is the curated central list. Individual tools can ALSO opt in via
// `wideWorkspace: true` in their tool.config.js (ToolDetailChrome ORs both),
// so adding a tool here or there has the same effect — pick whichever is
// easier. To add/remove a tool from wide mode, just edit this Set.
export const WIDE_WORKSPACE_SLUGS = new Set([
  // Code / text side-by-side editors and diff viewers (two panes need width)
  "html-editor",
  "json-editor",
  "xml-editor",
  "markdown-preview",
  "markdown-html-converter",
  "html-to-markdown-converter",
  "diff-checker",
  "text-diff-tool",
  "text-diff-viewer",

  // Canvas image editors (large canvas + controls)
  "image-editor",
  "image-cropper",
  "photo-to-sketch",
  "join-photo-and-signature",
  "text-behind-image",

  // PDF workspaces (page thumbnails / annotation canvas)
  "pdf-annotation",
  "pdf-merger",
  "pdf-split-tool",
  "pdf-watermark",

  // Diagram / canvas / simulation
  "flow-chart-maker",
  "storyboard-builder",
  "reaction-diffusion-simulator",

  // Video editors (timeline / preview need width)
  "video-trimmer",
  "video-to-gif",
]);

export function isWideWorkspaceTool(slug, tool) {
  return tool?.wideWorkspace === true || WIDE_WORKSPACE_SLUGS.has(slug);
}
