import { angerLevels } from "./level";

export const calculateAngerLevel = (answers) => {
  const totalScore = answers.reduce((sum, ans) => sum + ans.value, 0);

  if (totalScore <= 15) return angerLevels.minimal;
  if (totalScore <= 25) return angerLevels.low;
  if (totalScore <= 35) return angerLevels.moderate;
  if (totalScore <= 42) return angerLevels.elevated;

  return angerLevels.high;
};

export const detectAngerType = (answers) => {
  const totalScore = answers.reduce((sum, ans) => sum + ans.value, 0);

  if (totalScore <= 15) {
    return {
      type: "Constructive Anger",
      icon: "🧘",
      description:
        "You manage anger in a healthy way and use it to improve situations calmly.",
    };
  }

  if (totalScore <= 25) {
    return {
      type: "Passive Anger",
      icon: "😶",
      description:
        "You often suppress anger instead of expressing it directly.",
    };
  }

  if (totalScore <= 35) {
    return {
      type: "Reactive Anger",
      icon: "🔥",
      description:
        "You tend to react quickly but calm down later.",
    };
  }

  if (totalScore <= 42) {
    return {
      type: "Suppressed Anger",
      icon: "😤",
      description:
        "You may hide anger inside which builds over time.",
    };
  }

  return {
    type: "Chronic Anger",
    icon: "💢",
    description:
      "Your anger may be persistent and affect multiple areas of life.",
  };
};