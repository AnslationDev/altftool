// Insect type catalogue. Each entry defines scoring/behaviour plus its
// original inline-SVG artwork component. `rarity` drives weighted spawning.
import Butterfly from "../components/insects/Butterfly";
import Bee from "../components/insects/Bee";
import Ladybug from "../components/insects/Ladybug";
import Dragonfly from "../components/insects/Dragonfly";
import Firefly from "../components/insects/Firefly";
import Beetle from "../components/insects/Beetle";
import Ant from "../components/insects/Ant";

export const INSECT_TYPES = {
  butterfly: {
    key: "butterfly",
    name: "Butterfly",
    points: 10,
    speed: 95, // base px / second
    size: 46,
    color: "#a855f7",
    rarity: 0.14,
    Component: Butterfly,
  },
  bee: {
    key: "bee",
    name: "Bee",
    points: 15,
    speed: 130,
    size: 40,
    color: "#f59e0b",
    rarity: 0.14,
    Component: Bee,
  },
  ladybug: {
    key: "ladybug",
    name: "Ladybug",
    points: 12,
    speed: 85,
    size: 42,
    color: "#ef4444",
    rarity: 0.16,
    Component: Ladybug,
  },
  dragonfly: {
    key: "dragonfly",
    name: "Dragonfly",
    points: 18,
    speed: 160,
    size: 52,
    color: "#38bdf8",
    rarity: 0.1,
    Component: Dragonfly,
  },
  firefly: {
    key: "firefly",
    name: "Firefly",
    points: 14,
    speed: 110,
    size: 38,
    color: "#facc15",
    rarity: 0.14,
    Component: Firefly,
  },
  beetle: {
    key: "beetle",
    name: "Beetle",
    points: 8,
    speed: 70,
    size: 44,
    color: "#22c55e",
    rarity: 0.16,
    Component: Beetle,
  },
  ant: {
    key: "ant",
    name: "Ant",
    points: 6,
    speed: 140,
    size: 36,
    color: "#b45309",
    rarity: 0.16,
    Component: Ant,
  },
};

// Difficulty presets — they tune spawn rate, speed, time, lives and lifetime.
export const DIFFICULTIES = {
  easy: {
    key: "easy",
    name: "Easy",
    time: 75,
    lives: 5,
    spawnInterval: 1100,
    speedMul: 0.8,
    maxInsects: 5,
    lifetime: 4200,
  },
  medium: {
    key: "medium",
    name: "Medium",
    time: 60,
    lives: 4,
    spawnInterval: 850,
    speedMul: 1.0,
    maxInsects: 7,
    lifetime: 3400,
  },
  hard: {
    key: "hard",
    name: "Hard",
    time: 50,
    lives: 3,
    spawnInterval: 620,
    speedMul: 1.25,
    maxInsects: 9,
    lifetime: 2700,
  },
};

// Player-selectable favourite insects (cosmetic + small starting bonus).
export const CHOICE_INSECTS = ["butterfly", "bee", "ladybug", "dragonfly", "firefly", "beetle", "ant"];
