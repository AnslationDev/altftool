const seo = {
  intro:
    "Teleprompter scroll speed is derived, not guessed: the script's word count divided by the runtime gives the delivery pace in words per minute, the text width and font size give the number of wrapped lines, and lines × line height ÷ speaking seconds gives the scroll in pixels per second. This calculator does all three and reports the pace against the working bands used in broadcast — around 120 to 150 wpm for conversational presenting, 150 to 170 for scripted news, and above roughly 190 the audience stops absorbing new information. It also subtracts a breath at each paragraph break, because the prompter has to be still while the presenter pauses.",
  useCases: [
    "Set the scroll speed for a 90-second product video so the read finishes exactly on the last frame.",
    "Find out whether a 400-word script can be delivered in a minute, or whether words have to come out.",
    "Match prompter settings across a series so every presenter reads at the same pace regardless of script length.",
    "Work out the effect of raising the font size from 48px to 72px on how many lines the prompter has to scroll.",
  ],
  benefits: [
    ["Pixels per second, not a dial", "Gives a portable figure you can enter in any prompter app instead of guessing at a 1-to-10 speed slider."],
    ["Pace check built in", "Shows the words-per-minute the runtime demands and says plainly when the answer is to cut words rather than scroll faster."],
    ["Breaths accounted for", "Subtracts 0.7 seconds per paragraph break, so the speaking time the scroll has to cover is the real one."],
  ],
  faqs: [
    [
      "What is a good teleprompter speed in words per minute?",
      "Between 120 and 150 words per minute for conversational presenting, and 150 to 170 for scripted broadcast delivery. Below about 90 wpm the prompter feels stalled; above about 190 the audience cannot take in new information, however clearly the presenter speaks.",
    ],
    [
      "How long does a 500-word script take to read aloud?",
      "About 3 minutes 20 seconds at 150 words per minute, or 3 minutes 34 seconds at a more conversational 140. Divide the word count by the pace and multiply by 60, then add roughly 0.7 seconds for each paragraph break where the presenter breathes.",
    ],
    [
      "How do I convert words per minute into a prompter scroll speed?",
      "Work out how many lines the script occupies at your font size and column width, multiply by the line height in pixels to get the total scroll distance, then divide by the speaking time in seconds. A 37-line script at 56px type and 1.5 line height scrolls about 2,664 pixels, which over 120 seconds is 22 pixels per second.",
    ],
    [
      "What font size should a teleprompter use?",
      "Large enough to read comfortably from where the presenter stands — typically 48 to 72 pixels on a prompter screen, and larger the further back the camera is. Aim for roughly 30 to 50 characters per line: shorter lines make the eyes dart, longer ones are hard to track back to the start.",
    ],
  ],
};

export default seo;
