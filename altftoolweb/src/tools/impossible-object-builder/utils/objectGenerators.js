import { v4 as uuidv4 } from 'uuid';

export const generatePenroseTriangle = () => {
  const size = 3;
  const thickness = 0.8;
  const color = '#3b82f6'; 
  
  return [
    {
      id: uuidv4(),
      type: 'beam',
      position: [0, size/2, 0],
      rotation: [0, 0, 0],
      scale: [thickness, size, thickness],
      color: color
    },
    {
      id: uuidv4(),
      type: 'beam',
      position: [size/2, 0, 0],
      rotation: [0, 0, Math.PI / 2],
      scale: [thickness, size, thickness],
      color: color
    },
    {
      id: uuidv4(),
      type: 'beam',
      position: [0, 0, size],
      rotation: [Math.PI / 2, 0, 0],
      scale: [thickness, size, thickness],
      color: color
    }
  ];
};

export const generateImpossibleCube = () => {
    const size = 3;
    const thickness = 0.3;
    const color = '#3b82f6';
    const parts = [];

    parts.push({ id: uuidv4(), type: 'beam', position: [0, -size/2, size/2], rotation: [0, 0, Math.PI/2], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [size/2, -size/2, 0], rotation: [Math.PI/2, 0, 0], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [0, -size/2, -size/2], rotation: [0, 0, Math.PI/2], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [-size/2, -size/2, 0], rotation: [Math.PI/2, 0, 0], scale: [thickness, size, thickness], color });

    parts.push({ id: uuidv4(), type: 'beam', position: [size/2, 0, size/2], rotation: [0, 0, 0], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [-size/2, 0, size/2], rotation: [0, 0, 0], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [-size/2, 0, -size/2], rotation: [0, 0, 0], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [size/2, size/2, -size/2], rotation: [0, 0, 0], scale: [thickness, size, thickness], color });

    parts.push({ id: uuidv4(), type: 'beam', position: [0, size/2, size/2], rotation: [0, 0, Math.PI/2], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [-size/2, size/2, 0], rotation: [Math.PI/2, 0, 0], scale: [thickness, size, thickness], color });
    parts.push({ id: uuidv4(), type: 'beam', position: [0, size/2, -size/2], rotation: [0, 0, Math.PI/2], scale: [thickness, size, thickness], color });

    return parts;
};

export const generatePenroseStairs = () => {
    const color = '#3b82f6';
    const steps = [];
    const size = 4;
    const stepHeight = 0.5;

    // Create a loop of steps
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const x = i - 1.5;
            const z = j - 1.5;
            const height = (i + j) * 0.2;
            
            steps.push({
                id: uuidv4(),
                type: 'stair',
                position: [x, height, z],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                color: color
            });
        }
    }
    return steps;
};
