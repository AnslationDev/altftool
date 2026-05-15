import { useState, useCallback } from 'react';

export const useIllusionMode = () => {
  const [isIllusionMode, setIsIllusionMode] = useState(true);

  const toggleMode = useCallback(() => {
    setIsIllusionMode(prev => !prev);
  }, []);

  return { isIllusionMode, setIsIllusionMode, toggleMode };
};
