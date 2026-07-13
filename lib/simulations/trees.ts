// Pure step generators for the Tree visualizers (BST, AVL, Heap, Trie,
// Segment Tree). Each step carries a full positioned snapshot of the tree so
// the renderer stays dumb: it just draws `nodes` + `edges` and animates
// position changes. `codeLine` is the 0-based line into the C snippet in
// `lib/data.ts`.

export type NodeTone =
  | "idle"
  | "current" // node being visited right now
  | "path" // on the walked path
  | "compare" // compared against the key
  | "insert" // freshly inserted
  | "remove" // about to be removed
  | "rotate" // pivot of a rotation
  | "found" // search hit / query cover
  | "result"; // final answer node

export type EdgeTone = "idle" | "path" | "active";

export interface VizNode {
  id: string;
  label: string;
  sub?: string;
  x: number; // column (float; averaged for parents)
  y: number; // depth
  tone: NodeTone;
}

export interface VizEdge {
  from: string;
  to: string;
  tone: EdgeTone;
}

export interface ArrayView {
  values: (number | null)[];
  active?: number[];
  range?: [number, number];
  label?: string;
}

export interface TreeStep {
  codeLine: number;
  note: string;
  nodes: VizNode[];
  edges: VizEdge[];
  cols: number;
  depth: number;
  vars?: { label: string; value: string }[];
  arrayView?: ArrayView;
}

// ── Binary tree scaffolding ─────────────────────────────────────────────
interface BNode {
  id: string;
  key: number;
  sub?: string;
  left: BNode | null;
  right: BNode | null;
}

let ID = 0;
const mk = (key: number): BNode => ({
  id: `n${ID++}`,
  key,
  left: null,
  right: null,
});

/** In-order x assignment + depth for y — nice, non-overlapping binary layout. */
function layout(root: BNode | null) {
  let col = 0;
  let depth = 0;
  const pos = new Map<string, { x: number; y: number }>();
  const rec = (n: BNode | null, d: number) => {
    if (!n) return;
    rec(n.left, d + 1);
    pos.set(n.id, { x: col++, y: d });
    depth = Math.max(depth, d);
    rec(n.right, d + 1);
  };
  rec(root, 0);
  return { pos, cols: Math.max(col, 1), depth: depth + 1 };
}

function snapshot(
  root: BNode | null,
  tones: Map<string, NodeTone>,
  activeEdges: Set<string>,
  codeLine: number,
  note: string,
  vars?: { label: string; value: string }[]
): TreeStep {
  const { pos, cols, depth } = layout(root);
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];
  const rec = (n: BNode | null) => {
    if (!n) return;
    const p = pos.get(n.id)!;
    nodes.push({
      id: n.id,
      label: String(n.key),
      sub: n.sub,
      x: p.x,
      y: p.y,
      tone: tones.get(n.id) ?? "idle",
    });
    for (const c of [n.left, n.right]) {
      if (c) {
        edges.push({
          from: n.id,
          to: c.id,
          tone: activeEdges.has(c.id) ? "active" : tones.has(c.id) ? "path" : "idle",
        });
        rec(c);
      }
    }
  };
  rec(root);
  return { codeLine, note, nodes, edges, cols, depth, vars };
}

