import { useState } from "react";

export default function Insights() {
  const [insight, setInsight] = useState(null);

  const generateInsights = (options, votes) => {
    if (!votes.length) return;

    const max = Math.max(...votes);
    const min = Math.min(...votes);

    const maxIndex = votes.indexOf(max);
    const minIndex = votes.indexOf(min);

    let closeCompetition = false;

    // check if difference between top 2 is small
    const sorted = [...votes].sort((a, b) => b - a);
    if (sorted.length > 1 && sorted[0] - sorted[1] <= 1) {
      closeCompetition = true;
    }

    setInsight({
      popular: options[maxIndex],
      underdog: options[minIndex],
      close: closeCompetition,
    });
  };

  return { insight, generateInsights };
}