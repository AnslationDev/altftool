"use client";

import { useMemo, useState, useCallback, memo } from "react";
import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Brain,
  Columns,
  Droplets,
  Dumbbell,
  Eye,
  Filter,
  Heart,
  Wind,
  Scan,
  Search,
  UtensilsCrossed,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const SYSTEMS = [
  { id: "nervous", label: "Nervous", icon: Brain, color: "#F59E0B" },
  { id: "circulatory", label: "Circulatory", icon: Heart, color: "#EF4444" },
  { id: "respiratory", label: "Respiratory", icon: Wind, color: "#3B82F6" },
  { id: "digestive", label: "Digestive", icon: UtensilsCrossed, color: "#10B981" },
  { id: "skeletal", label: "Skeletal", icon: Columns, color: "#8B5CF6" },
  { id: "muscular", label: "Muscular", icon: Dumbbell, color: "#EC4899" },
];

const SYSTEMS_MAP = Object.fromEntries(SYSTEMS.map((s) => [s.id, s]));
const SYSTEM_COLORS = Object.fromEntries(SYSTEMS.map((s) => [s.id, s.color]));

const ORGANS = [
  {
    id: "brain",
    name: "Brain",
    system: "nervous",
    description:
      "The brain is the body's control center, responsible for processing sensory information, regulating bodily functions, and enabling thought, memory, and emotion.",
    function:
      "Controls voluntary and involuntary actions, processes sensory input, coordinates movement, enables cognition and consciousness.",
    facts: [
      "The brain weighs about 1.4 kg (3 lbs) and contains approximately 86 billion neurons.",
      "It uses about 20% of the body's oxygen and calories despite being only 2% of body mass.",
      "The brain has no pain receptors — brain surgery can be performed while the patient is awake.",
      "Your brain generates enough electricity to power a small light bulb (about 20 watts).",
    ],
    eduFact:
      "Your brain is like a supercomputer that controls everything you do — thinking, moving, feeling, and even breathing.",
    svgType: "ellipse",
    svgProps: { cx: 180, cy: 42, rx: 28, ry: 22 },
  },
  {
    id: "eyes",
    name: "Eyes",
    system: "nervous",
    description:
      "The eyes are complex organs that detect light and convert it into electrical signals, enabling vision — one of our most dominant senses.",
    function:
      "Focus light onto the retina, convert light into neural signals, and transmit visual information to the brain for processing.",
    facts: [
      "The human eye can distinguish about 10 million different colors.",
      "Your eyes blink about 15-20 times per minute, keeping the cornea moist and clear.",
      "The eye muscles are the fastest and most active muscles in the body.",
      "Eyes heal quickly — a corneal scratch can repair itself in about 48 hours.",
    ],
    eduFact:
      "Your eyes work like a camera — they capture light and send pictures to your brain so you can see the world.",
    svgType: "group",
    svgChildren: [
      { type: "circle", props: { cx: 165, cy: 36, r: 7 } },
      { type: "circle", props: { cx: 195, cy: 36, r: 7 } },
      { type: "circle", props: { cx: 165, cy: 36, r: 3, fill: "var(--anslation-ds-page)" } },
      { type: "circle", props: { cx: 195, cy: 36, r: 3, fill: "var(--anslation-ds-page)" } },
    ],
  },
  {
    id: "heart",
    name: "Heart",
    system: "circulatory",
    description:
      "The heart is a powerful muscular organ that pumps blood through the circulatory system, delivering oxygen and nutrients while removing waste products.",
    function:
      "Pumps approximately 5-6 liters of blood per minute through 100,000 km of blood vessels, supplying every cell in the body.",
    facts: [
      "Your heart beats about 100,000 times per day and 35 million times per year.",
      "A woman's heart typically beats faster than a man's — about 78 vs 70 bpm on average.",
      "The heart can continue beating even when disconnected from the body, as it has its own electrical system.",
      "Laughing is good for your heart — it reduces stress hormones and improves blood vessel function.",
    ],
    eduFact:
      "Your heart is a pump that works nonstop to send blood with oxygen to every part of your body.",
    svgType: "path",
    svgProps: {
      d: "M168,178 C168,178 145,156 145,140 C145,130 153,123 162,126 C168,128 168,136 168,136 C168,136 168,128 174,126 C183,123 191,130 191,140 C191,156 168,178 168,178 Z",
    },
  },
  {
    id: "lungs",
    name: "Lungs",
    system: "respiratory",
    description:
      "The lungs are the primary organs of respiration, responsible for gas exchange — taking in oxygen and expelling carbon dioxide with every breath.",
    function:
      "Transfer oxygen from the air into the bloodstream and remove carbon dioxide. The lungs also help regulate blood pH and protect against pathogens.",
    facts: [
      "The lungs contain about 500 million alveoli with a surface area roughly the size of a tennis court.",
      "You breathe about 20,000 times per day, moving roughly 10,000 liters of air.",
      "The right lung is slightly larger than the left to accommodate the heart.",
      "Your nose filters, warms, and humidifies air before it reaches your lungs.",
    ],
    eduFact:
      "Your lungs are like balloons that fill with air when you breathe in. They take oxygen from the air and put it into your blood.",
    svgType: "group",
    svgChildren: [
      { type: "ellipse", props: { cx: 146, cy: 187, rx: 16, ry: 30, transform: "rotate(5 146 187)" } },
      { type: "ellipse", props: { cx: 214, cy: 187, rx: 16, ry: 30, transform: "rotate(-5 214 187)" } },
    ],
  },
  {
    id: "liver",
    name: "Liver",
    system: "digestive",
    description:
      "The liver is the largest internal organ and performs over 500 vital functions, including detoxification, protein synthesis, and bile production.",
    function:
      "Filters blood from the digestive tract, metabolizes drugs and toxins, produces bile for digestion, stores vitamins and glycogen.",
    facts: [
      "The liver is the only organ that can regenerate itself — it can grow back to full size even after 75% removal.",
      "At any given moment, the liver holds about 13% of the body's blood supply.",
      "The liver performs more than 500 distinct functions, more than any other organ.",
      "Ancient Greeks believed the liver was the seat of human emotion and the soul.",
    ],
    eduFact:
      "Your liver is like a factory that cleans your blood, helps digest food, and stores energy for when you need it.",
    svgType: "ellipse",
    svgProps: { cx: 215, cy: 252, rx: 18, ry: 14 },
  },
  {
    id: "stomach",
    name: "Stomach",
    system: "digestive",
    description:
      "The stomach is a muscular organ that receives food from the esophagus and breaks it down with acid and enzymes, beginning the digestive process.",
    function:
      "Mixes food with gastric juices containing hydrochloric acid and digestive enzymes to form chyme, controls the release of food into the small intestine.",
    facts: [
      "The stomach lining produces a new layer of mucus every two weeks to protect itself from its own acid.",
      "Stomach acid is strong enough to dissolve metal — it has a pH of 1.5 to 3.5.",
      "Your stomach can expand to hold up to 3-4 liters of food and liquid.",
      "The stomach's rumbling sound (borborygmi) is caused by gas and muscle contractions, not hunger.",
    ],
    eduFact:
      "Your stomach is like a mixer that churns food and mixes it with special juices to break it down into tiny pieces.",
    svgType: "ellipse",
    svgProps: { cx: 155, cy: 255, rx: 18, ry: 24, transform: "rotate(-20 155 255)" },
  },
  {
    id: "kidneys",
    name: "Kidneys",
    system: "circulatory",
    description:
      "The kidneys are bean-shaped organs that filter waste products from the blood and regulate fluid balance, electrolyte levels, and blood pressure.",
    function:
      "Filter about 180 liters of blood daily, producing 1.5-2 liters of urine. Regulate blood pressure, pH balance, and red blood cell production via erythropoietin.",
    facts: [
      "Your kidneys filter your entire blood supply about 40 times per day.",
      "People can live normally with just one kidney, which will enlarge to take on extra workload.",
      "Each kidney contains about 1 million tiny filtering units called nephrons.",
      "Kidneys produce about 2 liters of urine per day, varying based on fluid intake and activity.",
    ],
    eduFact:
      "Your kidneys are like filters that clean your blood, removing waste and extra water to make urine.",
    svgType: "group",
    svgChildren: [
      { type: "ellipse", props: { cx: 132, cy: 288, rx: 10, ry: 15, transform: "rotate(10 132 288)" } },
      { type: "ellipse", props: { cx: 228, cy: 288, rx: 10, ry: 15, transform: "rotate(-10 228 288)" } },
    ],
  },
  {
    id: "intestines",
    name: "Intestines",
    system: "digestive",
    description:
      "The intestines are a long continuous tube where most digestion and nutrient absorption occurs, divided into the small intestine and large intestine.",
    function:
      "The small intestine absorbs nutrients from digested food. The large intestine absorbs water, electrolytes, and forms and expels waste.",
    facts: [
      "The small intestine is about 6 meters (20 feet) long — most of the digestive process happens here.",
      "The large intestine is only about 1.5 meters (5 feet) long but is called 'large' because of its wider diameter.",
      "Your intestines contain trillions of bacteria (gut microbiome) weighing about 1-2 kg.",
      "The surface area of the small intestine, with its villi and microvilli, is about 250 square meters — roughly the size of a tennis court.",
    ],
    eduFact:
      "Your intestines are like a long twisting tube where your body takes all the good stuff from food and sends the rest out as waste.",
    svgType: "path",
    svgProps: {
      d: "M150,315 Q165,305 185,310 Q200,312 203,322 Q205,332 195,338 Q182,345 168,340 Q157,336 158,326 Q159,318 168,315 Q180,310 195,315 Q205,320 200,330",
      strokeWidth: 4,
      fill: "none",
    },
  },
  {
    id: "bones",
    name: "Bones",
    system: "skeletal",
    description:
      "The skeletal system provides structural support, protects vital organs, enables movement, stores minerals, and produces blood cells.",
    function:
      "Supports the body, protects organs (skull protects brain, ribs protect heart/lungs), stores calcium and phosphorus, produces blood cells in bone marrow.",
    facts: [
      "The human skeleton has 206 bones at birth, but babies are born with about 270 bones that fuse as they grow.",
      "The femur (thigh bone) is the strongest bone in the body, capable of supporting 30 times your body weight.",
      "Bones are living tissue — they continuously break down and rebuild. Your entire skeleton is replaced about every 10 years.",
      "The smallest bone is the stapes in the middle ear, measuring just 2.5 millimeters.",
    ],
    eduFact:
      "Your bones are like the frame of a house — they hold your body up, protect soft organs inside, and work with muscles to help you move.",
    svgType: "group",
    svgChildren: [
      { type: "path", props: { d: "M180,112 L180,380", strokeWidth: 3, fill: "none" } },
      { type: "path", props: { d: "M180,130 Q150,140 143,158", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M180,130 Q210,140 217,158", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M180,148 Q155,158 148,175", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M180,148 Q205,158 212,175", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M180,166 Q158,175 152,190", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M180,166 Q202,175 208,190", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M143,158 L152,190", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M217,158 L208,190", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M148,175 L158,205", strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M212,175 L202,205", strokeWidth: 2, fill: "none" } },
      { type: "ellipse", props: { cx: 180, cy: 370, rx: 30, ry: 18, strokeWidth: 2, fill: "none" } },
      { type: "path", props: { d: "M155,365 Q165,380 180,382 Q195,380 205,365", strokeWidth: 2, fill: "none" } },
    ],
  },
  {
    id: "muscles",
    name: "Muscles",
    system: "muscular",
    description:
      "Muscles are specialized tissues that contract to produce force and movement, enabling everything from walking and talking to breathing and pumping blood.",
    function:
      "Generate force for movement (skeletal muscles), pump blood (cardiac muscle), and move substances through organs (smooth muscle).",
    facts: [
      "There are over 600 muscles in the human body, making up about 40% of your total body weight.",
      "The gluteus maximus (buttock) is the largest muscle, while the stapedius (in the ear) is the smallest.",
      "It takes 17 muscles to smile and 43 muscles to frown — smiling really is easier.",
      "The strongest muscle based on weight is the masseter (jaw muscle), capable of biting with force up to 90 kg.",
    ],
    eduFact:
      "Your muscles are like rubber bands that pull on your bones to make you move, run, jump, smile, and even breathe.",
    svgType: "path",
    svgProps: {
      d: "M180,5 C215,5 230,20 230,45 C230,68 218,82 205,90 L205,100 C225,102 265,108 280,120 C295,132 310,145 310,160 C310,168 305,172 295,175 L290,185 C290,200 298,210 298,225 L298,320 C298,330 305,340 310,350 L310,515 C310,530 300,540 280,540 L280,545 C280,555 285,560 290,568 L290,600 C290,615 275,620 255,620 L105,620 C85,620 70,615 70,600 L70,568 C75,560 80,555 80,545 L80,540 C60,540 50,530 50,515 L50,350 C55,340 62,330 62,320 L62,225 C62,210 70,200 70,185 L65,175 C55,172 50,168 50,160 C50,145 65,132 80,120 C95,108 135,102 155,100 L155,90 C142,82 130,68 130,45 C130,20 145,5 180,5 Z",
      fillOpacity: 0.15,
      stroke: "none",
    },
  },
  {
    id: "skin",
    name: "Skin",
    system: null,
    description:
      "The skin is the largest organ of the body, forming a protective barrier against the external environment while regulating temperature and providing sensation.",
    function:
      "Protects against pathogens and UV radiation, regulates body temperature through sweating and blood flow, provides sensation, and synthesizes vitamin D.",
    facts: [
      "Skin is the largest organ, covering about 2 square meters and weighing roughly 3-4 kg.",
      "You shed about 30,000-40,000 dead skin cells every minute — about 9 kg per year.",
      "Skin has three layers: epidermis (outer), dermis (middle), and hypodermis (inner fat layer).",
      "Fingerprints are unique to each person and are formed before birth by pressure and genetics.",
    ],
    eduFact:
      "Your skin is like a suit of armor that covers your whole body, keeping germs out and water in while helping you feel touch, heat, and cold.",
    svgType: "outline",
  },
];

const ORGANS_MAP = Object.fromEntries(ORGANS.map((o) => [o.id, o]));

function SystemFilter({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Body system filters">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          selected === null
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
        }`}
        aria-pressed={selected === null}
      >
        <Filter className="h-3.5 w-3.5" />
        All
      </button>
      {SYSTEMS.map((s) => {
        const SystemIcon = s.icon;
        const isActive = selected === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isActive ? "text-white" : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
            }`}
            style={isActive ? { background: s.color, borderColor: s.color } : {}}
            aria-pressed={isActive}
          >
            <SystemIcon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

const MemoizedSystemFilter = memo(SystemFilter);

function OrganIcon({ organId, className }) {
  const iconMap = {
    brain: Brain,
    eyes: Eye,
    heart: Heart,
    lungs: Wind,
    liver: Activity,
    stomach: UtensilsCrossed,
    kidneys: Droplets,
    intestines: ArrowLeftRight,
    bones: Columns,
    muscles: Dumbbell,
    skin: Scan,
  };
  const Icon = iconMap[organId];
  return Icon ? <Icon className={className || "h-5 w-5"} /> : null;
}

function DetailPanel({ organ, zoomed, onToggleZoom, educational, organSystemColor }) {
  if (!organ) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <Brain className="h-12 w-12 text-[var(--muted-foreground)] opacity-30" />
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">Select an organ</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Click on any organ in the body diagram or search for one to learn more.
          </p>
        </div>
      </div>
    );
  }

  const system = organ.system ? SYSTEMS_MAP[organ.system] : null;
  const color = organSystemColor || (system?.color || "var(--primary)");

  return (
    <div
      className="rounded-xl border bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition-all"
      style={{ borderColor: color }}
      role="region"
      aria-label={`Details for ${organ.name}`}
      aria-live="polite"
    >
      <div
        className="flex items-center justify-between rounded-t-xl px-5 py-4"
        style={{
          background: `color-mix(in srgb, ${color} 10%, var(--card))`,
          borderBottom: `1px solid color-mix(in srgb, ${color} 20%, var(--border))`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
          >
            <OrganIcon organId={organ.id} className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">{organ.name}</h2>
            {system && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
              >
                <system.icon className="h-3 w-3" />
                {system.label}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleZoom}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
        >
          {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
        </button>
      </div>

      <div className={`space-y-4 p-5 ${zoomed ? "max-h-[70vh] overflow-y-auto" : ""}`}>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {educational ? organ.eduFact || organ.description : organ.description}
        </p>

        {educational ? (
          <div
            className="rounded-lg border p-4"
            style={{
              borderColor: `color-mix(in srgb, ${color} 25%, var(--border))`,
              background: `color-mix(in srgb, ${color} 6%, var(--background))`,
            }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase" style={{ color }}>
              <BookOpen className="h-3.5 w-3.5" />
              Simplified explanation
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{organ.eduFact || organ.description}</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Function</h3>
              <p className="text-sm leading-6 text-[var(--foreground)]">{organ.function}</p>
            </div>
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Interesting Facts</h3>
              <ul className="space-y-2">
                {organ.facts.map((fact, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg p-2.5 text-sm leading-5"
                    style={{ background: `color-mix(in srgb, ${color} 6%, var(--background))` }}
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[var(--foreground)]">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MemoizedDetailPanel = memo(DetailPanel);

function OrganGrid({ organs, selectedOrgan, systemFilter, onSelect }) {
  if (organs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <Search className="h-10 w-10 text-[var(--muted-foreground)] opacity-30" />
        <p className="text-sm font-semibold text-[var(--foreground)]">No organs found</p>
        <p className="text-xs text-[var(--muted-foreground)]">Try a different search term or clear the filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {organs.map((organ) => {
        const isSelected = selectedOrgan?.id === organ.id;
        const system = organ.system ? SYSTEMS_MAP[organ.system] : null;
        const baseColor = system?.color || "var(--primary)";

        return (
          <button
            key={organ.id}
            type="button"
            onClick={() => onSelect(organ)}
            className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${
              isSelected ? "" : "border-[var(--border)] bg-[var(--card)] hover:shadow-sm"
            }`}
            style={
              isSelected
                ? {
                    background: `color-mix(in srgb, ${baseColor} 12%, var(--card))`,
                    borderColor: baseColor,
                    boxShadow: `0 0 0 1px ${baseColor}`,
                  }
                : {}
            }
            aria-label={`Select ${organ.name}`}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
              style={{ background: `color-mix(in srgb, ${baseColor} 14%, transparent)`, color: baseColor }}
            >
              <OrganIcon organId={organ.id} className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-[var(--foreground)]">{organ.name}</span>
            {system && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase"
                style={{ background: `color-mix(in srgb, ${baseColor} 14%, transparent)`, color: baseColor }}
              >
                {system.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const MemoizedOrganGrid = memo(OrganGrid);

const BODY_PATH =
  "M180,5 C215,5 230,20 230,45 C230,68 218,82 205,90 L205,100 C225,102 265,108 280,120 C295,132 310,145 310,160 C310,168 305,172 295,175 L290,185 C290,200 298,210 298,225 L298,320 C298,330 305,340 310,350 L310,515 C310,530 300,540 280,540 L280,545 C280,555 285,560 290,568 L290,600 C290,615 275,620 255,620 L105,620 C85,620 70,615 70,600 L70,568 C75,560 80,555 80,545 L80,540 C60,540 50,530 50,515 L50,350 C55,340 62,330 62,320 L62,225 C62,210 70,200 70,185 L65,175 C55,172 50,168 50,160 C50,145 65,132 80,120 C95,108 135,102 155,100 L155,90 C142,82 130,68 130,45 C130,20 145,5 180,5 Z";

const ORGANS_IN_SVG = ORGANS.filter((o) => o.id !== "skin");

function BodyDiagram({ organs, selectedOrgan, systemFilter, onSelect, educational }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null);

  const activeColorMap = useMemo(() => {
    const map = {};
    organs.forEach((o) => {
      if (o.system) map[o.id] = SYSTEMS_MAP[o.system]?.color || "#14B8A6";
    });
    return map;
  }, [organs]);

  const visualOrgans = useMemo(() => ORGANS_IN_SVG, []);

  const renderOrganSvg = useCallback(
    (organ) => {
      const isHovered = hoveredOrgan === organ.id;
      const isSelected = selectedOrgan?.id === organ.id;
      const systemColor = organ.system ? activeColorMap[organ.id] : null;
      const isHighlighted = !systemFilter || organ.system === systemFilter;
      const dimmed = systemFilter && !isHighlighted;
      const color = systemColor || "var(--primary)";
      const strokeColor = isSelected || isHovered ? color : dimmed ? "var(--border)" : color;
      const strokeW = isSelected ? 3 : isHovered ? 2.5 : dimmed ? 1 : 1.5;
      const fillC = isSelected
        ? `color-mix(in srgb, ${color} 30%, transparent)`
        : isHovered
          ? `color-mix(in srgb, ${color} 18%, transparent)`
          : dimmed
            ? `color-mix(in srgb, var(--card) 60%, var(--muted))`
            : `color-mix(in srgb, ${color} 12%, transparent)`;

      const common = {
        fill: fillC,
        stroke: strokeColor,
        strokeWidth: strokeW,
        style: { transition: "all 150ms ease-out", cursor: "pointer", filter: dimmed ? "grayscale(0.6) opacity(0.4)" : "none" },
      };

      if (organ.id === "muscles") return null;

      if (organ.svgType === "ellipse") {
        return <ellipse {...common} {...organ.svgProps} />;
      }

      if (organ.svgType === "path") {
        return <path {...common} {...organ.svgProps} />;
      }

      if (organ.svgType === "group" && organ.svgChildren) {
        return (
          <g>
            {organ.svgChildren.map((child, i) => {
              const El = child.type;
              return <El key={i} {...common} {...child.props} />;
            })}
          </g>
        );
      }

      return null;
    },
    [hoveredOrgan, selectedOrgan, systemFilter, activeColorMap]
  );

  return (
    <svg
      viewBox="0 0 360 650"
      className="h-auto w-full max-w-[340px] md:max-w-[380px]"
      role="img"
      aria-label="Interactive human body diagram showing major organs"
    >
      <g id="body-outline">
        <path d={BODY_PATH} fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
        <path d={BODY_PATH} fill="none" stroke="var(--muted-foreground)" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
      </g>

      {(!systemFilter || systemFilter === "muscular") && (
        <path
          d={BODY_PATH}
          fill={`color-mix(in srgb, ${SYSTEM_COLORS.muscular} 10%, transparent)`}
          stroke="none"
          opacity={
            !systemFilter || systemFilter === "muscular"
              ? selectedOrgan?.id === "muscles"
                ? 0.7
                : 0.25
              : 0.08
          }
          pointerEvents="none"
        />
      )}

      {visualOrgans.map((organ) => (
        <g
          key={organ.id}
          onClick={() => onSelect(organ)}
          onMouseEnter={() => setHoveredOrgan(organ.id)}
          onMouseLeave={() => setHoveredOrgan(null)}
          role="button"
          tabIndex={0}
          aria-label={`${organ.name}${organ.system ? ` - ${SYSTEMS_MAP[organ.system]?.label} system` : ""}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(organ);
            }
          }}
          style={{ cursor: "pointer", outline: "none" }}
        >
          {renderOrganSvg(organ)}
          {educational && (
            <text
              x={
                organ.svgType === "ellipse"
                  ? organ.svgProps.cx
                  : organ.id === "heart"
                    ? 168
                    : 180
              }
              y={
                organ.svgType === "ellipse"
                  ? organ.svgProps.cy - organ.svgProps.ry - 6
                  : organ.id === "heart"
                    ? 115
                    : organ.id === "intestines"
                      ? 298
                      : 100
              }
              textAnchor="middle"
              fontSize="8"
              fontWeight="600"
              fill="var(--foreground)"
            >
              {organ.name}
            </text>
          )}
          <title>{organ.name} — click to learn more</title>
        </g>
      ))}
    </svg>
  );
}

const MemoizedBodyDiagram = memo(BodyDiagram);

export default function ToolHome() {
  const [selectedOrganId, setSelectedOrganId] = useState(null);
  const [systemFilter, setSystemFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [educational, setEducational] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const filteredOrgans = useMemo(() => {
    if (!searchQuery.trim()) return ORGANS;
    const q = searchQuery.trim().toLowerCase();
    return ORGANS.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.system && SYSTEMS_MAP[o.system]?.label.toLowerCase().includes(q)) ||
        o.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const visibleOrgans = useMemo(() => {
    if (systemFilter) return filteredOrgans.filter((o) => o.system === systemFilter);
    return filteredOrgans;
  }, [filteredOrgans, systemFilter]);

  const selectedOrgan = useMemo(() => {
    if (!selectedOrganId) return null;
    return ORGANS_MAP[selectedOrganId] || null;
  }, [selectedOrganId]);

  const handleSelectOrgan = useCallback((organ) => {
    setSelectedOrganId((prev) => (prev === organ.id ? null : organ.id));
    setZoomed(false);
  }, []);

  const handleToggleZoom = useCallback(() => setZoomed((p) => !p), []);

  const handleSystemChange = useCallback((id) => setSystemFilter((p) => (p === id ? null : id)), []);

  const handleClearSearch = useCallback(() => setSearchQuery(""), []);

  const organSystemColor = useMemo(() => {
    if (!selectedOrgan?.system) return null;
    return SYSTEM_COLORS[selectedOrgan.system] || null;
  }, [selectedOrgan]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Brain className="h-4 w-4" />
            Human Anatomy
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Human Anatomy Explorer</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Click on any organ in the body diagram below, or use the search and system filters to explore
            how the human body works.
          </p>
        </div>

        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organs..."
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-9 pr-8 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              aria-label="Search organs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <MemoizedSystemFilter selected={systemFilter} onChange={handleSystemChange} />

          <div className="flex items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={educational}
                onChange={(e) => setEducational(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <BookOpen className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-xs font-semibold text-[var(--foreground)]">Educational mode</span>
              <span className="rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--muted-foreground)]">Simplified</span>
            </label>
            {selectedOrgan && (
              <span className="text-xs text-[var(--muted-foreground)]">
                Showing {educational ? "simplified" : "detailed"} view
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px]">
          <div className="flex flex-col items-center">
            <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex justify-center">
                <MemoizedBodyDiagram
                  organs={ORGANS}
                  selectedOrgan={selectedOrgan}
                  systemFilter={systemFilter}
                  onSelect={handleSelectOrgan}
                  educational={educational}
                />
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]" />
                  Click to select
                </span>
                {SYSTEMS.map((s) => (
                  <span key={s.id} className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 w-full">
              <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {visibleOrgans.length > 0
                  ? `${visibleOrgans.length} organ${visibleOrgans.length !== 1 ? "s" : ""} found`
                  : "Quick access"}
              </h3>
              <MemoizedOrganGrid
                organs={visibleOrgans.length > 0 ? visibleOrgans : ORGANS}
                selectedOrgan={selectedOrgan}
                systemFilter={systemFilter}
                onSelect={handleSelectOrgan}
              />
            </div>
          </div>

          <div className="md:sticky md:top-6 md:self-start">
            <MemoizedDetailPanel
              organ={selectedOrgan}
              zoomed={zoomed}
              onToggleZoom={handleToggleZoom}
              educational={educational}
              organSystemColor={organSystemColor}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
