"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Minus, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  GRAPH_ALGOS,
  VIEW_H,
  VIEW_W,
  type Graph,
  type GraphStep,
} from "@/lib/simulations/graphs";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import {
  ChoiceButton,
  PlaybackPanel,
  useStepPlayer,
} from "./step-player";

export function hasGraphViz(slug: string): boolean {
  return slug in GRAPH_ALGOS;
}

const LEGEND_KEYS: { key: TKey; dot: string }[] = [
  { key: "graph.legend.current", dot: "bg-claude-500" },
  { key: "graph.legend.frontier", dot: "bg-amber-400" },
  { key: "graph.legend.visited", dot: "bg-sky-500" },
  { key: "graph.legend.treeEdge", dot: "bg-claude-500" },
];

/** Config `startLabel` (English, from GRAPH_ALGOS) → translation key. */
const START_LABEL_KEY: Record<string, TKey> = {
  "Start node": "graph.start.node",
  Source: "graph.start.source",
  Start: "graph.start.start",
};

const NODE_R = 20;

type NodeState = "current" | "frontier" | "visited" | "idle";

function nodeState(step: GraphStep, id: number): NodeState {
  if (step.current === id) return "current";
  if (step.frontier.includes(id)) return "frontier";
  if (step.visited.includes(id)) return "visited";
  return "idle";
}

const NODE_FILL: Record<NodeState, string> = {
  current: "fill-claude-500",
  frontier: "fill-amber-400",
  visited: "fill-sky-500",
  idle: "fill-zinc-200 dark:fill-zinc-800",
};
const NODE_STROKE: Record<NodeState, string> = {
  current: "stroke-claude-600",
  frontier: "stroke-amber-500",
  visited: "stroke-sky-600",
  idle: "stroke-zinc-300 dark:stroke-zinc-700",
};
const LABEL_FILL: Record<NodeState, string> = {
  current: "fill-white",
  frontier: "fill-amber-950",
  visited: "fill-white",
  idle: "fill-zinc-500 dark:fill-zinc-400",
};

const same = (e: [number, number], a: number, b: number) =>
  (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a);

const MAX_NODES = 10;

/**
 * Weights are constrained to 1…99 because the engines — like the C snippets
 * beside them — use 0 in the adjacency matrix to mean "no edge". A zero-weight
 * edge could not be told apart from an absent one, so the editor never offers
 * one. See `toMatrix` in lib/simulations/graphs.ts.
 */
const MIN_EDGE_WEIGHT = 1;
const MAX_EDGE_WEIGHT = 99;