// ── BST (insert / search / delete) ──────────────────────────────────────
export function bstSteps(
  insertSeq: number[],
  searchKey: number,
  deleteKey: number
): TreeStep[] {
  ID = 0;
  const steps: TreeStep[] = [];
  let root: BNode | null = null;
  const path = new Map<string, NodeTone>();

  const emit = (
    codeLine: number,
    note: string,
    tones: Map<string, NodeTone>,
    vars?: { label: string; value: string }[]
  ) => steps.push(snapshot(root, tones, new Set(), codeLine, note, vars));

  // Insert phase.
  for (const key of insertSeq) {
    if (!root) {
      root = mk(key);
      const t = new Map<string, NodeTone>([[root.id, "insert"]]);
      emit(7, `Tree empty — ${key} becomes the root`, t);
      continue;
    }
    let cur: BNode | null = root;
    const walked = new Map<string, NodeTone>();
    while (cur) {
      const t = new Map(walked);
      t.set(cur.id, "compare");
      emit(8, `Insert ${key}: compare with ${cur.key}`, t);
      walked.set(cur.id, "path");
      if (key < cur.key) {
        if (!cur.left) {
          cur.left = mk(key);
          const t2 = new Map(walked);
          t2.set(cur.left.id, "insert");
          emit(9, `${key} < ${cur.key} — insert as left child`, t2);
          break;
        }
        cur = cur.left;
      } else if (key > cur.key) {
        if (!cur.right) {
          cur.right = mk(key);
          const t2 = new Map(walked);
          t2.set(cur.right.id, "insert");
          emit(11, `${key} > ${cur.key} — insert as right child`, t2);
          break;
        }
        cur = cur.right;
      } else {
        emit(12, `${key} already present — no change`, walked);
        break;
      }
    }
  }
  emit(12, `Built the BST from [${insertSeq.join(", ")}]`, new Map());

  // Search phase.
  {
    let cur: BNode | null = root;
    const walked = new Map<string, NodeTone>();
    let found = false;
    while (cur) {
      const t = new Map(walked);
      t.set(cur.id, "compare");
      emit(16, `Search ${searchKey}: at ${cur.key}`, t);
      if (cur.key === searchKey) {
        const t2 = new Map(walked);
        t2.set(cur.id, "found");
        emit(19, `Found ${searchKey}`, t2);
        found = true;
        break;
      }
      walked.set(cur.id, "path");
      const goLeft = searchKey < cur.key;
      cur = goLeft ? cur.left : cur.right;
      emit(17, `${searchKey} ${goLeft ? "<" : ">"} node — move ${goLeft ? "left" : "right"}`, new Map(walked));
    }
    if (!found) emit(19, `${searchKey} not in the tree`, new Map());
  }

  // Delete phase.
  const minNode = (n: BNode): BNode => {
    let cur = n;
    while (cur.left) cur = cur.left;
    return cur;
  };
  const del = (n: BNode | null, key: number, walked: Map<string, NodeTone>): BNode | null => {
    if (!n) {
      emit(23, `${key} not found — nothing to delete`, new Map(walked));
      return null;
    }
    const t = new Map(walked);
    t.set(n.id, "compare");
    emit(24, `Delete ${key}: at ${n.key}`, t);
    if (key < n.key) {
      walked.set(n.id, "path");
      n.left = del(n.left, key, walked);
    } else if (key > n.key) {
      walked.set(n.id, "path");
      n.right = del(n.right, key, walked);
    } else {
      const tr = new Map(walked);
      tr.set(n.id, "remove");
      emit(28, `Found ${key} — remove this node`, tr);
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      const succ = minNode(n.right);
      const ts = new Map(walked);
      ts.set(n.id, "remove");
      ts.set(succ.id, "current");
      emit(31, `Two children — copy successor ${succ.key} up`, ts);
      n.key = succ.key;
      n.right = del(n.right, succ.key, walked);
    }
    return n;
  };
  root = del(root, deleteKey, new Map());
  emit(35, `Deleted ${deleteKey} — BST property preserved`, new Map());
  void path;
  return steps;
}

