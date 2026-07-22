"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Trash2,
  Sparkles,
  PlusCircle,
  Camera,
  Layers,
  ChevronRight,
  Save
} from "lucide-react";

export default function GearPresets({ presets, setPresets, onLoad, currentSettings }) {
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetNotes, setNewPresetNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPreset = (e) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      sensorName: currentSettings.sensorName,
      focalLength: currentSettings.focalLength,
      aperture: currentSettings.aperture,
      distance: currentSettings.distance,
      distanceUnit: currentSettings.distanceUnit,
      notes: newPresetNotes.trim() || "Custom user setup."
    };

    setPresets((prev) => [newPreset, ...prev]);
    setNewPresetName("");
    setNewPresetNotes("");
    setShowAddForm(false);
  };

  const handleDeletePreset = (id, e) => {
    e.stopPropagation(); // Avoid triggering loading the preset
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  // Helper to assign standard theme classes based on preset name
  const getPresetColor = (name = "") => {
    return "border-[var(--card-border)] hover:border-[var(--primary)] bg-gradient-to-br from-[var(--card)]/50 to-[var(--card)] text-[var(--foreground)]";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--card-border)] gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[var(--primary)]" />
              My Camera Bag
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 font-mono">
              Save your favorite gear combos (bodies, prime focal lengths, focus zones) for instant recall.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-foreground)] shadow-md hover:shadow-lg transition-all duration-75 shrink-0"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            {showAddForm ? "Hide Form" : "Save Current Setup"}
          </button>
        </div>

        {/* Add Preset Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddPreset}
            className="mb-8 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-5 space-y-4 animate-fadeIn"
          >
            <div className="text-xs font-black uppercase text-[var(--primary)] tracking-wider flex items-center gap-1.5 mb-2">
              <Save className="h-4 w-4" />
              Save Active Parameters as Preset
            </div>

            {/* Readonly current parameters grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-3 text-xs font-mono text-[var(--secondary-foreground)]">
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] block">SENSOR</span>
                <span className="font-bold">{currentSettings.sensorName.split(" ")[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] block">LENS</span>
                <span className="font-bold">{currentSettings.focalLength}mm</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] block">APERTURE</span>
                <span className="font-bold">f/{currentSettings.aperture}</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted-foreground)] block">DISTANCE</span>
                <span className="font-bold">{currentSettings.distance} {currentSettings.distanceUnit}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--secondary-foreground)]">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Portraits Rig, Wide-angle Landscape"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]/80 px-4 py-2.5 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--secondary-foreground)]">Shoot Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Used for street candids at f/8"
                  value={newPresetNotes}
                  onChange={(e) => setNewPresetNotes(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]/80 px-4 py-2.5 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-xs font-bold text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-md"
              >
                Confirm Add
              </button>
            </div>
          </form>
        )}

        {/* Preset Cards List */}
        <div className="grid gap-4 sm:grid-cols-2">
          {presets.length === 0 ? (
            <div className="sm:col-span-2 py-12 text-center">
              <p className="text-sm text-[var(--muted-foreground)] italic">
                Your Camera Bag is currently empty. Adjust sliders on the calculator and tap 'Save Current Setup' to store your presets here!
              </p>
            </div>
          ) : (
            presets.map((preset) => {
              const themeClasses = getPresetColor(preset.name);
              return (
                <div
                  key={preset.id}
                  onClick={() => onLoad(preset)}
                  className={`group relative rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-100 hover:shadow-md cursor-pointer flex flex-col justify-between ${themeClasses}`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-[var(--foreground)] flex items-center gap-1.5">
                          <Camera className="h-4 w-4 shrink-0" />
                          {preset.name}
                        </h4>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold block text-[var(--muted-foreground)]">
                          {preset.sensorName.split(" ")[0]}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-all duration-75 opacity-0 group-hover:opacity-100"
                        title="Remove Setup"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Lens Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[var(--background)]/80 border border-[var(--card-border)]/50 rounded-xl p-2.5 text-center text-xs font-mono text-[var(--foreground)] font-bold">
                      <div className="border-r border-[var(--card-border)]/30">
                        <span className="text-[9px] text-[var(--muted-foreground)] block">LENS</span>
                        <span>{preset.focalLength}mm</span>
                      </div>
                      <div className="border-r border-[var(--card-border)]/30">
                        <span className="text-[9px] text-[var(--muted-foreground)] block">F-STOP</span>
                        <span>f/{preset.aperture}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--muted-foreground)] block">FOCUS</span>
                        <span>{preset.distance}{preset.distanceUnit}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <p className="text-xs text-[var(--secondary-foreground)] leading-relaxed italic line-clamp-2">
                      "{preset.notes}"
                    </p>
                  </div>

                  {/* Load Action Arrow */}
                  <div className="mt-4 pt-3 border-t border-[var(--card-border)]/10 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[var(--primary)] font-secondary">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Mount Rig to Calculator
                    </span>
                    <ChevronRight className="h-4 w-4 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-100" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
