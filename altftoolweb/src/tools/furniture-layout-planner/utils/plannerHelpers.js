export const ROOM_TYPES = [
  { id: 'bedroom', label: 'Bedroom', icon: 'Bed' },
  { id: 'living', label: 'Living Room', icon: 'Sofa' },
  { id: 'office', label: 'Office', icon: 'Briefcase' },
  { id: 'kitchen', label: 'Kitchen', icon: 'Utensils' },
  { id: 'study', label: 'Study Room', icon: 'Book' },
];

export const FURNITURE_TYPES = [
  { id: 'bed', label: 'Bed', width: 150, height: 200, color: '#3b82f6', icon: 'Bed' },
  { id: 'sofa', label: 'Sofa', width: 180, height: 90, color: '#10b981', icon: 'Sofa' },
  { id: 'chair', label: 'Chair', width: 50, height: 50, color: '#f59e0b', icon: 'Armchair' },
  { id: 'table', label: 'Table', width: 120, height: 80, color: '#8b5cf6', icon: 'Table' },
  { id: 'wardrobe', label: 'Wardrobe', width: 100, height: 60, color: '#ef4444', icon: 'Columns2' },
  { id: 'tv_unit', label: 'TV Unit', width: 140, height: 40, color: '#ec4899', icon: 'Tv' },
  { id: 'shelf', label: 'Shelf', width: 80, height: 30, color: '#06b6d4', icon: 'Layers' },
  { id: 'desk', label: 'Desk', width: 120, height: 60, color: '#f97316', icon: 'Laptop' },
];

export const INITIAL_TASKS = [
  { id: 1, text: 'Define room dimensions', completed: true },
  { id: 2, text: 'Select furniture pieces', completed: false },
  { id: 3, text: 'Arrange layout visually', completed: false },
  { id: 4, text: 'Check walking space', completed: false },
  { id: 5, text: 'Finalize and save', completed: false },
];

export const calculateArea = (width, height) => (width * height) / 10000; // in sqm if dims are cm

export const detectOverlap = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

export const saveLayouts = (layouts) => {
  localStorage.setItem('furniture_planner_layouts', JSON.stringify(layouts));
};

export const loadLayouts = () => {
  const saved = localStorage.getItem('furniture_planner_layouts');
  return saved ? JSON.parse(saved) : [];
};
