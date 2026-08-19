import React from "react";

// No `metadata` export here on purpose.
//
// Next.js resolves metadata from the root down and the deepest segment wins, so
// anything exported from this layout is silently overridden by page.jsx's
// generateMetadata(). A good title/description/keywords block used to sit here
// and never reached a single <head>. The canonical metadata for this route now
// lives in page.jsx — add fields there, not here.

export default function SoftMurmurLayout({ children }) {
  return <>{children}</>;
}
