// Per-algorithm explainer content for the workspace "About" tab: intuition,
// best/worst case behaviour and when to reach for the algorithm. English is
// the source of truth; Turkish is a full parallel record. Keyed by the
// algorithm slug from `lib/data.ts`.

import type { Lang } from "./i18n";

export interface AlgoInfo {
  /** Core intuition — how the algorithm "thinks". */
  how: string;
  /** Best-case behaviour, one line. */
  best?: string;
  /** Worst-case behaviour, one line. */
  worst?: string;
  /** When to reach for it in practice. */
  use: string;
}

const en: Record<string, AlgoInfo> = {
  // ── Sorting ──
  "bubble-sort": {
    how: "Sweep the array left to right, swapping any adjacent pair that is out of order. Each pass floats the largest remaining value to the end, so the sorted suffix grows by one every pass.",
    best: "Already sorted — one pass, no swaps, the swapped flag exits early: O(n).",
    worst: "Reverse-sorted input — every pair must be swapped: O(n²) comparisons and swaps.",
    use: "Teaching and tiny inputs only; in practice it is dominated by insertion sort.",
  },
  "selection-sort": {
    how: "Scan the unsorted part for its minimum and swap it into the next slot of the sorted prefix. The prefix grows one element per pass, and each element is moved at most once.",
    best: "No best case — it always scans the full unsorted part: O(n²) comparisons even when sorted.",
    worst: "Same O(n²) comparisons, but never more than n−1 swaps in total.",
    use: "When writes are expensive (e.g. flash memory) — it minimizes the number of swaps.",
  },
  "insertion-sort": {
    how: "Keep the left part sorted. Take the next element, shift everything larger one step right, and drop it into the gap — the way you sort playing cards in your hand.",
    best: "Already (or nearly) sorted — each element shifts at most a step: O(n).",
    worst: "Reverse-sorted — every element travels all the way left: O(n²).",
    use: "Small or nearly-sorted arrays; the standard finishing pass inside hybrid sorts like Timsort.",
  },
  "shell-sort": {
    how: "Run insertion sort over elements a gap apart, then shrink the gap. Distant elements jump close to their final spot early, so the final gap-1 pass finds an almost-sorted array.",
    best: "Already sorted — every gap pass just verifies order: about O(n log n).",
    worst: "Depends on the gap sequence; with n/2ᵏ gaps it degrades to O(n²).",
    use: "Simple in-place sort that beats plain insertion sort without recursion or extra memory.",
  },
  "merge-sort": {
    how: "Split the array in half, sort each half recursively, then merge the two sorted halves by repeatedly taking the smaller front element. All the real work happens in the merge.",
    best: "Always O(n log n) — the split/merge structure does not depend on the data.",
    worst: "Still O(n log n), but needs O(n) scratch space for merging.",
    use: "Stable sorting, linked lists, external sorting of data too big for memory, and guaranteed bounds.",
  },
  "quick-sort": {
    how: "Pick a pivot and partition: smaller values to its left, larger to its right — the pivot lands in its final place. Recurse on the two sides. Everything happens in place.",
    best: "Balanced partitions (good pivots): O(n log n) with a very small constant.",
    worst: "Sorted input with a bad pivot rule — one-sided partitions: O(n²).",
    use: "The default general-purpose in-memory sort when stability is not required.",
  },
  "heap-sort": {
    how: "Build a max-heap over the array, then repeatedly swap the root (maximum) with the last element and sift the new root down over the shrinking prefix.",
    best: "Always O(n log n); heap build itself is only O(n).",
    worst: "Still O(n log n) — no data-dependent blowup, and O(1) extra space.",
    use: "When you need guaranteed O(n log n) in place (real-time / adversarial inputs) and stability doesn't matter.",
  },
  "radix-sort": {
    how: "Never compares elements. Sort by the least significant digit with a stable counting pass, then the next digit, and so on — earlier digits survive later passes because the passes are stable.",
    best: "Few digits (small key range): effectively linear, O(d·(n+k)).",
    worst: "Many digits (huge keys) make d large; memory for buckets is extra.",
    use: "Large arrays of integers or fixed-length strings with a bounded number of digits.",
  },
  "counting-sort": {
    how: "Count how many times each value occurs, prefix-sum the counts into final positions, then place each element straight into its slot, scanning from the right for stability.",
    best: "O(n + k) always — a couple of linear passes.",
    worst: "A huge value range k dominates: counting array of size k must be allocated and swept.",
    use: "Integer keys from a small known range; also the stable pass inside radix sort.",
  },
  "bucket-sort": {
    how: "Split the value range into a few buckets, scatter elements into them, sort each small bucket (insertion sort), then concatenate the buckets in order.",
    best: "Uniformly spread data — buckets stay small: about O(n + k).",
    worst: "All values land in one bucket — degenerates to that bucket's sort: O(n²).",
    use: "Data known to spread evenly over a range (e.g. uniform floats in [0,1)).",
  },

  // ── Searching ──
  "linear-search": {
    how: "Walk the array front to back and compare each element with the target until you hit it or run out.",
    best: "Target is the first element: O(1).",
    worst: "Target is last or absent: O(n).",
    use: "Unsorted or tiny arrays, linked lists, or when you search only once so sorting wouldn't pay off.",
  },
  "binary-search": {
    how: "Compare the target with the middle of a sorted range. One comparison discards half the remaining candidates; repeat on the surviving half until found or empty.",
    best: "Target is exactly the middle: O(1).",
    worst: "Halving until one element remains: O(log n).",
    use: "Any sorted array — also as the building block for lower/upper-bound lookups.",
  },
  "jump-search": {
    how: "Leap through the sorted array in √n-sized blocks until you overshoot the target, then scan the previous block linearly.",
    best: "Target sits at a block boundary: O(1) jumps.",
    worst: "√n jumps plus √n scan steps: O(√n).",
    use: "Sorted data where jumping back is cheap but you want fewer comparisons than a full linear scan.",
  },
  "interpolation-search": {
    how: "Instead of the middle, probe where the target should be proportionally: if it's 90% of the way between the window's end values, probe 90% of the way in. Like opening a dictionary near the right letter.",
    best: "Uniformly distributed keys: O(log log n) probes.",
    worst: "Skewed distributions (e.g. exponential): degenerates to O(n).",
    use: "Large sorted arrays whose keys are close to uniformly distributed.",
  },

  // ── Data structures ──
  "linked-list": {
    how: "Each node stores a value and a pointer to the next node. There is no random access — you reach the k-th element by walking k links — but inserting at the head is a single pointer change.",
    best: "Push/pop at the head: O(1).",
    worst: "Search or delete by value: O(n) walk.",
    use: "Frequent insertions/removals at the ends, unknown final size, or as the chain inside hash tables.",
  },
  stack: {
    how: "Last in, first out. Push and pop touch only the top, so both are constant-time; nothing below the top is ever inspected.",
    use: "Undo histories, call stacks, matching brackets, DFS, expression evaluation.",
  },
  queue: {
    how: "First in, first out. Enqueue at the rear, dequeue from the front; a circular buffer wraps both indices around a fixed array so no element ever moves.",
    use: "Task scheduling, BFS, buffering between producers and consumers.",
  },
  "hash-table": {
    how: "A hash function maps each key to one of a few buckets. Lookups jump straight to the right bucket and only walk its (short) chain of colliding keys.",
    best: "Even spread — chains of length ~1: O(1) per operation.",
    worst: "All keys collide into one bucket: O(n) chain walk.",
    use: "The default dictionary/set: constant-time lookups when order doesn't matter.",
  },
  "union-find": {
    how: "Each set is a tree; the root is the set's representative. find(x) walks to the root, union links one root under the other. Path compression makes every visited node point straight at the root, flattening trees as a side effect of use.",
    best: "Flattened trees — find is a single hop: effectively O(1).",
    worst: "With union by rank + path compression: amortized O(α(n)) — inverse Ackermann, ≤ 4 in practice.",
    use: "Dynamic connectivity: Kruskal's MST, cycle detection, grouping equivalent items.",
  },

  // ── Graphs ──
  bfs: {
    how: "Explore outward in rings: visit all nodes at distance 1, then 2, and so on, using a FIFO queue. The first time you reach a node is via a shortest edge-count path.",
    use: "Shortest paths in unweighted graphs, level-order processing, connectivity checks.",
  },
  dfs: {
    how: "Follow one branch as deep as it goes before backtracking to the last fork. The recursion stack itself remembers the way back.",
    use: "Cycle detection, topological sorting, connected components, maze/backtracking problems.",
  },
  dijkstra: {
    how: "Grow a set of nodes with known shortest distances. Always settle the unvisited node with the smallest tentative distance, then relax its edges — a settled distance can never improve because all edges are non-negative.",
    worst: "O(V²) with the array scan shown here; O(E log V) with a priority queue.",
    use: "Single-source shortest paths with non-negative weights: routing, maps, network costs.",
  },
  "bellman-ford": {
    how: "Relax every edge, V−1 times. After pass k every shortest path using ≤ k edges is correct; a V-th improving pass would prove a negative cycle.",
    best: "Converges early if a pass changes nothing.",
    worst: "O(V·E) — every pass touches every edge.",
    use: "Graphs with negative edge weights, or when you must detect negative cycles.",
  },
  "topological-sort": {
    how: "Repeatedly peel off a node with no incoming edges and delete its outgoing edges (Kahn's algorithm). If the queue runs dry before all nodes are output, the graph has a cycle.",
    use: "Ordering tasks under dependencies: build systems, course prerequisites, spreadsheet evaluation.",
  },
  prim: {
    how: "Grow one tree from a start node: at each step add the cheapest edge that connects the tree to a new node. The cheapest crossing edge is always safe to take.",
    worst: "O(V²) with the array scan shown here; O(E log V) with a heap.",
    use: "Minimum spanning tree on dense graphs, or when you want the tree to grow from a specific node.",
  },
  kruskal: {
    how: "Sort all edges by weight and take them cheapest-first, skipping any edge whose endpoints are already connected (union-find detects that). Independent forests merge into one MST.",
    use: "Minimum spanning tree on sparse graphs / plain edge lists; clustering by cutting the largest edges.",
  },
  "a-star": {
    how: "Dijkstra with a sense of direction: order the frontier by g(n) + h(n), the cost so far plus an optimistic estimate to the goal. With an admissible h it never overlooks a shorter path, yet ignores most of the graph.",
    best: "Perfect heuristic — expands only the optimal path's nodes.",
    worst: "h ≡ 0 degenerates to plain Dijkstra.",
    use: "Pathfinding with a geometric goal: games, robotics, maps (straight-line distance as h).",
  },
  "floyd-warshall": {
    how: "Dynamic programming over intermediate nodes: after round k, dist[i][j] is the shortest path using only nodes 0..k as stopovers. Round k asks one question per pair — is going through k shorter?",
    worst: "Θ(V³) always — but with a tiny constant and no data structures.",
    use: "All-pairs shortest paths on small/dense graphs; handles negative edges (no negative cycles).",
  },

  // ── Dynamic programming ──
  lcs: {
    how: "dp[i][j] = LCS length of the first i chars of A and first j of B. Matching characters extend the diagonal by 1; otherwise inherit the better of dropping a character from either string.",
    use: "Diff tools, DNA sequence alignment, plagiarism detection — any 'how similar are two sequences' question.",
  },
  knapsack: {
    how: "For each item and each capacity, keep the best of two worlds: skip the item, or take it and add its value to the best result for the remaining capacity. The table reuses every sub-answer.",
    use: "Budgeted selection problems where items are indivisible: cargo, project portfolios, cutting stock.",
  },
  "edit-distance": {
    how: "dp[i][j] = cheapest way to turn the first i chars of A into the first j of B. Equal characters cost nothing; otherwise pay 1 for the best of replace (diagonal), delete (up) or insert (left).",
    use: "Spell checking, fuzzy search, diffing, DNA mutation distance.",
  },
  "coin-change": {
    how: "dp[i][a] = fewest coins for amount a using the first i denominations: skip the coin, or use it once and stay in the same row (unlimited supply). ∞ marks unreachable amounts.",
    use: "Making change, minimal-resource combinations; the template for unbounded knapsack problems.",
  },
  fibonacci: {
    how: "Build the sequence bottom-up in a table: each entry is the sum of the previous two. Tabulation turns the exponential recursion tree into a single linear sweep.",
    use: "The 'hello world' of DP — the pattern (memoize overlapping subproblems) is what transfers.",
  },
  lis: {
    how: "dp[i] = length of the longest increasing run ending exactly at i. For each i, look back at every smaller element and extend its best run. The answer is the maximum over all endings.",
    worst: "O(n²) as shown; an O(n log n) patience-sorting variant exists.",
    use: "Longest trend detection, patience sorting, box-stacking style problems.",
  },
  kadane: {
    how: "Walk the array once keeping the best sum that ends here: either extend the running sum or restart at the current element if the running sum went negative — a negative prefix can never help.",
    best: "Always one pass: O(n), O(1) space.",
    worst: "All-negative arrays still work — the answer is the largest single element.",
    use: "Maximum subarray sum: best trading window, brightest image strip, 1-D profit runs.",
  },

  // ── Greedy ──
  "activity-selection": {
    how: "Sort by finish time and always take the activity that frees you earliest. Anything that finishes earliest can be swapped into some optimal solution, so the greedy choice is always safe.",
    use: "Interval scheduling on one resource: meeting rooms, machines, CPU time slots.",
  },
  "fractional-knapsack": {
    how: "Best value per kilogram first. Take whole items while they fit, then top the bag off with a fraction of the next one — divisibility is what makes the greedy choice provably optimal.",
    use: "Divisible resources: liquids, budgets, bandwidth allocation. (Indivisible items need 0/1 knapsack DP.)",
  },
  "job-sequencing": {
    how: "Highest profit first; put each job into the latest free hour at or before its deadline. Scheduling late keeps earlier hours open for tighter deadlines that may come.",
    use: "Unit-length jobs with deadlines and penalties/profits — maximizing what gets done on time.",
  },
  "huffman-coding": {
    how: "Merge the two rarest symbols under one node, treat the pair as one symbol, and repeat. Rare symbols end up deep (long codes), frequent ones shallow (short codes); tree paths give prefix-free codes.",
    use: "Entropy coding in compression: DEFLATE/zip, JPEG, MP3 all embed Huffman stages.",
  },

  // ── Backtracking ──
  "n-queens": {
    how: "Place queens row by row. If a column/diagonal conflict appears, undo the latest placement and try the next column — pruning a whole subtree of doomed positions each time.",
    use: "The canonical constraint-satisfaction demo: placement problems with pairwise conflicts.",
  },
  sudoku: {
    how: "Find the next empty cell, try digits 1–9, recurse on the rest of the grid, and erase the digit when a dead end proves it wrong. Constraint checks keep the branching factor small.",
    use: "Constraint-satisfaction puzzles; the same skeleton solves scheduling and coloring instances.",
  },
  "rat-in-a-maze": {
    how: "From each cell try the four directions in a fixed order, marking the path as you go and unmarking on retreat. The marks double as a visited check so the search never loops.",
    use: "Path existence in grids and simple maze solving; a stepping stone to BFS/DFS on grids.",
  },
  subsets: {
    how: "For every element make a binary decision: in or out. The recursion tree has 2ⁿ leaves — each leaf is exactly one subset.",
    use: "Enumerating all combinations for brute-force checks, power sets, feature subsets.",
  },
  permutations: {
    how: "Fix the first position by swapping each candidate into it, recurse on the rest, then swap back. The undo keeps the array reusable across branches.",
    use: "Enumerating orderings: brute-force TSP, anagram generation, test-case shuffling.",
  },

  // ── Trees ──
  bst: {
    how: "The invariant — left subtree smaller, right subtree larger — turns every operation into a single root-to-leaf walk. Deleting a two-child node swaps in its in-order successor and deletes that instead.",
    best: "Balanced tree: O(log n) walks.",
    worst: "Sorted insertions degrade it to a linked list: O(n).",
    use: "Ordered maps: range queries, predecessor/successor, sorted iteration — when balancing is added.",
  },
  avl: {
    how: "A BST that measures each node's balance factor after insertions and repairs any ±2 tilt with one or two rotations. Height stays within 1.44·log n, so walks stay logarithmic.",
    use: "Read-heavy ordered maps where strict O(log n) lookups matter more than cheap writes.",
  },
  heap: {
    how: "A complete binary tree packed into an array (children of i at 2i+1, 2i+2). Push bubbles a value up until its parent is bigger; pop moves the last element to the root and sinks it down.",
    use: "Priority queues: schedulers, Dijkstra/Prim, top-k tracking, heapsort.",
  },
  trie: {
    how: "One tree node per character; a word is a root-to-node path. All words sharing a prefix share that path, so lookup cost depends on word length, not dictionary size.",
    use: "Autocomplete, prefix search, spell checkers, IP routing tables.",
  },
  "segment-tree": {
    how: "Each node stores an aggregate of an array range; children split the range in half. A query stitches its answer from O(log n) disjoint covering nodes; an update refreshes one leaf-to-root path.",
    use: "Range queries (sum/min/max) interleaved with point updates: competitive programming, analytics windows.",
  },

  // ── Strings ──
  kmp: {
    how: "Precompute, for each pattern prefix, the longest proper prefix that is also a suffix (LPS). On a mismatch the pattern slides to that border instead of restarting — the text pointer never backs up.",
    use: "Repeated searches with one pattern, streaming input where re-reading text is impossible.",
  },
  "rabin-karp": {
    how: "Compare hashes, not strings: a rolling hash updates the window's value in O(1) as it slides. Only hash collisions trigger a real character-by-character check.",
    best: "Few collisions: O(n + m) expected.",
    worst: "Adversarial collisions: O(n·m).",
    use: "Multi-pattern search (one hash set, many patterns), plagiarism chunk matching.",
  },
  "z-algorithm": {
    how: "Z[i] = length of the longest substring starting at i that matches the string's own prefix. A maintained [l, r) match window lets each Z value start from a mirrored earlier one instead of zero.",
    use: "Pattern matching (search P#T), string periodicity, prefix-based similarity.",
  },
  manacher: {
    how: "Insert separators so every palindrome has odd length, then expand around each center — but first seed each radius from its mirror inside the current rightmost palindrome. Every character is expanded over at most once.",
    use: "Longest palindromic substring in O(n); palindrome counting and factorization.",
  },
  "boyer-moore": {
    how: "Compare the pattern right to left. On a mismatch, the bad-character rule slides the pattern so its last occurrence of the offending text character lines up — often skipping many positions in one jump.",
    best: "Alphabet-rich text: about n/m character looks — sublinear.",
    worst: "Degenerate repetitive inputs: O(n·m) for the bad-character-only variant.",
    use: "Long patterns over large alphabets: text editors' find, grep-style scanning.",
  },

  // ── Math ──
  "sieve-of-eratosthenes": {
    how: "List 2..n; repeatedly take the next surviving number (a prime) and cross out its multiples starting at p². Anything still standing at the end was never a multiple of a smaller prime.",
    use: "Generating all primes up to n, smallest-prime-factor tables for fast factorization.",
  },
  "euclidean-gcd": {
    how: "gcd(a, b) = gcd(b, a mod b): any common divisor of a and b also divides the remainder. Remainders shrink fast — at least halving every two steps — so the chain is logarithmic.",
    use: "Reducing fractions, LCM via a·b/gcd, the base of modular arithmetic routines.",
  },
  "extended-euclidean": {
    how: "Run Euclid while carrying two extra sequences so that every remainder stays expressed as x·a + y·b. When the remainder hits gcd, its coefficients are the Bézout pair.",
    use: "Modular inverses (RSA, hashing), solving ax + by = c, the Chinese Remainder Theorem.",
  },
  "fast-exponentiation": {
    how: "Square the base repeatedly (b, b², b⁴, …) and multiply into the result only where the exponent's binary digit is 1. 2⁶⁴-sized exponents take just 64 rounds.",
    use: "Modular powers in cryptography, fast matrix powers for linear recurrences, big exponents anywhere.",
  },
};

