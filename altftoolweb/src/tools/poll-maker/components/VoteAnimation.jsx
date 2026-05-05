import { useState } from "react";

export default function VoteAnimation() {
  const [activeIndex, setActiveIndex] = useState(null);

  const triggerAnimation = (index) => {
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 500);
  };

  return { activeIndex, triggerAnimation };
}