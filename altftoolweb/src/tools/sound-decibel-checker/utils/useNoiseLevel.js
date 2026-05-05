export function getNoiseLevel(decibels) {
  if (decibels < 30)
    return {
      text: "Whisper Quiet",
      color: "text-green-400",
      gaugeColor: "#10b981",
    };

  if (decibels < 50)
    return {
      text: "Quiet Room",
      color: "text-blue-400",
      gaugeColor: "#3b82f6",
    };

  if (decibels < 70)
    return {
      text: "Normal Conversation",
      color: "text-yellow-400",
      gaugeColor: "#facc15",
    };

  if (decibels < 85)
    return {
      text: "Loud Environment",
      color: "text-orange-400",
      gaugeColor: "#fb923c",
    };

  return { text: "Very Loud", color: "text-red-400", gaugeColor: "#ef4444" };
}
