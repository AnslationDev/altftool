const seo = {
  intro:
    "This base converter rewrites a number in any positional base from 2 to 36 — binary, octal, decimal, hexadecimal, base 36 and everything between — using repeated division for the integer part and repeated multiplication for the fraction. Integers are handled as BigInt, so a 200-digit value converts exactly, and fractions are carried as exact rationals instead of being rounded through a 64-bit float. It is built for developers reading hex dumps and bit masks, and for students checking base-conversion homework.",
  useCases: [
    "Turn 0xDEADBEEF into the decimal 3,735,928,559 and check it still fits in a 32-bit unsigned integer.",
    "Show a class why 0.1 in decimal never terminates in binary, digit by digit.",
    "Convert a 64-bit permission mask between binary and hexadecimal without losing the low bits to floating point.",
  ],
  benefits: [
    ["Exact at any size", "BigInt arithmetic means a 200-digit integer converts without a single rounded digit."],
    ["Honest about fractions", "Marks any expansion that recurs rather than silently truncating it and calling it exact."],
    ["Bit-width answers included", "Reports bit length, byte count, and whether the value fits an 8, 16, 32, 64 or 128-bit signed or unsigned type."],
  ],
  faqs: [
    [
      "How do I convert decimal to binary by hand?",
      "Divide by 2 repeatedly and read the remainders bottom to top. 255 ÷ 2 gives remainder 1 eight times in a row, so 255 is 11111111 in binary — 8 bits, which is exactly the largest value an unsigned 8-bit integer can hold.",
    ],
    [
      "Why is base 36 the highest base available?",
      "Because the standard digit alphabet is 0-9 followed by A-Z, which is 10 + 26 = 36 symbols. Past that there is no agreed notation for the next digit, which is why JavaScript's own Number.toString has the same 36 limit.",
    ],
    [
      "Why does 0.1 in decimal never end in binary?",
      "Because a fraction terminates in base b only when its denominator's prime factors all divide b. One tenth is 1/(2 × 5), and binary has only the factor 2, so the 5 never divides out and the expansion 0.0001100110011… repeats forever. The same fraction ends immediately in base 10 and in base 20.",
    ],
    [
      "What is the largest number this can convert?",
      "Up to 4,096 characters of input, which is well past a 4,000-bit integer — far larger than any fixed-width type. There is no floating-point step anywhere in the conversion, so precision does not degrade as the number grows.",
    ],
  ],
};

export default seo;
