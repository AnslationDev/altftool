"use client";

/**
 * ALTFTool Editor Suite — modular Tiptap-based rich text editor.
 *
 * Composition entry points:
 *   EditorProvider     — owns the editor instance + content sync
 *   EditorToolbar      — grouped professional toolbar
 *   EditorBubbleMenu   — selection formatting bubble
 *   EditorFloatingMenu — empty-line quick insert
 *   EditorTableMenu    — contextual table controls
 *   EditorContextMenu  — right-click menu
 *   EditorCommandPalette / EditorSlashMenu — command surfaces
 *   EditorLinkDialog   — link insert/edit with validation
 *   EditorSeoPanel     — heading/alt/link audit + TOC
 *   EditorStatusBar    — counts, autosave, read-only state
 *
 * Extend by adding an extension in ./extensions and (optionally) a command
 * in EditorCommands.js — every surface picks it up automatically.
 */

export { default as EditorProvider, useAltfEditor } from "./EditorProvider.jsx";
export { default as EditorToolbar } from "./EditorToolbar.jsx";
export { default as EditorBubbleMenu } from "./EditorBubbleMenu.jsx";
export { default as EditorFloatingMenu } from "./EditorFloatingMenu.jsx";
export { default as EditorSlashMenuList } from "./EditorSlashMenu.jsx";
export { default as EditorCommandPalette } from "./EditorCommandPalette.jsx";
export { default as EditorLinkDialog } from "./EditorLinkDialog.jsx";
export { default as EditorTableMenu } from "./EditorTableMenu.jsx";
export { default as EditorContextMenu } from "./EditorContextMenu.jsx";
export { default as EditorSeoPanel } from "./EditorSeoPanel.jsx";
export { default as EditorStatusBar } from "./EditorStatusBar.jsx";
export { registerCommand } from "./EditorCommands.js";
export * from "./EditorUtils.js";
