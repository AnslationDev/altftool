const seo = {
  intro:
    "This calculator converts a percentage coverage threshold into the exact whole number of lines, branches, statements or functions you must cover — using ceil(total × target / 100), the same arithmetic every coverage gate applies. It is for developers and leads staring at an Istanbul, JaCoCo, coverage.py or SimpleCov report who need to know how many items stand between the current number and a green build, what the next pull request has to achieve, and how to ratchet the gate up over several sprints.",
  useCases: [
    "A developer whose CI gate fails at 79.6% against an 80% threshold working out that exactly 50 more lines out of 1,000 need tests",
    "A tech lead sizing a pull request that adds 100 new lines, checking whether covering only the new code keeps the repository above the gate",
    "An engineering manager planning a coverage ratchet from 70% to 80% across five sprints, with the whole-number line count each step demands",
  ],
  benefits: [
    ["Whole-number answers", "Percentages hide the real unit — this returns the exact count of lines or branches to cover, using the ceiling a gate actually enforces."],
    ["New-code planning", "Shows how well the code in your next change must be covered, and when the gate is unreachable without touching existing code."],
    ["Ratchet schedule", "Splits a coverage increase into equal percentage-point steps with the item count each sprint owes."],
  ],
  faqs: [
    [
      "How do I calculate how many lines I need to reach 80% coverage?",
      "Multiply the total lines by 0.80 and round up: required = ceil(total × 80 / 100), then subtract the lines already covered. For 1,000 total lines with 750 covered, you need ceil(800) = 800 covered lines, so 50 more — rounding down would leave you at 79.9% and a failing gate.",
    ],
    [
      "Why does my build fail at 79.99% when the threshold is 80%?",
      "Because coverage gates compare the exact ratio against the threshold, not a rounded display value — 79.99 is less than 80, so the check fails. That is why this calculator uses a ceiling: covering even one line fewer than ceil(total × target / 100) still fails the build.",
    ],
    [
      "Does adding new code lower my test coverage?",
      "Yes, if the new code ships untested — it grows the denominator while the covered count stays the same. Adding 100 untested lines to a 1,000-line project at 75% drops coverage to 750/1,100 ≈ 68.2%, and the required covered count for an 80% gate rises from 800 to 880.",
    ],
    [
      "What is a coverage ratchet and why use one?",
      "A ratchet raises the coverage threshold in small scheduled steps — for example two percentage points per sprint — instead of one large jump, so each sprint owes a fixed, achievable number of newly covered lines. It prevents the common failure mode where an ambitious one-off target (say 70% to 90%) stalls and the gate gets disabled.",
    ],
  ],
};

export default seo;
