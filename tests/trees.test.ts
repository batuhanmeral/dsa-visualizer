import { test } from "node:test";
import assert from "node:assert/strict";
import {
  avlSteps,
  bstSteps,
  heapSteps,
  segmentTreeSteps,
  trieSteps,
  unionFindSteps,
  type TreeStep,
} from "../lib/simulations/trees";
import { rng } from "./helpers";

/** In-order traversal read off the layout: x is assigned in-order. */
const inOrder = (step: TreeStep) =>
  [...step.nodes].sort((a, b) => a.x - b.x).map((n) => Number(n.label));

const childCounts = (step: TreeStep) => {
  const counts = new Map<string, number>();
  for (const e of step.edges) counts.set(e.from, (counts.get(e.from) ?? 0) + 1);
  return counts;
};

const rootCount = (step: TreeStep) => {
  const hasParent = new Set(step.edges.map((e) => e.to));
  return step.nodes.filter((n) => !hasParent.has(n.id)).length;
};

function distinct(rand: () => number, count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) set.add(1 + Math.floor(rand() * 99));
  return [...set];
}

test("a BST stays ordered and holds exactly the surviving keys", () => {
  const rand = rng(3);
  for (let k = 0; k < 120; k++) {
    const seq = distinct(rand, 1 + (k % 9));
    const searchKey = rand() < 0.5 ? seq[Math.floor(rand() * seq.length)] : 500;
    const deleteKey = rand() < 0.7 ? seq[Math.floor(rand() * seq.length)] : 500;
    const steps = bstSteps(seq, searchKey, deleteKey);
    const last = steps.at(-1)!;
    const want = seq.filter((v) => v !== deleteKey).sort((a, b) => a - b);
    assert.deepEqual(
      inOrder(last),
      want,
      `after deleting ${deleteKey} from [${seq}]`
    );
    if (last.nodes.length) assert.equal(rootCount(last), 1, "expected one root");
    for (const [id, c] of childCounts(last))
      assert.ok(c <= 2, `node ${id} has ${c} children`);
  }
});

test("a BST search reports presence correctly", () => {
  const rand = rng(5);
  for (let k = 0; k < 80; k++) {
    const seq = distinct(rand, 1 + (k % 8));
    for (const key of [seq[0], 500]) {
      const keys = bstSteps(seq, key, 500).map((s) => s.note.k);
      const present = seq.includes(key);
      assert.equal(
        keys.includes("n.bst.found"),
        present,
        `search ${key} in [${seq}]`
      );
      assert.equal(
        keys.includes("n.bst.notFound"),
        !present,
        `search ${key} in [${seq}]`
      );
    }
  }
});

test("an AVL tree stays balanced, including on sorted input", () => {
  const rand = rng(17);
  const sequences = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [9, 8, 7, 6, 5, 4, 3, 2, 1],
    [1, 2, 3],
    [3, 2, 1],
    [1, 3, 2],
    [3, 1, 2],
    ...Array.from({ length: 100 }, (_, k) => distinct(rand, 1 + (k % 9))),
  ];
  for (const seq of sequences) {
    const last = avlSteps(seq).at(-1)!;
    assert.deepEqual(
      inOrder(last),
      [...seq].sort((a, b) => a - b),
      `in-order of [${seq}]`
    );
    // Heights and balance factors are shown on every node; check both.
    const heights = new Map(
      last.nodes.map((n) => [n.id, Number(/h(\d+)/.exec(n.sub ?? "")![1])])
    );
    const kids = new Map<string, string[]>();
    for (const e of last.edges)
      kids.set(e.from, [...(kids.get(e.from) ?? []), e.to]);
    for (const n of last.nodes) {
      const bf = Number(/b([+-]?\d+)/.exec(n.sub ?? "")![1]);
      assert.ok(
        Math.abs(bf) <= 1,
        `node ${n.label} has balance factor ${bf} after inserting [${seq}]`
      );
      const children = kids.get(n.id) ?? [];
      assert.equal(
        heights.get(n.id),
        1 + Math.max(0, ...children.map((c) => heights.get(c)!)),
        `height label on node ${n.label}`
      );
    }
    const depth = Math.max(...last.nodes.map((n) => n.y)) + 1;
    assert.ok(
      depth <= Math.ceil(1.45 * Math.log2(seq.length + 2)),
      `depth ${depth} exceeds the AVL bound for n=${seq.length}`
    );
  }
});

