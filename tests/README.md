# Engine tests

`npm test` — no test framework, no build step. Node runs the app's TypeScript
sources directly; `register.mjs` installs a resolution hook so the bundler-style
imports (`./note`, `../step-notes`, `@/lib/...`) resolve on disk.

Every algorithm is checked against an **independent reference implementation**
rather than against a recorded snapshot, so a test failure means the algorithm
is wrong, not that its output changed:

| File | Checks |
| --- | --- |
| `sorting.test.ts` | result is sorted; in-place sorts keep a permutation at every step; a locked index really holds its final value |
| `searching.test.ts` | hit/miss against `Array.includes`, every value and several misses per input |
| `graphs.test.ts` | Dijkstra/Bellman-Ford vs. a reference relaxation; Prim/Kruskal vs. a reference MST; BFS layering; A\* vs. the true shortest cost; negative-cycle and cycle detection |
| `trees.test.ts` | BST ordering after delete; AVL balance factors and height labels; heap property and pop order; segment-tree sums; union-find component count |
| `dp.test.ts` | each table against a reference DP |
| `greedy.test.ts` | activity selection vs. DP, job sequencing vs. brute force, Huffman prefix-free and optimally short |
| `strings.test.ts` | match positions vs. a naive scan; Z-array and Manacher vs. brute force |
| `backtracking.test.ts` | solutions are legal, and unsolvable inputs are reported as such |
| `coverage.test.ts` | every `codeLine` exists in the algorithm's C snippet; every note key exists, is translated, and is given exactly the values its template needs |

`fixtures.ts` holds one representative run per algorithm. `coverage.test.ts`
fails if an algorithm with an engine has no fixture, so a new engine cannot slip
past the cross-cutting checks.
