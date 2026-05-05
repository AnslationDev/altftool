"use client";



import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusDot } from "../ui/Badge";

export function MediaDevices({ media, loading }) {
  const devices = media
    ? [
        {
          label: "Camera",
          available: media.hasCamera,
          count: media.cameraCount,
          icon: "📷",
          description: media.hasCamera
            ? `${media.cameraCount} camera${media.cameraCount > 1 ? "s" : ""} detected`
            : "No camera found",
        },
        {
          label: "Microphone",
          available: media.hasMicrophone,
          count: media.microphoneCount,
          icon: "🎙️",
          description: media.hasMicrophone
            ? `${media.microphoneCount} mic${media.microphoneCount > 1 ? "s" : ""} detected`
            : "No microphone found",
        },
        {
          label: "Speakers",
          available: media.hasSpeakers,
          count: media.speakerCount,
          icon: "🔊",
          description: media.hasSpeakers
            ? `${media.speakerCount} output${media.speakerCount > 1 ? "s" : ""} detected`
            : "No speakers found",
        },
      ]
    : [];

  return (
    <Card>
      <SectionHeader
        icon="📡"
        title="Media Devices"
        description="Hardware presence detected without requesting any permissions"
      />

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--muted)] rounded-xl animate-pulse" />
          ))}
        </div>

      ) : (
        <div>
          {/* Device cards grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {devices.map((device, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2
                           p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]
                           text-center hover:border-[var(--primary)]/20
                           transition-colors duration-150"
              >
                <span className="text-2xl">{device.icon}</span>
                <StatusDot available={device.available} size="md" />
                <div>
                  <p className="text-[13px] font-semibold text-[var(--card-foreground)] font-secondary">
                    {device.label}
                  </p>
                  <p className="text-[12px] text-[var(--muted-foreground)] font-secondary mt-0.5">
                    {device.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/15">
            <p className="text-[11px] text-green-800 font-secondary leading-relaxed">
              ✅ Privacy safe: We only detected device presence using enumerateDevices().
              No audio or video was accessed. No permissions were requested.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}