// ── AVL (self-balancing insert with rotations) ──────────────────────────
export function avlSteps(insertSeq: number[]): TreeStep[] {
  ID = 0;
  const steps: TreeStep[] = [];
  let root: BNode | null = null;

  const h = (n: BNode | null): number =>
    n ? 1 + Math.max(h(n.left), h(n.right)) : 0;
  const bf = (n: BNode | null): number => (n ? h(n.left) - h(n.right) : 0);
  const relabel = (n: BNode | null) => {
    if (!n) return;
    n.sub = `h${h(n)} b${bf(n) > 0 ? "+" : ""}${bf(n)}`;
    relabel(n.left);
    relabel(n.right);
  };

  const emit = (
    codeLine: number,
    note: string,
    tones: Map<string, NodeTone>,
    active = new Set<string>()
  ) => {
    relabel(root);
    steps.push(snapshot(root, tones, active, codeLine, note));
  };

  const rotateRight = (y: BNode): BNode => {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    return x;
  };
  const rotateLeft = (x: BNode): BNode => {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    return y;
  };

  const insert = (n: BNode | null, key: number, walked: Map<string, NodeTone>): BNode => {
    if (!n) {
      const node = mk(key);
      const t = new Map(walked);
      t.set(node.id, "insert");
      emit(22, `Insert ${key} as a new leaf`, t);
      return node;
    }
    const t = new Map(walked);
    t.set(n.id, "compare");
    emit(key < n.key ? 23 : 24, `Insert ${key}: compare with ${n.key}`, t);
    walked.set(n.id, "path");
    if (key < n.key) n.left = insert(n.left, key, walked);
    else n.right = insert(n.right, key, walked);

    const b = bf(n);
    emit(26, `Balance factor of ${n.key} is ${b > 0 ? "+" : ""}${b}`, new Map([[n.id, "current"]]));

    if (b > 1 && n.left && key < n.left.key) {
      emit(27, `Left-Left case at ${n.key} — rotate right`, new Map([[n.id, "rotate"]]));
      const r = rotateRight(n);
      emit(28, `Rotated right around ${n.key}`, new Map([[r.id, "current"]]));
      return r;
    }
    if (b < -1 && n.right && key > n.right.key) {
      emit(29, `Right-Right case at ${n.key} — rotate left`, new Map([[n.id, "rotate"]]));
      const r = rotateLeft(n);
      emit(30, `Rotated left around ${n.key}`, new Map([[r.id, "current"]]));
      return r;
    }
    if (b > 1 && n.left && key > n.left.key) {
      emit(31, `Left-Right case at ${n.key} — rotate left then right`, new Map([[n.id, "rotate"], [n.left.id, "rotate"]]));
      n.left = rotateLeft(n.left);
      const r = rotateRight(n);
      emit(33, `Double rotation done at ${n.key}`, new Map([[r.id, "current"]]));
      return r;
    }
    if (b < -1 && n.right && key < n.right.key) {
      emit(35, `Right-Left case at ${n.key} — rotate right then left`, new Map([[n.id, "rotate"], [n.right.id, "rotate"]]));
      n.right = rotateRight(n.right);
      const r = rotateLeft(n);
      emit(37, `Double rotation done at ${n.key}`, new Map([[r.id, "current"]]));
      return r;
    }
    return n;
  };

  for (const key of insertSeq) {
    root = insert(root, key, new Map());
  }
  emit(39, `AVL tree stays height-balanced after every insert`, new Map());
  return steps;
}

