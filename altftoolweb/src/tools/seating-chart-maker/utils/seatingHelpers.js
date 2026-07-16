export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'conference', label: 'Conference' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'meeting', label: 'Office Meeting' },
  { id: 'party', label: 'Party' },
  { id: 'banquet', label: 'Banquet' }
];

export const TABLE_TYPES = [
  { id: 'round', label: 'Round Table', defaultSeats: 8, icon: 'Circle' },
  { id: 'rectangle', label: 'Rectangular', defaultSeats: 10, icon: 'Square' },
  { id: 'classroom', label: 'Classroom Row', defaultSeats: 4, icon: 'Minus' },
  { id: 'banquet', label: 'Banquet Style', defaultSeats: 12, icon: 'Layout' }
];

export const GUEST_CATEGORIES = ['Family', 'Friend', 'Staff', 'VIP', 'Other'];

export const calculateSeatPositions = (type, seatsCount, tableWidth, tableHeight) => {
  const positions = [];
  const padding = 30; // Distance from table edge

  if (type === 'round') {
    const radius = Math.min(tableWidth, tableHeight) / 2 + padding;
    for (let i = 0; i < seatsCount; i++) {
      const angle = (i / seatsCount) * 2 * Math.PI;
      positions.push({
        x: tableWidth / 2 + radius * Math.cos(angle),
        y: tableHeight / 2 + radius * Math.sin(angle),
        angle: (angle * 180) / Math.PI
      });
    }
  } else if (type === 'rectangle' || type === 'banquet') {
    const seatsPerLongSide = Math.ceil(seatsCount / 2.5);
    const seatsPerShortSide = Math.floor((seatsCount - seatsPerLongSide * 2) / 2);
    
    // This is a simplified version. For now, let's just distribute around the perimeter.
    // Long sides (top & bottom)
    for (let i = 0; i < seatsPerLongSide; i++) {
      const x = (i + 0.5) * (tableWidth / seatsPerLongSide);
      positions.push({ x, y: -padding, angle: -90 }); // Top
      if (positions.length < seatsCount) {
        positions.push({ x, y: tableHeight + padding, angle: 90 }); // Bottom
      }
    }
    // Short sides (left & right)
    const remaining = seatsCount - positions.length;
    const halfRemaining = Math.ceil(remaining / 2);
    for (let i = 0; i < halfRemaining; i++) {
        const y = (i + 0.5) * (tableHeight / halfRemaining);
        if (positions.length < seatsCount) positions.push({ x: -padding, y, angle: 180 }); // Left
        if (positions.length < seatsCount) positions.push({ x: tableWidth + padding, y, angle: 0 }); // Right
    }
  } else if (type === 'classroom') {
    // Single row
    for (let i = 0; i < seatsCount; i++) {
      const x = (i + 0.5) * (tableWidth / seatsCount);
      positions.push({ x, y: tableHeight + padding, angle: 90 });
    }
  }

  return positions;
};

const STORAGE_KEY = 'altftools_seating_charts';

export const loadSavedCharts = () => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveChart = (chart) => {
  const charts = loadSavedCharts();
  const index = charts.findIndex(c => c.id === chart.id);
  if (index >= 0) {
    charts[index] = { ...chart, lastModified: new Date().toISOString() };
  } else {
    charts.push({ ...chart, lastModified: new Date().toISOString() });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
  return charts;
};

export const deleteChart = (id) => {
  const charts = loadSavedCharts().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
  return charts;
};
