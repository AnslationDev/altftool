"use client";

import { useState, useEffect, useRef } from "react";
import { ambientSounds } from "../data/ambientSounds";

export function useAmbientAudio() {
  // Sound states: mapping of soundId -> { active: boolean, volume: number }
  const [soundsState, setSoundsState] = useState(() => {
    const initialState = {};
    ambientSounds.forEach((s) => {
      initialState[s.id] = {
        active: false,
        volume: s.defaultVolume,
      };
    });
    return initialState;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [flowMode, setFlowMode] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState("Soft");

  // Sounds known (statically or discovered at runtime) to be unplayable
  const [unavailableSounds, setUnavailableSounds] = useState(() => {
    const initialUnavailable = {};
    ambientSounds.forEach((s) => {
      if (s.available === false) {
        initialUnavailable[s.id] = true;
      }
    });
    return initialUnavailable;
  });

  // Timer states
  const [timerTime, setTimerTime] = useState(0); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerFadeOut, setTimerFadeOut] = useState(true);
  const [initialTimerDuration, setInitialTimerDuration] = useState(0);

  // Audio HTMLAudioElement references
  const audiosRef = useRef({});
  // Fade intervals references
  const fadeIntervalsRef = useRef({});
  // Ref for tracking current states inside loops
  const stateRef = useRef({ soundsState, isPlaying, masterVolume, flowMode, flowIntensity });

  // Update stateRef
  useEffect(() => {
    stateRef.current = { soundsState, isPlaying, masterVolume, flowMode, flowIntensity };
  }, [soundsState, isPlaying, masterVolume, flowMode, flowIntensity]);

  // Clean up all audios on unmount
  useEffect(() => {
    return () => {
      Object.values(audiosRef.current).forEach((audio) => {
        try {
          audio.pause();
        } catch (e) {}
      });
      Object.values(fadeIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // Called whenever a sound's underlying <audio> element fails to load/play
  const handleAudioError = (soundId) => {
    if (fadeIntervalsRef.current[soundId]) {
      clearInterval(fadeIntervalsRef.current[soundId]);
      delete fadeIntervalsRef.current[soundId];
    }

    setUnavailableSounds((prev) => (prev[soundId] ? prev : { ...prev, [soundId]: true }));

    setSoundsState((prev) => {
      if (!prev[soundId] || !prev[soundId].active) return prev;
      return {
        ...prev,
        [soundId]: { ...prev[soundId], active: false },
      };
    });
  };

  // Initialize or retrieve Audio element
  const getAudio = (soundId) => {
    if (audiosRef.current[soundId]) {
      return audiosRef.current[soundId];
    }
    const soundData = ambientSounds.find((s) => s.id === soundId);
    if (!soundData) return null;

    const audio = new Audio(soundData.file);
    audio.loop = true;
    audio.volume = 0; // Start at 0 for fade-in

    // Set crossOrigin to anonymous so we don't have issues if we ever do Web Audio API processing
    audio.crossOrigin = "anonymous";

    // Surface load/playback failures instead of failing silently
    audio.addEventListener("error", () => handleAudioError(soundId));

    audiosRef.current[soundId] = audio;
    return audio;
  };

  // Fade helper
  const fadeSound = (soundId, targetVolume, duration = 800) => {
    const audio = getAudio(soundId);
    if (!audio) return;

    if (fadeIntervalsRef.current[soundId]) {
      clearInterval(fadeIntervalsRef.current[soundId]);
    }

    const steps = 20;
    const stepTime = duration / steps;
    const startVolume = audio.volume;
    const volumeDelta = targetVolume - startVolume;
    let currentStep = 0;

    fadeIntervalsRef.current[soundId] = setInterval(() => {
      currentStep++;
      const nextVolume = startVolume + (volumeDelta * currentStep) / steps;
      audio.volume = Math.max(0, Math.min(1, nextVolume));

      if (currentStep >= steps) {
        clearInterval(fadeIntervalsRef.current[soundId]);
        audio.volume = targetVolume;
        if (targetVolume === 0 && audio.paused === false) {
          audio.pause();
        }
      }
    }, stepTime);
  };

  // Toggle Sound active status
  const toggleSound = (soundId) => {
    const soundData = ambientSounds.find((s) => s.id === soundId);
    if (soundData?.available === false || unavailableSounds[soundId]) {
      return;
    }

    setSoundsState((prev) => {
      const nextState = { ...prev };
      const current = nextState[soundId];
      const newActive = !current.active;
      
      nextState[soundId] = {
        ...current,
        active: newActive,
      };

      const audio = getAudio(soundId);
      if (audio) {
        if (newActive) {
          // If global playing, start audio and fade in
          if (isPlaying) {
            const targetVol = (current.volume / 100) * (masterVolume / 100);
            audio.play().catch((err) => console.log("Audio play blocked: ", err));
            fadeSound(soundId, targetVol);
          }
        } else {
          // Fade out and pause
          fadeSound(soundId, 0);
        }
      }

      return nextState;
    });
  };

  // Set Sound volume
  const setSoundVolume = (soundId, newVolume) => {
    setSoundsState((prev) => {
      const nextState = { ...prev };
      const current = nextState[soundId];
      nextState[soundId] = {
        ...current,
        volume: newVolume,
      };

      const audio = getAudio(soundId);
      if (audio && current.active && isPlaying) {
        // If playing, adjust volume immediately
        const targetVol = (newVolume / 100) * (masterVolume / 100);
        
        // If there's an ongoing toggle fade, let's clear it and apply immediately
        if (fadeIntervalsRef.current[soundId]) {
          clearInterval(fadeIntervalsRef.current[soundId]);
        }
        audio.volume = targetVol;
      }

      return nextState;
    });
  };

  // Global Play/Pause
  const togglePlayPause = () => {
    setIsPlaying((prevIsPlaying) => {
      const nextIsPlaying = !prevIsPlaying;

      if (nextIsPlaying) {
        // Start all active sounds
        let hasActive = false;
        Object.entries(soundsState).forEach(([id, state]) => {
          if (state.active) {
            hasActive = true;
            const audio = getAudio(id);
            if (audio) {
              const targetVol = (state.volume / 100) * (masterVolume / 100);
              audio.play().catch((err) => console.log("Audio play blocked: ", err));
              fadeSound(id, targetVol);
            }
          }
        });
      } else {
        // Fade out all active sounds
        Object.entries(soundsState).forEach(([id, state]) => {
          if (state.active) {
            fadeSound(id, 0);
          }
        });
      }

      return nextIsPlaying;
    });
  };

  // Update audio volume when master volume changes
  useEffect(() => {
    if (isPlaying) {
      Object.entries(soundsState).forEach(([id, state]) => {
        if (state.active) {
          const audio = audiosRef.current[id];
          if (audio) {
            // Apply scale immediately
            const targetVol = (state.volume / 100) * (masterVolume / 100);
            if (!fadeIntervalsRef.current[id]) {
              audio.volume = targetVol;
            }
          }
        }
      });
    }
  }, [masterVolume, soundsState, isPlaying]);

  // Reset Mix
  const resetMix = () => {
    setIsPlaying(false);
    setFlowMode(false);
    // Pause all and clear intervals
    Object.keys(soundsState).forEach((id) => {
      const audio = audiosRef.current[id];
      if (audio) {
        audio.pause();
        audio.volume = 0;
      }
      if (fadeIntervalsRef.current[id]) {
        clearInterval(fadeIntervalsRef.current[id]);
      }
    });

    // Reset states
    const resetState = {};
    ambientSounds.forEach((s) => {
      resetState[s.id] = {
        active: false,
        volume: s.defaultVolume,
      };
    });
    setSoundsState(resetState);
    setMasterVolume(80);
    cancelTimer();
  };

  // Load Preset
  const loadPreset = (presetSounds, presetMasterVol = 80, presetFlow = false, presetFlowIntensity = "Soft") => {
    // 1. Pause everything first
    Object.keys(soundsState).forEach((id) => {
      const audio = audiosRef.current[id];
      if (audio) {
        audio.pause();
        audio.volume = 0;
      }
      if (fadeIntervalsRef.current[id]) {
        clearInterval(fadeIntervalsRef.current[id]);
      }
    });

    const nextState = {};
    ambientSounds.forEach((s) => {
      const isSoundAvailable = s.available !== false && !unavailableSounds[s.id];
      const isPresetActive =
        presetSounds[s.id] !== undefined && presetSounds[s.id] > 0 && isSoundAvailable;
      nextState[s.id] = {
        active: isPresetActive,
        volume: isPresetActive ? presetSounds[s.id] : s.defaultVolume,
      };
    });

    setSoundsState(nextState);
    setMasterVolume(presetMasterVol);
    setFlowMode(presetFlow);
    setFlowIntensity(presetFlowIntensity);
    setIsPlaying(true);

    // Fade in active sounds
    Object.entries(nextState).forEach(([id, state]) => {
      if (state.active) {
        const audio = getAudio(id);
        if (audio) {
          const targetVol = (state.volume / 100) * (presetMasterVol / 100);
          audio.play().catch((err) => console.log("Audio play blocked: ", err));
          fadeSound(id, targetVol);
        }
      }
    });
  };

  // Flow Mode - Natural Drift (Subtle volume oscillation)
  useEffect(() => {
    if (!flowMode || !isPlaying) return;

    // Define unique wave periods (in seconds) for each sound so they oscillate out of sync
    const periods = {
      rain: 24,
      thunder: 38,
      waves: 32,
      wind: 28,
      fire: 18,
      birds: 22,
      crickets: 26,
      coffee: 30,
      singing_bowl: 45,
      white_noise: 50,
    };

    // Drift intensity factor
    const intensityMap = {
      Soft: 0.1,    // +/- 10% variation
      Medium: 0.25, // +/- 25% variation
      Deep: 0.45,   // +/- 45% variation
    };

    const factor = intensityMap[flowIntensity] || 0.1;
    let startTime = Date.now() / 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() / 1000 - startTime;
      const { soundsState: curSounds, masterVolume: curMaster } = stateRef.current;

      Object.entries(curSounds).forEach(([id, state]) => {
        if (state.active) {
          const audio = audiosRef.current[id];
          if (audio) {
            const baseVol = (state.volume / 100) * (curMaster / 100);
            const period = periods[id] || 30;
            // Rhythmic sine wave drift
            const wave = Math.sin((elapsed * 2 * Math.PI) / period);
            const driftVol = baseVol * (1 + wave * factor);
            // Clamp and update immediately (but gently)
            audio.volume = Math.max(0.01, Math.min(1, driftVol));
          }
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [flowMode, flowIntensity, isPlaying]);

  // Timer Countdown Logic
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimerTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerEnd();
          return 0;
        }

        // Handle fade out in the last 15 seconds
        if (timerFadeOut && prev <= 15) {
          const fadeProgress = (prev - 1) / 15; // 1 down to 0
          const { soundsState: curSounds, masterVolume: curMaster } = stateRef.current;
          Object.entries(curSounds).forEach(([id, state]) => {
            if (state.active) {
              const audio = audiosRef.current[id];
              if (audio) {
                const targetVol = (state.volume / 100) * (curMaster / 100) * fadeProgress;
                audio.volume = Math.max(0, targetVol);
              }
            }
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timerFadeOut]);

  const handleTimerEnd = () => {
    setIsPlaying(false);
    setIsTimerActive(false);
    setTimerTime(0);

    // Pause all sounds
    Object.keys(soundsState).forEach((id) => {
      const audio = audiosRef.current[id];
      if (audio) {
        audio.pause();
        audio.volume = 0;
      }
    });
  };

  const startTimer = (minutes, fadeOut = true) => {
    const seconds = minutes * 60;
    setTimerTime(seconds);
    setInitialTimerDuration(seconds);
    setTimerFadeOut(fadeOut);
    setIsTimerActive(true);
  };

  const cancelTimer = () => {
    setIsTimerActive(false);
    setTimerTime(0);
    setInitialTimerDuration(0);

    // Restore volume to original
    if (isPlaying) {
      Object.entries(soundsState).forEach(([id, state]) => {
        if (state.active) {
          const audio = audiosRef.current[id];
          if (audio) {
            audio.volume = (state.volume / 100) * (masterVolume / 100);
          }
        }
      });
    }
  };

  return {
    soundsState,
    unavailableSounds,
    isPlaying,
    masterVolume,
    flowMode,
    flowIntensity,
    timerTime,
    isTimerActive,
    timerFadeOut,
    initialTimerDuration,
    toggleSound,
    setSoundVolume,
    togglePlayPause,
    setMasterVolume,
    resetMix,
    loadPreset,
    setFlowMode,
    setFlowIntensity,
    startTimer,
    cancelTimer,
  };
}