// ── Binary heap (array-backed, rendered as a tree) ──────────────────────
export function heapSteps(pushSeq: number[], popCount: number): TreeStep[] {
  ID = 0;
  const steps: TreeStep[] = [];
  const heap: number[] = [];
  const ids: string[] = [];

  const buildTree = (
    tones: Map<number, NodeTone>,
    active: Set<number>
  ): { nodes: VizNode[]; edges: VizEdge[]; cols: number; depth: number } => {
    // Position array indices as a binary tree via in-order over the heap shape.
    const pos = new Map<number, { x: number; y: number }>();
    let col = 0;
    let depth = 0;
    const rec = (i: number, d: number) => {
      if (i >= heap.length) return;
      rec(2 * i + 1, d + 1);
      pos.set(i, { x: col++, y: d });
      depth = Math.max(depth, d);
      rec(2 * i + 2, d + 1);
    };
    rec(0, 0);
    const nodes: VizNode[] = [];
    const edges: VizEdge[] = [];
    for (let i = 0; i < heap.length; i++) {
      const p = pos.get(i)!;
      nodes.push({
        id: ids[i],
        label: String(heap[i]),
        x: p.x,
        y: p.y,
        tone: tones.get(i) ?? "idle",
      });
      if (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        edges.push({
          from: ids[parent],
          to: ids[i],
          tone: active.has(i) ? "active" : "idle",
        });
      }
    }
    return { nodes, edges, cols: Math.max(col, 1), depth: depth + 1 };
  };

  const emit = (
    codeLine: number,
    note: string,
    tones: Map<number, NodeTone>,
    active = new Set<number>()
  ) => {
    const { nodes, edges, cols, depth } = buildTree(tones, active);
    steps.push({
      codeLine,
      note,
      nodes,
      edges,
      cols,
      depth,
      arrayView: {
        label: "heap array",
        values: [...heap],
        active: [...tones.keys()],
      },
    });
  };

  const swap = (i: number, j: number) => {
    [heap[i], heap[j]] = [heap[j], heap[i]];
    [ids[i], ids[j]] = [ids[j], ids[i]];
  };

  // Push (sift-up).
  for (const val of pushSeq) {
    heap.push(val);
    ids.push(`n${ID++}`);
    let i = heap.length - 1;
    emit(8, `Push ${val} at the end (index ${i})`, new Map([[i, "insert"]]));
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      emit(
        1,
        `Sift-up: compare ${heap[i]} with parent ${heap[parent]}`,
        new Map([
          [i, "current"],
          [parent, "compare"],
        ]),
        new Set([i])
      );
      if (heap[i] > heap[parent]) {
        swap(i, parent);
        emit(
          2,
          `${heap[parent]} > ${heap[i]} — swap up`,
          new Map([
            [i, "compare"],
            [parent, "current"],
          ]),
          new Set([i])
        );
        i = parent;
      } else break;
    }
  }
  emit(7, `Max-heap built — root holds the maximum`, new Map([[0, "found"]]));

  // Pop (sift-down).
  for (let c = 0; c < popCount && heap.length > 0; c++) {
    const top = heap[0];
    emit(24, `Pop: remove root ${top}`, new Map([[0, "remove"]]));
    const last = heap.length - 1;
    swap(0, last);
    heap.pop();
    ids.pop();
    if (heap.length > 0)
      emit(25, `Move last element ${heap[0]} to the root`, new Map([[0, "current"]]));
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let big = i;
      if (l < heap.length && heap[l] > heap[big]) big = l;
      if (r < heap.length && heap[r] > heap[big]) big = r;
      const tones = new Map<number, NodeTone>([[i, "current"]]);
      if (l < heap.length) tones.set(l, "compare");
      if (r < heap.length) tones.set(r, "compare");
      emit(14, `Sift-down: compare with children`, tones);
      if (big === i) {
        emit(17, `Heap property restored`, new Map([[i, "found"]]));
        break;
      }
      swap(i, big);
      emit(18, `Swap ${heap[i]} down`, new Map([[big, "current"]]), new Set([big]));
      i = big;
    }
  }
  return steps;
}

// ── Trie (insert words + search prefix) ─────────────────────────────────
interface TrieNode {
  id: string;
  ch: string; // "" for root
  end: boolean;
  children: Map<string, TrieNode>;
}

