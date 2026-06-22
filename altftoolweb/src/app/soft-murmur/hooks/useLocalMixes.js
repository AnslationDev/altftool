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
    if (!name.trim()) return false;

    // Filter only active sounds to keep storage light
    const activeSounds = {};
    Object.entries(soundsState).forEach(([id, state]) => {
      if (state.active) {
        activeSounds[id] = state.volume;
      }
    });

    if (Object.keys(activeSounds).length === 0) {
      return { error: "Mix must contain at least one active sound." };
    }

    const newMix = {
      id: `mix_${Date.now()}`,
      name: name.trim(),
      sounds: activeSounds,
      masterVolume,
      flowMode,
      flowIntensity,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updatedMixes = [newMix, ...savedMixes];
    setSavedMixes(updatedMixes);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMixes));
    return true;
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
