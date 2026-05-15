import * as THREE from 'three';

export const calculateSnapPoint = (point, gridSize = 0.5) => {
  return new THREE.Vector3(
    Math.round(point.x / gridSize) * gridSize,
    Math.round(point.y / gridSize) * gridSize,
    Math.round(point.z / gridSize) * gridSize
  );
};

export const getBoundingBox = (object) => {
  const box = new THREE.Box3().setFromObject(object);
  return box;
};

export const getCenter = (object) => {
  const box = getBoundingBox(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
};

export const createBoxGeometry = (width, height, depth) => {
  return new THREE.BoxGeometry(width, height, depth);
};

export const createCylinderGeometry = (radiusTop, radiusBottom, height, radialSegments) => {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
};
