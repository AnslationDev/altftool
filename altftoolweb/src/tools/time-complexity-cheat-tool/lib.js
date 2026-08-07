/**
 * Time and space complexity reference.
 *
 * Complexities follow the canonical analyses in CLRS (Cormen, Leiserson,
 * Rivest, Stein — Introduction to Algorithms, 4th ed.) and the standard
 * "Big-O cheat sheet" conventions: array-implementation costs for heaps,
 * amortised O(1) expected costs for hash tables with chaining, and the
 * optimised early-exit variant of bubble sort (best case O(n)).
 */

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "sorting", label: "Sorting" },
  { id: "searching", label: "Searching" },
  { id: "data-structure", label: "Data structures" },
  { id: "graph", label: "Graph algorithms" },
];

/**
 * Growth classes in strictly increasing asymptotic order. `ops(n)` gives the
 * approximate operation count used for the growth illustration table.
 */
export const GROWTH_CLASSES = [
  { id: "1", label: "O(1)", ops: () => 1 },
  { id: "logn", label: "O(log n)", ops: (n) => Math.log2(n) },
  { id: "n", label: "O(n)", ops: (n) => n },
  { id: "nlogn", label: "O(n log n)", ops: (n) => n * Math.log2(n) },
  { id: "n2", label: "O(n²)", ops: (n) => n * n },
  { id: "n3", label: "O(n³)", ops: (n) => n * n * n },
  { id: "2n", label: "O(2ⁿ)", ops: (n) => 2 ** n },
  { id: "nfact", label: "O(n!)", ops: (n) => factorial(n) },
];

/** Beyond this the count is astronomically large; shown as ">10^18". */
export const OPS_DISPLAY_CEILING = 1e18;

function factorial(n) {
  // Only used for the illustration table; capped to avoid overflow.
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
    if (result > OPS_DISPLAY_CEILING) return Infinity;
  }
  return result;
}

/**
 * Reference entries. best/average/worst are TIME complexity; space is the
 * auxiliary (extra) space unless noted. n = elements; V/E = vertices/edges;
 * k = key range (counting sort) or digit count (radix sort).
 */