/** Spot for a new node: the candidate farthest from every existing node. */
function freeSpot(nodes: { x: number; y: number }[]): { x: number; y: number } {
  const candidates: { x: number; y: number }[] = [];
  for (let ix = 0; ix < 5; ix++)
    for (let iy = 0; iy < 4; iy++)
      candidates.push({
        x: 50 + (ix * (VIEW_W - 100)) / 4,
        y: 40 + (iy * (VIEW_H - 80)) / 3,
      });
  let best = candidates[0];
  let bestDist = -1;
  for (const c of candidates) {
    const d = Math.min(...nodes.map((n) => Math.hypot(n.x - c.x, n.y - c.y)));
    if (d > bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

type EdgeRole = "active" | "tree" | "rejected" | "idle";

export default function GraphViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const config = GRAPH_ALGOS[slug];
  const [graph, setGraph] = useState<Graph>(config.graph);
  const [start, setStart] = useState(0);
  const [goal, setGoal] = useState(5);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  // The edge whose weight is being adjusted, as an [from, to] pair.
  const [pickedEdge, setPickedEdge] = useState<[number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Drag state lives in refs — no re-render churn while the pointer moves.
  const dragId = useRef<number | null>(null);
  const dragMoved = useRef(false);

  const steps = useMemo(
    () => config.generate(graph, start, goal),
    [config, graph, start, goal]
  );
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];
  const legend = LEGEND_KEYS.map((l) => ({ label: t(l.key), dot: l.dot }));

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const edgeRole = (a: number, b: number): EdgeRole => {
    if (step.edge && same(step.edge, a, b)) return "active";
    if (step.treeEdges?.some((e) => same(e, a, b))) return "tree";
    if (step.rejectedEdges?.some((e) => same(e, a, b))) return "rejected";
    return "idle";
  };

  const nodeById = (id: number) => graph.nodes[id];

  const toggleEdge = (a: number, b: number) => {
    setGraph((g) => {
      const exists = g.edges.some((e) => same([e.from, e.to], a, b));
      const edges = exists
        ? g.edges.filter((e) => !same([e.from, e.to], a, b))
        : [...g.edges, { from: a, to: b, weight: MIN_EDGE_WEIGHT }];
      return { ...g, edges };
    });
    // Select a newly drawn edge so its weight can be set straight away.
    setPickedEdge((current) =>
      current && same(current, a, b) ? null : [a, b]
    );
  };

  const edgeWeight = (a: number, b: number) =>
    graph.edges.find((e) => same([e.from, e.to], a, b))?.weight;

  const nudgeWeight = (delta: number) => {
    if (!pickedEdge) return;
    const [a, b] = pickedEdge;
    setGraph((g) => ({
      ...g,
      edges: g.edges.map((e) =>
        same([e.from, e.to], a, b)
          ? {
              ...e,
              weight: Math.min(
                MAX_EDGE_WEIGHT,
                Math.max(MIN_EDGE_WEIGHT, e.weight + delta)
              ),
            }
          : e
      ),
    }));
  };

  /**
   * Remove a node, renumbering the rest so ids stay 0..n-1.
   *
   * The engines index the adjacency matrix by node id, so a gap in the
   * numbering would leave a phantom row. Renumbering keeps that contract and
   * also keeps the start/goal pickers honest.
   */
  const deleteNode = (id: number) => {
    setGraph((g) => {
      if (g.nodes.length <= 2) return g;
      const renumber = (old: number) => (old > id ? old - 1 : old);
      return {
        ...g,
        nodes: g.nodes
          .filter((n) => n.id !== id)
          .map((n) => ({ ...n, id: renumber(n.id) })),
        edges: g.edges
          .filter((e) => e.from !== id && e.to !== id)
          .map((e) => ({ ...e, from: renumber(e.from), to: renumber(e.to) })),
      };
    });
    setSelected(null);
    setPickedEdge(null);
    const last = graph.nodes.length - 2;
    setStart((v) => Math.min(v > id ? v - 1 : v, last));
    setGoal((v) => Math.min(v > id ? v - 1 : v, last));
  };

  const toggleDirected = () => {
    setGraph((g) => ({ ...g, directed: !g.directed }));
    setPickedEdge(null);
  };

  const onNodeClick = (id: number, remove: boolean) => {
    if (!editing) return;
    // A drag that just ended must not double as an edge-toggle click.
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    if (remove) {
      deleteNode(id);
      return;
    }
    if (selected === null) {
      setSelected(id);
    } else if (selected === id) {
      setSelected(null);
    } else {
      toggleEdge(selected, id);
      setSelected(null);
    }
  };

  /** Pointer position in viewBox coordinates. */
  const toView = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragId.current === null || !svgRef.current) return;
    const { x, y } = toView(e);
    dragMoved.current = true;
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) =>
        n.id === dragId.current
          ? {
              ...n,
              x: Math.min(Math.max(x, NODE_R), VIEW_W - NODE_R),
              y: Math.min(Math.max(y, NODE_R), VIEW_H - NODE_R),
            }
          : n
      ),
    }));
  };

  const addNode = () => {
    setGraph((g) => {
      if (g.nodes.length >= MAX_NODES) return g;
      const spot = freeSpot(g.nodes);
      return {
        ...g,
        nodes: [...g.nodes, { id: g.nodes.length, ...spot }],
      };
    });
  };

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          {config.usesStart && (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] font-medium text-zinc-400">
                {t(START_LABEL_KEY[config.startLabel] ?? "graph.start.node")}
              </span>
              {graph.nodes.map((n) => (
                <ChoiceButton
                  key={n.id}
                  active={n.id === start}
                  onClick={() => setStart(n.id)}
                >
                  {n.id}
                </ChoiceButton>
              ))}
            </div>
          )}
          {config.usesGoal && (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] font-medium text-zinc-400">
                {t("graph.goal")}
              </span>
              {graph.nodes.map((n) => (
                <ChoiceButton
                  key={n.id}
                  active={n.id === goal}
                  onClick={() => setGoal(n.id)}
                >
                  {n.id}
                </ChoiceButton>
              ))}
            </div>
          )}
          {config.editable && (
            <div className="ml-auto flex items-center gap-1.5">
              {editing && config.weighted && pickedEdge && (
                <div className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-1.5 py-1">
                  <span className="px-1 font-mono text-[11px] text-amber-700 dark:text-amber-300">
                    {pickedEdge[0]}–{pickedEdge[1]}
                  </span>
                  <button
                    type="button"
                    onClick={() => nudgeWeight(-1)}
                    aria-label={t("graph.weight.less")}
                    className="rounded p-0.5 text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="min-w-6 text-center font-mono text-[11px] font-semibold tabular-nums text-amber-800 dark:text-amber-200">
                    {edgeWeight(pickedEdge[0], pickedEdge[1]) ?? "–"}
                  </span>
                  <button
                    type="button"
                    onClick={() => nudgeWeight(1)}
                    aria-label={t("graph.weight.more")}
                    className="rounded p-0.5 text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={toggleDirected}
                  aria-pressed={graph.directed === true}
                  title={t("graph.directed.title")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    graph.directed
                      ? "bg-claude-500/15 text-claude-600 dark:text-claude-400"
                      : "border border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  <ArrowRight className="size-3.5" />
                  {t(graph.directed ? "graph.directed" : "graph.undirected")}
                </button>
              )}
              {editing && graph.nodes.length < MAX_NODES && (
                <button
                  type="button"
                  onClick={addNode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100"
                >
                  <Plus className="size-3.5" />
                  {t("graph.addNode")}
                </button>
              )}
              {editing && selected !== null && graph.nodes.length > 2 && (
                <button
                  type="button"
                  onClick={() => deleteNode(selected)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                >
                  <Trash2 className="size-3.5" />
                  {t("graph.deleteNode", { id: selected })}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditing((e) => !e);
                  setSelected(null);
                  setPickedEdge(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  editing
                    ? "bg-claude-500/15 text-claude-600 dark:text-claude-400"
                    : "border border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                <Pencil className="size-3.5" />
                {editing ? t("graph.editing") : t("graph.edit")}
              </button>
              {graph !== config.graph && (
                <button
                  type="button"
                  onClick={() => {
                    setGraph(config.graph);
                    setSelected(null);
                    setPickedEdge(null);
                    setStart(0);
                    setGoal(config.graph.nodes.length - 1);
                  }}
                  title={t("graph.reset.title")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100"
                >
                  <RotateCcw className="size-3.5" />
                  {t("graph.reset")}
                </button>
              )}
            </div>
          )}
        </>
      }
    >
      <div className="flex w-full max-w-xl flex-col items-center gap-3">
        {editing && (
          <p className="text-[11px] text-claude-600 dark:text-claude-400">
            {t("graph.editHint")}
          </p>
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className={`h-auto w-full max-h-[44vh] ${editing ? "touch-none" : ""}`}
          role="img"
          aria-label={`${slug} graph`}
          onPointerMove={onPointerMove}
          onPointerUp={() => {
            dragId.current = null;
          }}
          onPointerLeave={() => {
            dragId.current = null;
          }}
        >
          {graph.directed && (
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" className="fill-zinc-400" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" className="fill-claude-400" />
              </marker>
            </defs>
          )}

          {/* Edges */}
          {graph.edges.map((e) => {
            const a = nodeById(e.from);
            const b = nodeById(e.to);
            const role = edgeRole(e.from, e.to);
            // Shorten toward the target so arrowheads clear the node circle.
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const x1 = a.x + ux * NODE_R;
            const y1 = a.y + uy * NODE_R;
            const x2 = b.x - ux * NODE_R;
            const y2 = b.y - uy * NODE_R;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const stroke =
              role === "active"
                ? "stroke-claude-400"
                : role === "tree"
                  ? "stroke-claude-500"
                  : role === "rejected"
                    ? "stroke-rose-400/60"
                    : "stroke-zinc-300 dark:stroke-zinc-700";
            const width = role === "active" || role === "tree" ? 4 : 2;
            const isPicked =
              editing && pickedEdge !== null && same(pickedEdge, e.from, e.to);
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={graph.directed ? x1 : a.x}
                  y1={graph.directed ? y1 : a.y}
                  x2={graph.directed ? x2 : b.x}
                  y2={graph.directed ? y2 : b.y}
                  className={stroke}
                  strokeWidth={width}
                  strokeLinecap="round"
                  strokeDasharray={role === "rejected" ? "5 4" : undefined}
                  markerEnd={
                    graph.directed
                      ? role === "active"
                        ? "url(#arrow-active)"
                        : "url(#arrow)"
                      : undefined
                  }
                />
                {config.weighted && (
                  <g
                    onClick={() =>
                      editing &&
                      setPickedEdge((current) =>
                        current && same(current, e.from, e.to)
                          ? null
                          : [e.from, e.to]
                      )
                    }
                    className={editing ? "cursor-pointer" : undefined}
                  >
                    <rect
                      x={mx - 11}
                      y={my - 9}
                      width={22}
                      height={16}
                      rx={4}
                      className={
                        isPicked
                          ? "fill-amber-100 stroke-amber-500 dark:fill-amber-950"
                          : "fill-white dark:fill-zinc-900"
                      }
                      strokeWidth={isPicked ? 1.5 : 0}
                    />
                    <text
                      x={mx}
                      y={my + 3}
                      textAnchor="middle"
                      className="fill-zinc-500 text-[11px] font-medium dark:fill-zinc-400"
                    >
                      {e.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((n) => {
            const state = nodeState(step, n.id);
            const d = step.dist?.[n.id];
            const badge = step.badges?.[n.id];
            const isGoal = config.usesGoal && n.id === goal;
            const isSelected = editing && selected === n.id;
            return (
              <g
                key={n.id}
                onClick={(e) => onNodeClick(n.id, e.shiftKey || e.altKey)}
                onPointerDown={(e) => {
                  if (!editing) return;
                  dragId.current = n.id;
                  dragMoved.current = false;
                  (e.target as Element).releasePointerCapture?.(e.pointerId);
                }}
                className={editing ? "cursor-move" : undefined}
              >
                {isGoal && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={NODE_R + 5}
                    fill="none"
                    className="stroke-claude-500/50"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                )}
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R}
                  initial={false}
                  animate={{ scale: state === "current" ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  className={`${NODE_FILL[state]} ${
                    isSelected ? "stroke-claude-500" : NODE_STROKE[state]
                  }`}
                  strokeWidth={isSelected ? 4 : 2.5}
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  className={`${LABEL_FILL[state]} pointer-events-none text-[15px] font-semibold`}
                >
                  {n.id}
                </text>
                {d !== undefined && (
                  <text
                    x={n.x}
                    y={n.y - 27}
                    textAnchor="middle"
                    className="pointer-events-none fill-claude-600 text-[11px] font-semibold dark:fill-claude-400"
                  >
                    {d}
                  </text>
                )}
                {badge !== undefined && (
                  <text
                    x={n.x}
                    y={n.y + 34}
                    textAnchor="middle"
                    className="pointer-events-none fill-zinc-400 text-[10px] font-medium"
                  >
                    {badge}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Output order (traversals / topo sort) */}
        {step.order.length > 0 && (
          <div className="flex min-h-8 flex-wrap items-center justify-center gap-1.5">
            <span className="mr-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              {t("graph.order")}
            </span>
            {step.order.map((id, i) => (
              <span key={`${id}-${i}`} className="flex items-center gap-1.5">
                <span className="flex size-7 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10 font-mono text-xs font-medium text-sky-600 dark:text-sky-300">
                  {id}
                </span>
                {i < step.order.length - 1 && (
                  <span className="text-zinc-300 dark:text-zinc-600">→</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </PlaybackPanel>
  );
}
