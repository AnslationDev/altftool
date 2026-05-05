
"use client"
import { useState } from "react";


export default function Reactions() {
  const [reactions, setReactions] = useState({
    laugh: 0,
    love: 0,
    angry: 0,
    shocked: 0,
    like: 0,
  });

  const addReaction = (emoji) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: prev[emoji] + 1,
    }));
  };

  return { reactions, addReaction };
}
