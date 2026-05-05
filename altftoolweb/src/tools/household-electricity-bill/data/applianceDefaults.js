
export const roomCategories = [
  "Kitchen",
  "Bedroom",
  "Hall",
  "Bathroom",
  "Outdoor",
  "Other",
];

export const quickApplianceTemplates = [
  {
    name: "AC",
    wattage: 1500,
    iconKey: "ac",
    subTypes: [
      { name: "1.5 Ton Split (5 Star)", wattage: 1200 },
      { name: "1.5 Ton Split (3 Star)", wattage: 1600 },
      { name: "1 Ton Split", wattage: 1000 },
      { name: "Window AC", wattage: 1800 },
    ],
  },
  {
    name: "Fridge",
    wattage: 180,
    iconKey: "fridge",
    subTypes: [
      { name: "Double Door (300L+)", wattage: 250 },
      { name: "Single Door (190L)", wattage: 150 },
      { name: "Side-by-Side", wattage: 400 },
    ],
  },
  {
    name: "Fan",
    wattage: 75,
    iconKey: "fan",
    subTypes: [
      { name: "Normal Ceiling Fan", wattage: 75 },
      { name: "BLDC Energy Saver", wattage: 30 },
      { name: "Table Fan", wattage: 50 },
      { name: "Exhaust Fan", wattage: 40 },
    ],
  },
  {
    name: "TV",
    wattage: 120,
    iconKey: "tv",
    subTypes: [
      { name: "LED TV (43-55\")", wattage: 100 },
      { name: "LED TV (32\")", wattage: 50 },
      { name: "OLED TV (65\")", wattage: 180 },
    ],
  },
  {
    name: "Lights",
    wattage: 40,
    iconKey: "lights",
    subTypes: [
      { name: "LED Bulb (9W)", wattage: 9 },
      { name: "LED Tube (20W)", wattage: 20 },
      { name: "CFL Bulb", wattage: 25 },
      { name: "Incandescent", wattage: 60 },
    ],
  },
  {
    name: "Washing Machine",
    wattage: 500,
    iconKey: "washing",
    subTypes: [
      { name: "Top Load", wattage: 400 },
      { name: "Front Load", wattage: 600 },
      { name: "Semi-Automatic", wattage: 350 },
    ],
  },
  {
    name: "Laptop/PC",
    wattage: 65,
    iconKey: "laptop",
    subTypes: [
      { name: "Laptop", wattage: 65 },
      { name: "Desktop PC", wattage: 250 },
      { name: "Gaming PC", wattage: 500 },
    ],
  },
  {
    name: "Geyser",
    wattage: 2000,
    iconKey: "geyser",
    subTypes: [
      { name: "Storage Geyser (15L)", wattage: 2000 },
      { name: "Instant Geyser", wattage: 3000 },
    ],
  },
];