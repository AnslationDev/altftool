const seo = {
  title: "Standard Deviation Calculator: Sample",
  metaDescription:
    "Paste numbers split by commas, spaces or line breaks and get the standard deviation, variance, mean and count - dividing by n or by n-1.",
  intro:
    "The Standard Deviation Calculator takes a list of numbers and returns the standard deviation, variance, mean and count, dividing the sum of squared deviations by n for a population or by n−1 (Bessel's correction) for a sample. Paste values separated by commas, spaces or line breaks — negatives and decimals are picked up automatically — and switch between the two modes to see how much the divisor changes the answer. It is aimed at students checking homework and at anyone summarising the spread of a small dataset without opening a spreadsheet.",
  useCases: [
    "You have eight exam scores and need to report both the mean and the spread, and your assignment specifies sample standard deviation rather than population.",
    "A spreadsheet gives one figure with STDEV and a different one with STDEVP, and you want to see the two side by side on your own numbers to work out which your report should use.",
    "You measured a process ten times and want the variance as well as the standard deviation, because the quality metric you are feeding is expressed in squared units.",
  ],
  benefits: [
    ["Population and sample in one switch", "Toggling between the n and n−1 divisors recalculates instantly, so you can see the size of the correction on your own data rather than trusting a rule of thumb."],
    ["Tolerant input parsing", "Numbers are extracted with a pattern match, so commas, spaces, tabs and newlines all work and you can paste a column straight out of a spreadsheet."],
    ["Shows the working values", "Variance, mean and the count of parsed numbers are returned alongside σ, which makes it easy to spot when a value was mistyped and dropped from the set."],
  ],
  faqs: [
    [
      "Should I use population or sample standard deviation?",
      "Use sample (n−1) when your numbers are a subset drawn from a larger group you want to make inferences about, and population (n) only when the list is the entire group. Sample is the more common choice in coursework and research, and it always produces the larger figure — for the dataset 2, 4, 4, 4, 5, 5, 7, 9 the population value is exactly 2 while the sample value is about 2.138.",
    ],
    [
      "What is Bessel's correction and why is it n−1?",
      "Bessel's correction is the use of n−1 instead of n in the denominator, and it exists because a sample's own mean sits closer to its data than the true population mean does. Dividing by n would therefore understate the spread; the smaller divisor corrects that bias, and its effect shrinks as the sample grows — noticeable at n = 5, negligible past a few hundred values.",
    ],
    [
      "What is the difference between variance and standard deviation?",
      "Standard deviation is the square root of variance. Variance is expressed in squared units, which makes it awkward to interpret, so the square root is reported to bring the figure back into the same units as the original data — a variance of 4 corresponds to a standard deviation of 2.",
    ],
    [
      "How many numbers do I need?",
      "At least two — with a single value there is no deviation to measure and the calculator will ask for more input. Note that sample standard deviation with exactly two values divides by 1, which makes the result unusually sensitive to each number.",
    ],
  ],
};

export default seo;