const tr: Record<string, AlgoInfo> = {
  // ── Sıralama ──
  "bubble-sort": {
    how: "Diziyi soldan sağa tara ve sırası bozuk her komşu çifti takas et. Her geçiş kalan en büyük değeri sona taşır; sıralı sondaki bölüm her geçişte bir büyür.",
    best: "Zaten sıralı — tek geçiş, takas yok, swapped bayrağı erken çıkar: O(n).",
    worst: "Ters sıralı girdi — her çift takas edilmek zorunda: O(n²) karşılaştırma ve takas.",
    use: "Yalnızca öğretim ve çok küçük girdiler; pratikte eklemeli sıralama her zaman daha iyidir.",
  },
  "selection-sort": {
    how: "Sıralanmamış kısımda en küçüğü bul ve sıralı önekin bir sonraki yerine takas et. Önek her geçişte bir eleman büyür ve her eleman en fazla bir kez taşınır.",
    best: "En iyi durum yok — sıralı olsa bile tüm sıralanmamış kısmı tarar: O(n²) karşılaştırma.",
    worst: "Yine O(n²) karşılaştırma; ama toplamda en fazla n−1 takas.",
    use: "Yazmanın pahalı olduğu durumlar (ör. flash bellek) — takas sayısını en aza indirir.",
  },
  "insertion-sort": {
    how: "Sol kısmı sıralı tut. Sıradaki elemanı al, ondan büyük her şeyi bir sağa kaydır ve boşluğa bırak — eldeki iskambil kartlarını sıralamak gibi.",
    best: "Zaten (veya neredeyse) sıralı — her eleman en fazla bir adım kayar: O(n).",
    worst: "Ters sıralı — her eleman en sola kadar yürür: O(n²).",
    use: "Küçük veya neredeyse sıralı diziler; Timsort gibi hibrit sıralamaların bitirme geçişi.",
  },
  "shell-sort": {
    how: "Aralarında gap kadar mesafe olan elemanlara eklemeli sıralama uygula, sonra gap'i küçült. Uzak elemanlar erken aşamada son yerlerine yaklaşır; son gap-1 geçişi neredeyse sıralı bir dizi bulur.",
    best: "Zaten sıralı — her gap geçişi yalnızca doğrular: yaklaşık O(n log n).",
    worst: "Gap dizisine bağlı; n/2ᵏ gap'lerle O(n²)'ye düşer.",
    use: "Özyineleme ve ek bellek olmadan düz eklemeli sıralamayı geçen basit yerinde sıralama.",
  },
  "merge-sort": {
    how: "Diziyi ikiye böl, her yarıyı özyinelemeli sırala, sonra iki sıralı yarıyı öndeki küçük elemanı ala ala birleştir. Asıl iş birleştirmede olur.",
    best: "Her zaman O(n log n) — bölme/birleştirme yapısı veriye bağlı değildir.",
    worst: "Yine O(n log n), ama birleştirme için O(n) ek alan gerekir.",
    use: "Kararlı sıralama, bağlı listeler, belleğe sığmayan veriler (dış sıralama) ve garanti sınırlar.",
  },
  "quick-sort": {
    how: "Bir eksen (pivot) seç ve böl: küçükler sola, büyükler sağa — pivot son yerine oturur. İki tarafta özyinele. Her şey yerinde olur.",
    best: "Dengeli bölmeler (iyi pivotlar): çok küçük sabitli O(n log n).",
    worst: "Kötü pivot kuralıyla sıralı girdi — tek taraflı bölmeler: O(n²).",
    use: "Kararlılık gerekmiyorsa bellek içi genel amaçlı sıralamanın varsayılanı.",
  },
  "heap-sort": {
    how: "Dizi üzerinde bir maksimum yığın kur; sonra kökü (en büyüğü) son elemanla takas edip yeni kökü küçülen önek üzerinde aşağı süz.",
    best: "Her zaman O(n log n); yığın kurma tek başına O(n).",
    worst: "Yine O(n log n) — veriye bağlı kötüleşme yok, O(1) ek alan.",
    use: "Yerinde ve garantili O(n log n) gerektiğinde (gerçek zamanlı / düşmanca girdiler), kararlılık önemsizse.",
  },
  "radix-sort": {
    how: "Hiç karşılaştırma yapmaz. En düşük basamaktan başlayarak her basamağı kararlı bir sayma geçişiyle sıralar — geçişler kararlı olduğu için önceki basamakların sırası korunur.",
    best: "Az basamak (küçük anahtar aralığı): fiilen doğrusal, O(d·(n+k)).",
    worst: "Çok basamak (dev anahtarlar) d'yi büyütür; kova belleği ekstradır.",
    use: "Sınırlı basamak sayılı büyük tamsayı veya sabit uzunluklu dize dizileri.",
  },
  "counting-sort": {
    how: "Her değerin kaç kez geçtiğini say, sayımları önek toplamıyla son konumlara çevir, sonra kararlılık için sağdan tarayarak her elemanı doğrudan yerine koy.",
    best: "Her zaman O(n + k) — birkaç doğrusal geçiş.",
    worst: "Dev değer aralığı k baskın çıkar: k boyutlu sayım dizisi ayrılıp taranmalı.",
    use: "Küçük ve bilinen aralıktan tamsayı anahtarlar; radix sıralamanın kararlı geçişi.",
  },
  "bucket-sort": {
    how: "Değer aralığını birkaç kovaya böl, elemanları kovalara dağıt, her küçük kovayı sırala (eklemeli), sonra kovaları sırayla birleştir.",
    best: "Düzgün yayılmış veri — kovalar küçük kalır: yaklaşık O(n + k).",
    worst: "Tüm değerler tek kovaya düşer — o kovanın sıralamasına döner: O(n²).",
    use: "Aralığa düzgün yayıldığı bilinen veriler (ör. [0,1) aralığında düzgün ondalıklar).",
  },

  // ── Arama ──
  "linear-search": {
    how: "Diziyi baştan sona yürü ve her elemanı hedefle karşılaştır; bulana ya da dizi bitene kadar.",
    best: "Hedef ilk eleman: O(1).",
    worst: "Hedef sonda veya yok: O(n).",
    use: "Sırasız veya çok küçük diziler, bağlı listeler ya da tek seferlik aramalar (sıralamaya değmez).",
  },
  "binary-search": {
    how: "Hedefi sıralı aralığın ortasıyla karşılaştır. Tek karşılaştırma kalan adayların yarısını eler; kalan yarıda tekrarla.",
    best: "Hedef tam ortada: O(1).",
    worst: "Tek eleman kalana dek yarılama: O(log n).",
    use: "Her sıralı dizi — ayrıca lower/upper-bound aramalarının yapı taşı.",
  },
  "jump-search": {
    how: "Sıralı dizide √n boyutlu bloklarla sıçra; hedefi aşınca önceki bloğu doğrusal tara.",
    best: "Hedef blok sınırında: O(1) sıçrama.",
    worst: "√n sıçrama + √n tarama adımı: O(√n).",
    use: "Geriye atlamanın ucuz olduğu ama tam doğrusal taramadan az karşılaştırma istenen sıralı veriler.",
  },
  "interpolation-search": {
    how: "Ortayı değil, hedefin orantısal olarak olması gereken yeri yokla: pencere uç değerlerinin %90'ı kadarsa %90'lık konuma bak. Sözlüğü doğru harfe yakın açmak gibi.",
    best: "Düzgün dağılmış anahtarlar: O(log log n) yoklama.",
    worst: "Çarpık dağılımlar (ör. üstel): O(n)'e düşer.",
    use: "Anahtarları düzgün dağılıma yakın büyük sıralı diziler.",
  },

  // ── Veri yapıları ──
  "linked-list": {
    how: "Her düğüm bir değer ve sonrakine işaretçi tutar. Rastgele erişim yoktur — k. elemana k bağlantı yürüyerek ulaşılır — ama başa ekleme tek işaretçi değişimidir.",
    best: "Baştan ekleme/çıkarma: O(1).",
    worst: "Değere göre arama veya silme: O(n) yürüyüş.",
    use: "Uçlarda sık ekleme/silme, bilinmeyen boyut veya hash tablolarının zincirleri.",
  },
  stack: {
    how: "Son giren ilk çıkar. Push ve pop yalnızca tepeye dokunur, ikisi de sabit zamanlıdır; tepenin altı asla incelenmez.",
    use: "Geri alma geçmişleri, çağrı yığınları, parantez eşleme, DFS, ifade değerlendirme.",
  },
  queue: {
    how: "İlk giren ilk çıkar. Arkadan ekle, önden çıkar; dairesel tampon iki ucu sabit dizide döndürür, hiçbir eleman yer değiştirmez.",
    use: "Görev sıralama, BFS, üretici-tüketici arası tamponlama.",
  },
  "hash-table": {
    how: "Hash fonksiyonu her anahtarı bir kovaya eşler. Arama doğru kovaya doğrudan atlar ve yalnızca o kovanın (kısa) çakışma zincirini yürür.",
    best: "Düzgün dağılım — ~1 uzunluklu zincirler: işlem başına O(1).",
    worst: "Tüm anahtarlar tek kovada çakışır: O(n) zincir yürüyüşü.",
    use: "Varsayılan sözlük/küme: sıra önemli değilken sabit zamanlı erişim.",
  },
  "union-find": {
    how: "Her küme bir ağaçtır; kök kümenin temsilcisidir. find(x) köke yürür, union bir kökü diğerinin altına bağlar. Yol sıkıştırma, ziyaret edilen her düğümü doğrudan köke bağlar — kullanım yan etkisi olarak ağaçlar düzleşir.",
    best: "Düzleşmiş ağaçlar — find tek sıçrama: fiilen O(1).",
    worst: "Rütbeye göre birleştirme + yol sıkıştırmayla: amorti O(α(n)) — ters Ackermann, pratikte ≤ 4.",
    use: "Dinamik bağlantılılık: Kruskal MST, döngü tespiti, eşdeğer öğeleri gruplama.",
  },

  // ── Graflar ──
  bfs: {
    how: "Halkalar hâlinde dışa doğru keşfet: önce 1 uzaklıktaki tüm düğümler, sonra 2, … — FIFO kuyrukla. Bir düğüme ilk ulaşma her zaman en az kenarlı yoldan olur.",
    use: "Ağırlıksız graflarda en kısa yol, seviye seviye işleme, bağlantılılık kontrolleri.",
  },
  dfs: {
    how: "Bir dalı gidebildiği kadar derine izle, sonra son çatala geri dön. Dönüş yolunu özyineleme yığını kendisi hatırlar.",
    use: "Döngü tespiti, topolojik sıralama, bağlı bileşenler, labirent/geri izleme problemleri.",
  },
  dijkstra: {
    how: "Kesin en kısa mesafesi bilinen düğümler kümesini büyüt. Her adımda geçici mesafesi en küçük ziyaretsiz düğümü kesinleştir ve kenarlarını gevşet — kenarlar negatif olmadığından kesinleşen mesafe bir daha iyileşemez.",
    worst: "Buradaki dizi taramasıyla O(V²); öncelik kuyruğuyla O(E log V).",
    use: "Negatif olmayan ağırlıklarla tek kaynaklı en kısa yol: rotalama, haritalar, ağ maliyetleri.",
  },
  "bellman-ford": {
    how: "Tüm kenarları V−1 kez gevşet. k. geçişten sonra ≤ k kenarlı tüm en kısa yollar doğrudur; V. geçişte hâlâ iyileşme olması negatif döngü kanıtıdır.",
    best: "Bir geçiş hiçbir şeyi değiştirmezse erken durur.",
    worst: "O(V·E) — her geçiş her kenara dokunur.",
    use: "Negatif kenar ağırlıklı graflar veya negatif döngü tespiti gerektiğinde.",
  },
  "topological-sort": {
    how: "Giriş derecesi 0 olan bir düğümü kopar, çıkan kenarlarını sil ve tekrarla (Kahn algoritması). Kuyruk tüm düğümler çıkmadan boşalırsa grafta döngü vardır.",
    use: "Bağımlılık altında iş sıralama: derleme sistemleri, ders ön koşulları, hesap tablosu değerlendirme.",
  },
  prim: {
    how: "Tek bir ağacı başlangıç düğümünden büyüt: her adımda ağacı yeni bir düğüme bağlayan en ucuz kenarı ekle. Kesiti geçen en ucuz kenar her zaman güvenlidir.",
    worst: "Buradaki dizi taramasıyla O(V²); yığınla O(E log V).",
    use: "Yoğun graflarda minimum kapsayan ağaç veya ağacın belirli bir düğümden büyümesi istendiğinde.",
  },
  kruskal: {
    how: "Tüm kenarları ağırlığa göre sırala ve en ucuzdan başlayarak al; uçları zaten bağlı olan kenarları atla (bunu union-find saptar). Bağımsız ormanlar tek MST'de birleşir.",
    use: "Seyrek graflar / düz kenar listelerinde MST; en büyük kenarları keserek kümeleme.",
  },
  "a-star": {
    how: "Yön duygusu olan Dijkstra: sınırı g(n) + h(n) ile sırala — o ana dek maliyet artı hedefe iyimser tahmin. Kabul edilebilir h ile asla daha kısa yolu kaçırmaz ama grafın çoğunu görmezden gelir.",
    best: "Mükemmel sezgisel — yalnızca optimal yolun düğümlerini genişletir.",
    worst: "h ≡ 0 düz Dijkstra'ya döner.",
    use: "Geometrik hedefli yol bulma: oyunlar, robotik, haritalar (h olarak kuş uçuşu mesafe).",
  },
  "floyd-warshall": {
    how: "Ara düğümler üzerinde dinamik programlama: k. turdan sonra dist[i][j], yalnızca 0..k düğümlerini durak olarak kullanan en kısa yoldur. k. tur her çifte tek soru sorar — k üzerinden gitmek daha mı kısa?",
    worst: "Her zaman Θ(V³) — ama çok küçük sabitle ve veri yapısız.",
    use: "Küçük/yoğun graflarda tüm-çiftler en kısa yol; negatif kenarları da işler (negatif döngü yoksa).",
  },

  // ── Dinamik programlama ──
  lcs: {
    how: "dp[i][j] = A'nın ilk i ve B'nin ilk j karakterinin LCS uzunluğu. Eşleşen karakter köşegeni 1 uzatır; aksi hâlde iki dizeden birinden karakter düşürmenin iyisi devralınır.",
    use: "Diff araçları, DNA hizalama, intihal tespiti — her 'iki dizi ne kadar benzer' sorusu.",
  },
  knapsack: {
    how: "Her öğe ve kapasite için iki dünyanın iyisini tut: öğeyi atla ya da al ve değerini kalan kapasitenin en iyi sonucuna ekle. Tablo her alt yanıtı yeniden kullanır.",
    use: "Öğelerin bölünemediği bütçeli seçim problemleri: kargo, proje portföyleri, stok kesimi.",
  },
  "edit-distance": {
    how: "dp[i][j] = A'nın ilk i karakterini B'nin ilk j karakterine çevirmenin en ucuz yolu. Eşit karakterler bedava; değilse değiştir (köşegen), sil (üst), ekle (sol) seçeneklerinin iyisine 1 öde.",
    use: "Yazım denetimi, bulanık arama, diff, DNA mutasyon mesafesi.",
  },
  "coin-change": {
    how: "dp[i][a] = ilk i birimle a tutarı için en az para: parayı atla ya da bir kez kullanıp aynı satırda kal (sınırsız arz). ∞ ulaşılamaz tutarları işaretler.",
    use: "Para üstü, en az kaynakla kombinasyon; sınırsız sırt çantası problemlerinin şablonu.",
  },
  fibonacci: {
    how: "Diziyi tabloda aşağıdan yukarı kur: her giriş önceki ikisinin toplamı. Tablolama, üstel özyineleme ağacını tek doğrusal taramaya çevirir.",
    use: "DP'nin 'hello world'ü — asıl aktarılan, örtüşen alt problemleri hafızalama desenidir.",
  },
  lis: {
    how: "dp[i] = tam i'de biten en uzun artan dizinin uzunluğu. Her i için geriye bak, daha küçük her elemanın en iyi dizisini uzat. Yanıt tüm bitişlerin maksimumudur.",
    worst: "Gösterildiği gibi O(n²); O(n log n)'lik patience-sorting türevi vardır.",
    use: "En uzun eğilim tespiti, patience sorting, kutu istifleme tarzı problemler.",
  },
  kadane: {
    how: "Diziyi tek geçişte yürü ve burada biten en iyi toplamı tut: ya süregelen toplamı uzat ya da toplam negatife düştüyse mevcut elemandan yeniden başla — negatif önek asla yardım edemez.",
    best: "Her zaman tek geçiş: O(n), O(1) alan.",
    worst: "Tamamı negatif diziler de çalışır — yanıt en büyük tek elemandır.",
    use: "Maksimum alt dizi toplamı: en iyi alım-satım penceresi, en parlak görüntü şeridi, 1B kâr aralıkları.",
  },

  // ── Açgözlü ──
  "activity-selection": {
    how: "Bitiş zamanına göre sırala ve her zaman seni en erken serbest bırakan etkinliği al. En erken biten her zaman bir optimal çözüme takas edilebilir; açgözlü seçim güvenlidir.",
    use: "Tek kaynakta aralık planlama: toplantı odaları, makineler, CPU zaman dilimleri.",
  },
  "fractional-knapsack": {
    how: "Önce kilogram başına en değerli. Sığdıkça öğeleri bütün al, sonra çantayı bir sonrakinin kesriyle doldur — açgözlü seçimi kanıtlanabilir optimal yapan bölünebilirliktir.",
    use: "Bölünebilir kaynaklar: sıvılar, bütçeler, bant genişliği. (Bölünemez öğeler 0/1 sırt çantası DP ister.)",
  },
  "job-sequencing": {
    how: "Önce en yüksek kâr; her işi son teslim tarihinden önceki en geç boş saate koy. Geç planlamak, erken saatleri gelebilecek daha sıkışık işlere açık tutar.",
    use: "Teslim tarihli ve kâr/cezalı birim işler — zamanında biteni en çoklamak.",
  },
  "huffman-coding": {
    how: "En nadir iki simgeyi tek düğüm altında birleştir, çifti tek simge say ve tekrarla. Nadir simgeler derine (uzun kod), sık olanlar yüzeye (kısa kod) düşer; ağaç yolları önek-siz kodlar verir.",
    use: "Sıkıştırmada entropi kodlama: DEFLATE/zip, JPEG, MP3 hep Huffman aşaması içerir.",
  },

  // ── Geri izleme ──
  "n-queens": {
    how: "Vezirleri satır satır yerleştir. Sütun/köşegen çakışması çıkarsa son yerleştirmeyi geri al ve sonraki sütunu dene — her seferinde mahkûm bir alt ağacın tamamı budanır.",
    use: "Kısıt sağlama probleminin klasiği: ikili çakışmalı yerleştirme problemleri.",
  },
  sudoku: {
    how: "Sıradaki boş hücreyi bul, 1–9 rakamlarını dene, kalan ızgarada özyinele ve çıkmaz kanıtlanınca rakamı sil. Kısıt kontrolleri dallanmayı küçük tutar.",
    use: "Kısıt sağlama bulmacaları; aynı iskelet planlama ve boyama örneklerini de çözer.",
  },
  "rat-in-a-maze": {
    how: "Her hücrede dört yönü sabit sırayla dene, giderken yolu işaretle, geri çekilirken sil. İşaretler ziyaret kontrolü olarak da çalışır; arama asla döngüye girmez.",
    use: "Izgaralarda yol varlığı ve basit labirent çözümü; ızgarada BFS/DFS'e geçiş taşı.",
  },
  subsets: {
    how: "Her eleman için ikili karar ver: içeride mi dışarıda mı. Özyineleme ağacının 2ⁿ yaprağı vardır — her yaprak tam olarak bir alt kümedir.",
    use: "Kaba kuvvet kontrolleri, kuvvet kümeleri, öznitelik alt kümeleri için tüm kombinasyonları sayma.",
  },
  permutations: {
    how: "Her adayı takasla ilk konuma sabitle, kalanında özyinele, sonra takası geri al. Geri alma diziyi dallar arasında yeniden kullanılabilir tutar.",
    use: "Sıralamaları sayma: kaba kuvvet TSP, anagram üretimi, test durumu karıştırma.",
  },

  // ── Ağaçlar ──
  bst: {
    how: "Değişmez kural — sol alt ağaç küçük, sağ alt ağaç büyük — her işlemi tek bir kök-yaprak yürüyüşüne çevirir. İki çocuklu düğüm silinirken sıradaki ardıl kopyalanır ve onun yerine o silinir.",
    best: "Dengeli ağaç: O(log n) yürüyüş.",
    worst: "Sıralı eklemeler onu bağlı listeye düşürür: O(n).",
    use: "Sıralı eşlemeler: aralık sorguları, öncel/ardıl, sıralı gezinme — dengeleme eklenince.",
  },
  avl: {
    how: "Her eklemeden sonra düğümlerin denge faktörünü ölçen ve ±2 eğilmeyi bir-iki döndürmeyle onaran bir İAA. Yükseklik 1.44·log n içinde kalır; yürüyüşler logaritmik kalır.",
    use: "Katı O(log n) aramanın ucuz yazmadan önemli olduğu, okuma ağırlıklı sıralı eşlemeler.",
  },
  heap: {
    how: "Diziye paketlenmiş tam ikili ağaç (i'nin çocukları 2i+1, 2i+2). Push değeri ebeveyni büyük olana dek yukarı süzer; pop son elemanı köke taşıyıp aşağı indirir.",
    use: "Öncelik kuyrukları: zamanlayıcılar, Dijkstra/Prim, top-k takibi, heapsort.",
  },
  trie: {
    how: "Karakter başına bir ağaç düğümü; kelime bir kök-düğüm yoludur. Aynı öneki paylaşan tüm kelimeler o yolu paylaşır; arama maliyeti sözlük boyutuna değil kelime uzunluğuna bağlıdır.",
    use: "Otomatik tamamlama, önek arama, yazım denetleyiciler, IP yönlendirme tabloları.",
  },
  "segment-tree": {
    how: "Her düğüm bir dizi aralığının özetini tutar; çocuklar aralığı ikiye böler. Sorgu yanıtını O(log n) ayrık kapsayıcı düğümden diker; güncelleme tek yaprak-kök yolunu tazeler.",
    use: "Nokta güncellemeleriyle iç içe aralık sorguları (toplam/min/maks): yarışma programlama, analitik pencereler.",
  },

  // ── Dizeler ──
  kmp: {
    how: "Her desen öneki için hem önek hem sonek olan en uzun öz-öneki (LPS) önceden hesapla. Uyumsuzlukta desen baştan başlamak yerine o sınıra kayar — metin işaretçisi asla geri gitmez.",
    use: "Tek desenle tekrarlı aramalar, metnin yeniden okunamadığı akış girdileri.",
  },
  "rabin-karp": {
    how: "Dizeleri değil hash'leri karşılaştır: yuvarlanan hash, pencere kayarken değerini O(1)'de günceller. Yalnızca hash çakışması gerçek karakter karşılaştırması tetikler.",
    best: "Az çakışma: beklenen O(n + m).",
    worst: "Düşmanca çakışmalar: O(n·m).",
    use: "Çoklu desen arama (tek hash kümesi, çok desen), intihal parça eşleme.",
  },
  "z-algorithm": {
    how: "Z[i] = i'den başlayıp dizenin kendi önekiyle eşleşen en uzun alt dizenin uzunluğu. Korunan [l, r) eşleşme penceresi, her Z değerinin sıfırdan değil aynadaki eski değerden başlamasını sağlar.",
    use: "Desen eşleme (P#T ara), dize periyodikliği, önek tabanlı benzerlik.",
  },
  manacher: {
    how: "Her palindromu tek uzunluklu yapmak için ayraçlar ekle, sonra her merkezden genişle — ama önce her yarıçapı, mevcut en sağ palindromun içindeki aynasından tohumla. Her karakter en fazla bir kez genişletilir.",
    use: "O(n)'de en uzun palindrom alt dize; palindrom sayma ve çarpanlama.",
  },
  "boyer-moore": {
    how: "Deseni sağdan sola karşılaştır. Uyumsuzlukta kötü-karakter kuralı deseni, sorunlu metin karakterinin desendeki son geçtiği yer hizalanacak şekilde kaydırır — çoğu zaman tek sıçrayışta çok konum atlanır.",
    best: "Zengin alfabeli metin: yaklaşık n/m karakter bakışı — alt-doğrusal.",
    worst: "Yozlaşmış tekrarlı girdiler: yalnız kötü-karakterli türev için O(n·m).",
    use: "Büyük alfabede uzun desenler: editörlerin 'bul'u, grep tarzı tarama.",
  },

  // ── Matematik ──
  "sieve-of-eratosthenes": {
    how: "2..n'i listele; sıradaki hayatta kalan sayıyı (bir asal) al ve katlarını p²'den başlayarak ele. Sonunda ayakta kalan her şey hiçbir küçük asalın katı olmamıştır.",
    use: "n'e kadar tüm asalları üretme, hızlı çarpanlama için en-küçük-asal-çarpan tabloları.",
  },
  "euclidean-gcd": {
    how: "gcd(a, b) = gcd(b, a mod b): a ve b'nin her ortak böleni kalanı da böler. Kalanlar hızla küçülür — her iki adımda en az yarıya — zincir logaritmiktir.",
    use: "Kesir sadeleştirme, a·b/gcd ile OKEK, modüler aritmetik rutinlerinin temeli.",
  },
  "extended-euclidean": {
    how: "Öklid'i, her kalanı x·a + y·b olarak ifade eden iki ek dizi taşıyarak çalıştır. Kalan gcd'ye ulaştığında katsayıları Bézout çiftidir.",
    use: "Modüler ters (RSA, hashing), ax + by = c çözümü, Çin Kalan Teoremi.",
  },
  "fast-exponentiation": {
    how: "Tabanın karesini tekrar tekrar al (b, b², b⁴, …) ve yalnızca üssün ikilik basamağı 1 olan yerlerde sonuca çarp. 2⁶⁴ boyutlu üsler yalnızca 64 tur sürer.",
    use: "Kriptografide modüler kuvvetler, doğrusal yinelemeler için hızlı matris kuvveti, her yerde büyük üsler.",
  },
};

export function getAlgoInfo(slug: string, lang: Lang): AlgoInfo | undefined {
  return lang === "tr" ? tr[slug] ?? en[slug] : en[slug];
}
