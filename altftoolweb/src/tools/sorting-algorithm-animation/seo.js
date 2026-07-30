const seo = {
  intro:
    "Sorting Algorithm Animation replays Bubble Sort, Selection Sort and Insertion Sort as a bar chart, recording every comparison and swap as a discrete step you can play, pause or walk through one at a time. It is built for students meeting O(n²) sorting for the first time, and for anyone teaching why insertion sort finishes early on nearly-ordered data while bubble sort keeps scanning. Bars being compared turn amber and the settled tail turns green, so the shape of each algorithm's progress is visible rather than described.",
  useCases: [
    "You are revising for an algorithms exam and cannot picture why selection sort makes the same number of comparisons on sorted and reverse-sorted input — stepping through both cases makes the difference obvious.",
    "You are teaching a class and want to pause mid-pass on a 15-bar array to ask which element the inner loop will touch next, before pressing step forward to check the answer.",
    "You are writing lecture notes on quadratic sorting and need to compare the step counts the three algorithms produce on the exact same random array.",
  ],
  benefits: [
    [
      "Every comparison is a step you can rewind",
      "The full sequence is generated up front, so you can scrub backwards and forwards or jump to the start, not just watch an animation run once.",
    ],
    [
      "Colour marks the invariant, not just the swap",
      "Amber shows the pair currently being compared and green shows the region already in final position, which is the part students usually miss.",
    ],
    [
      "Same array, three algorithms",
      "Switching algorithm re-sorts the array you are already looking at, so the comparison is like for like instead of against fresh random data.",
    ],
  ],
  faqs: [
    [
      "Which sorting algorithms are included?",
      "Three: Bubble Sort, Selection Sort and Insertion Sort. All three are comparison sorts with O(n²) worst-case time complexity and sort in place, which is what makes them worth watching side by side.",
    ],
    [
      "How many bars can I sort at once?",
      "Between 5 and 50, set with the array size slider. Values are random integers from 5 to 104, and changing the size generates a fresh array immediately.",
    ],
    [
      "Can I slow the animation down?",
      "Yes. The speed slider runs from 1% to 100%, which maps to a delay of roughly 198 ms per step at the slowest setting down to about 50 ms at the fastest. You can also pause and use the step-forward and step-back buttons to move exactly one comparison at a time.",
    ],
    [
      "Which of the three algorithms is fastest?",
      "On random data all three do on the order of n²/2 comparisons, but insertion sort is usually fastest in practice and drops to O(n) on already-sorted input, while selection sort always performs the same number of comparisons regardless of order. None of them is competitive with O(n log n) sorts like merge sort or quicksort on large inputs.",
    ],
  ],
};

export default seo;
