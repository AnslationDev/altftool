export const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'pg', label: 'PG' },
  { id: 'office', label: 'Office' },
  { id: 'house', label: 'House' },
];

export const ROOMS = [
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'living', label: 'Hall/Living Room' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'parking', label: 'Parking Area' },
];

export const CHECKLIST_TEMPLATES = {
  door: [
    { id: 'door_lock', text: 'Main door lock functioning correctly', completed: false, status: 'pending' },
    { id: 'door_hinge', text: 'Door hinges are stable and quiet', completed: false, status: 'pending' },
    { id: 'peephole', text: 'Peephole is clear and functional', completed: false, status: 'pending' },
  ],
  window: [
    { id: 'window_latch', text: 'Window latches work and lock securely', completed: false, status: 'pending' },
    { id: 'window_mesh', text: 'Mosquito meshes are intact', completed: false, status: 'pending' },
    { id: 'window_pane', text: 'Glass panes have no cracks', completed: false, status: 'pending' },
  ],
  fire_safety: [
    { id: 'smoke_detector', text: 'Smoke detectors are installed and working', completed: false, status: 'pending' },
    { id: 'fire_extinguisher', text: 'Fire extinguisher is accessible and valid', completed: false, status: 'pending' },
    { id: 'emergency_exit', text: 'Emergency exits are clear and accessible', completed: false, status: 'pending' },
  ],
  electrical: [
    { id: 'switches', text: 'All switches and sockets are working', completed: false, status: 'pending' },
    { id: 'wiring', text: 'No exposed or frayed wiring', completed: false, status: 'pending' },
    { id: 'appliances', text: 'Appliances (if provided) are tested', completed: false, status: 'pending' },
  ],
  plumbing: [
    { id: 'taps', text: 'Taps have no leaks', completed: false, status: 'pending' },
    { id: 'drains', text: 'Drains are clear and not clogged', completed: false, status: 'pending' },
    { id: 'geyser', text: 'Geyser/Water heater is working', completed: false, status: 'pending' },
  ],
  internet: [
    { id: 'wifi_speed', text: 'WiFi speed is as promised', completed: false, status: 'pending' },
    { id: 'router_location', text: 'Router is in a central location', completed: false, status: 'pending' },
  ]
};

export const INITIAL_DATA = {
  property: {
    name: '',
    type: 'apartment',
    moveInDate: '',
    address: '',
    landlord: ''
  },
  checklist: CHECKLIST_TEMPLATES,
  roomInspections: ROOMS.reduce((acc, room) => {
    acc[room.id] = {
      tasks: [],
      notes: '',
      images: []
    };
    return acc;
  }, {}),
  notes: [],
  deadlines: []
};

export const saveChecklistData = (data) => {
  localStorage.setItem('renter_security_checklist_data', JSON.stringify(data));
};

export const loadChecklistData = () => {
  const saved = localStorage.getItem('renter_security_checklist_data');
  return saved ? JSON.parse(saved) : INITIAL_DATA;
};

export const calculateProgress = (checklist) => {
  let totalTasks = 0;
  let completedTasks = 0;

  Object.values(checklist).forEach(category => {
    category.forEach(task => {
      totalTasks++;
      if (task.completed) completedTasks++;
    });
  });

  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
};
