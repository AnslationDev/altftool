"use client";

import { buildAvatarContent } from "../utils/avatarSvg";

// Renders the deterministic avatar as inline SVG so it scales crisply
// and exports cleanly. All visual logic lives in utils/avatarSvg.js.
export default function AvatarSvg({ config, className = "", svgRef }) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 240"
      role="img"
      aria-label="Generated avatar preview"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {buildAvatarContent(config)}
    </svg>
  );
}
