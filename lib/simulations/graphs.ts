/**
 * Graph engines — pure step generators for traversal, shortest paths and MST.
 * Each returns an ordered `GraphStep[]` snapshot list the renderer replays.
 * `codeLine` values are 0-based and MUST match the C code in lib/data.ts.
 */

export interface GraphNode {
  id: number;
  /** Position in the SVG viewBox (0..VIEW_W, 0..VIEW_H). */
  x: number;
  y: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

export interface GraphStep {
  codeLine: number;
  note: string;
  /** Nodes fully processed (dequeued / finalised / added to MST). */
  visited: number[];
  /** Nodes discovered but still pending — queue / stack / open set. */
  frontier: number[];
  /** Node currently being processed. */
  current: number | null;
  /** Edge under inspection this step, as `[from, to]`. */
  edge?: [number, number];
  /** Distance / key / g-score estimates (id → value, INF omitted). */
  dist?: Record<number, number>;
  /** Committed tree edges (shortest-path tree / MST). */
  treeEdges?: [number, number][];
  /** Edges considered and discarded (Kruskal cycle edges). */
  rejectedEdges?: [number, number][];
  /** Extra per-node label (in-degree, f-score, union-find root…). */
  badges?: Record<number, string>;
  /** Traversal / output order so far. */
  order: number[];
}

export const VIEW_W = 420;
export const VIEW_H = 300;
export const INF = 1_000_000;

const NODE_POS: GraphNode[] = [
  { id: 0, x: 60, y: 150 },
  { id: 1, x: 165, y: 60 },
  { id: 2, x: 165, y: 240 },
  { id: 3, x: 290, y: 60 },
  { id: 4, x: 290, y: 240 },
  { id: 5, x: 380, y: 150 },
];

/** Undirected, weighted 6-node preset — traversals, Dijkstra, Prim, Kruskal. */
export const SAMPLE_GRAPH: Graph = {
  nodes: NODE_POS,
  edges: [
    { from: 0, to: 1, weight: 7 },
    { from: 0, to: 2, weight: 9 },
    { from: 1, to: 2, weight: 3 },
    { from: 1, to: 3, weight: 5 },
    { from: 2, to: 4, weight: 6 },
    { from: 3, to: 4, weight: 4 },
    { from: 3, to: 5, weight: 2 },
    { from: 4, to: 5, weight: 8 },
  ],
};

/** Directed acyclic, weighted (with negative edges) — Bellman-Ford + topo sort. */
export const DIRECTED_DAG: Graph = {
  nodes: NODE_POS,
  directed: true,
  edges: [
    { from: 0, to: 1, weight: 6 },
    { from: 0, to: 2, weight: 7 },
    { from: 1, to: 3, weight: 5 },
    { from: 1, to: 4, weight: -4 },
    { from: 2, to: 3, weight: -3 },
    { from: 2, to: 5, weight: 9 },
    { from: 3, to: 5, weight: 2 },
    { from: 4, to: 5, weight: 3 },
  ],
};

const euclid = (a: GraphNode, b: GraphNode) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Same shape as SAMPLE_GRAPH but weights are the (ceil) straight-line distance
 * between nodes — so a floor-of-straight-line heuristic stays admissible for A*.
 */
export const GEOMETRIC_GRAPH: Graph = {
  nodes: NODE_POS,
  edges: SAMPLE_GRAPH.edges.map((e) => ({
    from: e.from,
    to: e.to,
    weight: Math.ceil(euclid(NODE_POS[e.from], NODE_POS[e.to]) / 10),
  })),
};

/** Adjacency matrix (0 = no edge, else weight). Respects `directed`. */
function toMatrix(g: Graph): number[][] {
  const n = g.nodes.length;
  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const { from, to, weight } of g.edges) {
    m[from][to] = weight;
    if (!g.directed) m[to][from] = weight;
  }
  return m;
}

