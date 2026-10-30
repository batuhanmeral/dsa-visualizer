import {
  BarChart3,
  Binary,
  Boxes,
  HandCoins,
  Layers,
  Puzzle,
  Search,
  Share2,
  Sigma,
  Type,
  type LucideIcon,
} from "lucide-react";

export interface Algorithm {
  slug: string;
  name: string;
  summary: string;
  time: string;
  space: string;
  /** When set, the workspace lets the user enter their own numbers. */
  inputKind?: "array" | "array-target";
  /** Input is auto-sorted before display (e.g. Binary Search). */
  sortedInput?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  algorithms: Algorithm[];
}

export const categories: Category[] = [
  {
    slug: "sorting",
    name: "Sorting",
    tagline: "Ordering data step by step",
    icon: BarChart3,
    algorithms: [
      {
        slug: "bubble-sort",
        name: "Bubble Sort",
        summary:
          "Repeatedly swaps adjacent elements that are out of order, bubbling the largest value to the end on each pass.",
        time: "O(n²)",
        space: "O(1)",
        inputKind: "array",
      },
      {
        slug: "selection-sort",
        name: "Selection Sort",
        summary:
          "Scans the unsorted part for the smallest element and swaps it into the next position of the sorted prefix.",
        time: "O(n²)",
        space: "O(1)",
        inputKind: "array",
      },
      {
        slug: "insertion-sort",
        name: "Insertion Sort",
        summary:
          "Grows a sorted prefix one element at a time, shifting larger values right until the new element fits.",
        time: "O(n²)",
        space: "O(1)",
        inputKind: "array",
      },
      {
        slug: "shell-sort",
        name: "Shell Sort",
        summary:
          "Insertion sort over shrinking gaps: distant elements move first, so the final pass has little work left.",
        time: "O(n log² n)",
        space: "O(1)",
        inputKind: "array",
      },
      {
        slug: "merge-sort",
        name: "Merge Sort",
        summary:
          "Recursively splits the array in half, sorts each half, then merges the two sorted halves back together.",
        time: "O(n log n)",
        space: "O(n)",
        inputKind: "array",
      },
      {
        slug: "quick-sort",
        name: "Quick Sort",
        summary:
          "Divide-and-conquer sort that partitions the array around a pivot, then recursively sorts each side.",
        time: "O(n log n)",
        space: "O(log n)",
        inputKind: "array",
      },
      {
        slug: "heap-sort",
        name: "Heap Sort",
        summary:
          "Builds a max-heap, then repeatedly swaps the root to the end and re-heapifies the shrinking prefix.",
        time: "O(n log n)",
        space: "O(1)",
        inputKind: "array",
      },
      {
        slug: "radix-sort",
        name: "Radix Sort",
        summary:
          "Sorts without comparisons: runs a stable counting pass per digit, from least to most significant.",
        time: "O(d · (n + k))",
        space: "O(n + k)",
        inputKind: "array",
      },
      {
        slug: "counting-sort",
        name: "Counting Sort",
        summary:
          "Tallies how many times each value occurs, prefix-sums the counts into final positions, then places each element directly — no comparisons.",
        time: "O(n + k)",
        space: "O(n + k)",
        inputKind: "array",
      },
      {
        slug: "bucket-sort",
        name: "Bucket Sort",
        summary:
          "Scatters values into a few range buckets, sorts each bucket, then concatenates them back — fast when the data spreads evenly.",
        time: "O(n + k)",
        space: "O(n + k)",
        inputKind: "array",
      },
    ],
  },
  {
    slug: "searching",
    name: "Searching",
    tagline: "Finding values fast",
    icon: Search,
    algorithms: [
      {
        slug: "linear-search",
        name: "Linear Search",
        summary:
          "Walks the array element by element until the target is found — works on any array, sorted or not.",
        time: "O(n)",
        space: "O(1)",
        inputKind: "array-target",
      },
      {
        slug: "binary-search",
        name: "Binary Search",
        summary:
          "Halves a sorted range each step by comparing the middle element with the target.",
        time: "O(log n)",
        space: "O(1)",
        inputKind: "array-target",
        sortedInput: true,
      },
      {
        slug: "jump-search",
        name: "Jump Search",
        summary:
          "On a sorted array, leaps ahead in fixed blocks of √n to find the block that may hold the target, then scans that block linearly.",
        time: "O(√n)",
        space: "O(1)",
        inputKind: "array-target",
        sortedInput: true,
      },
      {
        slug: "interpolation-search",
        name: "Interpolation Search",
        summary:
          "Estimates the probe position from the target's value relative to the window's endpoints — near O(log log n) on uniformly spread data.",
        time: "O(log log n)",
        space: "O(1)",
        inputKind: "array-target",
        sortedInput: true,
      },
    ],
  },
  {
    slug: "data-structures",
    name: "Data Structures",
    tagline: "How data is organized",
    icon: Boxes,
    algorithms: [
      {
        slug: "linked-list",
        name: "Linked List",
        summary:
          "Nodes chained by pointers: O(1) insertion at the head, sequential traversal to search or delete.",
        time: "O(n) search",
        space: "O(n)",
        inputKind: "array",
      },
      {
        slug: "stack",
        name: "Stack",
        summary:
          "LIFO container: push and pop happen at the same end, so the last element in is the first one out.",
        time: "O(1) push/pop",
        space: "O(n)",
        inputKind: "array",
      },
      {
        slug: "queue",
        name: "Queue",
        summary:
          "FIFO container implemented as a circular buffer: enqueue at the rear, dequeue from the front.",
        time: "O(1) enqueue/dequeue",
        space: "O(n)",
        inputKind: "array",
      },
      {
        slug: "hash-table",
        name: "Hash Table",
        summary:
          "Maps keys to buckets with a hash function; collisions are chained as linked lists inside each bucket.",
        time: "O(1) average",
        space: "O(n)",
        inputKind: "array",
      },
      {
        slug: "union-find",
        name: "Union-Find (Disjoint Set)",
        summary:
          "Forest of sets: find walks to a root and flattens the path behind it, union hangs the lower-rank root under the higher one.",
        time: "O(α(n))",
        space: "O(n)",
      },
    ],
  },
  {
    slug: "graphs",
    name: "Graphs",
    tagline: "Traversal & shortest paths",
    icon: Share2,
    algorithms: [
      {
        slug: "bfs",
        name: "Breadth-First Search",
        summary:
          "Explores a graph level by level using a queue — the backbone of shortest paths in unweighted graphs.",
        time: "O(V + E)",
        space: "O(V)",
      },
      {
        slug: "dfs",
        name: "Depth-First Search",
        summary:
          "Dives as deep as possible along each branch before backtracking — implemented with recursion or a stack.",
        time: "O(V + E)",
        space: "O(V)",
      },
      {
        slug: "dijkstra",
        name: "Dijkstra's Algorithm",
        summary:
          "Finds the shortest path from a source node to every other node in a weighted graph with non-negative edges.",
        time: "O(V²)",
        space: "O(V)",
      },
      {
        slug: "bellman-ford",
        name: "Bellman-Ford",
        summary:
          "Shortest paths from a source that also works with negative edge weights, by relaxing every edge V−1 times.",
        time: "O(V · E)",
        space: "O(V)",
      },
      {
        slug: "topological-sort",
        name: "Topological Sort",
        summary:
          "Linear ordering of a DAG's nodes so every edge points forward — Kahn's algorithm peels off in-degree-0 nodes.",
        time: "O(V + E)",
        space: "O(V)",
      },
      {
        slug: "prim",
        name: "Prim's MST",
        summary:
          "Grows a minimum spanning tree from a start node, always adding the cheapest edge that reaches a new node.",
        time: "O(V²)",
        space: "O(V)",
      },
      {
        slug: "kruskal",
        name: "Kruskal's MST",
        summary:
          "Builds a minimum spanning tree by adding edges in weight order, using union-find to reject cycle edges.",
        time: "O(E log E)",
        space: "O(V)",
      },
      {
        slug: "a-star",
        name: "A* Search",
        summary:
          "Best-first shortest path guided by a heuristic: expands the node with the lowest g + straight-line estimate.",
        time: "O(E)",
        space: "O(V)",
      },
      {
        slug: "floyd-warshall",
        name: "Floyd-Warshall",
        summary:
          "All-pairs shortest paths by dynamic programming: round k asks every pair whether a stopover at node k shortens their path.",
        time: "O(V³)",
        space: "O(V²)",
      },
    ],
  },
  {
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    tagline: "Optimal substructure & memoization",
    icon: Layers,
    algorithms: [
      {
        slug: "lcs",
        name: "Longest Common Subsequence",
        summary:
          "Finds the longest subsequence shared by two strings by building a 2-D table of subproblem answers.",
        time: "O(m · n)",
        space: "O(m · n)",
      },
      {
        slug: "knapsack",
        name: "0/1 Knapsack",
        summary:
          "Maximizes total value under a weight limit, deciding for each item whether to take it or leave it.",
        time: "O(n · W)",
        space: "O(n · W)",
      },
      {
        slug: "edit-distance",
        name: "Edit Distance",
        summary:
          "Fewest single-character insertions, deletions or replacements to turn one string into another (Levenshtein).",
        time: "O(m · n)",
        space: "O(m · n)",
      },
      {
        slug: "coin-change",
        name: "Coin Change",
        summary:
          "Fewest coins that sum to a target amount, given unlimited supply of each denomination.",
        time: "O(n · amount)",
        space: "O(n · amount)",
      },
      {
        slug: "fibonacci",
        name: "Fibonacci (Tabulation)",
        summary:
          "Builds the Fibonacci sequence bottom-up, each term being the sum of the two before it — no repeated work.",
        time: "O(n)",
        space: "O(n)",
      },
      {
        slug: "kadane",
        name: "Kadane's Algorithm",
        summary:
          "Maximum subarray sum in one pass: extend the running sum while it helps, restart at the current element when it turns negative.",
        time: "O(n)",
        space: "O(1)",
      },
      {
        slug: "lis",
        name: "Longest Increasing Subsequence",
        summary:
          "Longest run of values that strictly increases (not necessarily contiguous), via dp[i] = best subsequence ending at i.",
        time: "O(n²)",
        space: "O(n)",
      },
    ],
  },
  {
    slug: "greedy",
    name: "Greedy",
    tagline: "Locally optimal choices",
    icon: HandCoins,
    algorithms: [
      {
        slug: "activity-selection",
        name: "Activity Selection",
        summary:
          "Picks the maximum number of non-overlapping activities by always taking the one that finishes earliest.",
        time: "O(n log n)",
        space: "O(1)",
      },
      {
        slug: "fractional-knapsack",
        name: "Fractional Knapsack",
        summary:
          "Maximizes value under a weight limit when items can be split: take items in value/weight order, breaking the last one.",
        time: "O(n log n)",
        space: "O(1)",
      },
      {
        slug: "job-sequencing",
        name: "Job Sequencing",
        summary:
          "Schedules deadline-bound unit jobs for maximum profit: greedily place each job (highest profit first) into the latest free hour before its deadline.",
        time: "O(n²)",
        space: "O(n)",
      },
      {
        slug: "huffman-coding",
        name: "Huffman Coding",
        summary:
          "Builds an optimal prefix code: repeatedly merge the two least frequent trees, then read codes off the root-to-leaf paths.",
        time: "O(n log n)",
        space: "O(n)",
      },
    ],
  },
  {
    slug: "backtracking",
    name: "Backtracking",
    tagline: "Explore, fail fast, undo",
    icon: Puzzle,
    algorithms: [
      {
        slug: "n-queens",
        name: "N-Queens",
        summary:
          "Places N queens on an N×N board so none attack each other, undoing placements the moment a conflict appears.",
        time: "O(N!)",
        space: "O(N)",
      },
      {
        slug: "sudoku",
        name: "Sudoku Solver",
        summary:
          "Fills empty cells one at a time, trying digits 1–9 and backtracking whenever a digit breaks the rules.",
        time: "O(9^m)",
        space: "O(m)",
      },
      {
        slug: "rat-in-a-maze",
        name: "Rat in a Maze",
        summary:
          "Finds a path from the top-left to the bottom-right of a grid, marking the route and undoing it at dead ends.",
        time: "O(4^(N²))",
        space: "O(N²)",
      },
      {
        slug: "subsets",
        name: "Subsets",
        summary:
          "Generates every subset of a set by, for each element, branching into taking it or leaving it out.",
        time: "O(2^n)",
        space: "O(n)",
      },
      {
        slug: "permutations",
        name: "Permutations",
        summary:
          "Generates every ordering of a set by fixing each position in turn and swapping, then undoing the swap.",
        time: "O(n · n!)",
        space: "O(n)",
      },
    ],
  },
  {
    slug: "trees",
    name: "Trees",
    tagline: "Hierarchies, balancing & queries",
    icon: Binary,
    algorithms: [
      {
        slug: "bst",
        name: "Binary Search Tree",
        summary:
          "Ordered tree where every left subtree is smaller and every right subtree larger — insert, search and delete all follow one root-to-leaf path.",
        time: "O(h)",
        space: "O(n)",
      },
      {
        slug: "avl",
        name: "AVL Tree",
        summary:
          "A self-balancing BST: after each insert it checks balance factors and rotates so the height stays O(log n).",
        time: "O(log n)",
        space: "O(n)",
      },
      {
        slug: "heap",
        name: "Binary Heap",
        summary:
          "A complete binary tree stored in an array; push sifts a value up and pop sinks the last element down to restore the max-heap order.",
        time: "O(log n)",
        space: "O(n)",
      },
      {
        slug: "trie",
        name: "Trie (Prefix Tree)",
        summary:
          "A tree keyed by characters: each root-to-node path spells a prefix, so insert and lookup cost only the length of the word.",
        time: "O(L)",
        space: "O(Σ · N)",
      },
      {
        slug: "segment-tree",
        name: "Segment Tree",
        summary:
          "A binary tree over array ranges: each node stores an aggregate (here, a sum) so range queries resolve in O(log n) by combining O(log n) covering nodes.",
        time: "O(log n) query",
        space: "O(n)",
      },
    ],
  },
  {
    slug: "strings",
    name: "Strings",
    tagline: "Pattern matching & palindromes",
    icon: Type,
    algorithms: [
      {
        slug: "kmp",
        name: "KMP",
        summary:
          "Knuth-Morris-Pratt: precomputes a longest-prefix-suffix table so a mismatch never rescans the text — linear-time pattern matching.",
        time: "O(n + m)",
        space: "O(m)",
      },
      {
        slug: "rabin-karp",
        name: "Rabin-Karp",
        summary:
          "Hashes the pattern and each text window with a rolling hash, verifying character-by-character only when hashes collide.",
        time: "O(n + m) avg",
        space: "O(1)",
      },
      {
        slug: "z-algorithm",
        name: "Z-Algorithm",
        summary:
          "Computes, for every position, the length of the longest substring starting there that matches a prefix of the string — reusing a [l, r) window.",
        time: "O(n)",
        space: "O(n)",
      },
      {
        slug: "boyer-moore",
        name: "Boyer-Moore",
        summary:
          "Compares the pattern right to left and uses the bad-character table to leap past hopeless alignments — often sublinear in practice.",
        time: "O(n/m) best",
        space: "O(σ)",
      },
      {
        slug: "manacher",
        name: "Manacher's Algorithm",
        summary:
          "Finds the longest palindromic substring in linear time by expanding around centers and mirroring radii across the current palindrome.",
        time: "O(n)",
        space: "O(n)",
      },
    ],
  },
  {
    slug: "math",
    name: "Math / Number Theory",
    tagline: "Primes, GCD & modular arithmetic",
    icon: Sigma,
    algorithms: [
      {
        slug: "sieve-of-eratosthenes",
        name: "Sieve of Eratosthenes",
        summary:
          "Finds every prime up to n by crossing out the multiples of each prime, starting from its square.",
        time: "O(n log log n)",
        space: "O(n)",
      },
      {
        slug: "euclidean-gcd",
        name: "Euclidean Algorithm (GCD)",
        summary:
          "Computes the greatest common divisor by replacing the pair (a, b) with (b, a mod b) until the remainder is zero.",
        time: "O(log min(a, b))",
        space: "O(1)",
      },
      {
        slug: "extended-euclidean",
        name: "Extended Euclidean Algorithm",
        summary:
          "Runs Euclid while tracking Bézout coefficients, so it ends with gcd(a, b) = x·a + y·b — the key to modular inverses.",
        time: "O(log min(a, b))",
        space: "O(1)",
      },
      {
        slug: "fast-exponentiation",
        name: "Fast Exponentiation",
        summary:
          "Computes baseᵉˣᵖ mod m in O(log exp) by squaring the base and multiplying it in only where the exponent has a 1-bit.",
        time: "O(log exp)",
        space: "O(1)",
      },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAlgorithm(
  categorySlug: string,
  algorithmSlug: string
): { category: Category; algorithm: Algorithm } | undefined {
  const category = getCategory(categorySlug);
  const algorithm = category?.algorithms.find(
    (a) => a.slug === algorithmSlug
  );
  if (!category || !algorithm) return undefined;
  return { category, algorithm };
}
