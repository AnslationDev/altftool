"use client";



import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";
import { Badge } from "../ui/Badge";
import { InfoRow } from "../ui/InfoRow";
import { hashString } from "../../lib/hashFingerprint";

export function AudioFingerprint({ audio, loading }) {
  const [hash, setHash] = useState(null);

  useEffect(() => {
    if (
      audio?.rawValue &&
      !audio.rawValue.includes("blocked") &&
      !audio.rawValue.includes("supported")
    ) {
      hashString(audio.rawValue).then((h) => setHash(h));
    }
  }, [audio]);

  const isBlocked =
    !audio ||
    audio.rawValue?.includes("blocked") ||
    audio.rawValue?.includes("supported");

  const shortHash = hash ? hash.slice(0, 20) + "..." : "Computing...";

  return (
    <Card>
      <SectionHeader
        icon="🔊"
        title="Audio Fingerprint"
        description="Audio hardware differences detected silently via Web Audio API"
        badge={
          isBlocked ? (
            <Badge variant="success" size="xs">Protected ✓</Badge>
          ) : (
            <Badge variant="high" size="xs">Detected</Badge>
          )
        }
      />

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 bg-[var(--muted)] rounded-lg animate-pulse" />
          ))}
        </div>

      /* Audio blocked */
      ) : isBlocked ? (
        <div className="flex items-center gap-3 p-3 rounded-xl
                        bg-green-500/10 border border-green-500/20">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-400 font-primary">
              Audio Fingerprint Blocked
            </p>
            <p className="text-xs text-[var(--muted-foreground)] font-secondary mt-0.5">
              Web Audio API is restricted in this browser. Your audio fingerprint is protected.
            </p>
          </div>
        </div>

      /* Audio data available */
      ) : (
        <div>
          <InfoRow label="Audio Hash"   value={shortHash}  mono copyable />
          <InfoRow
            label="Sample Rate"
            value={audio?.sampleRate ? `${audio.sampleRate.toLocaleString()} Hz` : "N/A"}
          />
          <InfoRow
            label="Channels"
            value={audio?.channelCount ?? "N/A"}
          />

          {/* How it works callout */}
          <div className="mt-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
            <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
              🤫 This is completely silent — no sound was played. We ran a triangle wave
              oscillator through a dynamics compressor and summed the output float values.
              Tiny hardware differences produce a unique number that gets hashed above.
            </p>
          </div>

          {/* Anti-bot usage note */}
          <div className="mt-2 p-3 rounded-xl bg-[var(--primary)]/8 border border-[var(--primary)]/15">
            <p className="text-[10px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
              🤖 Used by: Cloudflare Turnstile, PerimeterX, FingerprintJS Pro
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}