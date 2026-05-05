"use client";


import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";
import { Badge } from "../ui/Badge";
import { InfoRow } from "../ui/InfoRow";
import { hashString } from "../../lib/hashFingerprint";

export function CanvasFingerprint({ canvas, loading }) {
  const [hash, setHash] = useState(null);

  // Hash the canvas data URL once available
  useEffect(() => {
    if (canvas?.rawValue && canvas.rawValue !== "canvas-blocked") {
      hashString(canvas.rawValue).then((h) => setHash(h));
    }
  }, [canvas]);

  const isBlocked = !canvas?.dataURL || canvas.rawValue === "canvas-blocked";
  const shortHash = hash ? hash.slice(0, 20) + "..." : "Computing...";

  return (
    <Card>
      <SectionHeader
        icon="🎨"
        title="Canvas Fingerprint"
        description="GPU renders shapes & text differently per device"
        badge={
          isBlocked ? (
            <Badge variant="success" size="xs">Blocked ✓</Badge>
          ) : (
            <Badge variant="high" size="xs">High Entropy</Badge>
          )
        }
      />

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          <div className="w-full h-16 bg-[var(--muted)] rounded-xl animate-pulse" />
          <div className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
          <div className="h-9 bg-[var(--muted)] rounded-lg animate-pulse w-3/4" />
        </div>

      /* Canvas is blocked */
      ) : isBlocked ? (
        <div className="flex items-center gap-3 p-3 rounded-xl
                        bg-green-500/10 border border-green-500/20">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-400 font-primary">
              Canvas Fingerprinting Blocked
            </p>
            <p className="text-xs text-[var(--muted-foreground)] font-secondary mt-0.5">
              Your browser is protecting you. Canvas API is restricted or randomized.
            </p>
          </div>
        </div>

      /* Canvas data available — show preview */
      ) : (
        <div className="space-y-3">

          {/* Live canvas image preview */}
          <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={canvas.dataURL}
              alt="Your canvas fingerprint render"
              className="w-full h-auto block"
              style={{ imageRendering: "auto" }}
            />
          </div>

          {/* Explanation note */}
          <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
            This image looks the same to everyone but renders at pixel level differently
            per device, GPU driver, OS, and browser — creating a unique hash below.
          </p>

          {/* Hash row */}
          <InfoRow label="Canvas Hash" value={shortHash} mono copyable />

          {/* Full hash expandable */}
          {hash && (
            <div className="p-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <p className="text-[9px] text-[var(--muted-foreground)] font-secondary mb-1">
                Full SHA-256 Hash
              </p>
              <p className="text-[10px] font-mono text-[var(--primary)] break-all leading-relaxed">
                {hash}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}