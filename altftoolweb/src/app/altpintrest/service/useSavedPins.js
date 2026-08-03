"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSavedPins,
  getSavedPinIdsSet,
  isPinSaved,
  toggleSavePin,
  savePin,
  unsavePin,
  subscribeToSavedPins,
} from "./savedPinsStore";

export function useSavedPins() {
  const [savedPins, setSavedPins] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    // Initial sync after mount to ensure hydration consistency
    setSavedPins(getSavedPins());
    setSavedIds(getSavedPinIdsSet());

    const unsub = subscribeToSavedPins((newList) => {
      setSavedPins(newList);
      const set = new Set();
      newList.forEach((pin) => {
        if (pin && pin.id !== undefined && pin.id !== null) {
          set.add(pin.id);
          set.add(String(pin.id));
          if (typeof pin.id === 'string' && pin.id.startsWith('pin-')) {
            set.add(pin.id.replace('pin-', ''));
          } else if (typeof pin.id === 'number' || !isNaN(Number(pin.id))) {
            set.add(`pin-${pin.id}`);
          }
        }
      });
      setSavedIds(set);
    });

    return unsub;
  }, []);

  const checkIsSaved = useCallback(
    (pinId) => isPinSaved(pinId, savedIds),
    [savedIds]
  );

  const toggleSave = useCallback((pinOrId, fullPin = null) => {
    return toggleSavePin(pinOrId, fullPin);
  }, []);

  return {
    savedPins,
    savedIds,
    isSaved: checkIsSaved,
    toggleSave,
    savePin,
    unsavePin,
  };
}