// ── Breadth-First Search ────────────────────────────────────────────────
export function bfsSteps(g: Graph, start: number): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const visited = new Array<boolean>(V).fill(false);
  const queue: number[] = [];
  const order: number[] = [];
  const steps: GraphStep[] = [];
  let current: number | null = null;
  let edge: [number, number] | undefined;

  const snap = (codeLine: number, note: string) =>
    steps.push({
      codeLine,
      note,
      visited: order.slice(),
      frontier: queue.slice(),
      current,
      edge,
      order: order.slice(),
    });

  visited[start] = true;
  queue.push(start);
  snap(6, `Mark source ${start} as visited.`);
  snap(7, `Enqueue ${start}. Queue: [${queue.join(", ")}].`);

  while (queue.length) {
    snap(9, `Queue not empty — keep exploring.`);
    current = queue.shift()!;
    order.push(current);
    edge = undefined;
    snap(10, `Dequeue ${current} — it is next in FIFO order.`);
    snap(11, `Visit ${current}. Output: ${order.join(" → ")}.`);

    for (let v = 0; v < V; v++) {
      if (!m[current][v]) continue;
      edge = [current, v];
      snap(
        13,
        `Look at neighbour ${v} of ${current}` +
          (visited[v] ? " — already visited, skip." : " — undiscovered.")
      );
      if (!visited[v]) {
        visited[v] = true;
        snap(14, `Mark ${v} as visited.`);
        queue.push(v);
        snap(15, `Enqueue ${v}. Queue: [${queue.join(", ")}].`);
      }
    }
    edge = undefined;
  }

  current = null;
  snap(9, `Queue empty — BFS complete. Order: ${order.join(" → ")}.`);
  return steps;
}

// ── Depth-First Search (recursive) ──────────────────────────────────────
export function dfsSteps(g: Graph, start: number): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const visited = new Array<boolean>(V).fill(false);
  const stack: number[] = [];
  const order: number[] = [];
  const steps: GraphStep[] = [];
  let edge: [number, number] | undefined;

  const snap = (codeLine: number, note: string, current: number | null) =>
    steps.push({
      codeLine,
      note,
      visited: order.slice(),
      frontier: stack.slice(0, -1),
      current,
      edge,
      order: order.slice(),
    });

  const visit = (u: number) => {
    stack.push(u);
    visited[u] = true;
    order.push(u);
    edge = undefined;
    snap(3, `Enter dfs(${u}) — mark ${u} visited.`, u);
    snap(4, `Visit ${u}. Output: ${order.join(" → ")}.`, u);

    for (let v = 0; v < V; v++) {
      if (!m[u][v]) continue;
      edge = [u, v];
      snap(
        6,
        `Neighbour ${v} of ${u}` +
          (visited[v] ? " — already visited, skip." : " — dive in."),
        u
      );
      if (!visited[v]) {
        snap(7, `Recurse: dfs(${v}).`, u);
        visit(v);
        edge = [u, v];
        snap(6, `Back in dfs(${u}); continue its neighbours.`, u);
      }
    }
    stack.pop();
    edge = undefined;
    const parent = stack.length ? stack[stack.length - 1] : null;
    snap(9, `dfs(${u}) returns — backtrack.`, parent);
  };

  visit(start);
  steps[steps.length - 1].note = `DFS complete. Order: ${order.join(" → ")}.`;
  return steps;
}

