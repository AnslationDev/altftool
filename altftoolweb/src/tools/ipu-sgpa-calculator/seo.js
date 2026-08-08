const seo = {
  title: "IPU SGPA Calculator: GGSIPU 10-Point Scale + CGPA",
  metaDescription:
    "Credit-weighted SGPA on the GGSIPU 10-point scale (O=10, F=0), rolled into your CGPA, plus what one grade step on each paper is worth.",
  steps: [
    "In Papers this semester, set each paper's Credits and pick its Grade from the list running O — 10 pt down to F — 0 pt; Add paper adds another row and the bin icon removes one.",
    "Fill CGPA before this semester, Credits completed before this semester, Target CGPA at graduation and Credits still to be attempted, so the new semester is folded into the running CGPA by credits rather than averaged.",
    "Semester SGPA shows the figure with its grade band and credit points, the per-paper table gives an SGPA per step column for each paper, and the last line states the average SGPA the remaining credits must carry; Copy result copies the summary and Reset restores the sample papers.",
  ],
  intro:
    "SGPA at GGSIPU is the credit-weighted mean of your grade points for one semester: Σ(credits × grade point) ÷ Σ(credits), on the 10-point scale where O carries 10 points and F carries 0. This calculator applies that formula, rolls the semester into your running CGPA using semester credits as the weight, and shows exactly how much each paper is worth — one extra grade point on a paper moves the SGPA by that paper's credits divided by the semester's total credits, which is why a 4-credit theory paper matters far more than a 1-credit workshop.",
  useCases: [
    "Checking an SGPA from an IPU result sheet that lists letter grades but no semester average",
    "Deciding which paper is worth applying for re-evaluation on, by comparing SGPA gained per grade step",
    "Finding the average SGPA the remaining credits must carry to graduate with an 8.0 CGPA",
  ],
  benefits: [
    ["Per-paper leverage", "Quantifies what one grade step on each paper is worth, instead of guessing."],
    ["CGPA weighted by credits", "Combines old and new credits properly rather than averaging two GPAs."],
    ["Earned credits tracked", "F papers stay in the denominator but out of the earned total, so backlogs are explicit."],
  ],
  faqs: [
    [
      "How is SGPA calculated in IPU?",
      "Multiply each paper's credits by its grade point, add the products, and divide by the total credits registered. Papers of 4, 4, 3, 3, 2, 2 and 1 credits graded 9, 8, 10, 7, 6, 8 and 5 give 152 credit points over 19 credits, an SGPA of exactly 8.00.",
    ],
    [
      "What are the GGSIPU grade points?",
      "O carries 10 points, A+ 9, A 8, B+ 7, B 6, C 5, P 4 and F 0. The marks band that earns each letter is set by your programme's scheme rather than by one university-wide table, so read the letter off your result sheet instead of converting marks yourself.",
    ],
    [
      "How much does one subject change my SGPA?",
      "One extra grade point on a paper raises the SGPA by that paper's credits divided by the semester's total credits. In a 19-credit semester, a 4-credit paper is worth 0.211 SGPA per grade step and a 1-credit paper only 0.053 — a fivefold difference.",
    ],
    [
      "Is IPU CGPA the average of my SGPAs?",
      "Only if every semester carries the same credits. CGPA is Σ(SGPA × semester credits) ÷ Σ(semester credits), so a heavier semester pulls harder. Adding an 8.00 SGPA over 19 credits to a 7.60 CGPA earned over 60 credits gives 7.70, not 7.80.",
    ],
  ],
};

export default seo;
