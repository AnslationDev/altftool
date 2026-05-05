import { angerLevels } from "./level";

export const calculateAngerLevel = (answers) => {
  const totalScore = answers.reduce((sum, ans) => sum + ans.value, 0);
  if (totalScore <= 15) return angerLevels.minimal;
  if (totalScore <= 25) return angerLevels.low;
  if (totalScore <= 35) return angerLevels.moderate;
  if (totalScore <= 42) return angerLevels.elevated;
  return angerLevels.high;
};