// ── Dijkstra's shortest paths ───────────────────────────────────────────
export function dijkstraSteps(g: Graph, src: number): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const visited = new Array<boolean>(V).fill(false);
  const dist = new Array<number>(V).fill(INF);
  const order: number[] = [];
  const steps: GraphStep[] = [];
  let current: number | null = null;
  let edge: [number, number] | undefined;

  const distMap = (): Record<number, number> => {
    const out: Record<number, number> = {};
    for (let i = 0; i < V; i++) if (dist[i] < INF) out[i] = dist[i];
    return out;
  };
  const snap = (codeLine: number, note: string) =>
    steps.push({
      codeLine,
      note,
      visited: order.slice(),
      frontier: [],
      current,
      edge,
      dist: distMap(),
      order: order.slice(),
    });

  snap(5, `Initialise every distance to ∞.`);
  dist[src] = 0;
  snap(6, `Distance to source ${src} is 0.`);

  for (let count = 0; count < V - 1; count++) {
    let u = -1;
    for (let v = 0; v < V; v++)
      if (!visited[v] && (u === -1 || dist[v] < dist[u])) u = v;
    if (u === -1 || dist[u] === INF) break;

    current = u;
    edge = undefined;
    snap(12, `Nearest unvisited node is ${u} (distance ${dist[u]}).`);
    visited[u] = true;
    order.push(u);
    snap(13, `Lock in ${u} — its shortest distance is final.`);

    for (let v = 0; v < V; v++) {
      if (!m[u][v] || visited[v]) continue;
      edge = [u, v];
      const relaxed = dist[u] + m[u][v];
      snap(
        16,
        `Edge ${u}→${v} (weight ${m[u][v]}): ${dist[u]} + ${m[u][v]} = ${relaxed} vs ${
          dist[v] === INF ? "∞" : dist[v]
        }.`
      );
      if (relaxed < dist[v]) {
        dist[v] = relaxed;
        snap(18, `Shorter — update dist[${v}] = ${relaxed}.`);
      }
    }
    edge = undefined;
  }

  current = null;
  edge = undefined;
  const summary = g.nodes
    .map((n) => `${n.id}:${dist[n.id] === INF ? "∞" : dist[n.id]}`)
    .join("  ");
  snap(20, `Done. Distances from ${src} → ${summary}.`);
  return steps;
}

// ── Bellman-Ford (handles negative edges) ───────────────────────────────
export function bellmanFordSteps(g: Graph, src: number): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const dist = new Array<number>(V).fill(INF);
  const pred = new Array<number>(V).fill(-1);
  const steps: GraphStep[] = [];
  let current: number | null = null;
  let edge: [number, number] | undefined;

  const distMap = () => {
    const out: Record<number, number> = {};
    for (let i = 0; i < V; i++) if (dist[i] < INF) out[i] = dist[i];
    return out;
  };
  const treeEdges = (): [number, number][] =>
    pred.map((p, v) => (p >= 0 ? [p, v] : null)).filter(Boolean) as [
      number,
      number,
    ][];
  const snap = (codeLine: number, note: string) =>
    steps.push({
      codeLine,
      note,
      visited: dist.map((d, i) => (d < INF ? i : -1)).filter((i) => i >= 0),
      frontier: [],
      current,
      edge,
      dist: distMap(),
      treeEdges: treeEdges(),
      order: [],
    });

  snap(4, `Initialise every distance to ∞.`);
  dist[src] = 0;
  snap(5, `Distance to source ${src} is 0.`);

  for (let pass = 1; pass < V; pass++) {
    let changed = false;
    for (let u = 0; u < V; u++) {
      if (dist[u] === INF) continue;
      current = u;
      for (let v = 0; v < V; v++) {
        if (!m[u][v]) continue;
        edge = [u, v];
        const relaxed = dist[u] + m[u][v];
        snap(
          12,
          `Pass ${pass}: relax ${u}→${v} (w ${m[u][v]}): ${dist[u]} + ${m[u][v]} = ${relaxed} vs ${
            dist[v] === INF ? "∞" : dist[v]
          }.`
        );
        if (relaxed < dist[v]) {
          dist[v] = relaxed;
          pred[v] = u;
          changed = true;
          snap(13, `Shorter — update dist[${v}] = ${relaxed}.`);
        }
      }
    }
    current = null;
    edge = undefined;
    if (!changed) {
      snap(7, `Pass ${pass} changed nothing — distances have converged.`);
      break;
    }
  }

  current = null;
  edge = undefined;
  const summary = g.nodes
    .map((n) => `${n.id}:${dist[n.id] === INF ? "∞" : dist[n.id]}`)
    .join("  ");
  snap(17, `Done. Distances from ${src} → ${summary}.`);
  return steps;
}

