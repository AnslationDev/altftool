const seo = {
  intro:
    "The Factorial Calculator computes n! — the product of every whole number from 1 to n — exactly, for any n from 0 to 2000, using arbitrary-precision big integers rather than floating-point arithmetic. That matters because a standard 64-bit double stops representing factorials exactly at 23!, while this returns every digit: 100! comes back as its full 158-digit value, and 2000! as all 5,736 digits. Alongside the number you get its digit count, so you can see the scale at a glance.",
  useCases: [
    "You are checking a combinatorics answer by hand — the number of ways to order 15 books is 15!, and you want the exact integer rather than 1.3e12 to compare against your working.",
    "You are writing a programming exercise and need known-good expected output for a big-integer factorial function you are testing.",
    "You want to show someone how fast factorial growth actually is: 20! is already 19 digits, 100! is 158, and 1000! is 2,568.",
  ],
  benefits: [
    ["Exact, not approximate", "Every digit is computed with big-integer multiplication, so results past 23! are correct instead of rounded to the nearest representable double."],
    ["Digit count included", "The output reports how many digits the answer has, which is often the number you actually wanted when comparing magnitudes."],
    ["Full value on hand", "The headline shows a truncated preview so the layout stays readable, while the complete integer is listed in full underneath."],
  ],
  faqs: [
    [
      "What is 0 factorial?",
      "0! = 1. It is the empty product — multiplying no numbers together gives the multiplicative identity — and defining it this way keeps formulas such as nCr = n! / (r!(n-r)!) correct when r equals 0 or n.",
    ],
    [
      "What is the largest number I can enter?",
      "2000, which produces a 5,736-digit result. The input must be a whole number from 0 to 2000; negative values and decimals are rejected, because the plain factorial is only defined on non-negative integers.",
    ],
    [
      "Why do other calculators give me 9.33e157 for 100!?",
      "Because they use floating-point numbers, which keep roughly 15-17 significant digits and switch to scientific notation beyond that. Factorials stop being exactly representable as a 64-bit double from 23! onward, so this tool uses big integers and returns all 158 digits of 100! instead.",
    ],
    [
      "Can I calculate the factorial of a decimal like 4.5?",
      "Not here — the input is floored to a whole number. Non-integer factorials are defined through the gamma function, where n! = Γ(n+1), so 4.5! is Γ(5.5), roughly 52.34; that needs a gamma-function calculator rather than a product of integers.",
    ],
  ],
};

export default seo;
