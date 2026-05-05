import { Smile, Meh, Flame, CloudOff, AlertOctagon } from "lucide-react";

export const detectAngerType = (answers) => {
  const totalScore = answers.reduce((sum, ans) => sum + ans.value, 0);

  if (totalScore <= 15)
    return {
      type: "Constructive Anger",
      icon: Smile,
      description: "You manage anger in a healthy way and use it to improve situations calmly.",
    };

  if (totalScore <= 25)
    return {
      type: "Passive Anger",
      icon: Meh,
      description: "You often suppress anger instead of expressing it directly.",
    };

  if (totalScore <= 35)
    return {
      type: "Reactive Anger",
      icon: Flame,
      description: "You tend to react quickly to situations but usually calm down afterward.",
    };

  if (totalScore <= 42)
    return {
      type: "Suppressed Anger",
      icon: CloudOff,
      description: "You may hide anger inside, which can build up over time.",
    };

  return {
    type: "Chronic Anger",
    icon: AlertOctagon,
    description: "Your anger may be persistent and affect multiple areas of life.",
  };
};