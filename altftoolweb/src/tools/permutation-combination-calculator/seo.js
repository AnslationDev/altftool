const seo = {
  title: "Permutation and Combination Calculator (nPr & nCr)",
  metaDescription:
    "Enter n and r to get nPr and nCr side by side — 8 choose 3 gives 336 permutations but 56 combinations. Rejects r > n instead of a bogus number.",
  intro:
    "This calculator returns both permutations and combinations for choosing r items from n, using nPr = n! ÷ (n − r)! when order matters and nCr = n! ÷ (r! × (n − r)!) when it does not. Enter the two whole numbers and it shows each count side by side, so you can see how much the ordering assumption changes the answer. Aimed at students working through counting problems and anyone sizing up how many arrangements or selections actually exist.",
  useCases: [
    "Working out how many 6-number lottery selections exist from a pool of 49 before deciding what a ticket is really worth",
    "Counting how many different 3-person subcommittees can be formed from a team of 6, where who is picked matters but the order does not",
    "Checking how many ways gold, silver and bronze can be assigned among 8 finalists, which is a permutation rather than a combination",
  ],
  benefits: [
    ["Both counts from one input", "nPr and nCr are shown together, so you can immediately see the r! factor separating them."],
    ["Guards the invalid cases", "It refuses r greater than n and negative inputs rather than returning a meaningless number, and floors non-integer entries."],
    ["Makes the ordering question explicit", "Seeing 336 permutations against 56 combinations for 8 choose 3 shows exactly what 'order matters' costs."],
  ],
  faqs: [
    [
      "What is the difference between a permutation and a combination?",
      "A permutation counts arrangements where order matters; a combination counts selections where it does not. They differ by a factor of r!: choosing 3 from 6 gives 120 permutations but 20 combinations, because each group of 3 can be arranged 3! = 6 ways.",
    ],
    [
      "How do I calculate nCr by hand?",
      "Divide n! by r! × (n − r)!. For 49 choose 6 that is 49! ÷ (6! × 43!) = 13,983,816 — the number of possible tickets in a 6-from-49 lottery. In practice you cancel most of the factorial instead of expanding it: 49×48×47×46×45×44 ÷ 720.",
    ],
    [
      "Why must r be less than or equal to n?",
      "Because you cannot choose more items than exist — (n − r)! would need the factorial of a negative number, which is undefined. The calculator shows a dash and the condition 0 ≤ r ≤ n instead of a result.",
    ],
    [
      "Are the results exact for very large n?",
      "Only up to a point. The factorials are computed in double-precision floating point, which is exact through 18! and then starts rounding, and anything from 171! upwards overflows to infinity. For counting problems in the tens, results are exact; for very large n treat them as approximations.",
    ],
  ],
};

export default seo;
