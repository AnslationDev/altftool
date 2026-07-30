const seo = {
  intro:
    "Shannon Entropy Explorer computes H = -sum(p * log_b p) for either a string of text or a list of probabilities, and reports the result in bits, nats or hartleys depending on the logarithm base you pick. Alongside the entropy it gives the maximum possible entropy for that number of outcomes, the normalised ratio between the two, the perplexity, and a per-outcome table of probability and self-information. It is for students and engineers who want to see where a distribution's uncertainty actually comes from rather than just a single number.",
  useCases: [
    "You are working through an information theory problem set and want to check your hand-calculated H for a four-outcome distribution against an exact figure.",
    "You are comparing two tokenisers or compression schemes and need the per-character entropy of the same sample text in bits to see which has less redundancy.",
    "You are explaining why a loaded die carries less information than a fair one, and want the per-outcome self-information column to make it concrete.",
  ],
  benefits: [
    [
      "Shows the ceiling, not just the value",
      "Every result comes with log_b(n), the maximum entropy for that many outcomes, so 2.04 bits means something instead of floating free.",
    ],
    [
      "Probabilities are normalised for you",
      "Enter counts, weights or percentages in any scale and they are divided by their total, so the list does not have to sum to 1.",
    ],
    [
      "Per-outcome breakdown",
      "The table gives each symbol's probability and its -log_b p surprisal, which is where you see one rare event dominating the total.",
    ],
  ],
  faqs: [
    [
      "What is the entropy of the word 'abracadabra'?",
      "About 2.0404 bits per character. It has 5 distinct symbols with counts a=5, b=2, r=2, c=1, d=1 over 11 characters, against a maximum of log2(5) = 2.3219 bits, giving a normalised entropy of roughly 0.879.",
    ],
    [
      "What is the difference between bits, nats and hartleys?",
      "Only the logarithm base: base 2 gives bits, base e gives nats, and base 10 gives hartleys. The underlying uncertainty is identical — one nat is about 1.4427 bits and one hartley is about 3.3219 bits — so switching base rescales the number without changing what it means.",
    ],
    [
      "What does normalised entropy tell me?",
      "It is H divided by the maximum log_b(n), so it runs from 0 to 1 and says how close your distribution is to uniform. A value of 1 means every outcome is equally likely; a value near 0 means one outcome dominates and observing the result tells you almost nothing new.",
    ],
    [
      "Is this a password strength checker?",
      "No. It measures the character-frequency entropy of the text you paste, treating each character as an independent draw — so a memorable phrase can score well here while still being trivial to guess, because real attackers use dictionaries and known patterns, not symbol frequencies. Judge password strength by how it was generated, not by this figure.",
    ],
  ],
};

export default seo;
