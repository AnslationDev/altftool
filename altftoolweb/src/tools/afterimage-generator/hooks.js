// src/tools/afterimage-generator/hooks.js
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getComplementaryColor,
  loadImage,
  resizeImageToCanvas,
  generateNegativeImage,
  createTimer,
  drawShapeOnCanvas
} from './utils';

export const useAfterimage = ({
  mode,
  selectedColor,
  selectedShape,
  shapeSize,
  backgroundColor,
  uploadedImage,
  intensity,
  onAfterimageGenerated,
}) => {
  const [isStaring, setIsStaring] = useState(false);
  const [stage, setStage] = useState('prepare'); // 'prepare', 'stare', 'observe'
  const [timerDuration, setTimerDuration] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);

  const generateAfterimage = useCallback(async () => {
    setStage('observe');
    if (mode === 'color') {
      const complementaryColor = getComplementaryColor(selectedColor, intensity.inversionIntensity || 1);
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw inverted shape on background
      drawShapeOnCanvas(ctx, selectedShape, canvas.width / 2, canvas.height / 2, shapeSize * 1.8, complementaryColor);

      const imageData = canvas.toDataURL();
      onAfterimageGenerated(imageData);
    } else if (mode === 'image' && uploadedImage) {
      try {
        const img = await loadImage(uploadedImage);
        const imageData = await resizeImageToCanvas(img, 800, 600);
        const negativeImageData = generateNegativeImage(imageData, intensity.inversionIntensity || 1);

        const canvas = document.createElement('canvas');
        canvas.width = negativeImageData.width;
        canvas.height = negativeImageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(negativeImageData, 0, 0);
        const dataUrl = canvas.toDataURL();
        onAfterimageGenerated(dataUrl);
      } catch (error) {
        console.error('Error generating afterimage:', error);
      }
    }
  }, [mode, selectedColor, selectedShape, shapeSize, backgroundColor, uploadedImage, intensity, onAfterimageGenerated]);

  const startStare = useCallback(() => {
    if (isStaring) return;

    setTimeLeft(timerDuration);
    setIsStaring(true);
    setStage('stare');

    timerRef.current = createTimer(
      timerDuration,
      (remaining) => {
        setTimeLeft(remaining > 0 ? remaining : 0);
      },
      async () => {
        setIsStaring(false);
        await generateAfterimage();
      }
    );

    timerRef.current.start();
  }, [timerDuration, isStaring, generateAfterimage]);

  const stopStare = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.stop();
    }
    setIsStaring(false);
    setStage('prepare');
    setTimeLeft(timerDuration);
  }, [timerDuration]);

  const resetStare = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.stop();
    }
    setIsStaring(false);
    setStage('prepare');
    setTimeLeft(timerDuration);
  }, [timerDuration]);

  return {
    isStaring,
    stage,
    setStage,
    timerDuration,
    setTimerDuration,
    timeLeft,
    startStare,
    stopStare,
    resetStare,
    generateAfterimage,
  };
};

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return { isFullscreen, toggleFullscreen, exitFullscreen };
};
