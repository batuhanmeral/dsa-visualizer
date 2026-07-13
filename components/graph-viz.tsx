"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, RotateCcw } from "lucide-react";
import {
  GRAPH_ALGOS,
  VIEW_H,
  VIEW_W,
  type Graph,
  type GraphStep,
} from "@/lib/simulations/graphs";
import {
  ChoiceButton,
  PlaybackPanel,
  useStepPlayer,
} from "./step-player";

export function hasGraphViz(slug: string): boolean {
  return slug in GRAPH_ALGOS;
}

const LEGEND = [
  { label: "current", dot: "bg-emerald-500" },
  { label: "frontier", dot: "bg-amber-400" },
  { label: "visited", dot: "bg-sky-500" },
  { label: "tree edge", dot: "bg-emerald-500" },
];

const NODE_R = 20;

type NodeState = "current" | "frontier" | "visited" | "idle";

function nodeState(step: GraphStep, id: number): NodeState {
  if (step.current === id) return "current";
  if (step.frontier.includes(id)) return "frontier";
  if (step.visited.includes(id)) return "visited";
  return "idle";
}

const NODE_FILL: Record<NodeState, string> = {
  current: "fill-emerald-500",
  frontier: "fill-amber-400",
  visited: "fill-sky-500",
  idle: "fill-zinc-200 dark:fill-zinc-800",
};
const NODE_STROKE: Record<NodeState, string> = {
  current: "stroke-emerald-600",
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
  const config = GRAPH_ALGOS[slug];
  const [graph, setGraph] = useState<Graph>(config.graph);
  const [start, setStart] = useState(0);
  const [goal, setGoal] = useState(5);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const steps = useMemo(
    () => config.generate(graph, start, goal),
    [config, graph, start, goal]
  );
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];

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
        : [
            ...g.edges,
            { from: a, to: b, weight: 1 + Math.floor(Math.random() * 9) },
          ];
      return { ...g, edges };
    });
  };

  const onNodeClick = (id: number) => {
    if (!editing) return;
    if (selected === null) {
      setSelected(id);
    } else if (selected === id) {
      setSelected(null);
    } else {
      toggleEdge(selected, id);
      setSelected(null);
    }
  };

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={LEGEND}
      extra={
        <>
          {config.usesStart && (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] font-medium text-zinc-400">
                {config.startLabel}
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
                Goal
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
              <button
                type="button"
                onClick={() => {
                  setEditing((e) => !e);
                  setSelected(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  editing
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "border border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                <Pencil className="size-3.5" />
                {editing ? "Editing edges" : "Edit graph"}
              </button>
              {graph !== config.graph && (
                <button
                  type="button"
                  onClick={() => {
                    setGraph(config.graph);
                    setSelected(null);
                  }}
                  title="Restore preset graph"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:border-zinc-800 dark:hover:text-zinc-100"
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </button>
              )}
            </div>
          )}
        </>
      }
    >
      <div className="flex w-full max-w-xl flex-col items-center gap-3">
        {editing && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Click two nodes to add or remove the edge between them.
          </p>
        )}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full max-h-[44vh]"
          role="img"
          aria-label={`${slug} graph`}
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
                <path d="M 0 1 L 9 5 L 0 9 z" className="fill-emerald-400" />
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
                ? "stroke-emerald-400"
                : role === "tree"
                  ? "stroke-emerald-500"
                  : role === "rejected"
                    ? "stroke-rose-400/60"
                    : "stroke-zinc-300 dark:stroke-zinc-700";
            const width = role === "active" || role === "tree" ? 4 : 2;
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
                  <g>
                    <rect
                      x={mx - 11}
                      y={my - 9}
                      width={22}
                      height={16}
                      rx={4}
                      className="fill-white dark:fill-zinc-900"
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
                onClick={() => onNodeClick(n.id)}
                className={editing ? "cursor-pointer" : undefined}
              >
                {isGoal && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={NODE_R + 5}
                    fill="none"
                    className="stroke-emerald-500/50"
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
                    isSelected ? "stroke-emerald-500" : NODE_STROKE[state]
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
                    className="pointer-events-none fill-emerald-600 text-[11px] font-semibold dark:fill-emerald-400"
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
              order
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
