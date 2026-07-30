const seo = {
  intro:
    "The Hindi Varnamala is the Devanagari alphabet used to write Hindi, and this tool presents it as 13 स्वर (vowels) and 36 व्यंजन (consonants) you can tap to hear spoken aloud. Each card shows the letter, its Roman transliteration and an English pronunciation cue such as \"aa as in father\", and audio is produced by your browser's Web Speech API set to the hi-IN voice at 0.8× speed so the sound is slow enough to copy. Learners and parents get a browse grid for the full chart plus a flashcard mode with next, previous and shuffle for drilling.",
  useCases: [
    "A parent helping a first-grader with a Hindi alphabet worksheet who wants to check whether ठ and थ are being said correctly before the child writes them",
    "An adult heritage speaker who talks Hindi fluently but never learned the script, working through क to ज्ञ card by card to attach sounds to shapes",
    "Someone preparing for a Hindi language test who uses shuffle mode to test recall of aspirated pairs like क/ख and ज/झ out of order rather than in memorised sequence",
  ],
  benefits: [
    ["Sound attached to every letter", "Tapping any card speaks it through the hi-IN speech voice, so you never have to guess a pronunciation from a Roman spelling."],
    ["English anchors for hard sounds", "Retroflex ट ठ ड ढ ण and the aspirated series are labelled explicitly, which is where Roman transliteration alone breaks down."],
    ["Two study modes from the same chart", "Browse the whole 13 + 36 grid for reference, or switch to flashcards with shuffle when you want randomised recall practice."],
  ],
  faqs: [
    [
      "How many letters are in the Hindi Varnamala?",
      "This chart covers 49 letters: 13 vowels and 36 consonants. Counts differ between textbooks because some include अं and अः as vowels (this tool does), and the consonant list here ends with the three conjuncts क्ष, त्र and ज्ञ, which many school charts also teach as letters.",
    ],
    [
      "What is the difference between swar and vyanjan?",
      "Swar (स्वर) are vowels that can be pronounced on their own, and vyanjan (व्यंजन) are consonants that carry an inherent 'a' sound and combine with vowel signs. In this tool the अ button shows the 13 swar and the क button shows the 36 vyanjan.",
    ],
    [
      "Why does no sound play when I tap a letter?",
      "The audio uses your browser's built-in speech synthesis, so nothing plays if the device has no Hindi voice installed or the browser blocks speech. Installing a Hindi (hi-IN) language pack in your operating system's settings usually fixes it; without one, some browsers fall back to a non-Hindi voice that mispronounces the letters.",
    ],
    [
      "What do ख, घ, छ and the other 'h' letters mean?",
      "They are aspirated consonants — the same mouth position as क, ग, च but released with a puff of breath. Hindi treats aspirated and unaspirated as completely different letters, so क and ख change a word's meaning, which is why the pronunciation cue on those cards says 'aspirated'.",
    ],
  ],
};

export default seo;
