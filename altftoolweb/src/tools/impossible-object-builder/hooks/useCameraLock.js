import { useState, useCallback } from 'react';

export const useCameraLock = (initialState = true) => {
  const [isLocked, setIsLocked] = useState(initialState);

  const toggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

  return { isLocked, setIsLocked, toggleLock };
};
