"use client";

import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  X,
  Scale,
  Ruler,
  Weight,
  MapPin,
  Globe,
  Lightbulb,
  BookOpen,
  Clock,
  UtensilsCrossed,
  Layers,
  ArrowLeft,
  Info,
  ExternalLink,
} from "lucide-react";

const DINOSAURS = [
  {
    id: "tyrannosaurus-rex",
    name: "Tyrannosaurus Rex",
    pronunciation: "tie-RAN-oh-SORE-us rex",
    meaning: "Tyrant Lizard King",
    period: "Cretaceous",
    diet: "Carnivore",
    size: "Large",
    length: "12.3 m (40 ft)",
    height: "3.7 m (12 ft) at hips",
    weight: "8,000–14,000 kg",
    habitat: "Forests, floodplains",
    location: "North America (USA, Canada)",
    facts: [
      "Had the most powerful bite force of any land animal — up to 12,800 lbs",
      "Teeth could grow up to 30 cm (12 in) long",
      "Could consume up to 230 kg (500 lbs) of meat in one bite",
      "Contrary to movies, T-Rex likely had feathers as juveniles",
      "Its arms were actually quite strong — could lift 200 kg each",
    ],
    timelineStart: 68,
    timelineEnd: 66,
    sizeRatio: 2.1,
    color: "bg-red-600",
  },
  {
    id: "triceratops",
    name: "Triceratops",
    pronunciation: "try-SERRA-tops",
    meaning: "Three-horned Face",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Large",
    length: "8–9 m (26–30 ft)",
    height: "3 m (10 ft)",
    weight: "6,000–12,000 kg",
    habitat: "Woodlands, plains",
    location: "North America (USA, Canada)",
    facts: [
      "Its frill was likely used for display and thermoregulation, not just defense",
      "Had a beak-like mouth for clipping tough plant material",
      "Could have weighed as much as a modern school bus",
      "Lived alongside T-Rex and was likely its prey",
      "Horns could grow up to 1.15 m (3.8 ft) long",
    ],
    timelineStart: 68,
    timelineEnd: 66,
    sizeRatio: 1.7,
    color: "bg-amber-600",
  },
  {
    id: "velociraptor",
    name: "Velociraptor",
    pronunciation: "vuh-LOSS-ih-RAP-tor",
    meaning: "Swift Thief",
    period: "Cretaceous",
    diet: "Carnivore",
    size: "Small",
    length: "1.5–2.1 m (5–7 ft)",
    height: "0.5 m (1.6 ft)",
    weight: "15–30 kg",
    habitat: "Deserts, dunes",
    location: "Asia (Mongolia, China)",
    facts: [
      "Much smaller than depicted in Jurassic Park — about the size of a turkey",
      "Was covered in feathers and had true wings",
      "Had a sickle-shaped 6.5 cm (2.5 in) claw on each foot",
      "Was likely an intelligent pack hunter",
      "Fossils have been found locked in combat with Protoceratops",
    ],
    timelineStart: 75,
    timelineEnd: 71,
    sizeRatio: 0.3,
    color: "bg-green-600",
  },
  {
    id: "stegosaurus",
    name: "Stegosaurus",
    pronunciation: "STEG-oh-SORE-us",
    meaning: "Roof Lizard",
    period: "Jurassic",
    diet: "Herbivore",
    size: "Large",
    length: "9 m (30 ft)",
    height: "4 m (13 ft)",
    weight: "5,000–7,000 kg",
    habitat: "Forests, floodplains",
    location: "North America, Europe",
    facts: [
      "Had a brain the size of a walnut — only 80 grams",
      "Its tail spikes (thagomizer) could swing at 80 km/h for defense",
      "Plates on its back were used for display and thermoregulation",
      "Could rear up on its hind legs to reach higher vegetation",
      "One of the most easily recognizable dinosaurs",
    ],
    timelineStart: 155,
    timelineEnd: 150,
    sizeRatio: 1.5,
    color: "bg-lime-600",
  },
  {
    id: "brachiosaurus",
    name: "Brachiosaurus",
    pronunciation: "BRACK-ee-oh-SORE-us",
    meaning: "Arm Lizard",
    period: "Jurassic",
    diet: "Herbivore",
    size: "Large",
    length: "25 m (82 ft)",
    height: "15–18 m (50–60 ft)",
    weight: "35,000–58,000 kg",
    habitat: "Forests, plains",
    location: "North America",
    facts: [
      "Could reach heights of a 5–6 story building",
      "Had a heart the size of a small car to pump blood up its long neck",
      "Nostrils were on top of its skull, suggesting a possible 'snorkel' function",
      "Ate up to 400 kg (880 lbs) of plants per day",
      "One of the largest land animals to ever exist",
    ],
    timelineStart: 154,
    timelineEnd: 153,
    sizeRatio: 3.0,
    color: "bg-teal-600",
  },
  {
    id: "pteranodon",
    name: "Pteranodon",
    pronunciation: "teh-RAN-oh-don",
    meaning: "Winged and Toothless",
    period: "Cretaceous",
    diet: "Carnivore",
    size: "Large",
    length: "1.8 m (6 ft) body",
    height: "1.8 m (6 ft)",
    weight: "20–40 kg",
    habitat: "Coastal cliffs, oceans",
    location: "North America, Europe",
    facts: [
      "Not a dinosaur — it's a pterosaur (flying reptile)",
      "Wingspan of 7+ m (23 ft) — wider than a modern fighter jet",
      "Males had large crests on their heads for display",
      "Was toothless and caught fish with its beak",
      "Could glide for hours over oceans using thermal currents",
    ],
    timelineStart: 88,
    timelineEnd: 84,
    sizeRatio: 1.0,
    color: "bg-sky-600",
  },
  {
    id: "diplodocus",
    name: "Diplodocus",
    pronunciation: "dih-PLOD-oh-kus",
    meaning: "Double Beam",
    period: "Jurassic",
    diet: "Herbivore",
    size: "Large",
    length: "27 m (89 ft)",
    height: "5 m (16 ft) at hips",
    weight: "15,000–25,000 kg",
    habitat: "Plains, forests",
    location: "North America",
    facts: [
      "One of the longest dinosaurs ever discovered",
      "Used its whip-like tail to defend against predators — could break the sound barrier",
      "Had peg-like teeth only at the front of its jaw for stripping leaves",
      "Could rear up on its hind legs like a rearing horse",
      "Its neck alone could reach 7.5 m (25 ft)",
    ],
    timelineStart: 154,
    timelineEnd: 152,
    sizeRatio: 2.5,
    color: "bg-emerald-700",
  },
  {
    id: "ankylosaurus",
    name: "Ankylosaurus",
    pronunciation: "ang-KIE-loh-SORE-us",
    meaning: "Fused Lizard",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Large",
    length: "6–8 m (20–26 ft)",
    height: "1.7 m (5.6 ft)",
    weight: "4,500–8,000 kg",
    habitat: "Forests, floodplains",
    location: "North America",
    facts: [
      "Covered in bony armor plates called osteoderms",
      "Tail club could swing with enough force to break bone",
      "Even its eyelids were armored",
      "Had a small brain for its body size",
      "Could withstand attacks from T-Rex thanks to its armor",
    ],
    timelineStart: 68,
    timelineEnd: 66,
    sizeRatio: 1.4,
    color: "bg-stone-600",
  },
  {
    id: "spinosaurus",
    name: "Spinosaurus",
    pronunciation: "SPINE-oh-SORE-us",
    meaning: "Spine Lizard",
    period: "Cretaceous",
    diet: "Carnivore",
    size: "Large",
    length: "15–18 m (49–59 ft)",
    height: "5–6 m (16–20 ft)",
    weight: "7,000–20,000 kg",
    habitat: "Rivers, swamps",
    location: "Africa (Egypt, Morocco)",
    facts: [
      "Larger than T-Rex — the largest known carnivorous dinosaur",
      "Had a massive sail on its back made of skin stretched over 1.8 m spines",
      "Spent most of its time in water and could swim",
      "Had a crocodile-like snout for catching fish",
      "Its tail was paddle-shaped for swimming",
    ],
    timelineStart: 99,
    timelineEnd: 93,
    sizeRatio: 2.3,
    color: "bg-orange-700",
  },
  {
    id: "parasaurolophus",
    name: "Parasaurolophus",
    pronunciation: "PAIR-ah-sore-OL-oh-fus",
    meaning: "Near Crested Lizard",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Large",
    length: "9–10 m (30–33 ft)",
    height: "3 m (10 ft) at hips",
    weight: "2,500–3,500 kg",
    habitat: "Woodlands, river valleys",
    location: "North America",
    facts: [
      "Famous for its long, backward-curving head crest",
      "The crest could be up to 1.8 m (6 ft) long",
      "Used its hollow crest to produce low-frequency sounds for communication",
      "Could likely hear infrasound over long distances",
      "Walked on two legs but could drop to four to feed",
    ],
    timelineStart: 76,
    timelineEnd: 73,
    sizeRatio: 1.6,
    color: "bg-cyan-700",
  },
  {
    id: "allosaurus",
    name: "Allosaurus",
    pronunciation: "AL-oh-SORE-us",
    meaning: "Different Lizard",
    period: "Jurassic",
    diet: "Carnivore",
    size: "Large",
    length: "8–12 m (26–39 ft)",
    height: "2.5–3.5 m (8–11 ft)",
    weight: "1,500–2,500 kg",
    habitat: "Forests, plains",
    location: "North America, Europe, Africa",
    facts: [
      "The most common large predator of the Jurassic period",
      "Had a distinctive ridge of horns above its eyes",
      "Could open its jaw extremely wide like a snake",
      "Fossils of over 60 individuals found at a single site",
      "Likely hunted in packs to take down larger prey",
    ],
    timelineStart: 155,
    timelineEnd: 150,
    sizeRatio: 1.2,
    color: "bg-red-700",
  },
  {
    id: "apatosaurus",
    name: "Apatosaurus",
    pronunciation: "ah-PAT-oh-SORE-us",
    meaning: "Deceptive Lizard",
    period: "Jurassic",
    diet: "Herbivore",
    size: "Large",
    length: "21–23 m (69–75 ft)",
    height: "7–8 m (23–26 ft)",
    weight: "20,000–36,000 kg",
    habitat: "Plains, forests",
    location: "North America",
    facts: [
      "Formerly known as Brontosaurus (thunder lizard)",
      "Had an incredibly long neck of up to 9 m (30 ft)",
      "Swallowed stones (gastroliths) to help grind food in its stomach",
      "Could crack its tail like a whip at supersonic speeds",
      "Grew continuously throughout its life",
    ],
    timelineStart: 154,
    timelineEnd: 150,
    sizeRatio: 2.6,
    color: "bg-emerald-600",
  },
  {
    id: "iguanodon",
    name: "Iguanodon",
    pronunciation: "ih-GWAN-oh-don",
    meaning: "Iguana Tooth",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Large",
    length: "9–10 m (30–33 ft)",
    height: "3 m (10 ft)",
    weight: "3,000–5,000 kg",
    habitat: "Woodlands, marshes",
    location: "Europe, North America, Asia",
    facts: [
      "One of the very first dinosaurs ever discovered and named (1822)",
      "Had a spike on each thumb that may have been used for defense",
      "Could walk on two legs or all fours",
      "Had hundreds of teeth for grinding tough plants",
      "Its name means 'iguana tooth' because its teeth resembled iguana teeth",
    ],
    timelineStart: 126,
    timelineEnd: 122,
    sizeRatio: 1.6,
    color: "bg-green-700",
  },
  {
    id: "pachycephalosaurus",
    name: "Pachycephalosaurus",
    pronunciation: "PAK-ee-SEF-ah-low-SORE-us",
    meaning: "Thick-headed Lizard",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Medium",
    length: "4.5 m (15 ft)",
    height: "1.5 m (5 ft) at hips",
    weight: "450 kg (990 lbs)",
    habitat: "Woodlands, plains",
    location: "North America",
    facts: [
      "Had a dome-shaped skull up to 25 cm (10 in) thick",
      "Males likely head-butted each other for dominance",
      "The dome was solid bone that could absorb massive impacts",
      "Had a bumpy fringe of spikes around the base of its skull",
      "Ran on two legs and was quite fast",
    ],
    timelineStart: 70,
    timelineEnd: 66,
    sizeRatio: 0.8,
    color: "bg-amber-700",
  },
  {
    id: "dilophosaurus",
    name: "Dilophosaurus",
    pronunciation: "die-LOH-foh-SORE-us",
    meaning: "Two-crested Lizard",
    period: "Jurassic",
    diet: "Carnivore",
    size: "Medium",
    length: "6–7 m (20–23 ft)",
    height: "1.8–2 m (6–7 ft)",
    weight: "400–500 kg",
    habitat: "Forests, river valleys",
    location: "North America, Asia",
    facts: [
      "Famous for its pair of thin, rounded crests on its head",
      "Much larger than the venom-spitting version in Jurassic Park",
      "The crests were likely used for display and species recognition",
      "Was one of the first large predatory dinosaurs (Early Jurassic)",
      "Had a weak bite suited for catching small prey",
    ],
    timelineStart: 196,
    timelineEnd: 183,
    sizeRatio: 0.9,
    color: "bg-purple-600",
  },
  {
    id: "carnotaurus",
    name: "Carnotaurus",
    pronunciation: "CAR-no-TORE-us",
    meaning: "Meat-eating Bull",
    period: "Cretaceous",
    diet: "Carnivore",
    size: "Medium",
    length: "7.5–8 m (25–26 ft)",
    height: "2.5 m (8.2 ft)",
    weight: "1,350–2,100 kg",
    habitat: "Floodplains, forests",
    location: "South America (Argentina)",
    facts: [
      "Had two distinctive bull-like horns above its eyes",
      "Arms were even smaller than T-Rex — possibly vestigial",
      "Had a surprisingly strong tail for quick turning",
      "Fossilized skin impressions show scaly, bumpy skin with no feathers",
      "Was built for speed — could run up to 48 km/h (30 mph)",
    ],
    timelineStart: 72,
    timelineEnd: 69,
    sizeRatio: 1.0,
    color: "bg-yellow-700",
  },
  {
    id: "compsognathus",
    name: "Compsognathus",
    pronunciation: "KOMP-sog-NAY-thus",
    meaning: "Elegant Jaw",
    period: "Jurassic",
    diet: "Carnivore",
    size: "Small",
    length: "1 m (3.3 ft)",
    height: "0.3 m (1 ft) at hips",
    weight: "2.5–3.5 kg",
    habitat: "Beaches, forests",
    location: "Europe (Germany, France)",
    facts: [
      "One of the smallest known dinosaurs",
      "About the size of a modern chicken",
      "Ate insects, small lizards, and other tiny prey",
      "Had a long tail that made up half its body length",
      "Fossils have been found with preserved stomach contents showing its last meal",
    ],
    timelineStart: 150,
    timelineEnd: 148,
    sizeRatio: 0.15,
    color: "bg-gray-500",
  },
  {
    id: "therizinosaurus",
    name: "Therizinosaurus",
    pronunciation: "THER-ih-ZIN-oh-SORE-us",
    meaning: "Scythe Lizard",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Large",
    length: "9–10 m (30–33 ft)",
    height: "4–5 m (13–16 ft)",
    weight: "3,000–6,000 kg",
    habitat: "Forests, floodplains",
    location: "Asia (Mongolia)",
    facts: [
      "Had the longest claws of any animal — up to 1 m (3.3 ft)",
      "Despite looking terrifying, was a gentle herbivore",
      "Claws were used for gathering plants, not fighting",
      "Had a beak-like mouth and a pot belly",
      "Covered in primitive feathers",
    ],
    timelineStart: 70,
    timelineEnd: 66,
    sizeRatio: 1.5,
    color: "bg-pink-700",
  },
  {
    id: "deinonychus",
    name: "Deinonychus",
    pronunciation: "die-NON-ih-kus",
    meaning: "Terrible Claw",
    period: "Cretaceous",
    diet: "Carnivore",
    size: "Small",
    length: "3–3.4 m (10–11 ft)",
    height: "1–1.2 m (3.3–4 ft)",
    weight: "60–80 kg",
    habitat: "Forests, floodplains",
    location: "North America",
    facts: [
      "The discovery of Deinonychus revolutionized how we think of dinosaurs",
      "Was warm-blooded and highly active, leading to the 'dinosaur renaissance'",
      "Had a 12 cm (5 in) sickle claw on each foot",
      "Likely hunted in coordinated packs",
      "Was the inspiration for the 'Velociraptors' in Jurassic Park",
    ],
    timelineStart: 115,
    timelineEnd: 108,
    sizeRatio: 0.5,
    color: "bg-lime-700",
  },
  {
    id: "maiasaura",
    name: "Maiasaura",
    pronunciation: "MY-ah-SORE-ah",
    meaning: "Good Mother Lizard",
    period: "Cretaceous",
    diet: "Herbivore",
    size: "Large",
    length: "9 m (30 ft)",
    height: "2.5 m (8 ft)",
    weight: "3,000–4,000 kg",
    habitat: "Woodlands, valleys",
    location: "North America (USA)",
    facts: [
      "Evidence shows adults cared for their young in nesting colonies",
      "Nests contained up to 30–40 eggs arranged in neat rows",
      "Juveniles stayed in the nest and were fed by adults",
      "Had a duck-billed face adapted for chewing tough plants",
      "Was named 'good mother lizard' because of extensive parenting evidence",
    ],
    timelineStart: 80,
    timelineEnd: 75,
    sizeRatio: 1.5,
    color: "bg-blue-700",
  },
];

