import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aStarSteps,
  bellmanFordSteps,
  bfsSteps,
  dijkstraSteps,
  dfsSteps,
  DIRECTED_DAG,
  GEOMETRIC_GRAPH,
  INF,
  kruskalSteps,
  primSteps,
  SAMPLE_GRAPH,
  topoSortSteps,
  type Graph,
} from "../lib/simulations/graphs";
import { rng } from "./helpers";

const matrix = (g: Graph) => {
  const n = g.nodes.length;
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (const { from, to, weight } of g.edges) {
    m[from][to] = weight;
    if (!g.directed) m[to][from] = weight;
  }
  return m;
};

/** Reference shortest paths; `null` when a negative cycle makes them undefined. */
function refDist(g: Graph, src: number): number[] | null {
  const n = g.nodes.length;
  const m = matrix(g);
  const d = new Array<number>(n).fill(Infinity);
  d[src] = 0;
  for (let k = 0; k < n - 1; k++)
    for (let u = 0; u < n; u++)
      for (let v = 0; v < n; v++)
        if (m[u][v] && d[u] !== Infinity && d[u] + m[u][v] < d[v])
          d[v] = d[u] + m[u][v];
  for (let u = 0; u < n; u++)
    for (let v = 0; v < n; v++)
      if (m[u][v] && d[u] !== Infinity && d[u] + m[u][v] < d[v]) return null;
  return d;
}

/** Reference MST weight and edge count (Kruskal over a plain union-find). */
function refMST(g: Graph) {
  const edges = [...g.edges].sort((a, b) => a.weight - b.weight);
  const parent = g.nodes.map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x];
    return x;
  };
  let weight = 0;
  let kept = 0;
  for (const e of edges) {
    const a = find(e.from);
    const b = find(e.to);
    if (a !== b) {
      parent[a] = b;
      weight += e.weight;
      kept++;
    }
  }
  return { weight, kept };
}

/**
 * Random 6-node graphs on the preset positions. Undirected edge keys are
 * canonicalised so the generator cannot emit two weights for one edge — the
 * adjacency matrix would keep only the last, which is not a bug in the engines
 * but would make the reference disagree with them.
 */
function randomGraph(rand: () => number, directed: boolean, negative: boolean): Graph {
  const n = 6;
  const seen = new Set<string>();
  const edges: Graph["edges"] = [];
  const add = (a: number, b: number) => {
    if (a === b) return;
    const key = directed ? `${a}>${b}` : [a, b].sort().join("-");
    if (seen.has(key)) return;
    seen.add(key);
    const w = negative
      ? Math.floor(rand() * 12) - 4 || 1
      : 1 + Math.floor(rand() * 9);
    edges.push({ from: a, to: b, weight: w });
  };
  for (let i = 1; i < n; i++) add(Math.floor(rand() * i), i);
  for (let k = 0; k < 4; k++)
    add(Math.floor(rand() * n), Math.floor(rand() * n));
  return { nodes: SAMPLE_GRAPH.nodes, edges, directed };
}

const positiveGraphs = () => {
  const rand = rng(7);
  return [
    SAMPLE_GRAPH,
    GEOMETRIC_GRAPH,
    ...Array.from({ length: 60 }, () => randomGraph(rand, false, false)),
  ];
};

const finalDist = (steps: { dist?: Record<number, number> }[]) =>
  steps.at(-1)!.dist ?? {};

test("Dijkstra matches a reference shortest-path computation", () => {
  for (const g of positiveGraphs())
    for (let src = 0; src < g.nodes.length; src++) {
      const want = refDist(g, src)!;
      const got = finalDist(dijkstraSteps(g, src));
      for (let v = 0; v < g.nodes.length; v++)
        assert.equal(
          got[v] ?? Infinity,
          want[v],
          `dijkstra src=${src} node=${v} on ${JSON.stringify(g.edges)}`
        );
    }
});

test("Dijkstra settles every reachable node, not all but one", () => {
  // The textbook loop runs V-1 times because the last distance is already
  // final; the visualization needs it marked visited too, or the farthest node
  // stays grey while displaying a correct distance.
  for (let src = 0; src < SAMPLE_GRAPH.nodes.length; src++) {
    const order = dijkstraSteps(SAMPLE_GRAPH, src).at(-1)!.order;
    assert.equal(
      order.length,
      SAMPLE_GRAPH.nodes.length,
      `only ${order.length} nodes locked in from source ${src}: [${order}]`
    );
  }
});

test("Bellman-Ford matches the reference on directed negative-weight graphs", () => {
  const rand = rng(11);
  const graphs = [
    DIRECTED_DAG,
    ...Array.from({ length: 60 }, () => randomGraph(rand, true, true)),
  ];
  for (const g of graphs)
    for (let src = 0; src < g.nodes.length; src++) {
      const want = refDist(g, src);
      if (want === null) continue; // negative cycle: covered separately
      const got = finalDist(bellmanFordSteps(g, src));
      for (let v = 0; v < g.nodes.length; v++)
        assert.equal(
          got[v] ?? Infinity,
          want[v],
          `bellman src=${src} node=${v} on ${JSON.stringify(g.edges)}`
        );
    }
});

test("Bellman-Ford reports a reachable negative cycle", () => {
  const cyclic: Graph = {
    nodes: SAMPLE_GRAPH.nodes,
    directed: true,
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: -3 },
      { from: 2, to: 1, weight: 1 },
    ],
  };
  const steps = bellmanFordSteps(cyclic, 0);
  assert.equal(
    steps.at(-1)!.note.k,
    "n.bellman.negativeCycle",
    "distances are meaningless here, so the run must say so rather than print them"
  );
});

