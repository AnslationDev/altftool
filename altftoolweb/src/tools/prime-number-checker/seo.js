const seo = {
  intro:
    "The Prime Number Checker tests whether a whole number is prime by trial division against every integer from 2 up to the square root of the number, and when it is not prime it returns the smallest divisor together with its pair — for example 91 = 7 × 13. It is for students checking homework, anyone verifying a number before using it in a puzzle or exercise, and developers sanity-checking a value by hand. Testing only up to the square root is what keeps it fast: any composite number must have a factor at or below that point.",
  useCases: [
    "You are working through a factorisation exercise and want to confirm that 391 is composite and see that it breaks down as 17 × 23 rather than hunting for the divisor yourself.",
    "You picked a number for a maths puzzle or a class demonstration and need to be certain it has no divisors other than 1 and itself before putting it on the board.",
    "You are checking a sequence — 2, 3, 5, 7, 11 and so on — and want a quick yes/no on each candidate without writing out the divisions.",
  ],
  benefits: [
    [
      "Shows the divisor, not just a verdict",
      "A composite result comes with the actual factor pair it found, so you can see why it failed instead of being told only that it did.",
    ],
    [
      "Stops at the square root",
      "Trial division runs while i × i ≤ n, which is the smallest range that can still prove primality — checking 9,973 needs fewer than 100 divisions rather than nearly 10,000.",
    ],
    [
      "Refuses ambiguous input",
      "Anything below 2 is rejected outright rather than being labelled prime or composite, since 1 and 0 are neither and negative numbers fall outside the definition.",
    ],
  ],
  faqs: [
    [
      "What is a prime number?",
      "A whole number greater than 1 whose only positive divisors are 1 and itself. 2 is the smallest prime and the only even one; 1 is not prime, which is why this tool requires an input of at least 2.",
    ],
    [
      "How does the checker decide a number is prime?",
      "It divides the number by every integer from 2 upward and stops as soon as i × i exceeds the number. If nothing divides evenly in that range, the number is prime — a composite n always has a factor no larger than the square root of n, so there is no need to test any further.",
    ],
    [
      "Does it give the full prime factorisation?",
      "No — it reports the first factor pair it finds, which is the smallest divisor and its cofactor. For 60 that is 2 × 30, not 2² × 3 × 5; feed the cofactor back in if you want to keep breaking it down.",
    ],
    [
      "Is there a limit to how large a number I can test?",
      "Two practical ones. Values are handled as standard JavaScript numbers, so integers above 2^53 − 1 (about 9.007 quadrillion) can lose exactness, and trial division slows down as the square root grows — a 16-digit prime needs on the order of 100 million divisions. For cryptographic-scale numbers you need a probabilistic test such as Miller-Rabin instead.",
    ],
  ],
};

export default seo;