export const COMPLEXITY_ENTRIES = [
  // Sorting — CLRS chapters 2, 6–8; Timsort per CPython listsort.txt.
  { name: "Quicksort", category: "sorting", best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)", note: "Worst case hits on already-sorted input with naive pivots; randomised pivots make it rare." },
  { name: "Merge sort", category: "sorting", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", note: "Stable; the guaranteed n log n cost is why it backs external sorting." },
  { name: "Heapsort", category: "sorting", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)", note: "In-place with guaranteed n log n, but not stable and cache-unfriendly." },
  { name: "Insertion sort", category: "sorting", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", note: "Best case is an already-sorted array; the standard choice for tiny or nearly-sorted inputs." },
  { name: "Bubble sort (optimised)", category: "sorting", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", note: "Early-exit variant stops after a pass with no swaps." },
  { name: "Selection sort", category: "sorting", best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", note: "Always scans the whole remainder; does the minimum possible number of swaps (n − 1)." },
  { name: "Counting sort", category: "sorting", best: "O(n + k)", average: "O(n + k)", worst: "O(n + k)", space: "O(n + k)", note: "Non-comparison sort; k is the key range, so it only pays off when k = O(n)." },
  { name: "Radix sort (LSD)", category: "sorting", best: "O(nk)", average: "O(nk)", worst: "O(nk)", space: "O(n + k)", note: "k digit positions, each sorted with a stable counting pass." },
  { name: "Timsort (Python/Java)", category: "sorting", best: "O(n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", note: "Exploits existing runs; best case is already-sorted data." },

  // Searching — CLRS chapter 2 and 12.
  { name: "Linear search", category: "searching", best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)", note: "Works on unsorted data; average n/2 probes on a uniform hit." },
  { name: "Binary search", category: "searching", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", note: "Requires sorted input; iterative version needs no extra space." },

  // Data structures — operation costs; CLRS chapters 10–13, 6, 11.
  { name: "Array (linear search)", category: "data-structure", best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(n)", note: "Case analysis is for scanning to find a value. Indexed access is always O(1); inserting or deleting mid-array is O(n) because it shifts elements." },
  { name: "Dynamic array append", category: "data-structure", best: "O(1)", average: "O(1) amortised", worst: "O(n)", space: "O(n)", note: "Occasional resize copies everything, but doubling keeps the amortised cost constant." },
  { name: "Singly linked list (search)", category: "data-structure", best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(n)", note: "Case analysis is for finding a value by traversal. Insertion/deletion is O(1) once you hold the node — indexed access needs the same O(n) traversal as search." },
  { name: "Stack / Queue", category: "data-structure", best: "O(1)", average: "O(1)", worst: "O(1)", space: "O(n)", note: "Push, pop, enqueue and dequeue are all constant time." },
  { name: "Hash table (chaining)", category: "data-structure", best: "O(1)", average: "O(1) expected", worst: "O(n)", space: "O(n)", note: "Worst case is every key colliding into one bucket; a good hash makes it O(1) expected." },
  { name: "Binary search tree (unbalanced)", category: "data-structure", best: "O(log n)", average: "O(log n)", worst: "O(n)", space: "O(n)", note: "Degenerates to a linked list when keys arrive in sorted order." },
  { name: "Balanced BST (AVL / red-black)", category: "data-structure", best: "O(log n)", average: "O(log n)", worst: "O(log n)", space: "O(n)", note: "Rotations keep height Θ(log n), so search, insert and delete are all logarithmic." },
  { name: "Binary heap (insert)", category: "data-structure", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(n)", note: "Case analysis is for inserting a value (sift-up). find-min is always O(1); extract-min is always O(log n) (sift-down). Building a heap from n items is O(n), not O(n log n)." },
  { name: "Trie (prefix tree)", category: "data-structure", best: "O(m)", average: "O(m)", worst: "O(m)", space: "O(alphabet × nodes)", note: "m is the key length — independent of how many keys are stored." },

  // Graph algorithms — CLRS chapters 20–23 (4th ed. numbering).
  { name: "Breadth-first search (BFS)", category: "graph", best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)", note: "Adjacency-list representation; also finds shortest paths in unweighted graphs." },
  { name: "Depth-first search (DFS)", category: "graph", best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)", note: "Recursion stack can reach O(V) on a path graph." },
  { name: "Topological sort (Kahn / DFS)", category: "graph", best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)", space: "O(V)", note: "Only defined for directed acyclic graphs." },
  { name: "Dijkstra (binary heap)", category: "graph", best: "O((V + E) log V)", average: "O((V + E) log V)", worst: "O((V + E) log V)", space: "O(V)", note: "No negative edge weights; a Fibonacci heap improves it to O(E + V log V)." },
  { name: "Bellman-Ford", category: "graph", best: "O(E)", average: "O(VE)", worst: "O(VE)", space: "O(V)", note: "Handles negative edges and detects negative cycles; best case with early exit on a settled pass." },
  { name: "Floyd-Warshall", category: "graph", best: "O(V³)", average: "O(V³)", worst: "O(V³)", space: "O(V²)", note: "All-pairs shortest paths by dynamic programming over intermediate vertices." },
  { name: "Kruskal's MST", category: "graph", best: "O(E log E)", average: "O(E log E)", worst: "O(E log E)", space: "O(V)", note: "Dominated by sorting the edges; union-find adds near-constant α(V) per operation." },
  { name: "Prim's MST (binary heap)", category: "graph", best: "O(E log V)", average: "O(E log V)", worst: "O(E log V)", space: "O(V)", note: "Grows one tree from a start vertex using a priority queue." },
];

/** Input sizes used in the growth illustration table. */
export const GROWTH_SIZES = [10, 100, 1000, 1000000];

const formatOps = (value) => {
  if (!Number.isFinite(value) || value > OPS_DISPLAY_CEILING) return ">10^18";
  if (value < 10) return String(Math.round(value * 10) / 10);
  if (value <= 1e6) return Math.round(value).toLocaleString("en-US");
  return value.toExponential(1).replace("e+", "×10^");
};

/**
 * Rows for the growth table: one per growth class, with approximate operation
 * counts at each size in GROWTH_SIZES. Total function — sizes are validated.
 */
export function growthTable(sizes = GROWTH_SIZES) {
  if (!Array.isArray(sizes) || sizes.length === 0 || sizes.some((n) => !Number.isFinite(n) || n < 1 || n > 1e9)) {
    return { error: "Sizes must be numbers between 1 and 1,000,000,000." };
  }
  return {
    sizes,
    rows: GROWTH_CLASSES.map((cls) => ({
      id: cls.id,
      label: cls.label,
      counts: sizes.map((n) => formatOps(cls.ops(n))),
    })),
  };
}

/**
 * Filter the reference by free-text query and category.
 * Empty result is a valid answer, not an error.
 */
export function filterComplexityEntries({ query = "", category = "all" } = {}) {
  if (!CATEGORIES.some((item) => item.id === category)) {
    return { error: "Pick a category from the list." };
  }
  const needle = String(query).trim().toLowerCase();
  const entries = COMPLEXITY_ENTRIES.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (needle === "") return true;
    return (
      entry.name.toLowerCase().includes(needle) ||
      entry.note.toLowerCase().includes(needle) ||
      entry.best.toLowerCase().includes(needle) ||
      entry.average.toLowerCase().includes(needle) ||
      entry.worst.toLowerCase().includes(needle)
    );
  });
  return { entries, count: entries.length, total: COMPLEXITY_ENTRIES.length };
}