test("a binary heap keeps the heap property and pops the largest values", () => {
  const rand = rng(23);
  for (let k = 0; k < 120; k++) {
    const pushes = Array.from({ length: 1 + (k % 10) }, () =>
      Math.floor(rand() * 100)
    );
    const pops = k % 4;
    const steps = heapSteps(pushes, pops);
    const heap = steps.at(-1)!.arrayView!.values as number[];
    for (let i = 1; i < heap.length; i++)
      assert.ok(
        heap[(i - 1) >> 1] >= heap[i],
        `heap property broken at ${i} in [${heap}]`
      );
    const popped = steps
      .filter((s) => s.note.k === "n.heap.pop")
      .map((s) => Number(s.note.v!.value));
    assert.deepEqual(
      popped,
      [...pushes].sort((a, b) => b - a).slice(0, pops),
      `pops from [${pushes}]`
    );
    assert.equal(heap.length, pushes.length - Math.min(pops, pushes.length));
  }
});

test("popping more than a heap holds is handled without crashing", () => {
  assert.doesNotThrow(() => heapSteps([5], 5));
  assert.doesNotThrow(() => heapSteps([], 3));
});

test("a trie distinguishes a word, a prefix and a miss", () => {
  const words = ["CAT", "CAR", "CARD", "DOG", "DO"];
  const keyFor = (query: string) =>
    trieSteps(words, query).map((s) => s.note.k);
  assert.ok(keyFor("CARD").includes("n.trie.word"), "CARD is a word");
  assert.ok(keyFor("CA").includes("n.trie.prefix"), "CA is a prefix only");
  assert.ok(!keyFor("CA").includes("n.trie.word"), "CA is not a word");
  assert.ok(keyFor("ZZ").includes("n.trie.missing"), "ZZ is absent");
});

test("a segment tree answers every range query", () => {
  const rand = rng(29);
  for (let k = 0; k < 150; k++) {
    const a = Array.from({ length: 1 + (k % 10) }, () =>
      Math.floor(rand() * 50)
    );
    const lo = Math.floor(rand() * a.length);
    const hi = lo + Math.floor(rand() * (a.length - lo));
    const steps = segmentTreeSteps(a, lo, hi);
    const last = steps.at(-1)!;
    assert.equal(last.note.k, "n.seg.total");
    assert.equal(
      last.note.v!.total,
      a.slice(lo, hi + 1).reduce((s, v) => s + v, 0),
      `sum over [${lo},${hi}] of [${a}]`
    );
    const built = steps.find((s) => s.note.k === "n.seg.built")!;
    assert.equal(built.note.v!.sum, a.reduce((s, v) => s + v, 0), "root sum");
  }
});

test("an empty segment tree returns a note instead of recursing forever", () => {
  // construct(0, -1) used to recurse on itself: mid = (0 + -1) >> 1 = -1.
  const steps = segmentTreeSteps([], 0, 0);
  assert.equal(steps.length, 1);
  assert.equal(steps[0].note.k, "n.seg.empty");
});

test("union-find tracks connectivity and flattens the forest", () => {
  const rand = rng(31);
  for (let k = 0; k < 120; k++) {
    const n = 2 + (k % 7);
    const unions = Array.from(
      { length: 1 + (k % 6) },
      () =>
        [Math.floor(rand() * n), Math.floor(rand() * n)] as [number, number]
    );
    const findKey = Math.floor(rand() * n);
    const steps = unionFindSteps(unions, findKey, n);

    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => {
      while (parent[x] !== x) x = parent[x];
      return x;
    };
    for (const [a, b] of unions) {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[ra] = rb;
    }
    const components = new Set(
      Array.from({ length: n }, (_, i) => find(i))
    ).size;

    const last = steps.at(-1)!;
    assert.equal(last.nodes.length, n, "every element must stay visible");
    assert.equal(
      rootCount(last),
      components,
      `${rootCount(last)} roots for ${components} components (n=${n})`
    );
    if (last.note.k === "n.uf.done")
      assert.equal(
        find(Number(last.note.v!.root)),
        find(findKey),
        "find returned a representative of another set"
      );
  }
});
