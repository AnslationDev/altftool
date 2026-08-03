"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getLikedPinIds,
  isPinLiked,
  togglePinLike,
  subscribeToLikedPins,
} from "./likedPinsStore";

export function useLikedPins() {
  const [likedIds, setLikedIds] = useState(new Set());

  useEffect(() => {
    // Sync after mount on client to avoid hydration mismatch
    setLikedIds(getLikedPinIds());

    const unsub = subscribeToLikedPins((newSet) => {
      setLikedIds(newSet);
    });

    return unsub;
  }, []);

  const checkIsLiked = useCallback(
    (pinId) => isPinLiked(pinId, likedIds),
    [likedIds]
  );

  const toggleLike = useCallback(async (pinId, currentLikesCount = 0, onRollback = null) => {
    return await togglePinLike(pinId, currentLikesCount, onRollback);
  }, []);

  return {
    likedIds,
    isLiked: checkIsLiked,
    toggleLike,
  };
}
