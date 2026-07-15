import { spiritAnimals } from "../constants/data";

export function calculateSpiritAnimal(answers) {
  const scores = {};

  spiritAnimals.forEach((animal) => {
    scores[animal.id] = 0;
  });

  answers.forEach((answerIndex, questionIdx) => {
    if (answerIndex === null || answerIndex === undefined) return;

    const question = null;
    const { spiritAnimals: data } = require("../constants/data");
    const q = data.quizQuestions[questionIdx];
    if (!q) return;

    const selectedOption = q.options[answerIndex];
    if (!selectedOption) return;

    selectedOption.animals.forEach((animalId, rank) => {
      if (scores[animalId] !== undefined) {
        scores[animalId] += 3 - rank;
      }
    });
  });

  const sorted = Object.entries(scores)
    .map(([id, score]) => ({
      animal: spiritAnimals.find((a) => a.id === id),
      score,
    }))
    .filter((entry) => entry.animal)
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];
  const secondary = sorted[1];
  const tertiary = sorted[2];

  const maxPossible = 30;
  const matchPercentage = Math.round((top.score / maxPossible) * 100);

  return {
    primary: top.animal,
    secondary: secondary?.animal || null,
    tertiary: tertiary?.animal || null,
    matchPercentage: Math.min(98, Math.max(45, matchPercentage)),
    allScores: sorted,
  };
}

export function calculateSpiritAnimalSimple(answers) {
  const scores = {};

  spiritAnimals.forEach((animal) => {
    scores[animal.id] = 0;
  });

  answers.forEach((answer) => {
    if (!answer || !answer.animals) return;

    answer.animals.forEach((animalId, rank) => {
      if (scores[animalId] !== undefined) {
        scores[animalId] += 3 - rank;
      }
    });
  });

  const sorted = Object.entries(scores)
    .map(([id, score]) => ({
      animal: spiritAnimals.find((a) => a.id === id),
      score,
    }))
    .filter((entry) => entry.animal)
    .sort((a, b) => b.score - a.score);

  const top = sorted[0];
  const secondary = sorted[1];
  const tertiary = sorted[2];

  const maxPossible = 30;
  const matchPercentage = Math.round((top.score / maxPossible) * 100);

  return {
    primary: top.animal,
    secondary: secondary?.animal || null,
    tertiary: tertiary?.animal || null,
    matchPercentage: Math.min(98, Math.max(45, matchPercentage)),
    allScores: sorted,
  };
}
