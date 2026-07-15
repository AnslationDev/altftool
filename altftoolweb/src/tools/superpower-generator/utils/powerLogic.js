export const powers = [
  {
    name: "Quantum Pizza Delivery",
    description: "You can teleport anywhere in the world, but only if you are holding a hot, fresh slice of pizza.",
    weakness: "Lactose intolerance.",
    origin: "Bitten by a radioactive delivery driver.",
    icon: "pizza"
  },
  {
    name: "Instant Caffeine Infusion",
    description: "You can instantly wake up anyone around you with a burst of pure energy.",
    weakness: "Decaf coffee makes you fall asleep instantly.",
    origin: "Fell into a vat of experimental espresso.",
    icon: "coffee"
  },
  {
    name: "WiFi Whisperer",
    description: "You emit a perfect 5G signal at all times and can communicate directly with routers.",
    weakness: "You buffer when you are hungry.",
    origin: "Struck by lightning while restarting a router.",
    icon: "wifi"
  },
  {
    name: "The Typo Eradicator",
    description: "You can rewrite reality just by fixing spelling mistakes on signs and documents.",
    weakness: "Poor grammar makes you physically dizzy.",
    origin: "Found a magical dictionary in an ancient library.",
    icon: "edit-3"
  },
  {
    name: "Chronological Snooze",
    description: "You have the ability to pause time, but only while you are actively hitting the snooze button.",
    weakness: "You have absolutely no internal clock.",
    origin: "A radioactive alarm clock shattered near you.",
    icon: "clock"
  },
  {
    name: "Animal Translator",
    description: "You can understand exactly what any animal is saying.",
    weakness: "Turns out, squirrels are extremely rude.",
    origin: "Adopted a very talkative stray dog from a glowing meteorite crater.",
    icon: "paw-print"
  },
  {
    name: "The Vibe Shifter",
    description: "You can instantly change the mood of any room to match the exact opposite of what it currently is.",
    weakness: "You must dance for 10 seconds to activate it.",
    origin: "Exposed to experimental disco ball radiation.",
    icon: "music"
  },
  {
    name: "Pocket Dimension Hoarder",
    description: "Your pockets hold an infinite amount of space, allowing you to store anything.",
    weakness: "You can never find your keys in there.",
    origin: "Sewed a pair of pants using fabric woven from dark matter.",
    icon: "box"
  }
];

export function generatePower(name, color) {
  if (!name || !color) return null;
  
  // Create a pseudo-random index based on the name characters and color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorHash = color.charCodeAt(0) + color.charCodeAt(color.length - 1);
  const combined = Math.abs(hash + colorHash);
  const index = combined % powers.length;
  
  return powers[index];
}
