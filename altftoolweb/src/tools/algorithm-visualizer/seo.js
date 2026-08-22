const seo = {
  title: "Algorithm Visualizer: Bubble Sort on Your Array",
  metaDescription:
    "Type up to 16 numbers and watch every comparison and swap as bars — scrub, pause, live counters, plus 12 algorithms with their Big-O complexities.",
  intro:
    "The Algorithm Visualizer steps through a comparison sort on your own array, drawing every comparison and swap as a bar chart you can play, pause, scrub and rewind. Type up to 16 numbers or generate a random set, and it builds the full list of steps up front — highlighting the two indices being compared in amber, the elements already in their final position in green, and running counters for comparisons and swaps. Alongside it sits a browsable catalogue of twelve classic algorithms with their Big-O complexities, and a merge-sort divide-and-merge walkthrough with the Python and JavaScript source.",
  useCases: [
    "You are revising for a data-structures exam and want to watch why a nearly-sorted array still costs a full pass of comparisons",
    "You are teaching a first-year class and need a chart you can pause mid-comparison and point at, rather than a finished animation",
    "You want to compare the comparison count for the same 7 values sorted by hand versus by the algorithm, to check your trace was right",
  ],
  benefits: [
    ["Scrub, don't just watch", "Steps are precomputed, so the slider moves backwards as freely as forwards and you can sit on one comparison."],
    ["Counts as well as colours", "Comparisons, swaps and the current step index update at every frame, so the O(n²) growth is a number you can read."],
    ["Your data, not a canned demo", "Paste your own array — including deliberately worst-case or already-sorted input — and see what it costs."],
  ],
  faqs: [
    [
      "What is the time complexity of bubble sort?",
      "O(n²) in the average and worst case, because each of n passes compares up to n elements. On 7 values that is 21 comparisons; on 16 values it is 120. The visualizer's comparison counter makes this quadratic growth visible directly.",
    ],
    [
      "Why is merge sort faster than bubble sort?",
      "Merge sort is O(n log n) in the best, average and worst case, while bubble sort is O(n²). Splitting the array in half repeatedly gives log n levels of merging, each doing n work, instead of comparing every pair. The trade-off is O(n) extra space for the merge buffers, where bubble sort sorts in place.",
    ],
    [
      "How many numbers can I visualize at once?",
      "Up to 16. Input is split on commas or whitespace, non-numeric tokens are dropped, and anything past the sixteenth value is ignored — past that the bars get too thin to read and the step count grows quadratically.",
    ],
    [
      "When would you use linear search instead of binary search?",
      "When the data is unsorted, or the list is short enough that sorting it first costs more than scanning it. Linear search is O(n) but works on any array; binary search is O(log n) but requires the array to be sorted first, which is at best O(n log n) if it is not already.",
    ],
  ],
};

export default seo;
