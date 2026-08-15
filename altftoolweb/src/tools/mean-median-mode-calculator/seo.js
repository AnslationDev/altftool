const seo = {
  title: "Mean, Median & Mode Calculator (Range, Std Dev)",
  metaDescription:
    "Paste numbers separated by commas, spaces or line breaks to get mean, median, mode, range, population standard deviation and count in one pass.",
  steps: [
    "Paste your list into the 'Numbers (comma or space separated)' box — commas, spaces or line breaks all work, and negative numbers and decimals are extracted automatically.",
    "There is no calculate button: the Result panel recomputes as you type, showing 'Mean' to two decimals with Median, Mode, Range, 'Std. dev (pop)' and Count cards beneath; Mode reads 'none' when no value repeats.",
    "Click 'Copy' to put the summary on the clipboard or 'Download' to save it as mean-median-mode-calculator.txt.",
  ],
  intro:
    "This calculator takes a list of numbers and returns the mean, median, mode, range, population standard deviation and count in one pass. You can paste values separated by commas, spaces or line breaks — negatives and decimals included — and it pulls out every number it finds without you having to clean the list first. Mean and standard deviation are shown to two decimal places, and the mode reads \"none\" when no value repeats.",
  useCases: [
    "You copied a column of survey scores out of a spreadsheet and want the average and spread without building formulas — paste the whole column in, line breaks and all.",
    "A student checking homework needs to confirm that their median is right for an even-length list, where the answer is the average of the two middle values rather than a value from the list.",
    "You are comparing two sets of measurements and want the range and standard deviation side by side to argue that one set is noticeably more consistent than the other.",
  ],
  benefits: [
    ["Parses messy input", "It scans your text for numbers with a pattern that accepts minus signs and decimal points, so stray labels, commas or blank lines do not break it."],
    ["Six statistics at once", "Mean, median, mode, range, standard deviation and count all come back from one paste, instead of one measure per calculation."],
    ["Says when there is no mode", "If every value appears exactly once, the mode is reported as \"none\" rather than misleadingly returning the first number."],
  ],
  faqs: [
    [
      "How do I enter my numbers?",
      "Type or paste them separated by commas, spaces or new lines — any mix works, because the tool extracts every number in the text. Negative values and decimals such as -3.5 are recognised.",
    ],
    [
      "Is the standard deviation the sample or the population one?",
      "It is the population standard deviation: the squared differences from the mean are divided by n, the full count of values, not by n − 1. If your list is a sample drawn from a larger group and you need the sample standard deviation, the result here will be slightly smaller than that figure.",
    ],
    [
      "What happens with an even number of values?",
      "The median is the average of the two middle values after sorting. For example, in a sorted list of 8 numbers it is the mean of the 4th and 5th values.",
    ],
    [
      "What if two values tie for most frequent?",
      "Only one mode is reported — the value that reaches the highest frequency first as the list is read. A value must appear at least twice to count, so a list where every entry is unique returns \"none\" rather than a tie.",
    ],
  ],
};

export default seo;