// ── Topological Sort (Kahn's algorithm) ─────────────────────────────────
export function topoSortSteps(g: Graph): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const indeg = new Array<number>(V).fill(0);
  const queue: number[] = [];
  const order: number[] = [];
  const steps: GraphStep[] = [];
  let current: number | null = null;
  let edge: [number, number] | undefined;

  const badges = () => {
    const b: Record<number, string> = {};
    for (let i = 0; i < V; i++) b[i] = String(indeg[i]);
    return b;
  };
  const snap = (codeLine: number, note: string) =>
    steps.push({
      codeLine,
      note,
      visited: order.slice(),
      frontier: queue.slice(),
      current,
      edge,
      badges: badges(),
      order: order.slice(),
    });

  for (let u = 0; u < V; u++)
    for (let v = 0; v < V; v++) if (m[u][v]) indeg[v]++;
  snap(6, `Count in-degrees (badge under each node).`);

  for (let v = 0; v < V; v++) if (indeg[v] === 0) queue.push(v);
  snap(10, `Seed the queue with in-degree-0 nodes: [${queue.join(", ")}].`);

  while (queue.length) {
    current = queue.shift()!;
    order.push(current);
    edge = undefined;
    snap(13, `Dequeue ${current}.`);
    snap(14, `Emit ${current}. Order: ${order.join(" → ")}.`);
    for (let v = 0; v < V; v++) {
      if (!m[current][v]) continue;
      edge = [current, v];
      indeg[v]--;
      snap(
        16,
        `Remove edge ${current}→${v}; in-degree of ${v} is now ${indeg[v]}` +
          (indeg[v] === 0 ? " — ready." : ".")
      );
      if (indeg[v] === 0) queue.push(v);
    }
    edge = undefined;
  }

  current = null;
  snap(19, `Done. Topological order: ${order.join(" → ")}.`);
  return steps;
}

// ── Prim's MST ──────────────────────────────────────────────────────────
export function primSteps(g: Graph, start: number): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const inMST = new Array<boolean>(V).fill(false);
  const key = new Array<number>(V).fill(INF);
  const parent = new Array<number>(V).fill(-1);
  const order: number[] = [];
  const steps: GraphStep[] = [];
  let current: number | null = null;
  let edge: [number, number] | undefined;

  const distMap = () => {
    const out: Record<number, number> = {};
    for (let i = 0; i < V; i++) if (key[i] < INF) out[i] = key[i];
    return out;
  };
  const treeEdges = (): [number, number][] =>
    order
      .filter((v) => parent[v] >= 0)
      .map((v) => [parent[v], v] as [number, number]);
  const weight = () =>
    treeEdges().reduce((s, [a, b]) => s + m[a][b], 0);
  const snap = (codeLine: number, note: string) =>
    steps.push({
      codeLine,
      note,
      visited: order.slice(),
      frontier: g.nodes
        .map((n) => n.id)
        .filter((v) => !inMST[v] && key[v] < INF),
      current,
      edge,
      dist: distMap(),
      treeEdges: treeEdges(),
      order: order.slice(),
    });

  key[start] = 0;
  snap(7, `Start from ${start}: key[${start}] = 0, all others ∞.`);

  for (let count = 0; count < V; count++) {
    let u = -1;
    for (let v = 0; v < V; v++)
      if (!inMST[v] && (u === -1 || key[v] < key[u])) u = v;
    if (u === -1 || key[u] === INF) break;

    current = u;
    inMST[u] = true;
    order.push(u);
    edge = parent[u] >= 0 ? [parent[u], u] : undefined;
    snap(
      14,
      parent[u] >= 0
        ? `Add ${u} via edge ${parent[u]}–${u} (w ${m[parent[u]][u]}). MST weight ${weight()}.`
        : `Add start node ${u} to the MST.`
    );

    for (let v = 0; v < V; v++) {
      if (!m[u][v] || inMST[v]) continue;
      edge = [u, v];
      snap(
        17,
        `Edge ${u}–${v} (w ${m[u][v]}) vs current key[${v}] = ${
          key[v] === INF ? "∞" : key[v]
        }.`
      );
      if (m[u][v] < key[v]) {
        key[v] = m[u][v];
        parent[v] = u;
        snap(19, `Cheaper — key[${v}] = ${m[u][v]}, parent = ${u}.`);
      }
    }
    edge = undefined;
  }

  current = null;
  edge = undefined;
  snap(22, `Done. Minimum spanning tree weight is ${weight()}.`);
  return steps;
}

