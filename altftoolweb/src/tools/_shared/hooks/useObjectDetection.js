"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

let model = null;
let modelLoading = false;
let loadPromise = null;

async function ensureModel() {
  if (model) return model;
  if (loadPromise) return loadPromise;
  modelLoading = true;
  loadPromise = (async () => {
    try {
      await tf.ready();
      const cocossd = await import('@tensorflow-models/coco-ssd');
      model = await cocossd.load({ base: 'lite_mobilenet_v2' });
      return model;
    } catch (err) {
      modelLoading = false;
      loadPromise = null;
      throw err;
    }
  })();
  return loadPromise;
}

export function useObjectDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detections, setDetections] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoadingState, setModelLoadingState] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const loadModel = useCallback(async () => {
    setModelLoadingState(true);
    setError(null);
    try {
      await ensureModel();
      if (mountedRef.current) setModelReady(true);
    } catch (err) {
      if (mountedRef.current) setError('Failed to load object detection model. Please refresh and try again.');
    } finally {
      if (mountedRef.current) setModelLoadingState(false);
    }
  }, []);

  const detect = useCallback(async (image, minConfidence = 0.4) => {
    setLoading(true);
    setError(null);
    setDetections(null);
    const startTime = performance.now();
    try {
      const m = await ensureModel();
      const predictions = await m.detect(image);
      const detectionTime = Math.round(performance.now() - startTime);

      const filtered = predictions
        .filter(p => p.score >= minConfidence)
        .map((p, i) => ({
          id: i,
          class: p.class,
          score: Math.round(p.score * 100),
          bbox: p.bbox,
          x: p.bbox[0], y: p.bbox[1],
          width: p.bbox[2], height: p.bbox[3],
        }));

      const categories = {};
      filtered.forEach(d => {
        if (!categories[d.class]) categories[d.class] = { count: 0, scores: [] };
        categories[d.class].count++;
        categories[d.class].scores.push(d.score);
      });

      const result = {
        total: filtered.length,
        categories: Object.entries(categories).map(([name, data]) => ({
          name,
          count: data.count,
          avgConfidence: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        })),
        detections: filtered,
        detectionTime,
      };

      if (mountedRef.current) setDetections(result);
      return result;
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Object detection failed.');
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDetections(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, detections, modelReady, modelLoadingState, loadModel, detect, reset };
}
