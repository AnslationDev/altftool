"use client";

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  Crosshair, Info, Moon,
  Search, Star, Telescope, ZoomIn, ZoomOut,
} from "lucide-react";

/* ──────────────────────────────────────────
   Constellation data
   ────────────────────────────────────────── */

const CONSTELLATIONS = [
  {
    id: "ursa-major", name: "Ursa Major", meaning: "Great Bear", season: "Spring",
    genitive: "Ursae Majoris",
    brightest: "Dubhe (α UMa) – 1.8 mag",
    story: "In Greek myth, Zeus turned the nymph Callisto into a bear. Her son Arcas almost killed her while hunting, so Zeus placed them both in the sky as Ursa Major and Ursa Minor.",
    facts: "Contains the Big Dipper asterism — seven bright stars forming a ladle shape. Two of its stars, Dubhe and Merak, point to Polaris, the North Star.",
    stars: [
      { id: "alpha", name: "Dubhe", x: 0.50, y: 0.75, mag: 1.79, dist: 123, temp: "K0III" },
      { id: "beta", name: "Merak", x: 0.43, y: 0.70, mag: 2.37, dist: 79.7, temp: "A1V" },
      { id: "gamma", name: "Phecda", x: 0.39, y: 0.63, mag: 2.44, dist: 83.2, temp: "A0Ve" },
      { id: "delta", name: "Megrez", x: 0.44, y: 0.58, mag: 3.31, dist: 80.5, temp: "A3V" },
      { id: "epsilon", name: "Alioth", x: 0.52, y: 0.55, mag: 1.76, dist: 80.9, temp: "A0p" },
      { id: "zeta", name: "Mizar", x: 0.59, y: 0.60, mag: 2.27, dist: 82.8, temp: "A1V" },
      { id: "eta", name: "Alkaid", x: 0.64, y: 0.67, mag: 1.86, dist: 103.9, temp: "B3V" },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    id: "ursa-minor", name: "Ursa Minor", meaning: "Little Bear", season: "Spring",
    genitive: "Ursae Minoris",
    brightest: "Polaris (α UMi) – 2.0 mag",
    story: "Ursa Minor represents Arcas, the son of Callisto, placed in the sky beside his mother. Its tail forms the Little Dipper.",
    facts: "Polaris, the North Star, sits nearly directly above Earth's north pole. It has been used for navigation for centuries.",
    stars: [
      { id: "alpha", name: "Polaris", x: 0.45, y: 0.92, mag: 1.98, dist: 433, temp: "F7Ib" },
      { id: "delta", name: "Yildun", x: 0.43, y: 0.85, mag: 4.36, dist: 183, temp: "A1V" },
      { id: "epsilon", name: "Urodelus", x: 0.46, y: 0.80, mag: 4.22, dist: 347, temp: "G5III" },
      { id: "zeta", name: "Akhfa al Farkadain", x: 0.52, y: 0.77, mag: 4.32, dist: 380, temp: "A3V" },
      { id: "eta", name: "Anwar al Farkadain", x: 0.47, y: 0.72, mag: 4.95, dist: 97.3, temp: "F5V" },
      { id: "beta", name: "Kochab", x: 0.40, y: 0.74, mag: 2.08, dist: 130.9, temp: "K4III" },
      { id: "gamma", name: "Pherkad", x: 0.36, y: 0.79, mag: 3.07, dist: 480, temp: "A3II-III" },
    ],
    lines: [[6,5],[5,4],[4,3],[3,2],[2,1],[1,0]],
  },
  {
    id: "orion", name: "Orion", meaning: "The Hunter", season: "Winter",
    genitive: "Orionis",
    brightest: "Rigel (β Ori) – 0.1 mag",
    story: "Orion was a giant huntsman in Greek myth. He boasted he could kill any beast, so Gaia sent a scorpion to sting him. Both were placed in opposite sides of the sky.",
    facts: "Orion's seven brightest stars form his shoulders, belt and knees. The three belt stars (Alnitak, Alnilam, Mintaka) are a famous celestial landmark. Betelgeuse is a red supergiant nearing the end of its life.",
    stars: [
      { id: "betelgeuse", name: "Betelgeuse", x: 0.32, y: 0.60, mag: 0.50, dist: 643, temp: "M2Iab" },
      { id: "bellatrix", name: "Bellatrix", x: 0.26, y: 0.63, mag: 1.64, dist: 250, temp: "B2III" },
      { id: "alnitak", name: "Alnitak", x: 0.30, y: 0.53, mag: 1.89, dist: 1260, temp: "O9.5Iab" },
      { id: "alnilam", name: "Alnilam", x: 0.34, y: 0.52, mag: 1.70, dist: 2000, temp: "B0Iab" },
      { id: "mintaka", name: "Mintaka", x: 0.38, y: 0.51, mag: 2.25, dist: 1200, temp: "O9.5II" },
      { id: "saiph", name: "Saiph", x: 0.36, y: 0.42, mag: 2.07, dist: 650, temp: "B0.5Iab" },
      { id: "rigel", name: "Rigel", x: 0.42, y: 0.45, mag: 0.13, dist: 860, temp: "B8Ia" },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,2],[2,4]],
  },
  {
    id: "cassiopeia", name: "Cassiopeia", meaning: "Seated Queen", season: "Fall",
    genitive: "Cassiopeiae",
    brightest: "Schedar (α Cas) – 2.2 mag",
    story: "Queen Cassiopeia boasted that she and her daughter Andromeda were more beautiful than the Nereids. As punishment, she was chained to a throne in the sky, sometimes shown upside-down.",
    facts: "Cassiopeia's five main stars form a distinctive W or M shape. It lies in the Milky Way and contains many open star clusters visible with binoculars.",
    stars: [
      { id: "alpha", name: "Schedar", x: 0.45, y: 0.30, mag: 2.24, dist: 228, temp: "K0IIIa" },
      { id: "beta", name: "Caph", x: 0.50, y: 0.25, mag: 2.28, dist: 54.5, temp: "F2III" },
      { id: "gamma", name: "Navi", x: 0.55, y: 0.30, mag: 2.47, dist: 613, temp: "B0IV" },
      { id: "delta", name: "Ruchbah", x: 0.56, y: 0.36, mag: 2.66, dist: 99.4, temp: "A5IV" },
      { id: "epsilon", name: "Segin", x: 0.50, y: 0.40, mag: 3.38, dist: 410, temp: "B3V" },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    id: "scorpius", name: "Scorpius", meaning: "Scorpion", season: "Summer",
    genitive: "Scorpii",
    brightest: "Antares (α Sco) – 1.0 mag",
    story: "The scorpion sent by Gaia to kill Orion. Zeus placed the scorpion in the sky as a constellation. Orion and Scorpius never appear in the sky at the same time.",
    facts: "Antares, the heart of the scorpion, is a red supergiant 700 times the Sun's diameter. Its name means 'rival of Mars' because of its reddish hue. Scorpius also contains many bright globular clusters.",
    stars: [
      { id: "antares", name: "Antares", x: 0.60, y: 0.48, mag: 0.96, dist: 550, temp: "M1.5Iab" },
      { id: "acrab", name: "Acrab", x: 0.64, y: 0.42, mag: 2.90, dist: 530, temp: "B1V" },
      { id: "dschubba", name: "Dschubba", x: 0.68, y: 0.45, mag: 2.32, dist: 400, temp: "B2V" },
      { id: "fang", name: "Fang", x: 0.72, y: 0.40, mag: 2.70, dist: 420, temp: "B1.5V" },
      { id: "sargas", name: "Sargas", x: 0.76, y: 0.35, mag: 1.87, dist: 270, temp: "F1II" },
      { id: "shaula", name: "Shaula", x: 0.80, y: 0.28, mag: 1.63, dist: 700, temp: "B1.5IV" },
      { id: "lesath", name: "Lesath", x: 0.82, y: 0.25, mag: 2.70, dist: 580, temp: "B2IV" },
      { id: "graffias", name: "Graffias", x: 0.60, y: 0.40, mag: 2.56, dist: 90, temp: "F5V" },
    ],
    lines: [[0,1],[1,2],[0,7],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    id: "leo", name: "Leo", meaning: "Lion", season: "Spring",
    genitive: "Leonis",
    brightest: "Regulus (α Leo) – 1.3 mag",
    story: "The Nemean Lion slain by Heracles as the first of his Twelve Labours. The lion's pelt became Heracles' impenetrable armour.",
    facts: "Regulus, the 'little king', marks the lion's heart. The sickle asterism forms the lion's mane and head. Leo contains many bright galaxies visible in amateur telescopes.",
    stars: [
      { id: "regulus", name: "Regulus", x: 0.38, y: 0.35, mag: 1.36, dist: 79.3, temp: "B7V" },
      { id: "denebola", name: "Denebola", x: 0.56, y: 0.30, mag: 2.14, dist: 35.9, temp: "A3V" },
      { id: "zavijava", name: "Zavijava", x: 0.48, y: 0.28, mag: 3.44, dist: 32.3, temp: "G0IV" },
      { id: "zosma", name: "Zosma", x: 0.52, y: 0.24, mag: 2.56, dist: 58.4, temp: "A4IV" },
      { id: "rasalas", name: "Rasalas", x: 0.34, y: 0.28, mag: 3.54, dist: 100, temp: "K2III" },
      { id: "giebel", name: "Giebel", x: 0.30, y: 0.32, mag: 3.34, dist: 105, temp: "K0III" },
      { id: "algeiba", name: "Algeiba", x: 0.36, y: 0.40, mag: 2.01, dist: 130, temp: "K0III" },
    ],
    lines: [[0,5],[5,4],[4,6],[6,0],[6,1],[1,2],[2,3]],
  },
  {
    id: "cygnus", name: "Cygnus", meaning: "Swan", season: "Summer",
    genitive: "Cygni",
    brightest: "Deneb (α Cyg) – 1.2 mag",
    story: "Zeus disguised himself as a swan to seduce Leda. The constellation represents the swan flying along the Milky Way.",
    facts: "The Northern Cross is an asterism within Cygnus. Deneb is one of the most luminous stars known, 200,000 times brighter than the Sun. The Cygnus region is rich in nebulae including the North America Nebula.",
    stars: [
      { id: "deneb", name: "Deneb", x: 0.45, y: 0.85, mag: 1.25, dist: 2615, temp: "A2Ia" },
      { id: "albireo", name: "Albireo", x: 0.40, y: 0.68, mag: 3.08, dist: 430, temp: "K3II" },
      { id: "zeta", name: "Zeta Cygni", x: 0.50, y: 0.70, mag: 3.21, dist: 150, temp: "G8III" },
      { id: "gamma", name: "Sadr", x: 0.48, y: 0.76, mag: 2.23, dist: 1800, temp: "F8Iab" },
      { id: "delta", name: "Fawaris", x: 0.48, y: 0.82, mag: 2.86, dist: 170, temp: "B9III" },
      { id: "epsilon", name: "Aljanah", x: 0.42, y: 0.78, mag: 2.48, dist: 73, temp: "K0III" },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[3,5],[5,1]],
  },
  {
    id: "taurus", name: "Taurus", meaning: "Bull", season: "Winter",
    genitive: "Tauri",
    brightest: "Aldebaran (α Tau) – 0.8 mag",
    story: "Zeus transformed into a white bull to carry Europa across the sea to Crete. The bull's front half is visible in the sky.",
    facts: "Aldebaran, the bull's fiery red eye, is 65 light-years away. The Pleiades (Seven Sisters) cluster sits on the bull's shoulder. The Hyades cluster forms the bull's face and is the nearest open cluster to Earth.",
    stars: [
      { id: "aldebaran", name: "Aldebaran", x: 0.40, y: 0.35, mag: 0.87, dist: 65.1, temp: "K5III" },
      { id: "el-nath", name: "Elnath", x: 0.45, y: 0.22, mag: 1.68, dist: 130, temp: "B7III" },
      { id: "lambda", name: "λ Tauri", x: 0.35, y: 0.30, mag: 3.41, dist: 370, temp: "B3V" },
      { id: "xi", name: "ξ Tauri", x: 0.33, y: 0.38, mag: 3.73, dist: 220, temp: "B9Vn" },
      { id: "omicron", name: "ο Tauri", x: 0.37, y: 0.42, mag: 3.61, dist: 210, temp: "G6II" },
      { id: "tau", name: "τ Tauri", x: 0.42, y: 0.40, mag: 4.27, dist: 400, temp: "B3V" },
    ],
    lines: [[0,1],[0,2],[2,3],[3,4],[0,5]],
  },
  {
    id: "gemini", name: "Gemini", meaning: "Twins", season: "Winter",
    genitive: "Geminorum",
    brightest: "Pollux (β Gem) – 1.1 mag",
    story: "Castor and Pollux were twin brothers from Greek myth. Pollux was immortal, Castor was mortal. When Castor died, Pollux asked Zeus to share his immortality, so they alternate between Olympus and Hades.",
    facts: "Castor and Pollux mark the heads of the twins. Castor is a complex sextuple star system. The constellation Gemini lies on the ecliptic and is one of the 12 zodiac signs.",
    stars: [
      { id: "castor", name: "Castor", x: 0.42, y: 0.48, mag: 1.98, dist: 51.6, temp: "A1V" },
      { id: "pollux", name: "Pollux", x: 0.50, y: 0.45, mag: 1.14, dist: 33.8, temp: "K0III" },
      { id: "alhena", name: "Alhena", x: 0.55, y: 0.55, mag: 1.93, dist: 109, temp: "A0IV" },
      { id: "wasat", name: "Wasat", x: 0.48, y: 0.55, mag: 3.53, dist: 59.4, temp: "F2IV" },
      { id: "mebsuta", name: "Mebsuta", x: 0.54, y: 0.63, mag: 2.98, dist: 790, temp: "G8Ib" },
      { id: "propus", name: "Propus", x: 0.38, y: 0.52, mag: 3.27, dist: 580, temp: "M0III" },
      { id: "tejat", name: "Tejat Prior", x: 0.36, y: 0.60, mag: 3.49, dist: 320, temp: "M3III" },
    ],
    lines: [[0,1],[0,3],[1,3],[1,2],[2,4],[0,5],[5,6]],
  },
  {
    id: "canis-major", name: "Canis Major", meaning: "Greater Dog", season: "Winter",
    genitive: "Canis Majoris",
    brightest: "Sirius (α CMa) – –1.4 mag",
    story: "Laelaps, the fastest hunting dog, was placed in the sky by Zeus. It follows Orion the Hunter across the sky.",
    facts: "Sirius, the Dog Star, is the brightest star in the night sky at magnitude –1.46. It is only 8.6 light-years away and has a white dwarf companion. Ancient Egyptians based their calendar on its heliacal rising.",
    stars: [
      { id: "sirius", name: "Sirius", x: 0.38, y: 0.18, mag: -1.46, dist: 8.6, temp: "A1V" },
      { id: "adara", name: "Adara", x: 0.44, y: 0.14, mag: 1.51, dist: 430, temp: "B2II" },
      { id: "wezen", name: "Wezen", x: 0.50, y: 0.18, mag: 1.86, dist: 1800, temp: "F8Ia" },
      { id: "aludra", name: "Aludra", x: 0.52, y: 0.24, mag: 2.47, dist: 3200, temp: "B5Ia" },
      { id: "furud", name: "Furud", x: 0.42, y: 0.26, mag: 3.04, dist: 340, temp: "B2V" },
      { id: "mirzam", name: "Mirzam", x: 0.34, y: 0.22, mag: 2.0, dist: 500, temp: "B1II-III" },
    ],
    lines: [[0,1],[1,2],[2,3],[0,5],[0,4]],
  },
  {
    id: "lyra", name: "Lyra", meaning: "Lyre / Harp", season: "Summer",
    genitive: "Lyrae",
    brightest: "Vega (α Lyr) – 0.0 mag",
    story: "The lyre of Orpheus, the legendary musician whose music could charm all living things. After his death, Zeus placed his lyre in the sky.",
    facts: "Vega is the fifth brightest star and one of the vertices of the Summer Triangle. It was the first star (after the Sun) to be photographed and the first to have its spectrum recorded. The Ring Nebula (M57) lies within Lyra.",
    stars: [
      { id: "vega", name: "Vega", x: 0.48, y: 0.80, mag: 0.03, dist: 25.0, temp: "A0V" },
      { id: "shal", name: "Sheliak", x: 0.44, y: 0.74, mag: 3.52, dist: 960, temp: "B2V" },
      { id: "sulamak", name: "Sulafat", x: 0.52, y: 0.74, mag: 3.25, dist: 620, temp: "B9III" },
    ],
    lines: [[0,1],[0,2],[1,2]],
  },
  {
    id: "crux", name: "Crux", meaning: "Southern Cross", season: "Spring",
    genitive: "Crucis",
    brightest: "Acrux (α Cru) – 0.8 mag",
    story: "Crux is the smallest of the 88 modern constellations. It was used by sailors for navigation in the Southern Hemisphere, pointing toward the south celestial pole.",
    facts: "The Southern Cross appears on the flags of Australia, New Zealand, Brazil, Papua New Guinea and several other nations. The Coalsack Nebula, a dark nebula visible to the naked eye, sits next to Crux.",
    stars: [
      { id: "acrux", name: "Acrux", x: 0.48, y: 0.20, mag: 0.76, dist: 320, temp: "B0.5IV" },
      { id: "bcr", name: "Becrux", x: 0.44, y: 0.26, mag: 1.30, dist: 280, temp: "B2IV" },
      { id: "gacr", name: "Gacrux", x: 0.40, y: 0.30, mag: 1.63, dist: 88.6, temp: "M4III" },
      { id: "dcr", name: "δ Crucis", x: 0.50, y: 0.30, mag: 2.78, dist: 360, temp: "B2V" },
      { id: "ecr", name: "ε Crucis", x: 0.52, y: 0.24, mag: 3.58, dist: 230, temp: "K3III" },
    ],
    lines: [[0,1],[1,2],[4,3],[3,0],[0,4]],
  },
  {
    id: "pegasus", name: "Pegasus", meaning: "Winged Horse", season: "Fall",
    genitive: "Pegasi",
    brightest: "Markab (α Peg) – 2.4 mag",
    story: "Pegasus sprang from the blood of Medusa after Perseus beheaded her. The winged horse carried Bellerophon to battle the Chimera.",
    facts: "The Great Square of Pegasus is a prominent autumn asterism. Despite being the horse's body, the star Alpheratz (Sirrah) is now officially part of Andromeda. Four stars in the square mark the horse's torso.",
    stars: [
      { id: "markab", name: "Markab", x: 0.55, y: 0.42, mag: 2.49, dist: 133, temp: "A0IV" },
      { id: "scheat", name: "Scheat", x: 0.50, y: 0.48, mag: 2.44, dist: 200, temp: "M2III" },
      { id: "algenib", name: "Algenib", x: 0.60, y: 0.48, mag: 2.83, dist: 333, temp: "B2IV" },
      { id: "enif", name: "Enif", x: 0.66, y: 0.40, mag: 2.39, dist: 670, temp: "K2Ib" },
      { id: "matar", name: "Matar", x: 0.62, y: 0.34, mag: 2.95, dist: 160, temp: "G8II-III" },
      { id: "homam", name: "Homam", x: 0.55, y: 0.35, mag: 3.41, dist: 210, temp: "F5V" },
    ],
    lines: [[0,1],[0,2],[1,3],[2,3],[3,4],[0,5]],
  },
  {
    id: "andromeda", name: "Andromeda", meaning: "Chained Princess", season: "Fall",
    genitive: "Andromedae",
    brightest: "Alpheratz (α And) – 2.1 mag",
    story: "Andromeda was chained to a rock as a sacrifice to Cetus the sea monster. Perseus rescued her, and they married. She was placed in the sky with her parents Cepheus and Cassiopeia nearby.",
    facts: "The Andromeda Galaxy (M31), the closest major galaxy to the Milky Way, lies within this constellation. It is visible to the naked eye on dark nights. Andromeda also contains the star Almach, a beautiful double star with contrasting colours.",
    stars: [
      { id: "alpheratz", name: "Alpheratz", x: 0.55, y: 0.52, mag: 2.07, dist: 97, temp: "B8IV" },
      { id: "mirach", name: "Mirach", x: 0.48, y: 0.55, mag: 2.07, dist: 200, temp: "M0III" },
      { id: "almach", name: "Almach", x: 0.40, y: 0.58, mag: 2.26, dist: 350, temp: "K2III" },
      { id: "delta", name: "δ Andromedae", x: 0.44, y: 0.48, mag: 3.28, dist: 100, temp: "K3III" },
      { id: "epsilon", name: "ε Andromedae", x: 0.58, y: 0.55, mag: 4.34, dist: 165, temp: "G6III" },
      { id: "zeta", name: "ζ Andromedae", x: 0.50, y: 0.60, mag: 4.08, dist: 180, temp: "K1III" },
    ],
    lines: [[0,1],[1,2],[0,4],[1,3],[2,5],[1,5]],
  },
  {
    id: "draco", name: "Draco", meaning: "Dragon", season: "Spring",
    genitive: "Draconis",
    brightest: "Eltanin (γ Dra) – 2.2 mag",
    story: "The dragon Ladon that guarded the golden apples in the Garden of the Hesperides. It was killed by Heracles during his eleventh labour and placed in the sky.",
    facts: "Draco winds around the north celestial pole. Thuban (α Draconis) was the north pole star around 3000 BCE — the ancient Egyptians aligned their pyramids to it. Draco contains many faint galaxies including the Cat's Eye Nebula.",
    stars: [
      { id: "eltanin", name: "Eltanin", x: 0.46, y: 0.54, mag: 2.24, dist: 148, temp: "K5III" },
      { id: "rastaban", name: "Rastaban", x: 0.48, y: 0.50, mag: 2.73, dist: 380, temp: "G2II" },
      { id: "grumium", name: "Grumium", x: 0.52, y: 0.46, mag: 3.28, dist: 85, temp: "M0III" },
      { id: "thuban", name: "Thuban", x: 0.56, y: 0.52, mag: 3.65, dist: 270, temp: "A0III" },
      { id: "alpha", name: "α Draconis", x: 0.60, y: 0.56, mag: 3.67, dist: 290, temp: "F7V" },
      { id: "edasich", name: "Edasich", x: 0.64, y: 0.60, mag: 3.29, dist: 90, temp: "K2III" },
      { id: "zeta", name: "ζ Draconis", x: 0.58, y: 0.64, mag: 3.17, dist: 340, temp: "B6III" },
      { id: "eta", name: "η Draconis", x: 0.50, y: 0.66, mag: 2.73, dist: 88, temp: "G8III" },
      { id: "iota", name: "ι Draconis", x: 0.42, y: 0.62, mag: 3.29, dist: 100, temp: "K2III" },
      { id: "theta", name: "θ Draconis", x: 0.38, y: 0.58, mag: 4.01, dist: 68, temp: "F8IV" },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],
  },
  {
    id: "sagittarius", name: "Sagittarius", meaning: "Archer", season: "Summer",
    genitive: "Sagittarii",
    brightest: "Kaus Australis (ε Sgr) – 1.8 mag",
    story: "The centaur Chiron, a wise teacher of heroes including Heracles and Achilles. He is depicted as an archer aiming his bow at the heart of Scorpius.",
    facts: "Sagittarius points toward the centre of the Milky Way galaxy, which lies in the rich star fields of its teapot asterism. It contains many of the brightest nebulae including the Lagoon Nebula (M8) and the Trifid Nebula (M20).",
    stars: [
      { id: "kaus-australis", name: "Kaus Australis", x: 0.70, y: 0.35, mag: 1.79, dist: 143, temp: "B9.5III" },
      { id: "kaus-media", name: "Kaus Media", x: 0.68, y: 0.32, mag: 2.70, dist: 305, temp: "K0III" },
      { id: "kaus-borealis", name: "Kaus Borealis", x: 0.65, y: 0.30, mag: 2.81, dist: 77, temp: "K1III" },
      { id: "nunki", name: "Nunki", x: 0.72, y: 0.30, mag: 2.05, dist: 210, temp: "B2V" },
      { id: "ascella", name: "Ascella", x: 0.74, y: 0.26, mag: 2.60, dist: 90, temp: "A2V" },
      { id: "albaldah", name: "Albaldah", x: 0.62, y: 0.36, mag: 2.87, dist: 390, temp: "G8II" },
      { id: "ira", name: "τ Sagittarii", x: 0.66, y: 0.40, mag: 3.34, dist: 125, temp: "K1III" },
    ],
    lines: [[0,1],[1,2],[2,5],[5,6],[0,3],[3,4]],
  },
];

const SEASONS = ["All", "Spring", "Summer", "Fall", "Winter"];

/* ──────────────────────────────────────────
   Background stars (random distribution)
   ────────────────────────────────────────── */

function generateBgStars(seed = 42) {
  const rng = (s) => { let x = Math.sin(s * 9301 + 49297) % 1; return x < 0 ? x + 1 : x; };
  const bg = [];
  let s = seed;
  for (let i = 0; i < 600; i += 1) {
    s = (s * 16807) % 2147483647;
    const u = s / 2147483647;
    s = (s * 16807) % 2147483647;
    const v = s / 2147483647;
    s = (s * 16807) % 2147483647;
    const m = s / 2147483647;
    const mag = 3 + m * 5;
    bg.push({ x: u, y: v, mag });
  }
  return bg;
}

const BG_STARS = generateBgStars();

/* ──────────────────────────────────────────
   Utilities
   ────────────────────────────────────────── */

function toCanvasX(x, vp) {
  return (x - vp.x) * vp.scale * vp.w + vp.w / 2;
}

function toCanvasY(y, vp) {
  return (1 - (y - vp.y)) * vp.scale * vp.h + vp.h / 2;
}

function magToRadius(mag) {
  const r = 6 / (mag + 1);
  return Math.max(1.2, Math.min(r, 5));
}

function magToOpacity(mag) {
  const o = 1 - (mag + 0.5) / 8;
  return Math.max(0.3, Math.min(o, 1));
}

/* ──────────────────────────────────────────
   Component
   ────────────────────────────────────────── */

export default function ToolHome() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("All");
  const [vp, setVp] = useState({ x: 0.5, y: 0.5, scale: 1, w: 800, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /* resize */
  useEffect(() => {
    const onResize = () => {
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      setVp((p) => ({ ...p, w: rect.width, h: rect.height }));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* filtered list */
  const filtered = useMemo(() => {
    let list = CONSTELLATIONS;
    if (season !== "All") list = list.filter((c) => c.season === season);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.meaning.toLowerCase().includes(q));
    }
    return list;
  }, [season, search]);

  /* drawing */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { w, h, x, y, scale } = vp;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    /* background gradient */
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    bgGrad.addColorStop(0, "#0a1628");
    bgGrad.addColorStop(0.5, "#060e1c");
    bgGrad.addColorStop(1, "#02040a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    /* background stars */
    const sv = Math.min(w, h) * 0.0015 * scale;
    for (const star of BG_STARS) {
      const cx = toCanvasX(star.x, vp);
      const cy = toCanvasY(star.y, vp);
      if (cx < -20 || cx > w + 20 || cy < -20 || cy > h + 20) continue;
      const r = magToRadius(star.mag) * sv;
      const alpha = magToOpacity(star.mag);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
      ctx.fill();
    }

    if (!filtered.length && !error) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No constellations match your search", w / 2, h / 2);
      return;
    }

    /* draw constellation lines for filtered + selected */
    for (const con of filtered) {
      const isSelected = con.id === selectedId;
      const lineColor = isSelected ? "rgba(45,212,191,0.8)" : "rgba(255,255,255,0.15)";
      const lineWidth = isSelected ? 2.5 : 1;

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth * (scale ** 0.5);

      for (const [i, j] of con.lines) {
        const a = con.stars[i];
        const b = con.stars[j];
        const ax = toCanvasX(a.x, vp);
        const ay = toCanvasY(a.y, vp);
        const bx = toCanvasX(b.x, vp);
        const by = toCanvasY(b.y, vp);
        if (ax < -50 && bx < -50) continue;
        if (ax > w + 50 && bx > w + 50) continue;
        if (ay < -50 && by < -50) continue;
        if (ay > h + 50 && by > h + 50) continue;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      /* glow on selected */
      if (isSelected) {
        for (const [i, j] of con.lines) {
          const a = con.stars[i];
          const b = con.stars[j];
          const ax = toCanvasX(a.x, vp);
          const ay = toCanvasY(a.y, vp);
          const bx = toCanvasX(b.x, vp);
          const by = toCanvasY(b.y, vp);
          ctx.strokeStyle = "rgba(45,212,191,0.2)";
          ctx.lineWidth = 8 * (scale ** 0.5);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      /* draw stars */
      for (const star of con.stars) {
        const cx = toCanvasX(star.x, vp);
        const cy = toCanvasY(star.y, vp);
        if (cx < -20 || cx > w + 20 || cy < -20 || cy > h + 20) continue;

        const r = magToRadius(star.mag) * sv * (isSelected ? 1.4 : 1);
        const alpha = magToOpacity(star.mag);

        /* glow */
        if (isSelected && star.mag < 3) {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 6);
          grad.addColorStop(0, `rgba(45,212,191,0.15)`);
          grad.addColorStop(1, "rgba(45,212,191,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        /* star color based on temperature */
        let color = "255,255,255";
        if (star.temp) {
          if (star.temp.startsWith("M") || star.temp.startsWith("K")) color = "255,200,150";
          else if (star.temp.startsWith("G") || star.temp.startsWith("F")) color = "255,230,180";
          else if (star.temp.startsWith("A")) color = "230,235,255";
          else if (star.temp.startsWith("B") || star.temp.startsWith("O")) color = "180,200,255";
        }

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();

        /* bright star cross */
        if (star.mag < 1.5 && isSelected) {
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          const cl = r * 1.8;
          ctx.beginPath();
          ctx.moveTo(cx - cl, cy);
          ctx.lineTo(cx + cl, cy);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy - cl);
          ctx.lineTo(cx, cy + cl);
          ctx.stroke();
        }
      }
    }

    /* constellation labels for selected or hovered */
    for (const con of filtered) {
      if (con.id !== selectedId) continue;
      const cx = con.stars.reduce((s, st) => s + st.x, 0) / con.stars.length;
      const cy = con.stars.reduce((s, st) => s + st.y, 0) / con.stars.length;
      const lx = toCanvasX(cx, vp);
      const ly = toCanvasY(cy, vp) - 30 * scale;
      ctx.fillStyle = "rgba(45,212,191,0.9)";
      ctx.font = `bold ${16 * scale}px Geist, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(con.name, lx, ly);
    }
  }, [filtered, selectedId, vp, error]);

  useEffect(() => {
    setError(null);
    setLoading(true);
    try {
      draw();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [draw]);

  /* interaction */
  const getEvtPoint = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }, []);

  const getCanvasCoords = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const { w, h, x, y, scale } = vp;
    return {
      nx: (px - w / 2) / (scale * w) + x,
      ny: 1 - ((py - h / 2) / (scale * h) + y),
    };
  }, [vp]);

  const handleClick = useCallback((e) => {
    const pt = getEvtPoint(e);
    const coords = getCanvasCoords(pt.x, pt.y);
    if (!coords) return;

    const { nx, ny } = coords;
    let found = null;
    let minDist = 0.06;

    for (const con of filtered) {
      for (const star of con.stars) {
        const dx = star.x - nx;
        const dy = star.y - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          found = con;
        }
      }
    }

    if (found) {
      setSelectedId(found.id);
      setDetails(found);
    } else {
      setSelectedId(null);
      setDetails(null);
    }
  }, [filtered, getCanvasCoords, getEvtPoint]);

  const handlePointerDown = useCallback((e) => {
    setIsPanning(true);
    const pt = getEvtPoint(e);
    setPanStart(pt);
  }, [getEvtPoint]);

  const handlePointerMove = useCallback((e) => {
    if (!isPanning || !panStart) return;
    const pt = getEvtPoint(e);
    const dx = (pt.x - panStart.x) / vp.w / vp.scale;
    const dy = -(pt.y - panStart.y) / vp.h / vp.scale;
    setVp((p) => ({ ...p, x: p.x - dx, y: p.y - dy }));
    setPanStart(pt);
  }, [isPanning, panStart, vp]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  /* wheel zoom */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setVp((p) => ({ ...p, scale: Math.max(0.3, Math.min(p.scale * delta, 6)) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* zoom buttons */
  const zoomIn = () => setVp((p) => ({ ...p, scale: Math.min(p.scale * 1.3, 6) }));
  const zoomOut = () => setVp((p) => ({ ...p, scale: Math.max(p.scale / 1.3, 0.3) }));
  const resetView = () => setVp((p) => ({ ...p, x: 0.5, y: 0.5, scale: 1 }));

  /* touch support */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastDist = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDist = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist > 0) {
        const factor = dist / lastDist;
        setVp((p) => ({ ...p, scale: Math.max(0.3, Math.min(p.scale * factor, 6)) }));
      }
      lastDist = dist;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  /* ── render ── */

  return (
    <div className="mx-auto w-full max-w-7xl py-6 px-0 sm:px-4">
      {/* Hero */}
      <div className="mb-6 space-y-4 px-4 sm:px-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase text-primary">
          <Moon className="h-3.5 w-3.5" />
          Sky explorer
        </div>
        <h1 className="heading max-w-3xl">Constellation Finder</h1>
        <p className="description max-w-2xl">
          Explore 16 major constellations on an interactive night sky map. Search, click, and
          zoom to discover star names, magnitudes, distances, and mythology.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3 px-4 sm:px-0">
        {/* Search */}
        <div className="relative min-w-0 flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search constellations…"
            aria-label="Search constellations"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          <button type="button" onClick={zoomOut} aria-label="Zoom out" className="btn min-h-9 px-2.5 py-1.5 text-sm hover:bg-muted">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-semibold text-muted-foreground">
            {Math.round(vp.scale * 100)}%
          </span>
          <button type="button" onClick={zoomIn} aria-label="Zoom in" className="btn min-h-9 px-2.5 py-1.5 text-sm hover:bg-muted">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button type="button" onClick={resetView} aria-label="Reset view" className="btn min-h-9 px-2.5 py-1.5 text-sm hover:bg-muted">
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Season tabs */}
      <div className="mb-4 flex flex-wrap gap-2 px-4 sm:px-0" role="tablist" aria-label="Season filter">
        {SEASONS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={season === s}
            onClick={() => setSeason(s)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              season === s
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {s === "All" ? "★ All" : s}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border border-border bg-[#02040a] shadow-[var(--anslation-ds-shadow-md)]"
          style={{ aspectRatio: "4 / 3", minHeight: 320, touchAction: "none", cursor: isPanning ? "grabbing" : "grab" }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onClick={handleClick}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            aria-label="Interactive night sky map showing constellations"
          />

          {/* loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#02040a]/80">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Star className="h-5 w-5 animate-pulse text-primary" />
                <span className="text-sm font-semibold">Loading star chart…</span>
              </div>
            </div>
          )}

          {/* error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#02040a]/80">
              <div className="max-w-sm rounded-lg border border-[var(--anslation-ds-danger)]/30 bg-[var(--anslation-ds-danger)]/10 p-4 text-center">
                <p className="text-sm font-semibold text-[var(--anslation-ds-danger)]">Something went wrong</p>
                <p className="mt-1 text-xs text-muted-foreground">{error}</p>
                <button type="button" onClick={() => { setError(null); setLoading(true); }} className="btn-primary mt-3 min-h-9 px-3 py-1.5 text-xs">
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* zoom hint */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] text-white/50 backdrop-blur-sm">
            Scroll to zoom · Drag to pan · Click a star
          </div>
        </div>

        {/* Details panel */}
        <div className="space-y-4">
          {details ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <Telescope className="h-3 w-3" />
                  {details.season}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{details.genitive}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{details.name}</h2>
              <p className="mt-0.5 text-sm italic text-muted-foreground">The {details.meaning}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background p-2.5">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Brightest star</p>
                  <p className="mt-0.5 text-xs font-semibold text-foreground">{details.brightest}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-2.5">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground">Stars counted</p>
                  <p className="mt-0.5 text-xs font-semibold text-foreground">{details.stars.length} major</p>
                </div>
              </div>

              {/* Star list */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Major stars</p>
                <div className="max-h-48 space-y-1 overflow-y-auto no-scrollbar">
                  {details.stars.map((star) => (
                    <div key={star.id} className="flex items-center justify-between gap-2 rounded-md bg-background px-2.5 py-1.5 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Star className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate font-semibold text-foreground">{star.name}</span>
                      </div>
                      <div className="flex shrink-0 gap-3 text-muted-foreground">
                        <span>{star.mag.toFixed(2)} mag</span>
                        <span>{star.dist} ly</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Story */}
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Mythology</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{details.story}</p>
              </div>

              {/* Facts */}
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Did you know?</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{details.facts}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Telescope className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">No constellation selected</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click a star on the sky map to see details
              </p>
            </div>
          )}

          {/* Facts section */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Sky facts</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                There are 88 officially recognized constellations covering the entire celestial sphere.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Constellations are not real groupings — stars in a pattern may be hundreds of light-years apart.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                The IAU defined modern constellation boundaries in 1930, using both Latin names and three-letter abbreviations.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                The brightest star in the night sky is Sirius (α Canis Majoris) at magnitude −1.46.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
