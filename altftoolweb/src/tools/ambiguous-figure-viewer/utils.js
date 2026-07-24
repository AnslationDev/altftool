// src/tools/ambiguous-figure-viewer/utils.js

const svgText = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const figureSvg = ({ id, title, subtitle, variant }) => {
  const patterns = {
    profiles: `
      <path d="M182 126c-48 20-72 62-70 120 22-20 46-28 72-23 25 5 47 19 68 42 9-38 1-72-23-101-12-15-28-27-47-38Z" class="soft"/>
      <path d="M538 126c48 20 72 62 70 120-22-20-46-28-72-23-25 5-47 19-68 42-9-38-1-72 23-101 12-15 28-27 47-38Z" class="soft"/>
      <path d="M342 118c-28 53-29 112-4 178h44c25-66 24-125-4-178-9-17-27-17-36 0Z" class="solid"/>
      <circle cx="248" cy="182" r="8" class="dot"/>
      <circle cx="472" cy="182" r="8" class="dot"/>
    `,
    cube: `
      <path d="M240 134h190l78 70v168H316l-76-70V134Z" class="soft"/>
      <path d="M240 134l76 70h192M316 204v168M430 134l78 70M240 302h190l78 70M430 134v168l78 70" class="line"/>
      <path d="M316 204h192" class="line accent"/>
      <path d="M240 134v168l76 70" class="line accent"/>
    `,
    dancer: `
      <circle cx="360" cy="206" r="31" class="solid"/>
      <path d="M358 238c-45 33-67 77-67 133h45c6-45 24-76 54-95l-32-38Z" class="soft"/>
      <path d="M367 240c44 16 84 11 121-15l-22-39c-33 16-62 17-88 3l-11 51Z" class="soft alt"/>
      <path d="M365 281c28 31 53 67 73 108" class="line"/>
      <path d="M356 286c-38 18-69 47-94 86" class="line"/>
      <path d="M194 246c88-98 244-98 332 0M224 284c72 66 199 66 271 0" class="line faint"/>
    `,
    portrait: `
      <path d="M412 102c-75 10-132 58-154 136-14 50-7 92 23 126 55-4 98-25 130-62-32-16-50-39-55-70 33 24 72 35 118 33 28-67 8-121-62-163Z" class="soft"/>
      <path d="M273 180c60-38 113-42 159-13-30 3-53 17-70 41-21 31-20 69 2 116-48-18-80-48-97-88-7-18-5-37 6-56Z" class="solid"/>
      <path d="M354 204c-32 52-53 96-63 132 42 1 84-8 126-28" class="line"/>
      <circle cx="338" cy="202" r="8" class="dot"/>
    `,
    stairs: `
      <path d="M188 302l90-122h252l-90 122H188Z" class="soft"/>
      <path d="M278 180v188M350 180v188M422 180v188M530 180v188M188 302h252l90-122M226 250h252M263 202h252" class="line"/>
      <path d="M188 302l90 66h252l-90-66" class="line accent"/>
    `,
    vanity: `
      <circle cx="360" cy="226" r="104" class="soft"/>
      <circle cx="323" cy="210" r="25" class="cut"/>
      <circle cx="397" cy="210" r="25" class="cut"/>
      <path d="M310 298c30 20 70 20 100 0" class="line"/>
      <path d="M260 328c64 52 136 52 200 0M250 150c42-62 178-62 220 0" class="line faint"/>
      <rect x="292" y="134" width="136" height="150" rx="68" class="frame"/>
    `,
    cylinder: `
      <ellipse cx="302" cy="174" rx="98" ry="42" class="soft"/>
      <path d="M204 174v154c0 24 44 42 98 42s98-18 98-42V174" class="soft"/>
      <ellipse cx="302" cy="328" rx="98" ry="42" class="line-fill"/>
      <rect x="424" y="138" width="112" height="210" rx="20" class="soft alt"/>
      <path d="M424 184h112M424 302h112" class="line"/>
    `,
    book: `
      <path d="M356 138c-64-34-122-26-174 24v188c52-50 110-58 174-24V138Z" class="soft"/>
      <path d="M364 138c64-34 122-26 174 24v188c-52-50-110-58-174-24V138Z" class="soft alt"/>
      <path d="M360 138v188M214 190c43-22 85-25 126-8M214 240c43-22 85-25 126-8M506 190c-43-22-85-25-126-8M506 240c-43-22-85-25-126-8" class="line faint"/>
    `,
    trident: `
      <path d="M190 168h202c30 0 54 24 54 54v16" class="line thick"/>
      <path d="M190 236h274" class="line thick"/>
      <path d="M190 304h202c30 0 54-24 54-54v-16" class="line thick"/>
      <path d="M446 222h86M446 250h86" class="line thick accent"/>
      <circle cx="190" cy="168" r="22" class="soft"/><circle cx="190" cy="236" r="22" class="soft"/><circle cx="190" cy="304" r="22" class="soft"/>
    `,
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 450" role="img" aria-labelledby="${id}-title">
      <title id="${id}-title">${svgText(title)}</title>
      <defs>
        <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#eef5ff"/>
          <stop offset="0.55" stop-color="#f8fbff"/>
          <stop offset="1" stop-color="#dbeafe"/>
        </linearGradient>
        <radialGradient id="${id}-glow" cx="50%" cy="40%" r="62%">
          <stop offset="0" stop-color="#60a5fa" stop-opacity="0.32"/>
          <stop offset="1" stop-color="#60a5fa" stop-opacity="0"/>
        </radialGradient>
        <filter id="${id}-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.16"/>
        </filter>
        <style>
          .bg{fill:url(#${id}-bg)}
          .grid{stroke:#bfdbfe;stroke-width:1;opacity:.38}
          .soft{fill:#dbeafe;stroke:#2563eb;stroke-width:7;filter:url(#${id}-shadow)}
          .soft.alt{fill:#e0f2fe}
          .solid{fill:#2563eb;stroke:#1d4ed8;stroke-width:7;filter:url(#${id}-shadow)}
          .cut{fill:#f8fbff;stroke:#93c5fd;stroke-width:5}
          .dot{fill:#1e40af}
          .frame{fill:none;stroke:#1d4ed8;stroke-width:8;opacity:.75}
          .line{fill:none;stroke:#1d4ed8;stroke-width:8;stroke-linecap:round;stroke-linejoin:round}
          .line.thick{stroke-width:20}
          .line.accent{stroke:#0ea5e9}
          .line.faint{stroke:#64748b;opacity:.55;stroke-width:5}
          .line-fill{fill:#dbeafe;stroke:#1d4ed8;stroke-width:7}
          .label{font-family:Inter,Manrope,Arial,sans-serif;fill:#0f172a;font-weight:800}
          .caption{font-family:Inter,Manrope,Arial,sans-serif;fill:#64748b;font-weight:700}
        </style>
      </defs>
      <rect class="bg" width="720" height="450" rx="0"/>
      <rect width="720" height="450" fill="url(#${id}-glow)"/>
      <g opacity=".7">
        ${Array.from({ length: 13 }, (_, index) => `<path class="grid" d="M${index * 60} 0v450"/>`).join("")}
        ${Array.from({ length: 8 }, (_, index) => `<path class="grid" d="M0 ${index * 60}h720"/>`).join("")}
      </g>
      <g transform="translate(0 12)">
        ${patterns[variant] || patterns.profiles}
      </g>
      <rect x="34" y="34" width="652" height="382" rx="32" fill="none" stroke="#2563eb" stroke-opacity=".16" stroke-width="2"/>
      <text x="42" y="392" class="label" font-size="28">${svgText(title)}</text>
      <text x="42" y="420" class="caption" font-size="15">${svgText(subtitle)}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const ILLUSIONS = [
  {
    id: "duck-rabbit",
    title: "Duck / Rabbit",
    description: "One of the most famous ambiguous figures. Can you see both the duck looking left and the rabbit looking right?",
    image: figureSvg({ id: "duck-rabbit", title: "Duck / Rabbit", subtitle: "Two meanings in one outline", variant: "profiles" }),
    difficulty: "Beginner",
    perceptionType: "Gestalt Switching",
    interpretations: [
      { id: "duck", label: "Duck", hint: "Look for the beak pointing to the left." },
      { id: "rabbit", label: "Rabbit", hint: "Look for the ears pointing to the left." },
    ],
  },
  {
    id: "rubin-vase",
    title: "Rubin Vase",
    description: "A classic figure-ground illusion. Do you see a vase in the center or two faces looking at each other?",
    image: figureSvg({ id: "rubin-vase", title: "Rubin Vase", subtitle: "Vase or two faces?", variant: "profiles" }),
    difficulty: "Beginner",
    perceptionType: "Figure-Ground",
    interpretations: [
      { id: "vase", label: "Vase", hint: "Focus on the light shape in the center." },
      { id: "faces", label: "Faces", hint: "Focus on the side profiles." },
    ],
  },
  {
    id: "necker-cube",
    title: "Necker Cube",
    description: "A wireframe cube with no depth cues. Your brain will spontaneously switch which face is in the front.",
    image: figureSvg({ id: "necker-cube", title: "Necker Cube", subtitle: "Which face is in front?", variant: "cube" }),
    difficulty: "Intermediate",
    perceptionType: "Bistable Perception",
    interpretations: [
      { id: "front-down", label: "Facing Down", hint: "Imagine the lower-left square is the front." },
      { id: "front-up", label: "Facing Up", hint: "Imagine the upper-right square is the front." },
    ],
  },
  {
    id: "spinning-dancer",
    title: "Spinning Dancer",
    description: "A kinetic bistable illusion. Is she spinning clockwise or counter-clockwise? It depends on your perspective.",
    image: figureSvg({ id: "spinning-dancer", title: "Spinning Dancer", subtitle: "Clockwise or counter?", variant: "dancer" }),
    difficulty: "Advanced",
    perceptionType: "Kinetic Depth",
    interpretations: [
      { id: "clockwise", label: "Clockwise", hint: "Imagine you are looking from above." },
      { id: "counter", label: "Counter-Clockwise", hint: "Imagine you are looking from below." },
    ],
  },
  {
    id: "old-young",
    title: "Old Woman / Young Girl",
    description: "Also known as My Wife and My Mother-in-Law. A legendary illusion where a young woman's necklace is an old woman's mouth.",
    image: figureSvg({ id: "old-young", title: "Old / Young", subtitle: "Age changes with focus", variant: "portrait" }),
    difficulty: "Intermediate",
    perceptionType: "Gestalt Switching",
    interpretations: [
      { id: "young", label: "Young Girl", hint: "Look for the chin and the ear of a woman looking away." },
      { id: "old", label: "Old Woman", hint: "Look for the large nose and the mouth in the necklace area." },
    ],
  },
  {
    id: "eskimo-indian",
    title: "Eskimo / Indian",
    description: "A clever profile illusion. Do you see a figure entering a cave or the profile of a Native American head?",
    image: figureSvg({ id: "eskimo-indian", title: "Figure / Profile", subtitle: "Cave scene or face?", variant: "portrait" }),
    difficulty: "Intermediate",
    perceptionType: "Figure-Ground",
    interpretations: [
      { id: "eskimo", label: "Figure", hint: "Look for the figure walking into the dark opening." },
      { id: "indian", label: "Profile", hint: "The entire dark area forms a face looking left." },
    ],
  },
  {
    id: "schroder-stairs",
    title: "Schroder Stairs",
    description: "An ambiguous drawing of a staircase that can be perceived either as a staircase leading up or down.",
    image: figureSvg({ id: "schroder-stairs", title: "Schroder Stairs", subtitle: "Upstairs or downstairs?", variant: "stairs" }),
    difficulty: "Intermediate",
    perceptionType: "Perspective Shift",
    interpretations: [
      { id: "upstairs", label: "Upstairs", hint: "See the top surface as the steps." },
      { id: "downstairs", label: "Downstairs", hint: "See the bottom surface as the steps." },
    ],
  },
  {
    id: "all-is-vanity",
    title: "All is Vanity",
    description: "A famous memento mori illusion. A woman at a vanity table forms the shape of a large human skull.",
    image: figureSvg({ id: "all-is-vanity", title: "All is Vanity", subtitle: "Portrait or skull?", variant: "vanity" }),
    difficulty: "Advanced",
    perceptionType: "Holistic Perception",
    interpretations: [
      { id: "woman", label: "Woman", hint: "Focus on the lady looking into her mirror." },
      { id: "skull", label: "Skull", hint: "Step back and see the entire composition as a head." },
    ],
  },
  {
    id: "face-candlestick",
    title: "Face / Candlestick",
    description: "A variation of the Rubin Vase. Do you see two faces in silhouette or an ornate candlestick in the middle?",
    image: figureSvg({ id: "face-candlestick", title: "Face / Candlestick", subtitle: "Silhouette or object?", variant: "profiles" }),
    difficulty: "Beginner",
    perceptionType: "Figure-Ground",
    interpretations: [
      { id: "faces", label: "Faces", hint: "Look at the shapes on the left and right." },
      { id: "candlestick", label: "Candlestick", hint: "Focus on the light shape in the center." },
    ],
  },
  {
    id: "ambiguous-cylinder",
    title: "Ambiguous Cylinder",
    description: "A 3D illusion where an object looks circular from one angle but rectangular in a mirror reflection.",
    image: figureSvg({ id: "ambiguous-cylinder", title: "Ambiguous Cylinder", subtitle: "Circle or rectangle?", variant: "cylinder" }),
    difficulty: "Advanced",
    perceptionType: "Geometric Illusion",
    interpretations: [
      { id: "circle", label: "Circular", hint: "Look at the object directly from the front." },
      { id: "square", label: "Square", hint: "Look at the reflection in the mirror." },
    ],
  },
  {
    id: "mach-book",
    title: "Bistable Book",
    description: "Also known as the Mach Book. An open book that can appear to be facing towards you or away from you.",
    image: figureSvg({ id: "mach-book", title: "Bistable Book", subtitle: "Opening in or out?", variant: "book" }),
    difficulty: "Intermediate",
    perceptionType: "Perspective Shift",
    interpretations: [
      { id: "open-towards", label: "Opening Towards", hint: "Imagine the spine is closer to you." },
      { id: "open-away", label: "Opening Away", hint: "Imagine the spine is further away." },
    ],
  },
  {
    id: "impossible-trident",
    title: "Impossible Trident",
    description: "A classic impossible object. It has three cylindrical prongs at one end which transform into two rectangular prongs at the other.",
    image: figureSvg({ id: "impossible-trident", title: "Impossible Trident", subtitle: "Three ends or two?", variant: "trident" }),
    difficulty: "Advanced",
    perceptionType: "Impossible Object",
    interpretations: [
      { id: "three-prongs", label: "Three Prongs", hint: "Focus on the bottom end of the object." },
      { id: "two-prongs", label: "Two Prongs", hint: "Focus on the top end of the object." },
    ],
  },
];
