export const SHAPES = [
  {
    id: "circle",
    label: "Circle",
    icon: "circle",
    category: "2D",
    fields: [
      { key: "radius", label: "Radius (r)", default: 5, min: 0.1 },
    ],
    formulas: [
      { id: "area", label: "Area", formula: "πr²", fn: (v) => Math.PI * v.radius ** 2 },
      { id: "circumference", label: "Circumference", formula: "2πr", fn: (v) => 2 * Math.PI * v.radius },
      { id: "diameter", label: "Diameter", formula: "2r", fn: (v) => 2 * v.radius },
    ],
  },
  {
    id: "rectangle",
    label: "Rectangle",
    icon: "square",
    category: "2D",
    fields: [
      { key: "length", label: "Length (l)", default: 8, min: 0.1 },
      { key: "width", label: "Width (w)", default: 5, min: 0.1 },
    ],
    formulas: [
      { id: "area", label: "Area", formula: "l × w", fn: (v) => v.length * v.width },
      { id: "perimeter", label: "Perimeter", formula: "2(l + w)", fn: (v) => 2 * (v.length + v.width) },
      { id: "diagonal", label: "Diagonal", formula: "√(l² + w²)", fn: (v) => Math.sqrt(v.length ** 2 + v.width ** 2) },
    ],
  },
  {
    id: "triangle",
    label: "Triangle",
    icon: "triangle",
    category: "2D",
    fields: [
      { key: "base", label: "Base (b)", default: 6, min: 0.1 },
      { key: "height", label: "Height (h)", default: 4, min: 0.1 },
    ],
    formulas: [
      { id: "area", label: "Area", formula: "½bh", fn: (v) => 0.5 * v.base * v.height },
      { id: "hypotenuse", label: "Hypotenuse (if right)", formula: "√(b² + h²)", fn: (v) => Math.sqrt(v.base ** 2 + v.height ** 2) },
    ],
  },
  {
    id: "trapezoid",
    label: "Trapezoid",
    icon: "trapezoid",
    category: "2D",
    fields: [
      { key: "a", label: "Side a (a)", default: 6, min: 0.1 },
      { key: "b", label: "Side b (b)", default: 4, min: 0.1 },
      { key: "h", label: "Height (h)", default: 3, min: 0.1 },
    ],
    formulas: [
      { id: "area", label: "Area", formula: "½(a + b)h", fn: (v) => 0.5 * (v.a + v.b) * v.h },
    ],
  },
  {
    id: "parallelogram",
    label: "Parallelogram",
    icon: "parallelogram",
    category: "2D",
    fields: [
      { key: "base", label: "Base (b)", default: 7, min: 0.1 },
      { key: "height", label: "Height (h)", default: 4, min: 0.1 },
    ],
    formulas: [
      { id: "area", label: "Area", formula: "b × h", fn: (v) => v.base * v.height },
      { id: "perimeter", label: "Perimeter", formula: "2(b + h)", fn: (v) => 2 * (v.base + v.height) },
    ],
  },
  {
    id: "ellipse",
    label: "Ellipse",
    icon: "circle",
    category: "2D",
    fields: [
      { key: "a", label: "Semi-major axis (a)", default: 6, min: 0.1 },
      { key: "b", label: "Semi-minor axis (b)", default: 4, min: 0.1 },
    ],
    formulas: [
      { id: "area", label: "Area", formula: "πab", fn: (v) => Math.PI * v.a * v.b },
      { id: "perimeter", label: "Perimeter (approx)", formula: "π[3(a+b) - √((3a+b)(a+3b))]", fn: (v) => Math.PI * (3 * (v.a + v.b) - Math.sqrt((3 * v.a + v.b) * (v.a + 3 * v.b))) },
    ],
  },
  {
    id: "sphere",
    label: "Sphere",
    icon: "circle",
    category: "3D",
    fields: [
      { key: "radius", label: "Radius (r)", default: 5, min: 0.1 },
    ],
    formulas: [
      { id: "volume", label: "Volume", formula: "(4/3)πr³", fn: (v) => (4 / 3) * Math.PI * v.radius ** 3 },
      { id: "surface", label: "Surface Area", formula: "4πr²", fn: (v) => 4 * Math.PI * v.radius ** 2 },
    ],
  },
  {
    id: "cylinder",
    label: "Cylinder",
    icon: "cylinder",
    category: "3D",
    fields: [
      { key: "radius", label: "Radius (r)", default: 4, min: 0.1 },
      { key: "height", label: "Height (h)", default: 7, min: 0.1 },
    ],
    formulas: [
      { id: "volume", label: "Volume", formula: "πr²h", fn: (v) => Math.PI * v.radius ** 2 * v.height },
      { id: "surface", label: "Surface Area", formula: "2πr(r + h)", fn: (v) => 2 * Math.PI * v.radius * (v.radius + v.height) },
    ],
  },
  {
    id: "cone",
    label: "Cone",
    icon: "cone",
    category: "3D",
    fields: [
      { key: "radius", label: "Radius (r)", default: 3, min: 0.1 },
      { key: "height", label: "Height (h)", default: 5, min: 0.1 },
    ],
    formulas: [
      { id: "volume", label: "Volume", formula: "(1/3)πr²h", fn: (v) => (1 / 3) * Math.PI * v.radius ** 2 * v.height },
      { id: "surface", label: "Lateral Surface", formula: "πr√(r² + h²)", fn: (v) => Math.PI * v.radius * Math.sqrt(v.radius ** 2 + v.height ** 2) },
    ],
  },
  {
    id: "rectangular_prism",
    label: "Rectangular Prism",
    icon: "box",
    category: "3D",
    fields: [
      { key: "length", label: "Length (l)", default: 5, min: 0.1 },
      { key: "width", label: "Width (w)", default: 4, min: 0.1 },
      { key: "height", label: "Height (h)", default: 3, min: 0.1 },
    ],
    formulas: [
      { id: "volume", label: "Volume", formula: "l × w × h", fn: (v) => v.length * v.width * v.height },
      { id: "surface", label: "Surface Area", formula: "2(lw + lh + wh)", fn: (v) => 2 * (v.length * v.width + v.length * v.height + v.width * v.height) },
      { id: "diagonal", label: "Space Diagonal", formula: "√(l² + w² + h²)", fn: (v) => Math.sqrt(v.length ** 2 + v.width ** 2 + v.height ** 2) },
    ],
  },
];
