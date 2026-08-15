const seo = {
  title: "Radioactive Decay Calculator: Half-Life to Amount Left",
  metaDescription:
    "Enter half-life and elapsed time in any matching unit: get the remaining quantity, decay constant λ = ln2/t½, half-lives elapsed, and time to a target.",
  steps: [
    "Under Inputs, type the Initial quantity / activity and the Half-life — any time unit works, as long as Elapsed time (same units) uses the same one.",
    "Enter Elapsed time (same units) and a Target remaining quantity; the Result panel recomputes live as you type, or tap the \"100 over 12 years\" chip under Examples to load a worked set.",
    "Read the remaining amount and its % of initial, plus the Decay constant, Elapsed half-lives, Decayed quantity and \"Time to entered target\" rows; Copy or Download saves radioactive-decay-calculator.txt.",
  ],
  intro:
    "The Radioactive Decay Calculator applies the exponential decay law N = N₀·e^(−λt), with the decay constant λ derived from the half-life as ln(2)/t½, to tell you how much of a sample or how much activity remains after a given elapsed time. It also reports the decay constant, how many half-lives have passed, the quantity that has decayed, and - working the equation backwards as t = ln(N₀/N)/λ - how long it takes to fall to a target you specify. Students, lab staff and anyone planning around a source's usable life can use any consistent time unit, as long as the half-life and elapsed time share it.",
  useCases: [
    "A physics problem gives you a 5-year half-life and asks what fraction of 100 units survives 12 years, and you want the number plus the 2.4 half-lives that represents.",
    "A lab has a calibration source with a known half-life and you need to know when its activity will have dropped to a stated threshold before it stops being usable.",
    "You are checking a homework answer on carbon dating and want the elapsed time implied by a measured remaining fraction, rather than only the forward calculation.",
  ],
  benefits: [
    ["Solves in both directions", "One run gives you both the remaining quantity after your elapsed time and the time required to reach a target level, from the same half-life."],
    ["Shows the intermediate physics", "The decay constant λ = ln(2)/t½ and the number of elapsed half-lives are reported alongside the answer, so you can check your own working."],
    ["Unit-agnostic by design", "Half-life and elapsed time are entered in whatever unit you like - seconds, days, years - and λ is quoted per that same unit."],
  ],
  faqs: [
    [
      "What formula does this use?",
      "N = N₀·e^(−λt), where λ = ln(2)/half-life. The remaining fraction depends only on the ratio of elapsed time to half-life, so after one half-life 50% remains, after two 25%, and after ten about 0.098%.",
    ],
    [
      "What units should I enter the half-life in?",
      "Any unit you want, as long as the elapsed time and target time use the same one. Enter a half-life of 5 with an elapsed time of 12 and the answer is for 12 of those same units; the decay constant is then reported per that unit.",
    ],
    [
      "How do I find how long until a sample drops to a certain level?",
      "Enter that level as the target quantity and the calculator solves t = ln(N₀/N)/λ. The target has to be greater than zero and no larger than the initial quantity, because decay never reaches exactly zero.",
    ],
    [
      "Does this account for decay chains or detector effects?",
      "No - it models a single isotope decaying exponentially. Real measurements can involve daughter products and decay chains, branching ratios, detector efficiency, background, shielding and contamination, so treat the result as an estimate and follow your facility's protocols for anything regulated.",
    ],
  ],
};

export default seo;
