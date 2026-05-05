import { useState } from "react";

export default function Gamification() {
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");

  const updateGamification = (votes, index) => {
    const totalVotes = votes.reduce((a, b) => a + b, 0);
    const selectedVotes = votes[index];

    if (totalVotes === 0) return;

    const percentage = Math.round((selectedVotes / totalVotes) * 100);

    if (percentage >= 50) {
      setMessage(`🎯 You voted with ${percentage}% people`);
    } else {
      setMessage("😎 You are unique");
    }

    setPoints((prev) => prev + 10);
  };

  return { points, message, updateGamification };
}