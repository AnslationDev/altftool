export const talents = [
  {
    title: "Professional Cloud Whisperer",
    description: "You have an uncanny ability to predict the weather just by staring intensely at the sky. Meteorologists fear you.",
    icon: "cloud-lightning"
  },
  {
    title: "Master of Unintentional Origami",
    description: "Any piece of paper in your hands magically turns into a crumpled masterpiece resembling an abstract swan.",
    icon: "file"
  },
  {
    title: "Human Lie Detector",
    description: "You can spot a fib from a mile away. Your friends don't even bother trying to surprise you anymore.",
    icon: "eye"
  },
  {
    title: "Vibe Curator",
    description: "You instantly know exactly what song to play to match the exact mood of any room you walk into.",
    icon: "music"
  },
  {
    title: "Snack Alchemist",
    description: "You can combine three totally unrelated items from the fridge and create a Michelin-star worthy midnight snack.",
    icon: "pizza"
  },
  {
    title: "Time Zone Traveler",
    description: "You operate in your own unique time zone where 'five minutes' can mean anything from exactly 5 minutes to 3 hours.",
    icon: "clock"
  },
  {
    title: "Animal Magnet",
    description: "Every stray cat, dog, and random squirrel within a 5-mile radius wants to be your best friend.",
    icon: "cat"
  },
  {
    title: "Plant Whisperer",
    description: "Even fake plants somehow grow under your care. You bring life to any room you're in.",
    icon: "leaf"
  },
  {
    title: "Chaos Coordinator",
    description: "The more chaotic the situation, the calmer you get. You thrive when everything else is falling apart.",
    icon: "zap"
  },
  {
    title: "Accidental Comedian",
    description: "You don't even try to be funny, yet somehow you have the whole room laughing with just your facial expressions.",
    icon: "smile"
  }
];

export function generateTalent(name, month) {
  if (!name || !month) return null;
  
  // Create a pseudo-random index based on the name characters and month
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const monthNum = parseInt(month, 10);
  const combined = Math.abs(hash + monthNum);
  const index = combined % talents.length;
  
  return talents[index];
}
