import { useCallback } from 'react';
import * as THREE from 'three';

export const useObjectSnap = (gridSize = 0.5) => {
  const snapToGrid = useCallback((position) => {
    return [
      Math.round(position[0] / gridSize) * gridSize,
      Math.round(position[1] / gridSize) * gridSize,
      Math.round(position[2] / gridSize) * gridSize
    ];
  }, [gridSize]);

  return { snapToGrid };
};
