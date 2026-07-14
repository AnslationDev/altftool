"use client";

import { Button } from "@/shared/ui/Button";
import { Volume2, VolumeX, RotateCcw, RefreshCw } from "lucide-react";

// Shared action bar. `actions` is an array of { key, label, icon, onClick,
// variant, disabled }. Plus persistent controls (sound, reset) are passed in.
export default function Controls({ actions = [], soundOn, onToggleSound, onReset, onReplay, replayLabel = "Replay" }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {actions.map((a) => (
        <Button
          key={a.key}
          variant={a.variant || "primary"}
          onClick={a.onClick}
          disabled={a.disabled}
          aria-label={a.label}
          className="!rounded-xl !px-4 !py-2.5 font-semibold"
        >
          {a.icon ? <span className="mr-1.5 inline-flex">{a.icon}</span> : null}
          {a.label}
        </Button>
      ))}

      {onReplay && (
        <Button
          variant="outline"
          onClick={onReplay}
          aria-label={replayLabel}
          className="!rounded-xl !px-4 !py-2.5 font-semibold"
        >
          <RefreshCw size={16} className="mr-1.5" />
          {replayLabel}
        </Button>
      )}

      <Button
        variant="ghost"
        onClick={onToggleSound}
        aria-label={soundOn ? "Mute sound" : "Enable sound"}
        className="!rounded-xl !px-3 !py-2.5"
      >
        {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </Button>

      {onReset && (
        <Button
          variant="ghost"
          onClick={onReset}
          aria-label="Reset game"
          className="!rounded-xl !px-3 !py-2.5"
        >
          <RotateCcw size={18} />
        </Button>
      )}
    </div>
  );
}
