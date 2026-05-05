"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { InfoRow } from "../ui/InfoRow";

export function WebGLFingerprint({ webgl, loading }) {
  const [isOpen, setIsOpen] = useState(false);

  const isBlocked =
    !webgl ||
    webgl.renderer === "Blocked" ||
    webgl.renderer === "Not supported";

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] border-l-4
                    border-l-cyan-500 rounded-2xl shadow-sm
                    transition-all duration-300 ease-out">

      {/* ─ Header  */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none
                   hover:bg-[var(--muted)]/40 rounded-2xl transition-colors duration-200"
        onClick={() => setIsOpen((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20
                         flex items-center justify-center text-lg shrink-0">
            🖥️
          </div>

          <div>
            <p className="text-sm font-semibold font-primary text-[var(--card-foreground)]">
              WebGL / GPU Fingerprint
            </p>

            {!isOpen && !loading && webgl && (
              <p className={`text-xs font-secondary font-medium mt-0.5
                ${isBlocked ? "text-green-400" : "text-cyan-400"}`}>
                {isBlocked ? "Protected ✓" : webgl.vendor || "GPU Exposed"}
              </p>
            )}
            {!isOpen && loading && (
              <div className="h-3 w-24 bg-[var(--muted)] rounded animate-pulse mt-1" />
            )}
          </div>
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-secondary
              ${isBlocked
                ? "text-green-400 bg-green-500/10 border-green-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}>
              {isBlocked ? "Protected" : "Exposed"}
            </span>
          )}
          <ChevronDown
            className={`w-6 h-6 text-blue-600
                        transition-transform duration-300
                        ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </div>

      {/*  Expandable Content ─ */}
      <div className={`overflow-hidden transition-all duration-400 ease-in-out
                      ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-5">

          <div className="h-px bg-[var(--border)] mb-4" />

          {/* Loading */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
              ))}
            </div>

          ) : isBlocked ? (
            <div className="flex items-center gap-3 p-3 rounded-xl
                            bg-green-500/10 border border-green-500/20">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-400 font-primary">
                  WebGL Fingerprint Blocked
                </p>
                <p className="text-xs text-[var(--muted-foreground)] font-secondary mt-0.5">
                  Your GPU identity is hidden — a great privacy signal.
                </p>
              </div>
            </div>

          ) : (
            <div>
              <InfoRow label="Vendor"        value={webgl?.vendor}                 highlight />
              <InfoRow label="Renderer"      value={webgl?.renderer}               truncate copyable />
              <InfoRow label="WebGL Version" value={webgl?.version}                truncate />
              <InfoRow label="GLSL Version"  value={webgl?.shadingLanguageVersion} truncate />
              <InfoRow
                label="Max Texture"
                value={webgl?.maxTextureSize ? `${webgl.maxTextureSize}px` : "N/A"}
              />
              <InfoRow
                label="Extensions"
                value={webgl?.extensions?.length ? `${webgl.extensions.length} supported` : "None"}
              />

              <div className="mt-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <p className="text-[11px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
                  🎮 The renderer string reveals your exact GPU model. Combined with canvas
                  output, this creates one of the strongest device fingerprints available.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
