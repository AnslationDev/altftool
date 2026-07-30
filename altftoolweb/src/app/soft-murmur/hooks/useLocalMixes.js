"use client";

import { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "altf_ambient_mixes";

export function useLocalMixes() {
  const [savedMixes, setSavedMixes] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedMixes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved mixes", e);
    }
  }, []);

  // Save a new mix
  const saveMix = (name, soundsState, masterVolume, flowMode, flowIntensity) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { ok: false, error: "Please enter a name for your custom mix." };
    }

    const isDuplicate = savedMixes.some(
      (mix) => mix.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      return { ok: false, error: "A mix with this name already exists." };
    }

    // Filter only active sounds to keep storage light
    const activeSounds = {};
    Object.entries(soundsState).forEach(([id, state]) => {
      if (state.active) {
        activeSounds[id] = state.volume;
      }
    });

    if (Object.keys(activeSounds).length === 0) {
      return { ok: false, error: "Mix must contain at least one active sound." };
    }

    const newMix = {
      id: `mix_${Date.now()}`,
      name: trimmedName,
      sounds: activeSounds,
      masterVolume,
      flowMode,
      flowIntensity,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedMixes = [newMix, ...savedMixes];
    setSavedMixes(updatedMixes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMixes));
    return { ok: true };
  };

  // Delete a mix
  const deleteMix = (mixId) => {
    const updatedMixes = savedMixes.filter((mix) => mix.id !== mixId);
    setSavedMixes(updatedMixes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMixes));
  };

  return {
    savedMixes,
    saveMix,
    deleteMix,
  };
}