const PERIODS = ["All", "Triassic", "Jurassic", "Cretaceous"];
const DIETS = ["All", "Carnivore", "Herbivore", "Omnivore"];
const SIZES = ["All", "Small", "Medium", "Large"];

const PERIOD_COLORS = {
  Triassic: "bg-purple-500",
  Jurassic: "bg-blue-500",
  Cretaceous: "bg-green-500",
};

const DIET_ICONS = {
  Carnivore: "🍖",
  Herbivore: "🌿",
  Omnivore: "🍓",
};

function FilterBar({ filters, onFilterChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
        <input
          type="text"
          placeholder="Search dinosaurs..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="h-10 w-full rounded-lg border border-(--border) bg-(--card) pl-9 pr-3 text-sm text-(--foreground) placeholder-(--muted-foreground) outline-none transition-[border,box-shadow] focus:border-(--primary) focus:ring-[3px] focus:ring-[rgba(20,184,166,0.35)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Period"
          value={filters.period}
          options={PERIODS}
          onChange={(v) => onFilterChange("period", v)}
        />
        <FilterDropdown
          label="Diet"
          value={filters.diet}
          options={DIETS}
          onChange={(v) => onFilterChange("diet", v)}
        />
        <FilterDropdown
          label="Size"
          value={filters.size}
          options={SIZES}
          onChange={(v) => onFilterChange("size", v)}
        />
        <button
          onClick={onReset}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-3 text-sm font-medium text-(--muted-foreground) transition-colors hover:bg-(--surface-soft) hover:text-(--foreground)"
          aria-label="Reset filters"
        >
          <X className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--surface-soft)"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value === "All" ? <SlidersHorizontal className="h-4 w-4 text-(--muted-foreground)" /> : null}
        {value !== "All" ? value : label}
        <ChevronDown className="h-3.5 w-3.5 text-(--muted-foreground)" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-(--border) bg-(--card) py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-(--surface-soft) ${
                  opt === value
                    ? "font-semibold text-(--primary)"
                    : "text-(--foreground)"
                }`}
                role="option"
                aria-selected={opt === value}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TimelineBar({ start, end }) {
  const minYear = 200;
  const maxYear = 65;
  const range = minYear - maxYear;
  const left = ((minYear - end) / range) * 100;
  const width = ((end - start) / range) * 100;
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-(--surface-soft)">
      <div
        className="absolute top-0 h-full rounded-full bg-(--primary)"
        style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
        title={`${start}–${end} mya`}
      />
    </div>
  );
}

function TimelineEpoch() {
  const epochs = [
    { name: "Triassic", start: 252, end: 201, color: "bg-purple-500" },
    { name: "Jurassic", start: 201, end: 145, color: "bg-blue-500" },
    { name: "Cretaceous", start: 145, end: 66, color: "bg-green-500" },
  ];
  const total = 252 - 66;
  return (
    <div className="relative h-8 w-full">
      {epochs.map((e) => {
        const left = ((252 - e.start) / total) * 100;
        const w = ((e.start - e.end) / total) * 100;
        return (
          <div
            key={e.name}
            className={`absolute top-0 flex h-full items-center justify-center text-[10px] font-semibold text-white ${e.color}`}
            style={{ left: `${left}%`, width: `${w}%` }}
          >
            {e.name}
          </div>
        );
      })}
    </div>
  );
}

function SizeComparison({ ratio }) {
  const humanHeight = 40;
  const dinoHeight = humanHeight * ratio;
  const maxHeight = Math.max(dinoHeight, 200);
  return (
    <div className="flex items-end gap-3" style={{ height: `${Math.min(maxHeight, 200)}px` }}>
      <div className="flex flex-col items-center">
        <div
          className="w-5 rounded-t-md bg-(--muted-foreground) opacity-50"
          style={{ height: `${humanHeight}px` }}
        />
        <span className="mt-0.5 text-[10px] text-(--muted-foreground)">Human</span>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="w-7 rounded-t-md bg-(--primary)"
          style={{ height: `${Math.min(dinoHeight, 180)}px` }}
        />
        <span className="mt-0.5 text-[10px] text-(--muted-foreground)">Dino</span>
      </div>
    </div>
  );
}

function DetailCard({ dinosaur, onBack }) {
  if (!dinosaur) return null;
  const d = dinosaur;
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-(--primary) transition-colors hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to explorer
      </button>

      <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-(--foreground)">{d.name}</h2>
            <p className="mt-0.5 text-sm italic text-(--muted-foreground)">{d.pronunciation}</p>
            <p className="mt-0.5 text-sm text-(--muted-foreground)">{d.meaning}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${PERIOD_COLORS[d.period]}`}>
              <Clock className="h-3 w-3" /> {d.period}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-(--surface-soft) px-2.5 py-0.5 text-xs font-semibold text-(--foreground)">
              {DIET_ICONS[d.diet]} {d.diet}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-(--surface-soft) px-2.5 py-0.5 text-xs font-semibold text-(--foreground)">
              <Layers className="h-3 w-3" /> {d.size}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatBox icon={<Ruler className="h-4 w-4" />} label="Length" value={d.length} />
          <StatBox icon={<Scale className="h-4 w-4" />} label="Height" value={d.height} />
          <StatBox icon={<Weight className="h-4 w-4" />} label="Weight" value={d.weight} />
          <StatBox icon={<Globe className="h-4 w-4" />} label="Habitat" value={d.habitat} />
          <StatBox icon={<MapPin className="h-4 w-4" />} label="Location" value={d.location} />
          <StatBox
            icon={<Clock className="h-4 w-4" />}
            label="Lived"
            value={`${d.timelineStart}–${d.timelineEnd} mya`}
          />
        </div>
      </div>

      <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-lg font-semibold text-(--foreground)">
          <Scale className="h-5 w-5 text-(--primary)" /> Size Comparison
        </h3>
        <p className="mb-3 text-xs text-(--muted-foreground)">
          Relative height compared to an average human (1.8 m).
        </p>
        <SizeComparison ratio={d.sizeRatio} />
      </div>

      <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-lg font-semibold text-(--foreground)">
          <Lightbulb className="h-5 w-5 text-(--primary)" /> Fun Facts
        </h3>
        <ul className="space-y-2">
          {d.facts.map((fact, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-(--foreground)">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-(--primary)" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--surface-soft) p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
        {icon} {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold text-(--foreground)">{value}</p>
    </div>
  );
}

function DinoCard({
  dinosaur,
  viewMode,
  onSelect,
}) {
  const d = dinosaur;
  if (viewMode === "list") {
    return (
      <button
        onClick={() => onSelect(d)}
        className="flex w-full items-center gap-4 rounded-xl border border-(--border) bg-(--card) p-4 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-[3px] focus:ring-[rgba(20,184,166,0.35)]"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg">
          {DIET_ICONS[d.diet]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-(--foreground)">{d.name}</p>
          <p className="truncate text-xs text-(--muted-foreground)">{d.pronunciation}</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${PERIOD_COLORS[d.period]}`}>
            {d.period}
          </span>
          <span className="text-xs text-(--muted-foreground)">{d.diet}</span>
          <span className="text-xs text-(--muted-foreground)">{d.size}</span>
        </div>
        <ChevronDown className="h-4 w-4 -rotate-90 text-(--muted-foreground)" />
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(d)}
      className="group rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-[3px] focus:ring-[rgba(20,184,166,0.35)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--surface-soft) text-lg shadow-sm transition-transform group-hover:scale-110">
          {DIET_ICONS[d.diet]}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${PERIOD_COLORS[d.period]}`}>
          {d.period}
        </span>
      </div>
      <h3 className="text-base font-bold text-(--foreground)">{d.name}</h3>
      <p className="text-xs text-(--muted-foreground)">{d.pronunciation}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-(--surface-soft) px-2 py-0.5 text-[10px] font-medium text-(--muted-foreground)">
          {d.diet}
        </span>
        <span className="rounded-md bg-(--surface-soft) px-2 py-0.5 text-[10px] font-medium text-(--muted-foreground)">
          {d.size}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-[10px] text-(--muted-foreground)">{d.timelineStart}–{d.timelineEnd} mya</p>
        <TimelineBar start={d.timelineStart} end={d.timelineEnd} />
      </div>
    </button>
  );
}

function EducationSection() {
  const sections = [
    {
      icon: BookOpen,
      title: "What is a Dinosaur?",
      content:
        "Dinosaurs were a diverse group of reptiles that dominated terrestrial ecosystems for over 165 million years, from the Late Triassic (about 230 mya) until the end-Cretaceous extinction event (66 mya). They ranged from the tiny Compsognathus to the massive Brachiosaurus.",
    },
    {
      icon: Clock,
      title: "The Three Periods",
      content:
        "The Mesozoic Era is divided into three periods: Triassic (252–201 mya) — when dinosaurs first appeared; Jurassic (201–145 mya) — when they grew to enormous sizes; and Cretaceous (145–66 mya) — when species diversity peaked before the mass extinction.",
    },
    {
      icon: Info,
      title: "Extinction Event",
      content:
        "Most dinosaurs were wiped out 66 million years ago when a 10–15 km asteroid struck the Yucatán Peninsula, creating the Chicxulub crater. This caused global wildfires, tsunamis, and a 'nuclear winter' that blocked sunlight for years. Only birds (avian dinosaurs) survived.",
    },
  ];

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-1.5 text-lg font-semibold text-(--foreground)">
        <BookOpen className="h-5 w-5 text-(--primary)" /> Educational Guide
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <div key={s.title} className="rounded-lg border border-(--border) bg-(--surface-soft) p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-(--primary)/10">
              <s.icon className="h-4 w-4 text-(--primary)" />
            </div>
            <h4 className="mb-1 text-sm font-semibold text-(--foreground)">{s.title}</h4>
            <p className="text-xs leading-relaxed text-(--muted-foreground)">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [filters, setFilters] = useState({
    search: "",
    period: "All",
    diet: "All",
    size: "All",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = [...DINOSAURS];
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.period.toLowerCase().includes(q) ||
          d.diet.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q)
      );
    }
    if (filters.period !== "All") {
      result = result.filter((d) => d.period === filters.period);
    }
    if (filters.diet !== "All") {
      result = result.filter((d) => d.diet === filters.diet);
    }
    if (filters.size !== "All") {
      result = result.filter((d) => d.size === filters.size);
    }
    return result;
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSelected(null);
  };

  const resetFilters = () => {
    setFilters({ search: "", period: "All", diet: "All", size: "All" });
    setSelected(null);
  };

  if (selected) {
    return (
      <div className="mx-auto w-full max-w-4xl py-6">
        <DetailCard dinosaur={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-(--foreground)">Dinosaur Explorer</h1>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Discover 20+ prehistoric species with search, filters, timeline, and size comparisons.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
          <div className="flex items-center gap-1 rounded-lg border border-(--border) bg-(--card) p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-(--primary) text-white"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-(--primary) text-white"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-(--muted-foreground)">GEOLOGICAL TIMELINE (millions of years ago)</p>
          <TimelineEpoch />
          <div className="mt-4 space-y-1">
            {filtered.slice(0, 6).map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-xs">
                <span className="w-28 truncate font-medium text-(--foreground)">{d.name}</span>
                <div className="relative flex-1">
                  <div className="h-1.5 w-full rounded-full bg-(--surface-soft)" />
                  <div
                    className="absolute top-0 h-1.5 rounded-full opacity-70"
                    style={{
                      left: `${((200 - d.timelineEnd) / (200 - 65)) * 100}%`,
                      width: `${((d.timelineEnd - d.timelineStart) / (200 - 65)) * 100}%`,
                      backgroundColor: PERIOD_COLORS[d.period].replace("bg-", ""),
                    }}
                  />
                </div>
                <span className="w-16 text-right text-(--muted-foreground)">
                  {d.timelineStart}–{d.timelineEnd}
                </span>
              </div>
            ))}
            {filtered.length > 6 && (
              <p className="pt-1 text-center text-xs text-(--muted-foreground)">
                +{filtered.length - 6} more species — click a card for details
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-(--border) border-t-(--primary)" />
              <p className="text-sm text-(--muted-foreground)">Loading dinosaurs...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-full bg-(--surface-soft) p-4">
              <Search className="h-8 w-8 text-(--muted-foreground)" />
            </div>
            <p className="mt-4 text-base font-semibold text-(--foreground)">No dinosaurs found</p>
            <p className="mt-1 text-sm text-(--muted-foreground)">
              Try adjusting your filters or search terms.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-(--muted-foreground)">
              Showing {filtered.length} of {DINOSAURS.length} species
            </p>
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((d) => (
                  <DinoCard
                    key={d.id}
                    dinosaur={d}
                    viewMode={viewMode}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((d) => (
                  <DinoCard
                    key={d.id}
                    dinosaur={d}
                    viewMode={viewMode}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <EducationSection />
      </div>
    </div>
  );
}