export function trieSteps(words: string[], query: string): TreeStep[] {
  ID = 0;
  const root: TrieNode = { id: `n${ID++}`, ch: "", end: false, children: new Map() };
  const steps: TreeStep[] = [];

  const build = (
    tones: Map<string, NodeTone>,
    active: Set<string>
  ): { nodes: VizNode[]; edges: VizEdge[]; cols: number; depth: number } => {
    const pos = new Map<string, { x: number; y: number }>();
    let col = 0;
    let depth = 0;
    const rec = (n: TrieNode, d: number): number => {
      const kids = [...n.children.values()].sort((a, b) => a.ch.localeCompare(b.ch));
      depth = Math.max(depth, d);
      if (kids.length === 0) {
        pos.set(n.id, { x: col++, y: d });
        return pos.get(n.id)!.x;
      }
      const xs = kids.map((k) => rec(k, d + 1));
      const x = xs.reduce((s, v) => s + v, 0) / xs.length;
      pos.set(n.id, { x, y: d });
      return x;
    };
    rec(root, 0);
    const nodes: VizNode[] = [];
    const edges: VizEdge[] = [];
    const walk = (n: TrieNode) => {
      const p = pos.get(n.id)!;
      nodes.push({
        id: n.id,
        label: n.ch === "" ? "•" : n.ch,
        sub: n.end ? "★" : undefined,
        x: p.x,
        y: p.y,
        tone: tones.get(n.id) ?? "idle",
      });
      for (const k of n.children.values()) {
        edges.push({
          from: n.id,
          to: k.id,
          tone: active.has(k.id) ? "active" : tones.has(k.id) ? "path" : "idle",
        });
        walk(k);
      }
    };
    walk(root);
    return { nodes, edges, cols: Math.max(col, 1), depth: depth + 1 };
  };

  const emit = (
    codeLine: number,
    note: string,
    tones: Map<string, NodeTone>,
    active = new Set<string>()
  ) => {
    const { nodes, edges, cols, depth } = build(tones, active);
    steps.push({ codeLine, note, nodes, edges, cols, depth });
  };

  // Insert each word.
  for (const w of words) {
    let node = root;
    const walked = new Map<string, NodeTone>([[root.id, "path"]]);
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      const existing = node.children.get(c);
      if (!existing) {
        const child: TrieNode = { id: `n${ID++}`, ch: c, end: false, children: new Map() };
        node.children.set(c, child);
        node = child;
        const t = new Map(walked);
        t.set(child.id, "insert");
        emit(11, `Insert "${w}": create node for '${c}'`, t, new Set([child.id]));
      } else {
        node = existing;
        const t = new Map(walked);
        t.set(existing.id, "current");
        emit(12, `Insert "${w}": '${c}' already exists — descend`, t, new Set([existing.id]));
      }
      walked.set(node.id, "path");
    }
    node.end = true;
    emit(14, `Mark end of word "${w}"`, new Map([[node.id, "found"]]));
  }

  // Search the query prefix/word.
  {
    let node: TrieNode | null = root;
    const walked = new Map<string, NodeTone>([[root.id, "path"]]);
    let ok = true;
    for (let i = 0; i < query.length && node; i++) {
      const c = query[i];
      const next = node.children.get(c);
      if (!next) {
        emit(21, `Search "${query}": '${c}' missing — not found`, new Map([[node.id, "remove"]]));
        ok = false;
        node = null;
        break;
      }
      node = next;
      const t = new Map(walked);
      t.set(next.id, "current");
      emit(22, `Search "${query}": match '${c}' — descend`, t, new Set([next.id]));
      walked.set(next.id, "path");
    }
    if (ok && node)
      emit(
        24,
        node.end ? `"${query}" is a complete word` : `"${query}" is a valid prefix`,
        new Map([[node.id, "result"]])
      );
  }
  return steps;
}

// ── Segment Tree (build + range sum query) ──────────────────────────────
interface SegNode {
  id: string;
  lo: number;
  hi: number;
  sum: number;
  left: SegNode | null;
  right: SegNode | null;
}

