const seo = {
  title: "Time Complexity Cheat Sheet: Big-O for Algorithms",
  metaDescription:
    "Best, average and worst-case time and space for sorting, searching, data structures and graph algorithms, per CLRS, with growth counts to n = 1,000,000.",
  steps: [
    "Type an algorithm or Big-O class into the Search box (placeholder 'quicksort, hash, O(n log n)…') or narrow the Category select to Sorting, Searching, Data structures or Graph algorithms.",
    "The 'Matching entries' table refilters as you type — no lookup button — listing Best, Average, Worst and Space for every match, plus a growth table of operation counts at n = 10, 100, 1,000 and 1,000,000.",
    "Press 'Copy table' to copy the visible rows as a Markdown table, or 'Reset' to clear the search text and category filter.",
  ],
  intro:
    "This reference tool looks up the best, average and worst-case time complexity — plus auxiliary space — for the sorting algorithms, search algorithms, data structures and graph algorithms that appear in coding interviews, following the canonical analyses in CLRS (Introduction to Algorithms). Search by name, filter by category, and compare growth classes with a table of approximate operation counts from n = 10 to n = 1,000,000.",
  useCases: [
    "An interview candidate double-checks quicksort's O(n²) worst case and O(log n) stack space the night before an onsite",
    "A student comparing hash tables with balanced BSTs sees O(1) expected versus O(log n) guaranteed lookups side by side",
    "An engineer picking a shortest-path algorithm compares Dijkstra's O((V+E) log V) against Bellman-Ford's O(VE) and Floyd-Warshall's O(V³)",
  ],
  benefits: [
    ["All three cases shown", "Best, average and worst-case time are listed separately, so the quicksort O(n log n) vs O(n²) distinction is never blurred."],
    ["Space included", "Every entry carries its auxiliary space cost — the figure interviewers ask about right after time."],
    ["Growth made concrete", "A side table turns O(n²) vs O(n log n) into actual operation counts at n = 1,000 and n = 1,000,000."],
  ],
  faqs: [
    [
      "What is the time complexity of quicksort?",
      "O(n log n) in the best and average case and O(n²) in the worst case, with O(log n) auxiliary stack space. The quadratic case occurs when pivots split the array maximally unevenly — for example naive first-element pivots on already-sorted input — and randomised pivot selection makes it vanishingly unlikely.",
    ],
    [
      "Which sorting algorithm has the best worst-case time complexity?",
      "Merge sort and heapsort both guarantee O(n log n) in the worst case, which is optimal for comparison-based sorting. Merge sort is stable but needs O(n) extra space; heapsort is in-place with O(1) extra space but unstable. Non-comparison sorts like counting sort reach O(n + k) when the key range k is small.",
    ],
    [
      "Is a hash table always O(1)?",
      "No — O(1) is the expected cost per lookup, insert or delete with a good hash function and sensible load factor; the worst case is O(n) when every key collides into one bucket. That is why languages like Java switch long collision chains to red-black trees, capping the worst case at O(log n).",
    ],
    [
      "What is the difference between O(n log n) and O(n²) in practice?",
      "At n = 1,000,000 an O(n log n) algorithm does roughly 2×10⁷ operations while an O(n²) one does 10¹² — about 50,000 times more work. At tiny sizes the gap reverses because Big-O hides constants, which is why production sorts use insertion sort below a small threshold.",
    ],
  ],
};

export default seo;
