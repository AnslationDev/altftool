"use client";

import React, { useState, useMemo } from "react";
import { Search, RotateCcw, Info, Sparkles } from "lucide-react";

// Full 118-element dataset (IUPAC-recognized elements 1-118) with Periodic Table Grid Coordinates.
// Sourced from standard reference values (CIAAW/IUPAC standard atomic weights, NIST, CRC Handbook
// conventions); superheavy/synthetic elements without a stable-isotope standard atomic weight use
// the conventional bracketed mass-number notation, e.g. "[268]". Fields marked "Unknown" have no
// experimentally measured value published (only a handful of atoms have ever been produced).
const ELEMENTS = [
  { n: 1, sym: "H", name: "Hydrogen", mass: 1.008, cat: "Nonmetal", group: 1, period: 1, eConfig: "1s¹", melt: "-259.1 °C", boil: "-252.9 °C", density: "0.0899 g/L", disc: "1766", uses: "Rocket fuel, ammonia synthesis, fuel cells." },
  { n: 2, sym: "He", name: "Helium", mass: 4.0026, cat: "Noble Gas", group: 18, period: 1, eConfig: "1s²", melt: "-272.2 °C", boil: "-268.9 °C", density: "0.1786 g/L", disc: "1868", uses: "Cryogenic cooling, balloons, MRI magnets." },
  { n: 3, sym: "Li", name: "Lithium", mass: 6.94, cat: "Alkali Metal", group: 1, period: 2, eConfig: "[He] 2s¹", melt: "180.5 °C", boil: "1342 °C", density: "0.534 g/cm³", disc: "1817", uses: "Rechargeable Li-ion batteries, ceramics." },
  { n: 4, sym: "Be", name: "Beryllium", mass: 9.0122, cat: "Alkaline Earth", group: 2, period: 2, eConfig: "[He] 2s²", melt: "1287 °C", boil: "2469 °C", density: "1.85 g/cm³", disc: "1798", uses: "Aerospace mirrors, X-ray windows, alloys." },
  { n: 5, sym: "B", name: "Boron", mass: 10.81, cat: "Metalloid", group: 13, period: 2, eConfig: "[He] 2s² 2p¹", melt: "2076 °C", boil: "3927 °C", density: "2.34 g/cm³", disc: "1808", uses: "Pyrex glass, semiconductors, fiberglass." },
  { n: 6, sym: "C", name: "Carbon", mass: 12.011, cat: "Nonmetal", group: 14, period: 2, eConfig: "[He] 2s² 2p²", melt: "3550 °C", boil: "4027 °C", density: "2.26 g/cm³", disc: "Ancient", uses: "Organic life, steel manufacture, diamonds." },
  { n: 7, sym: "N", name: "Nitrogen", mass: 14.007, cat: "Nonmetal", group: 15, period: 2, eConfig: "[He] 2s² 2p³", melt: "-210.0 °C", boil: "-195.8 °C", density: "1.251 g/L", disc: "1772", uses: "Fertilizers, food preservation, explosives." },
  { n: 8, sym: "O", name: "Oxygen", mass: 15.999, cat: "Nonmetal", group: 16, period: 2, eConfig: "[He] 2s² 2p⁴", melt: "-218.8 °C", boil: "-183.0 °C", density: "1.429 g/L", disc: "1774", uses: "Cellular respiration, steelmaking, medical oxygen." },
  { n: 9, sym: "F", name: "Fluorine", mass: 18.998, cat: "Halogen", group: 17, period: 2, eConfig: "[He] 2s² 2p⁵", melt: "-219.7 °C", boil: "-188.1 °C", density: "1.696 g/L", disc: "1886", uses: "Toothpaste fluoride, Teflon, refrigerants." },
  { n: 10, sym: "Ne", name: "Neon", mass: 20.180, cat: "Noble Gas", group: 18, period: 2, eConfig: "[He] 2s² 2p⁶", melt: "-248.6 °C", boil: "-246.1 °C", density: "0.900 g/L", disc: "1898", uses: "Neon signage, high-voltage indicators, lasers." },
  { n: 11, sym: "Na", name: "Sodium", mass: 22.990, cat: "Alkali Metal", group: 1, period: 3, eConfig: "[Ne] 3s¹", melt: "97.8 °C", boil: "883 °C", density: "0.97 g/cm³", disc: "1807", uses: "Table salt (NaCl), street lamps, soap production." },
  { n: 12, sym: "Mg", name: "Magnesium", mass: 24.305, cat: "Alkaline Earth", group: 2, period: 3, eConfig: "[Ne] 3s²", melt: "650 °C", boil: "1090 °C", density: "1.74 g/cm³", disc: "1755", uses: "Lightweight automotive alloys, fireworks, medicine." },
  { n: 13, sym: "Al", name: "Aluminum", mass: 26.982, cat: "Post-Transition", group: 13, period: 3, eConfig: "[Ne] 3s² 3p¹", melt: "660.3 °C", boil: "2470 °C", density: "2.70 g/cm³", disc: "1825", uses: "Aircraft frames, beverage cans, foil wrapping." },
  { n: 14, sym: "Si", name: "Silicon", mass: 28.085, cat: "Metalloid", group: 14, period: 3, eConfig: "[Ne] 3s² 3p²", melt: "1414 °C", boil: "3265 °C", density: "2.33 g/cm³", disc: "1824", uses: "Microchips, solar panels, computer processors." },
  { n: 15, sym: "P", name: "Phosphorus", mass: 30.974, cat: "Nonmetal", group: 15, period: 3, eConfig: "[Ne] 3s² 3p³", melt: "44.15 °C", boil: "280.5 °C", density: "1.82 g/cm³", disc: "1669", uses: "Agricultural fertilizers, safety matches, DNA." },
  { n: 16, sym: "S", name: "Sulfur", mass: 32.06, cat: "Nonmetal", group: 16, period: 3, eConfig: "[Ne] 3s² 3p⁴", melt: "115.2 °C", boil: "444.6 °C", density: "2.07 g/cm³", disc: "Ancient", uses: "Sulfuric acid, rubber vulcanization, gunpowder." },
  { n: 17, sym: "Cl", name: "Chlorine", mass: 35.45, cat: "Halogen", group: 17, period: 3, eConfig: "[Ne] 3s² 3p⁵", melt: "-101.5 °C", boil: "-34.04 °C", density: "3.21 g/L", disc: "1774", uses: "Water sanitation, PVC plastics, disinfectants." },
  { n: 18, sym: "Ar", name: "Argon", mass: 39.948, cat: "Noble Gas", group: 18, period: 3, eConfig: "[Ne] 3s² 3p⁶", melt: "-189.3 °C", boil: "-185.8 °C", density: "1.784 g/L", disc: "1894", uses: "Shielding gas for welding, incandescent bulbs." },
  { n: 19, sym: "K", name: "Potassium", mass: 39.098, cat: "Alkali Metal", group: 1, period: 4, eConfig: "[Ar] 4s¹", melt: "63.5 °C", boil: "759 °C", density: "0.89 g/cm³", disc: "1807", uses: "Nerve signaling in body, crop fertilizers." },
  { n: 20, sym: "Ca", name: "Calcium", mass: 40.078, cat: "Alkaline Earth", group: 2, period: 4, eConfig: "[Ar] 4s²", melt: "842 °C", boil: "1484 °C", density: "1.55 g/cm³", disc: "1808", uses: "Human bones and teeth, cement & plaster." },
  { n: 21, sym: "Sc", name: "Scandium", mass: 44.956, cat: "Transition Metal", group: 3, period: 4, eConfig: "[Ar] 3d¹ 4s²", melt: "1540.9 °C", boil: "2835.9 °C", density: "2.985 g/cm³", disc: "1879", uses: "Aerospace alloys, sports equipment (bicycle frames), high-intensity stadium lighting." },
  { n: 22, sym: "Ti", name: "Titanium", mass: 47.867, cat: "Transition Metal", group: 4, period: 4, eConfig: "[Ar] 3d² 4s²", melt: "1667.9 °C", boil: "3286.9 °C", density: "4.506 g/cm³", disc: "1791", uses: "Aircraft airframes, surgical implants, white pigment (TiO2) in paint." },
  { n: 23, sym: "V", name: "Vanadium", mass: 50.942, cat: "Transition Metal", group: 5, period: 4, eConfig: "[Ar] 3d³ 4s²", melt: "1909.9 °C", boil: "3406.9 °C", density: "6 g/cm³", disc: "1801", uses: "Steel alloying for strength, vanadium redox flow batteries, industrial catalysts." },
  { n: 24, sym: "Cr", name: "Chromium", mass: 51.996, cat: "Transition Metal", group: 6, period: 4, eConfig: "[Ar] 3d⁵ 4s¹", melt: "1906.9 °C", boil: "2670.9 °C", density: "7.19 g/cm³", disc: "1794", uses: "Stainless steel, chrome plating, leather tanning." },
  { n: 25, sym: "Mn", name: "Manganese", mass: 54.938, cat: "Transition Metal", group: 7, period: 4, eConfig: "[Ar] 3d⁵ 4s²", melt: "1245.9 °C", boil: "2060.9 °C", density: "7.21 g/cm³", disc: "1774", uses: "Steelmaking desulfurizer, alkaline battery cathodes, aluminum alloys." },
  { n: 26, sym: "Fe", name: "Iron", mass: 55.845, cat: "Transition Metal", group: 8, period: 4, eConfig: "[Ar] 3d⁶ 4s²", melt: "1538 °C", boil: "2862 °C", density: "7.87 g/cm³", disc: "Ancient", uses: "Structural steel, hemoglobin in red blood cells." },
  { n: 27, sym: "Co", name: "Cobalt", mass: 58.933, cat: "Transition Metal", group: 9, period: 4, eConfig: "[Ar] 3d⁷ 4s²", melt: "1494.9 °C", boil: "2926.9 °C", density: "8.9 g/cm³", disc: "1735", uses: "Lithium-ion battery cathodes, rechargeable magnets, blue ceramic pigments." },
  { n: 28, sym: "Ni", name: "Nickel", mass: 58.693, cat: "Transition Metal", group: 10, period: 4, eConfig: "[Ar] 3d⁸ 4s²", melt: "1454.9 °C", boil: "2729.9 °C", density: "8.908 g/cm³", disc: "1751", uses: "Stainless steel, rechargeable batteries, coinage alloys." },
  { n: 29, sym: "Cu", name: "Copper", mass: 63.546, cat: "Transition Metal", group: 11, period: 4, eConfig: "[Ar] 3d¹⁰ 4s¹", melt: "1085 °C", boil: "2562 °C", density: "8.96 g/cm³", disc: "Ancient", uses: "Electrical wiring, plumbing pipes, bronze alloys." },
  { n: 30, sym: "Zn", name: "Zinc", mass: 65.382, cat: "Transition Metal", group: 12, period: 4, eConfig: "[Ar] 3d¹⁰ 4s²", melt: "419.5 °C", boil: "906.9 °C", density: "7.14 g/cm³", disc: "Ancient", uses: "Galvanizing steel against rust, brass alloys, dietary supplements." },
  { n: 31, sym: "Ga", name: "Gallium", mass: 69.723, cat: "Post-Transition", group: 13, period: 4, eConfig: "[Ar] 3d¹⁰ 4s² 4p¹", melt: "29.8 °C", boil: "2399.9 °C", density: "5.91 g/cm³", disc: "1875", uses: "LED and laser-diode semiconductors, low-melting alloys, solar cells." },
  { n: 32, sym: "Ge", name: "Germanium", mass: 72.631, cat: "Metalloid", group: 14, period: 4, eConfig: "[Ar] 3d¹⁰ 4s² 4p²", melt: "938.3 °C", boil: "2832.9 °C", density: "5.323 g/cm³", disc: "1886", uses: "Fiber-optic cable cores, infrared optics, semiconductor transistors." },
  { n: 33, sym: "As", name: "Arsenic", mass: 74.922, cat: "Metalloid", group: 15, period: 4, eConfig: "[Ar] 3d¹⁰ 4s² 4p³", melt: "817 °C (28 atm)", boil: "615 °C (sublimes at 1 atm)", density: "5.727 g/cm³", disc: "1250", uses: "Semiconductor doping (gallium arsenide), wood preservatives, historically pesticides." },
  { n: 34, sym: "Se", name: "Selenium", mass: 78.972, cat: "Nonmetal", group: 16, period: 4, eConfig: "[Ar] 3d¹⁰ 4s² 4p⁴", melt: "220.9 °C", boil: "684.9 °C", density: "4.81 g/cm³", disc: "1817", uses: "Glassmaking decolorizer, photocopier drums, dietary supplements." },
  { n: 35, sym: "Br", name: "Bromine", mass: 79.904, cat: "Halogen", group: 17, period: 4, eConfig: "[Ar] 3d¹⁰ 4s² 4p⁵", melt: "-7.3 °C", boil: "58.9 °C", density: "3.1028 g/cm³", disc: "1825", uses: "Flame retardants, water disinfection, pharmaceutical intermediates." },
  { n: 36, sym: "Kr", name: "Krypton", mass: 83.798, cat: "Noble Gas", group: 18, period: 4, eConfig: "[Ar] 3d¹⁰ 4s² 4p⁶", melt: "-157.4 °C", boil: "-153.2 °C", density: "3.749 g/L", disc: "1898", uses: "High-performance camera flash bulbs, energy-efficient window insulation, lasers." },
  { n: 37, sym: "Rb", name: "Rubidium", mass: 85.468, cat: "Alkali Metal", group: 1, period: 5, eConfig: "[Kr] 5s¹", melt: "39.3 °C", boil: "687.9 °C", density: "1.532 g/cm³", disc: "1861", uses: "Atomic clocks, research lasers, specialty glass." },
  { n: 38, sym: "Sr", name: "Strontium", mass: 87.621, cat: "Alkaline Earth", group: 2, period: 5, eConfig: "[Kr] 5s²", melt: "776.9 °C", boil: "1376.9 °C", density: "2.64 g/cm³", disc: "1787", uses: "Red fireworks flares, ceramic magnets, historic CRT television glass." },
  { n: 39, sym: "Y", name: "Yttrium", mass: 88.906, cat: "Transition Metal", group: 3, period: 5, eConfig: "[Kr] 4d¹ 5s²", melt: "1525.9 °C", boil: "2929.9 °C", density: "4.472 g/cm³", disc: "1794", uses: "Red display phosphors, YAG laser crystals, superconductor components." },
  { n: 40, sym: "Zr", name: "Zirconium", mass: 91.224, cat: "Transition Metal", group: 4, period: 5, eConfig: "[Kr] 4d² 5s²", melt: "1854.9 °C", boil: "4376.9 °C", density: "6.52 g/cm³", disc: "1789", uses: "Nuclear reactor fuel cladding, ceramic tiles, corrosion-resistant chemical equipment." },
  { n: 41, sym: "Nb", name: "Niobium", mass: 92.906, cat: "Transition Metal", group: 5, period: 5, eConfig: "[Kr] 4d⁴ 5s¹", melt: "2476.9 °C", boil: "4743.9 °C", density: "8.57 g/cm³", disc: "1801", uses: "Superconducting magnet wire (MRI machines), jet engine superalloys, steel strengthening." },
  { n: 42, sym: "Mo", name: "Molybdenum", mass: 95.951, cat: "Transition Metal", group: 6, period: 5, eConfig: "[Kr] 4d⁵ 5s¹", melt: "2622.9 °C", boil: "4638.9 °C", density: "10.28 g/cm³", disc: "1778", uses: "High-strength steel alloys, industrial lubricant additive, electrical filaments." },
  { n: 43, sym: "Tc", name: "Technetium", mass: "[98]", cat: "Transition Metal", group: 7, period: 5, eConfig: "[Kr] 4d⁵ 5s²", melt: "2156.9 °C", boil: "4264.9 °C", density: "11 g/cm³", disc: "1937", uses: "Medical diagnostic imaging (Tc-99m radiotracer); virtually absent in nature." },
  { n: 44, sym: "Ru", name: "Ruthenium", mass: 101.07, cat: "Transition Metal", group: 8, period: 5, eConfig: "[Kr] 4d⁷ 5s¹", melt: "2333.9 °C", boil: "4149.9 °C", density: "12.45 g/cm³", disc: "1844", uses: "Wear-resistant electrical contacts, chip resistors, chemical catalysts." },
  { n: 45, sym: "Rh", name: "Rhodium", mass: 102.91, cat: "Transition Metal", group: 9, period: 5, eConfig: "[Kr] 4d⁸ 5s¹", melt: "1963.9 °C", boil: "3694.9 °C", density: "12.41 g/cm³", disc: "1804", uses: "Catalytic converters, jewelry plating, glass fiber production." },
  { n: 46, sym: "Pd", name: "Palladium", mass: 106.42, cat: "Transition Metal", group: 10, period: 5, eConfig: "[Kr] 4d¹⁰", melt: "1554.9 °C", boil: "2962.9 °C", density: "12.023 g/cm³", disc: "1802", uses: "Catalytic converters, electronics soldering, hydrogen purification and storage." },
  { n: 47, sym: "Ag", name: "Silver", mass: 107.87, cat: "Transition Metal", group: 11, period: 5, eConfig: "[Kr] 4d¹⁰ 5s¹", melt: "961.8 °C", boil: "2162 °C", density: "10.49 g/cm³", disc: "Ancient", uses: "Jewelry, solar panels, electronics contacts." },
  { n: 48, sym: "Cd", name: "Cadmium", mass: 112.41, cat: "Transition Metal", group: 12, period: 5, eConfig: "[Kr] 4d¹⁰ 5s²", melt: "321.1 °C", boil: "766.9 °C", density: "8.65 g/cm³", disc: "1817", uses: "Rechargeable nickel-cadmium batteries, pigments, corrosion-resistant plating." },
  { n: 49, sym: "In", name: "Indium", mass: 114.82, cat: "Post-Transition", group: 13, period: 5, eConfig: "[Kr] 4d¹⁰ 5s² 5p¹", melt: "156.6 °C", boil: "2071.9 °C", density: "7.31 g/cm³", disc: "1863", uses: "Transparent touchscreen electrodes (indium tin oxide), solar panels, solder alloys." },
  { n: 50, sym: "Sn", name: "Tin", mass: 118.71, cat: "Post-Transition", group: 14, period: 5, eConfig: "[Kr] 4d¹⁰ 5s² 5p²", melt: "231.9 °C", boil: "2601.9 °C", density: "7.365 g/cm³", disc: "Ancient", uses: "Solder alloys, tin-plated steel cans, bronze alloys." },
  { n: 51, sym: "Sb", name: "Antimony", mass: 121.76, cat: "Metalloid", group: 15, period: 5, eConfig: "[Kr] 4d¹⁰ 5s² 5p³", melt: "630.6 °C", boil: "1634.9 °C", density: "6.697 g/cm³", disc: "Ancient", uses: "Flame retardant compounds, lead-acid battery alloys, semiconductors." },
  { n: 52, sym: "Te", name: "Tellurium", mass: 127.6, cat: "Metalloid", group: 16, period: 5, eConfig: "[Kr] 4d¹⁰ 5s² 5p⁴", melt: "449.5 °C", boil: "987.9 °C", density: "6.24 g/cm³", disc: "1782", uses: "Thin-film solar panels (CdTe), alloying steel and copper, thermoelectric devices." },
  { n: 53, sym: "I", name: "Iodine", mass: 126.9, cat: "Halogen", group: 17, period: 5, eConfig: "[Kr] 4d¹⁰ 5s² 5p⁵", melt: "113.7 °C", boil: "184.3 °C", density: "4.933 g/cm³", disc: "1811", uses: "Antiseptics, thyroid medication and imaging, iodized table salt." },
  { n: 54, sym: "Xe", name: "Xenon", mass: 131.29, cat: "Noble Gas", group: 18, period: 5, eConfig: "[Kr] 4d¹⁰ 5s² 5p⁶", melt: "-111.7 °C", boil: "-108.1 °C", density: "5.894 g/L", disc: "1898", uses: "High-intensity car headlights, ion propulsion for spacecraft, anesthesia research." },
  { n: 55, sym: "Cs", name: "Cesium", mass: 132.91, cat: "Alkali Metal", group: 1, period: 6, eConfig: "[Xe] 6s¹", melt: "28.6 °C", boil: "670.9 °C", density: "1.93 g/cm³", disc: "1860", uses: "Atomic clocks defining the second, drilling fluids, photoelectric cells." },
  { n: 56, sym: "Ba", name: "Barium", mass: 137.33, cat: "Alkaline Earth", group: 2, period: 6, eConfig: "[Xe] 6s²", melt: "726.9 °C", boil: "1844.9 °C", density: "3.51 g/cm³", disc: "1772", uses: "Barium-meal medical X-ray imaging, drilling mud, green fireworks coloring." },
  { n: 57, sym: "La", name: "Lanthanum", mass: 138.91, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 5d¹ 6s²", melt: "919.9 °C", boil: "3463.9 °C", density: "6.162 g/cm³", disc: "1838", uses: "Camera and telescope lens glass, catalytic converters, nickel-metal-hydride batteries." },
  { n: 58, sym: "Ce", name: "Cerium", mass: 140.12, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹ 5d¹ 6s²", melt: "794.9 °C", boil: "3442.9 °C", density: "6.77 g/cm³", disc: "1803", uses: "Catalytic converters, glass and lens polishing powder, self-cleaning oven coatings." },
  { n: 59, sym: "Pr", name: "Praseodymium", mass: 140.91, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f³ 6s²", melt: "934.9 °C", boil: "3129.9 °C", density: "6.77 g/cm³", disc: "1885", uses: "Aircraft engine alloys, strong magnets, didymium welding-glass filters." },
  { n: 60, sym: "Nd", name: "Neodymium", mass: 144.24, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f⁴ 6s²", melt: "1023.9 °C", boil: "3073.9 °C", density: "7.01 g/cm³", disc: "1841", uses: "High-strength permanent magnets for motors and headphones, laser crystals." },
  { n: 61, sym: "Pm", name: "Promethium", mass: "[145]", cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f⁵ 6s²", melt: "1041.9 °C", boil: "2999.9 °C", density: "7.26 g/cm³", disc: "1945", uses: "Luminous paint and betavoltaic nuclear batteries; no natural abundance." },
  { n: 62, sym: "Sm", name: "Samarium", mass: 150.36, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f⁶ 6s²", melt: "1071.9 °C", boil: "1899.9 °C", density: "7.52 g/cm³", disc: "1879", uses: "Samarium-cobalt magnets, cancer radiotherapy (Sm-153), reactor control rods." },
  { n: 63, sym: "Eu", name: "Europium", mass: 151.96, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f⁷ 6s²", melt: "825.9 °C", boil: "1528.9 °C", density: "5.264 g/cm³", disc: "1896", uses: "Red and blue phosphors in TV/phone screens, euro banknote anti-counterfeiting." },
  { n: 64, sym: "Gd", name: "Gadolinium", mass: 157.25, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f⁷ 5d¹ 6s²", melt: "1311.9 °C", boil: "2999.9 °C", density: "7.9 g/cm³", disc: "1880", uses: "MRI contrast agent, nuclear reactor control rods, magnetic refrigeration." },
  { n: 65, sym: "Tb", name: "Terbium", mass: 158.93, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f⁹ 6s²", melt: "1355.9 °C", boil: "3122.9 °C", density: "8.23 g/cm³", disc: "1843", uses: "Green display phosphors, magnetostrictive alloys, solid-state devices." },
  { n: 66, sym: "Dy", name: "Dysprosium", mass: 162.5, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹⁰ 6s²", melt: "1406.9 °C", boil: "2566.9 °C", density: "8.54 g/cm³", disc: "1886", uses: "Neodymium magnet additive for heat resistance, data storage devices." },
  { n: 67, sym: "Ho", name: "Holmium", mass: 164.93, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹¹ 6s²", melt: "1460.9 °C", boil: "2599.9 °C", density: "8.79 g/cm³", disc: "1878", uses: "Medical and industrial lasers, some of the strongest permanent magnets." },
  { n: 68, sym: "Er", name: "Erbium", mass: 167.26, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹² 6s²", melt: "1528.9 °C", boil: "2867.9 °C", density: "9.066 g/cm³", disc: "1843", uses: "Fiber-optic signal amplifiers, pink glass and ceramic coloring, medical lasers." },
  { n: 69, sym: "Tm", name: "Thulium", mass: 168.93, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹³ 6s²", melt: "1544.9 °C", boil: "1949.9 °C", density: "9.32 g/cm³", disc: "1879", uses: "Portable X-ray devices, high-power lasers; one of the least abundant lanthanides." },
  { n: 70, sym: "Yb", name: "Ytterbium", mass: 173.05, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹⁴ 6s²", melt: "823.9 °C", boil: "1195.9 °C", density: "6.9 g/cm³", disc: "1878", uses: "Atomic clocks, fiber laser amplifiers, stainless steel additive." },
  { n: 71, sym: "Lu", name: "Lutetium", mass: 174.97, cat: "Lanthanide", group: 3, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹ 6s²", melt: "1651.9 °C", boil: "3401.9 °C", density: "9.841 g/cm³", disc: "1906", uses: "PET-scan detector crystals, oil-refining catalysts; one of the least abundant lanthanides." },
  { n: 72, sym: "Hf", name: "Hafnium", mass: 178.49, cat: "Transition Metal", group: 4, period: 6, eConfig: "[Xe] 4f¹⁴ 5d² 6s²", melt: "2232.9 °C", boil: "4602.9 °C", density: "13.31 g/cm³", disc: "1922", uses: "Nuclear reactor control rods, microprocessor transistor gates, plasma cutting tips." },
  { n: 73, sym: "Ta", name: "Tantalum", mass: 180.95, cat: "Transition Metal", group: 5, period: 6, eConfig: "[Xe] 4f¹⁴ 5d³ 6s²", melt: "3016.9 °C", boil: "5457.9 °C", density: "16.69 g/cm³", disc: "1802", uses: "Miniature electronic capacitors in phones and laptops, surgical implants." },
  { n: 74, sym: "W", name: "Tungsten", mass: 183.84, cat: "Transition Metal", group: 6, period: 6, eConfig: "[Xe] 4f¹⁴ 5d⁴ 6s²", melt: "3421.9 °C", boil: "5929.9 °C", density: "19.25 g/cm³", disc: "1783", uses: "Incandescent light bulb filaments, cutting tool tips, radiation shielding." },
  { n: 75, sym: "Re", name: "Rhenium", mass: 186.21, cat: "Transition Metal", group: 7, period: 6, eConfig: "[Xe] 4f¹⁴ 5d⁵ 6s²", melt: "3185.9 °C", boil: "5595.9 °C", density: "21.02 g/cm³", disc: "1908", uses: "Jet engine superalloys (turbine blades), catalysts for lead-free gasoline." },
  { n: 76, sym: "Os", name: "Osmium", mass: 190.23, cat: "Transition Metal", group: 8, period: 6, eConfig: "[Xe] 4f¹⁴ 5d⁶ 6s²", melt: "3032.9 °C", boil: "5011.9 °C", density: "22.59 g/cm³", disc: "1803", uses: "Fountain pen nib tips, electrical contacts; one of the densest metals known." },
  { n: 77, sym: "Ir", name: "Iridium", mass: 192.22, cat: "Transition Metal", group: 9, period: 6, eConfig: "[Xe] 4f¹⁴ 5d⁷ 6s²", melt: "2445.9 °C", boil: "4129.9 °C", density: "22.56 g/cm³", disc: "1803", uses: "Spark plug electrodes, high-temperature crucibles, corrosion-resistant alloys." },
  { n: 78, sym: "Pt", name: "Platinum", mass: 195.08, cat: "Transition Metal", group: 10, period: 6, eConfig: "[Xe] 4f¹⁴ 5d⁹ 6s¹", melt: "1768.3 °C", boil: "3824.9 °C", density: "21.45 g/cm³", disc: "1735", uses: "Catalytic converters, fine jewelry, laboratory electrodes." },
  { n: 79, sym: "Au", name: "Gold", mass: 196.97, cat: "Transition Metal", group: 11, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", melt: "1064 °C", boil: "2970 °C", density: "19.30 g/cm³", disc: "Ancient", uses: "Bullion reserve, electronics plating, dentistry." },
  { n: 80, sym: "Hg", name: "Mercury", mass: 200.59, cat: "Transition Metal", group: 12, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", melt: "-38.8 °C", boil: "356.7 °C", density: "13.534 g/cm³", disc: "Ancient", uses: "Fluorescent lamp gas fill, historic thermometers and barometers (largely phased out)." },
  { n: 81, sym: "Tl", name: "Thallium", mass: 204.38, cat: "Post-Transition", group: 13, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", melt: "303.9 °C", boil: "1472.9 °C", density: "11.85 g/cm³", disc: "1861", uses: "Infrared optical glass, historically rat poison (now banned or restricted)." },
  { n: 82, sym: "Pb", name: "Lead", mass: 207.21, cat: "Post-Transition", group: 14, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", melt: "327.5 °C", boil: "1748.9 °C", density: "11.34 g/cm³", disc: "Ancient", uses: "Lead-acid car batteries, radiation shielding, ammunition." },
  { n: 83, sym: "Bi", name: "Bismuth", mass: 208.98, cat: "Post-Transition", group: 15, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", melt: "271.6 °C", boil: "1563.9 °C", density: "9.78 g/cm³", disc: "Ancient", uses: "Stomach-relief medicine (bismuth subsalicylate), cosmetics, low-toxicity solder replacing lead." },
  { n: 84, sym: "Po", name: "Polonium", mass: "[209]", cat: "Post-Transition", group: 16, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", melt: "253.9 °C", boil: "961.9 °C", density: "9.196 g/cm³", disc: "1898", uses: "Static-eliminator brushes, historic spacecraft heat sources; extremely radioactive." },
  { n: 85, sym: "At", name: "Astatine", mass: "[210]", cat: "Halogen", group: 17, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", melt: "301.9 °C", boil: "336.9 °C", density: "6.35 g/cm³", disc: "1940", uses: "Experimental targeted alpha-particle cancer therapy research; the rarest natural element." },
  { n: 86, sym: "Rn", name: "Radon", mass: "[222]", cat: "Noble Gas", group: 18, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", melt: "-71.1 °C", boil: "-61.6 °C", density: "9.73 g/L", disc: "1899", uses: "No commercial uses; a radioactive indoor-air hazard monitored in homes." },
  { n: 87, sym: "Fr", name: "Francium", mass: "[223]", cat: "Alkali Metal", group: 1, period: 7, eConfig: "[Rn] 7s¹", melt: "26.9 °C", boil: "676.9 °C", density: "1.87 g/cm³", disc: "1939", uses: "No practical applications; too rare and short-lived outside physics research." },
  { n: 88, sym: "Ra", name: "Radium", mass: "[226]", cat: "Alkaline Earth", group: 2, period: 7, eConfig: "[Rn] 7s²", melt: "959.9 °C", boil: "1736.9 °C", density: "5.5 g/cm³", disc: "1898", uses: "Historic luminous watch-dial paint (discontinued), targeted alpha cancer therapy (Ra-223)." },
  { n: 89, sym: "Ac", name: "Actinium", mass: "[227]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 6d¹ 7s²", melt: "1226.9 °C", boil: "3226.9 °C", density: "10 g/cm³", disc: "1902", uses: "Neutron source in research, experimental targeted alpha cancer therapy." },
  { n: 90, sym: "Th", name: "Thorium", mass: 232.04, cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 6d² 7s²", melt: "1749.9 °C", boil: "4787.9 °C", density: "11.724 g/cm³", disc: "1829", uses: "Historic gas-mantle lighting, tungsten alloying, prospective nuclear reactor fuel." },
  { n: 91, sym: "Pa", name: "Protactinium", mass: 231.04, cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f² 6d¹ 7s²", melt: "1567.9 °C", boil: "4026.9 °C", density: "15.37 g/cm³", disc: "1913", uses: "No commercial uses; studied only in nuclear science research." },
  { n: 92, sym: "U", name: "Uranium", mass: 238.03, cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f³ 6d¹ 7s²", melt: "1135 °C", boil: "4131 °C", density: "19.1 g/cm³", disc: "1789", uses: "Nuclear power plants, radioisotopes." },
  { n: 93, sym: "Np", name: "Neptunium", mass: "[237]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f⁴ 6d¹ 7s²", melt: "638.9 °C", boil: "4173.9 °C", density: "20.45 g/cm³", disc: "1940", uses: "Neutron detection instruments; a minor role in some nuclear research reactors." },
  { n: 94, sym: "Pu", name: "Plutonium", mass: "[244]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f⁶ 7s²", melt: "639.4 °C", boil: "3231.9 °C", density: "19.816 g/cm³", disc: "1940", uses: "Nuclear reactor and weapons fuel, radioisotope power for deep-space probes." },
  { n: 95, sym: "Am", name: "Americium", mass: "[243]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f⁷ 7s²", melt: "1175.9 °C", boil: "2606.9 °C", density: "12 g/cm³", disc: "1944", uses: "Ionization-chamber smoke detectors, industrial density and thickness gauges." },
  { n: 96, sym: "Cm", name: "Curium", mass: "[247]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f⁷ 6d¹ 7s²", melt: "1339.9 °C", boil: "3109.9 °C", density: "13.51 g/cm³", disc: "1944", uses: "Radioisotope thermoelectric power research, portable X-ray spectrometers on Mars rovers." },
  { n: 97, sym: "Bk", name: "Berkelium", mass: "[247]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f⁹ 7s²", melt: "985.9 °C", boil: "2626.9 °C", density: "14.78 g/cm³", disc: "1949", uses: "No practical applications; produced in nanogram amounts for research only." },
  { n: 98, sym: "Cf", name: "Californium", mass: "[251]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f¹⁰ 7s²", melt: "899.9 °C", boil: "1469.9 °C", density: "15.1 g/cm³", disc: "1950", uses: "Neutron source for oil-well logging, starting nuclear reactors, and cancer therapy." },
  { n: 99, sym: "Es", name: "Einsteinium", mass: "[252]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f¹¹ 7s²", melt: "859.9 °C", boil: "995.9 °C", density: "8.84 g/cm³", disc: "1952", uses: "No practical applications; produced only in trace amounts for pure research." },
  { n: 100, sym: "Fm", name: "Fermium", mass: "[257]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f¹² 7s²", melt: "1526.9 °C", boil: "Unknown", density: "Unknown", disc: "1953", uses: "No practical applications; exists only fleetingly in nuclear-physics experiments." },
  { n: 101, sym: "Md", name: "Mendelevium", mass: "[258]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f¹³ 7s²", melt: "826.9 °C", boil: "Unknown", density: "Unknown", disc: "1955", uses: "No practical applications; produced one atom at a time for research." },
  { n: 102, sym: "No", name: "Nobelium", mass: "[259]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f¹⁴ 7s²", melt: "826.9 °C", boil: "Unknown", density: "Unknown", disc: "1965", uses: "No practical applications; studied only to probe heavy-element chemistry." },
  { n: 103, sym: "Lr", name: "Lawrencium", mass: "[266]", cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f¹⁴ 7s² 7p¹", melt: "1626.9 °C", boil: "Unknown", density: "Unknown", disc: "1961", uses: "No practical applications; marks the end of the actinide series." },
  { n: 104, sym: "Rf", name: "Rutherfordium", mass: "[267]", cat: "Transition Metal", group: 4, period: 7, eConfig: "[Rn] 5f¹⁴ 6d² 7s²", melt: "2126.9 °C", boil: "5526.9 °C", density: "23.2 g/cm³", disc: "1969", uses: "No practical applications; synthesized briefly to study superheavy-element chemistry." },
  { n: 105, sym: "Db", name: "Dubnium", mass: "[268]", cat: "Transition Metal", group: 5, period: 7, eConfig: "[Rn] 5f¹⁴ 6d³ 7s²", melt: "Unknown", boil: "Unknown", density: "29.3 g/cm³", disc: "1970", uses: "No practical applications; produced atom-by-atom in particle accelerators." },
  { n: 106, sym: "Sg", name: "Seaborgium", mass: "[269]", cat: "Transition Metal", group: 6, period: 7, eConfig: "[Rn] 5f¹⁴ 6d⁴ 7s²", melt: "Unknown", boil: "Unknown", density: "35 g/cm³", disc: "1974", uses: "No practical applications; exists only for milliseconds in accelerator experiments." },
  { n: 107, sym: "Bh", name: "Bohrium", mass: "[270]", cat: "Transition Metal", group: 7, period: 7, eConfig: "[Rn] 5f¹⁴ 6d⁵ 7s²", melt: "Unknown", boil: "Unknown", density: "37.1 g/cm³", disc: "1981", uses: "No practical applications; created only a few atoms at a time." },
  { n: 108, sym: "Hs", name: "Hassium", mass: "[269]", cat: "Transition Metal", group: 8, period: 7, eConfig: "[Rn] 5f¹⁴ 6d⁶ 7s²", melt: "-147.1 °C", boil: "Unknown", density: "40.7 g/cm³", disc: "1984", uses: "No practical applications; used solely to probe nuclear structure theory." },
  { n: 109, sym: "Mt", name: "Meitnerium", mass: "[278]", cat: "Transition Metal", group: 9, period: 7, eConfig: "[Rn] 5f¹⁴ 6d⁷ 7s²", melt: "Unknown", boil: "Unknown", density: "37.4 g/cm³", disc: "1982", uses: "No practical applications; among the shortest-lived synthetic elements known." },
  { n: 110, sym: "Ds", name: "Darmstadtium", mass: "[281]", cat: "Transition Metal", group: 10, period: 7, eConfig: "[Rn] 5f¹⁴ 6d⁹ 7s¹", melt: "Unknown", boil: "Unknown", density: "34.8 g/cm³", disc: "1994", uses: "No practical applications; produced only in particle-accelerator collision experiments." },
  { n: 111, sym: "Rg", name: "Roentgenium", mass: "[282]", cat: "Transition Metal", group: 11, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s¹", melt: "Unknown", boil: "Unknown", density: "28.7 g/cm³", disc: "1994", uses: "No practical applications; named for X-ray discoverer Wilhelm Röntgen." },
  { n: 112, sym: "Cn", name: "Copernicium", mass: "[285]", cat: "Transition Metal", group: 12, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", melt: "Unknown", boil: "3296.9 °C", density: "14 g/cm³", disc: "1996", uses: "No practical applications; named in honor of astronomer Nicolaus Copernicus." },
  { n: 113, sym: "Nh", name: "Nihonium", mass: "[286]", cat: "Post-Transition", group: 13, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", melt: "426.9 °C", boil: "1156.9 °C", density: "16 g/cm³", disc: "2004", uses: "No practical applications; first element discovered and named by a Japanese team." },
  { n: 114, sym: "Fl", name: "Flerovium", mass: "[289]", cat: "Post-Transition", group: 14, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", melt: "66.9 °C", boil: "146.9 °C", density: "14 g/cm³", disc: "1999", uses: "No practical applications; named after Russia's Flerov Laboratory of Nuclear Reactions." },
  { n: 115, sym: "Mc", name: "Moscovium", mass: "[289]", cat: "Post-Transition", group: 15, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", melt: "396.9 °C", boil: "1126.9 °C", density: "13.5 g/cm³", disc: "2003", uses: "No practical applications; named for the Moscow region where it was made." },
  { n: 116, sym: "Lv", name: "Livermorium", mass: "[293]", cat: "Post-Transition", group: 16, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", melt: "435.9 °C", boil: "811.9 °C", density: "12.9 g/cm³", disc: "2000", uses: "No practical applications; named after Lawrence Livermore National Laboratory." },
  { n: 117, sym: "Ts", name: "Tennessine", mass: "[294]", cat: "Halogen", group: 17, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", melt: "449.9 °C", boil: "609.9 °C", density: "7.17 g/cm³", disc: "2010", uses: "No practical applications; named for Tennessee, home to Oak Ridge National Laboratory." },
  { n: 118, sym: "Og", name: "Oganesson", mass: "[294]", cat: "Noble Gas", group: 18, period: 7, eConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", melt: "Unknown", boil: "76.9 °C", density: "4.95 g/cm³", disc: "2002", uses: "No practical applications; the heaviest element made, only a few atoms ever detected." },
];

const CATEGORIES = [
  "All",
  "Alkali Metal",
  "Alkaline Earth",
  "Transition Metal",
  "Lanthanide",
  "Actinide",
  "Post-Transition",
  "Metalloid",
  "Nonmetal",
  "Halogen",
  "Noble Gas",
];

export default function PeriodicTableExplorer() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedElement, setSelectedElement] = useState(ELEMENTS[5]); // Carbon default

  const filteredElements = useMemo(() => {
    return ELEMENTS.filter((el) => {
      const matchesSearch =
        el.name.toLowerCase().includes(search.toLowerCase()) ||
        el.sym.toLowerCase().includes(search.toLowerCase()) ||
        String(el.n).includes(search);
      const matchesCat = categoryFilter === "All" || el.cat === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [search, categoryFilter]);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("All");
    setSelectedElement(ELEMENTS[5]);
  };

  const getCatColor = (cat) => {
    switch (cat) {
      case "Alkali Metal": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "Alkaline Earth": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Transition Metal": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Post-Transition": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "Lanthanide": return "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30";
      case "Metalloid": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      case "Nonmetal": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Halogen": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "Noble Gas": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Actinide": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default: return "bg-surface-soft text-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Chemistry
              </span>
              <span className="text-xs text-muted-foreground">Elements & Atomic Structure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Periodic Table Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Explore chemical elements, electron shell configurations, physical constants, and industrial applications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border bg-card hover:bg-surface-soft transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Search, Filters & Element Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search element name, symbol, or atomic number..."
                  aria-label="Search element name, symbol, or atomic number"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by element family"
                className="px-3 py-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Elements Interactive Grid */}
            {filteredElements.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
                No elements match your search — this explorer covers 118 elements; try a different name, symbol, or atomic number.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {filteredElements.map((el) => (
                  <button
                    key={el.sym}
                    onClick={() => setSelectedElement(el)}
                    aria-pressed={selectedElement.sym === el.sym}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition cursor-pointer ${getCatColor(el.cat)} ${
                      selectedElement.sym === el.sym ? "ring-2 ring-primary border-primary scale-105" : "hover:scale-102"
                    }`}
                  >
                    <span className="text-[10px] opacity-75 font-mono">{el.n}</span>
                    <span className="text-lg font-black tracking-tight">{el.sym}</span>
                    <span className="text-[10px] truncate w-full">{el.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Element Detail Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm" aria-live="polite">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs font-mono text-primary font-bold">Atomic No. {selectedElement.n}</span>
                  <h2 className="text-2xl font-extrabold text-foreground mt-0.5">{selectedElement.name}</h2>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCatColor(selectedElement.cat)}`}>
                    {selectedElement.cat}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl font-black text-primary">
                  {selectedElement.sym}
                </div>
              </div>

              {/* Physical Properties */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Atomic Mass</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">{selectedElement.mass} u</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Electron Config</div>
                  <div className="text-xs font-bold font-mono text-foreground mt-0.5">{selectedElement.eConfig}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Melting Point</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.melt}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Boiling Point</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.boil}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Density</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.density}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Year Discovered</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.disc}</div>
                </div>
              </div>

              {/* Uses */}
              <div className="p-3.5 rounded-xl bg-surface-soft border border-border space-y-1">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Common Uses & Applications
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{selectedElement.uses}</p>
              </div>
            </div>

            {/* Educational Info Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Periodic Law
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Elements are ordered by atomic number ($Z$). Periodic trends recur periodically due to valence shell electron configurations ($s, p, d, f$ blocks).
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
