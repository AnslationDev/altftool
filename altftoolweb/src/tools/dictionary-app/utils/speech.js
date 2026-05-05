export const speakWord = (word, options = {}) => {
  if (!("speechSynthesis" in window)) return;

  // pehle jo chal raha ho usse band karo
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);

  // slow mode
  utterance.rate = options.slow ? 0.5 : 1;

  // accent set karo
  const voices = speechSynthesis.getVoices();

  if (options.accent === "uk") {
    const ukVoice = voices.find(
      (v) => v.lang === "en-GB" || v.name.includes("UK") || v.name.includes("British")
    );
    if (ukVoice) utterance.voice = ukVoice;
    utterance.lang = "en-GB";
  } else {
    const usVoice = voices.find(
      (v) => v.lang === "en-US" || v.name.includes("US") || v.name.includes("American")
    );
    if (usVoice) utterance.voice = usVoice;
    utterance.lang = "en-US";
  }

  speechSynthesis.speak(utterance);
};