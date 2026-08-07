import { renderGlasses as renderGlassesReal } from '../../_shared/render/glassesRenderer.js';

export const GLASSES_STYLES = [
  { id: 'rectangle', name: 'Rectangle', category: 'classic' },
  { id: 'square', name: 'Square', category: 'classic' },
  { id: 'round', name: 'Round', category: 'classic' },
  { id: 'oval', name: 'Oval', category: 'classic' },
  { id: 'aviator', name: 'Aviator', category: 'retro' },
  { id: 'wayfarer', name: 'Wayfarer', category: 'retro' },
  { id: 'cat-eye', name: 'Cat Eye', category: 'fashion' },
  { id: 'clubmaster', name: 'Clubmaster', category: 'retro' },
  { id: 'rimless', name: 'Rimless', category: 'minimal' },
  { id: 'half-rim', name: 'Half Rim', category: 'minimal' },
  { id: 'sports', name: 'Sports', category: 'sport' },
  { id: 'reading', name: 'Reading', category: 'classic' },
  { id: 'luxury', name: 'Luxury', category: 'fashion' },
  { id: 'fashion', name: 'Fashion', category: 'fashion' },
  { id: 'gaming', name: 'Gaming', category: 'sport' },
  { id: 'blue-light', name: 'Blue Light', category: 'minimal' },
  { id: 'sunglasses', name: 'Sunglasses', category: 'sun' },
  { id: 'oversized', name: 'Oversized', category: 'fashion' },
  { id: 'retro', name: 'Retro', category: 'retro' },
  { id: 'kids', name: 'Kids', category: 'classic' },
];

export const LENS_COLORS = [
  { name: 'Clear', value: 'rgba(255,255,255,0.15)' },
  { name: 'Black', value: 'rgba(0,0,0,0.8)' },
  { name: 'Transparent', value: 'rgba(255,255,255,0.05)' },
  { name: 'Blue', value: 'rgba(59,130,246,0.3)' },
  { name: 'Brown', value: 'rgba(139,90,43,0.4)' },
  { name: 'Green', value: 'rgba(34,197,94,0.3)' },
  { name: 'Gray', value: 'rgba(156,163,175,0.4)' },
  { name: 'Purple', value: 'rgba(168,85,247,0.3)' },
  { name: 'Pink', value: 'rgba(236,72,153,0.3)' },
  { name: 'Yellow', value: 'rgba(234,179,8,0.3)' },
  { name: 'Mirror', value: 'rgba(192,192,192,0.5)' },
  { name: 'Gradient', value: 'gradient' },
];

export const FRAME_COLORS = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Silver', value: '#c0c0c0' },
  { name: 'Gold', value: '#d4a843' },
  { name: 'Brown', value: '#5c3a1e' },
  { name: 'White', value: '#f0f0f0' },
  { name: 'Transparent', value: 'rgba(200,200,200,0.3)' },
  { name: 'Custom', value: '' },
];

export function renderGlasses(ctx, style, faceData, options) {
  const enriched = faceData.hairline || faceData.eyeCenter ? faceData : null;
  const face = enriched || legacyToFace(faceData, options);
  renderGlassesReal(ctx, style, face, options);
}

function legacyToFace(faceData, options) {
  const { box, landmarks } = faceData;
  const leftEye = landmarks?.leftEye || [];
  const rightEye = landmarks?.rightEye || [];
  const le = {
    x: leftEye[3]?.x || box.x + box.width * 0.4,
    y: leftEye[1]?.y || box.y + box.height * 0.4,
  };
  const re = {
    x: rightEye[0]?.x || box.x + box.width * 0.6,
    y: rightEye[1]?.y || box.y + box.height * 0.4,
  };
  const eyeCenter = midpoint(le, re);
  return {
    box,
    landmarks,
    eyeCenter,
    leftEye: le,
    rightEye: re,
    eyeDistance: dist(le, re),
    noseTip: landmarks?.noseTip?.[2] || { x: eyeCenter.x, y: eyeCenter.y + box.height * 0.1 },
    pose: { roll: 0, yaw: 0, pitch: 0 },
    faceShape: 'Oval',
    lighting: null,
    jawWidth: box.width * 0.85,
    foreheadWidth: box.width,
    faceWidth: box.width,
    faceHeight: box.height,
  };
}