// ── Kruskal's MST (union-find) ──────────────────────────────────────────
export function kruskalSteps(g: Graph): GraphStep[] {
  const V = g.nodes.length;
  const parent = Array.from({ length: V }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  const sorted = [...g.edges].sort((a, b) => a.weight - b.weight);
  const tree: [number, number][] = [];
  const rejected: [number, number][] = [];
  const steps: GraphStep[] = [];
  let edge: [number, number] | undefined;

  const badges = () => {
    const b: Record<number, string> = {};
    for (let i = 0; i < V; i++) b[i] = `s${find(i)}`;
    return b;
  };
  const weight = () => tree.reduce((s, [a, b]) => {
    const e = g.edges.find(
      (x) =>
        (x.from === a && x.to === b) || (x.from === b && x.to === a)
    );
    return s + (e?.weight ?? 0);
  }, 0);
  const snap = (codeLine: number, note: string) =>
    steps.push({
      codeLine,
      note,
      visited: [],
      frontier: [],
      current: null,
      edge,
      treeEdges: tree.slice(),
      rejectedEdges: rejected.slice(),
      badges: badges(),
      order: [],
    });

  snap(9, `Put each node in its own set (badge = set root).`);
  snap(
    10,
    `Sort edges by weight: ${sorted
      .map((e) => `${e.from}–${e.to}(${e.weight})`)
      .join(", ")}.`
  );

  for (const e of sorted) {
    edge = [e.from, e.to];
    const a = find(e.from);
    const b = find(e.to);
    snap(13, `Edge ${e.from}–${e.to} (w ${e.weight}): roots ${a} and ${b}.`);
    if (a !== b) {
      parent[a] = b;
      tree.push([e.from, e.to]);
      snap(
        16,
        `Different sets — union them and keep the edge. MST weight ${weight()}.`
      );
    } else {
      rejected.push([e.from, e.to]);
      snap(15, `Same set — this edge would form a cycle, skip it.`);
    }
  }

  edge = undefined;
  snap(18, `Done. Minimum spanning tree weight is ${weight()}.`);
  return steps;
}

// ── A* search (straight-line heuristic) ─────────────────────────────────
export function aStarSteps(g: Graph, src: number, goal = 5): GraphStep[] {
  const V = g.nodes.length;
  const m = toMatrix(g);
  const h = g.nodes.map((n) =>
    Math.floor(euclid(n, g.nodes[goal]) / 10)
  );
  const gscore = new Array<number>(V).fill(INF);
  const f = new Array<number>(V).fill(INF);
  const pred = new Array<number>(V).fill(-1);
  const closed = new Array<boolean>(V).fill(false);
  const steps: GraphStep[] = [];
  let current: number | null = null;
  let edge: [number, number] | undefined;

  const distMap = () => {
    const out: Record<number, number> = {};
    for (let i = 0; i < V; i++) if (gscore[i] < INF) out[i] = gscore[i];
    return out;
  };
  const badges = () => {
    const b: Record<number, string> = {};
    for (let i = 0; i < V; i++) if (f[i] < INF) b[i] = `f${f[i]}`;
    return b;
  };
  const pathTo = (v: number): [number, number][] => {
    const edges: [number, number][] = [];
    let cur = v;
    while (pred[cur] >= 0) {
      edges.push([pred[cur], cur]);
      cur = pred[cur];
    }
    return edges;
  };
  const snap = (
    codeLine: number,
    note: string,
    tree: [number, number][] = []
  ) =>
    steps.push({
      codeLine,
      note,
      visited: closed.map((c, i) => (c ? i : -1)).filter((i) => i >= 0),
      frontier: gscore
        .map((s, i) => (s < INF && !closed[i] ? i : -1))
        .filter((i) => i >= 0),
      current,
      edge,
      dist: distMap(),
      badges: badges(),
      treeEdges: tree,
      order: [],
    });

  gscore[src] = 0;
  f[src] = h[src];
  snap(8, `Goal is ${goal}. g[${src}] = 0, f[${src}] = h = ${h[src]}.`);

  for (let count = 0; count < V; count++) {
    let u = -1;
    for (let v = 0; v < V; v++)
      if (!closed[v] && f[v] < INF && (u === -1 || f[v] < f[u])) u = v;
    if (u === -1) break;

    current = u;
    edge = undefined;
    snap(14, `Lowest f is node ${u} (g ${gscore[u]} + h ${h[u]} = ${f[u]}).`, pathTo(u));
    if (u === goal) {
      snap(15, `Reached the goal ${goal}! Shortest cost = ${gscore[u]}.`, pathTo(u));
      break;
    }
    closed[u] = true;
    snap(16, `Close ${u} — its best cost is settled.`, pathTo(u));

    for (let v = 0; v < V; v++) {
      if (!m[u][v]) continue;
      edge = [u, v];
      const tentative = gscore[u] + m[u][v];
      snap(
        19,
        `Edge ${u}→${v} (w ${m[u][v]}): g ${gscore[u]} + ${m[u][v]} = ${tentative} vs ${
          gscore[v] === INF ? "∞" : gscore[v]
        }.`,
        pathTo(u)
      );
      if (tentative < gscore[v]) {
        gscore[v] = tentative;
        f[v] = tentative + h[v];
        pred[v] = u;
        snap(21, `Better — g[${v}] = ${tentative}, f[${v}] = ${f[v]}.`, pathTo(v));
      }
    }
    edge = undefined;
  }

  return steps;
}

// ── Registry ────────────────────────────────────────────────────────────
export interface GraphAlgoConfig {
  graph: Graph;
  /** Show edge weights. */
  weighted: boolean;
  /** Node the run starts from can be chosen (false for topo/kruskal). */
  usesStart: boolean;
  /** A* picks a goal node too. */
  usesGoal?: boolean;
  /** Whether the graph editor is offered for this algorithm. */
  editable?: boolean;
  startLabel: string;
  generate: (g: Graph, start: number, goal?: number) => GraphStep[];
}

export const GRAPH_ALGOS: Record<string, GraphAlgoConfig> = {
  bfs: {
    graph: SAMPLE_GRAPH,
    weighted: false,
    usesStart: true,
    editable: true,
    startLabel: "Start node",
    generate: bfsSteps,
  },
  dfs: {
    graph: SAMPLE_GRAPH,
    weighted: false,
    usesStart: true,
    editable: true,
    startLabel: "Start node",
    generate: dfsSteps,
  },
  dijkstra: {
    graph: SAMPLE_GRAPH,
    weighted: true,
    usesStart: true,
    editable: true,
    startLabel: "Source",
    generate: dijkstraSteps,
  },
  "bellman-ford": {
    graph: DIRECTED_DAG,
    weighted: true,
    usesStart: true,
    startLabel: "Source",
    generate: bellmanFordSteps,
  },
  "topological-sort": {
    graph: DIRECTED_DAG,
    weighted: false,
    usesStart: false,
    startLabel: "",
    generate: topoSortSteps,
  },
  prim: {
    graph: SAMPLE_GRAPH,
    weighted: true,
    usesStart: true,
    editable: true,
    startLabel: "Start node",
    generate: primSteps,
  },
  kruskal: {
    graph: SAMPLE_GRAPH,
    weighted: true,
    usesStart: false,
    startLabel: "",
    generate: kruskalSteps,
  },
  "a-star": {
    graph: GEOMETRIC_GRAPH,
    weighted: true,
    usesStart: true,
    usesGoal: true,
    startLabel: "Start",
    generate: (g, start, goal) => aStarSteps(g, start, goal),
  },
};