test("Bellman-Ford clears a graph that has no negative cycle", () => {
  const rand = rng(13);
  let checked = 0;
  for (let k = 0; k < 60; k++) {
    const g = randomGraph(rand, true, true);
    for (let src = 0; src < g.nodes.length; src++) {
      if (refDist(g, src) === null) continue;
      const notes = bellmanFordSteps(g, src).map((s) => s.note.k);
      assert.ok(
        !notes.includes("n.bellman.negativeCycle"),
        `false negative-cycle report on ${JSON.stringify(g.edges)}`
      );
      checked++;
    }
  }
  assert.ok(checked > 50, `only ${checked} acyclic cases exercised`);
});

test("Prim and Kruskal agree with the reference MST", () => {
  for (const g of positiveGraphs()) {
    const { weight, kept } = refMST(g);
    const prim = primSteps(g, 0).at(-1)!;
    const kruskal = kruskalSteps(g).at(-1)!;
    assert.equal(prim.note.v?.weight, weight, "prim weight");
    assert.equal(kruskal.note.v?.weight, weight, "kruskal weight");
    assert.equal(kruskal.treeEdges?.length, kept, "kruskal edge count");
    assert.equal(prim.treeEdges?.length, kept, "prim edge count");
  }
});

test("topological sort respects every edge", () => {
  const order = topoSortSteps(DIRECTED_DAG).at(-1)!.order;
  assert.equal(order.length, DIRECTED_DAG.nodes.length);
  const pos = new Map(order.map((v, i) => [v, i]));
  for (const e of DIRECTED_DAG.edges)
    assert.ok(
      pos.get(e.from)! < pos.get(e.to)!,
      `order [${order}] puts ${e.to} before ${e.from}`
    );
});

test("topological sort refuses a cyclic graph instead of printing a partial order", () => {
  const cyclic: Graph = {
    nodes: SAMPLE_GRAPH.nodes,
    directed: true,
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 0, weight: 1 },
    ],
  };
  const steps = topoSortSteps(cyclic);
  assert.equal(steps.at(-1)!.note.k, "n.topo.cycle");
});

test("BFS and DFS visit exactly the reachable nodes, once each", () => {
  for (const g of positiveGraphs()) {
    const m = matrix(g);
    for (let src = 0; src < g.nodes.length; src++) {
      const reachable = new Set([src]);
      const stack = [src];
      while (stack.length) {
        const u = stack.pop()!;
        for (let v = 0; v < g.nodes.length; v++)
          if (m[u][v] && !reachable.has(v)) {
            reachable.add(v);
            stack.push(v);
          }
      }
      for (const [name, run] of [
        ["bfs", bfsSteps],
        ["dfs", dfsSteps],
      ] as const) {
        const order = run(g, src).at(-1)!.order;
        assert.equal(order[0], src, `${name} did not start at ${src}`);
        assert.equal(new Set(order).size, order.length, `${name} revisited a node`);
        assert.equal(
          order.length,
          reachable.size,
          `${name} visited ${order.length} of ${reachable.size} reachable from ${src}`
        );
      }
    }
  }
});

test("BFS visits in non-decreasing hop distance", () => {
  for (const g of positiveGraphs()) {
    const m = matrix(g);
    for (let src = 0; src < g.nodes.length; src++) {
      const hop = new Array<number>(g.nodes.length).fill(Infinity);
      hop[src] = 0;
      const queue = [src];
      while (queue.length) {
        const u = queue.shift()!;
        for (let v = 0; v < g.nodes.length; v++)
          if (m[u][v] && hop[v] === Infinity) {
            hop[v] = hop[u] + 1;
            queue.push(v);
          }
      }
      const order = bfsSteps(g, src).at(-1)!.order;
      for (let i = 1; i < order.length; i++)
        assert.ok(
          hop[order[i]] >= hop[order[i - 1]],
          `bfs order [${order}] is not layered by hop distance`
        );
    }
  }
});

test("A* returns the true shortest cost, or says the goal is unreachable", () => {
  const n = GEOMETRIC_GRAPH.nodes.length;
  for (let src = 0; src < n; src++)
    for (let goal = 0; goal < n; goal++) {
      const steps = aStarSteps(GEOMETRIC_GRAPH, src, goal);
      const hit = steps.find((s) => s.note.k === "n.astar.reached");
      const want = refDist(GEOMETRIC_GRAPH, src)![goal];
      if (want === Infinity) {
        assert.equal(steps.at(-1)!.note.k, "n.astar.exhausted", `${src}→${goal}`);
        continue;
      }
      assert.ok(hit, `A* ${src}→${goal} never reached the goal (cost ${want})`);
      assert.equal(hit.note.v?.cost, want, `A* ${src}→${goal} cost`);
    }
});

test("A* reports arrival when the start is already the goal", () => {
  const steps = aStarSteps(GEOMETRIC_GRAPH, 3, 3);
  assert.ok(steps.some((s) => s.note.k === "n.astar.reached"));
});

test("distances are reported as ∞ rather than the INF sentinel", () => {
  const isolated: Graph = {
    nodes: SAMPLE_GRAPH.nodes,
    edges: [{ from: 0, to: 1, weight: 4 }],
  };
  for (const step of dijkstraSteps(isolated, 0))
    for (const d of Object.values(step.dist ?? {}))
      assert.ok(d < INF, `a distance of ${d} leaked the INF sentinel`);
});