export function segmentTreeSteps(
  arr: number[],
  ql: number,
  qr: number
): TreeStep[] {
  ID = 0;
  const steps: TreeStep[] = [];
  let root: SegNode | null = null;

  const layoutSeg = (r: SegNode | null) => {
    const pos = new Map<string, { x: number; y: number }>();
    let col = 0;
    let depth = 0;
    const rec = (n: SegNode | null, d: number) => {
      if (!n) return;
      rec(n.left, d + 1);
      pos.set(n.id, { x: col++, y: d });
      depth = Math.max(depth, d);
      rec(n.right, d + 1);
    };
    rec(r, 0);
    return { pos, cols: Math.max(col, 1), depth: depth + 1 };
  };

  const emit = (
    codeLine: number,
    note: string,
    tones: Map<string, NodeTone>,
    active = new Set<string>(),
    view?: ArrayView
  ) => {
    const { pos, cols, depth } = layoutSeg(root);
    const nodes: VizNode[] = [];
    const edges: VizEdge[] = [];
    const rec = (n: SegNode | null) => {
      if (!n) return;
      const p = pos.get(n.id)!;
      nodes.push({
        id: n.id,
        label: String(n.sum),
        sub: n.lo === n.hi ? `[${n.lo}]` : `[${n.lo},${n.hi}]`,
        x: p.x,
        y: p.y,
        tone: tones.get(n.id) ?? "idle",
      });
      for (const c of [n.left, n.right]) {
        if (c) {
          edges.push({
            from: n.id,
            to: c.id,
            tone: active.has(c.id) ? "active" : tones.has(c.id) ? "path" : "idle",
          });
          rec(c);
        }
      }
    };
    rec(root);
    steps.push({ codeLine, note, nodes, edges, cols, depth, arrayView: view });
  };

  const baseView = (active?: number[], range?: [number, number]): ArrayView => ({
    label: "input array",
    values: [...arr],
    active,
    range,
  });

  // Build the full tree silently, then animate the post-order fill so every
  // node stays visible in each snapshot (highlight, not reveal).
  const construct = (lo: number, hi: number): SegNode => {
    const node: SegNode = { id: `n${ID++}`, lo, hi, sum: 0, left: null, right: null };
    if (lo === hi) {
      node.sum = arr[lo];
      return node;
    }
    const mid = (lo + hi) >> 1;
    node.left = construct(lo, mid);
    node.right = construct(mid + 1, hi);
    node.sum = node.left.sum + node.right.sum;
    return node;
  };
  const built = construct(0, arr.length - 1);
  root = built;

  const animateBuild = (n: SegNode) => {
    if (n.lo === n.hi) {
      emit(4, `Leaf [${n.lo}] = ${arr[n.lo]}`, new Map([[n.id, "insert"]]), new Set(), baseView([n.lo]));
      return;
    }
    animateBuild(n.left!);
    animateBuild(n.right!);
    emit(
      10,
      `Combine [${n.lo},${n.hi}] = ${n.left!.sum} + ${n.right!.sum} = ${n.sum}`,
      new Map([
        [n.id, "current"],
        [n.left!.id, "compare"],
        [n.right!.id, "compare"],
      ]),
      new Set([n.left!.id, n.right!.id]),
      baseView(undefined, [n.lo, n.hi])
    );
  };
  animateBuild(built);
  emit(2, `Segment tree built — root sum = ${built.sum}`, new Map([[built.id, "found"]]), new Set(), baseView());

  // Range query.
  const query = (n: SegNode, l: number, r: number, walked: Map<string, NodeTone>): number => {
    if (r < n.lo || n.hi < l) {
      emit(
        14,
        `[${n.lo},${n.hi}] outside [${l},${r}] — contributes 0`,
        new Map([...walked, [n.id, "remove"]]),
        new Set(),
        baseView(undefined, [l, r])
      );
      return 0;
    }
    if (l <= n.lo && n.hi <= r) {
      emit(
        15,
        `[${n.lo},${n.hi}] fully inside — take ${n.sum}`,
        new Map([...walked, [n.id, "found"]]),
        new Set(),
        baseView(undefined, [l, r])
      );
      return n.sum;
    }
    emit(
      16,
      `[${n.lo},${n.hi}] partially overlaps — split`,
      new Map([...walked, [n.id, "current"]]),
      new Set([n.left!.id, n.right!.id]),
      baseView(undefined, [l, r])
    );
    const w2 = new Map(walked);
    w2.set(n.id, "path");
    return query(n.left!, l, r, w2) + query(n.right!, l, r, w2);
  };
  const total = query(built, ql, qr, new Map());
  emit(
    13,
    `Sum over [${ql}, ${qr}] = ${total}`,
    new Map([[built.id, "result"]]),
    new Set(),
    baseView(
      Array.from({ length: qr - ql + 1 }, (_, i) => ql + i),
      [ql, qr]
    )
  );
  return steps;
}
