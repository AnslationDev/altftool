import { useState } from "react";

export default function PredictMode() {
  const [hideResults, setHideResults] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  return {
    hideResults,
    setHideResults,
    hasVoted,
    setHasVoted,
  };
}