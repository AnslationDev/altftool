const seo = {
  intro:
    "Friendship Score turns two names and five self-rated qualities — trust, humour, loyalty, communication and shared history — into a single 0-100 friendship rating with an achievement badge. The five sliders (each 1-10) are averaged and carry 65% of the score, while a deterministic hash of both names, sorted so A & B always equals B & A, contributes the remaining 35%. It is built for entertainment: a repeatable, shareable score you can copy or download as a text report, not a psychological assessment.",
  useCases: [
    "Two friends arguing over who is the better best friend rate each other on the same five sliders and compare the two scores side by side.",
    "Someone writing a birthday caption for their oldest friend runs the pair, downloads the text report and quotes the badge and the loyalty percentage in the post.",
    "A group chat sets a rule that everyone scores the same person, so the differences between each member's trust and communication sliders become the joke.",
  ],
  benefits: [
    ["Your input drives the result", "Sliders carry 65% of the score, so the answer reflects how you rated the friendship rather than the names alone."],
    ["Same names, same number", "The name component is a fixed hash of the two names sorted alphabetically, so the result never changes between runs or between the two friends."],
    ["Sharable report, not just a number", "Every run produces a text report with the badge, the five sub-scores as percentages and the evaluation, ready to copy or download."],
  ],
  faqs: [
    [
      "How is the friendship score calculated?",
      "The five sliders are averaged and rescaled to 0-100, that value is weighted 65%, and a name-based score weighted 35% is added; the total is clamped to the 15-100 range. So a pair who rate every slider 10/10 is guaranteed at least a 70 (Silver tier or higher), but the exact score — and whether it reaches Platinum or Gold — still depends on the name-based component.",
    ],
    [
      "What are the badge levels?",
      "There are four: Bronze Buddy below 60, Silver Companion from 60 to 79, Platinum Confidant from 80 to 94, and the Ride-or-Die Gold Badge at 95 and above. Each badge comes with a short written evaluation of the bond.",
    ],
    [
      "Will I get the same score if my friend enters the names in the other order?",
      "Yes. The two names are lowercased and sorted before hashing, so \"Alex & Sam\" and \"Sam & Alex\" produce an identical name component — any difference in the final score comes only from how each of you moved the sliders.",
    ],
    [
      "Is this an accurate measure of a real friendship?",
      "No — it is a novelty tool. The name portion is a hash with no meaning attached to letters, and the slider portion is simply your own opinion averaged, so treat the score as a conversation starter rather than an evaluation of the relationship.",
    ],
  ],
};

export default seo;
