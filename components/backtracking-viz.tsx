"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import {
  makeSudokuGrid,
  mazeSteps,
  nQueensSteps,
  permutationsSteps,
  SAMPLE_MAZE,
  subsetsSteps,
  sudokuSteps,
  type ChoiceStatus,
  type ChoiceStep,
  type MazeStatus,
  type MazeStep,
  type QueenStatus,
  type QueensStep,
  type SudokuStatus,
  type SudokuStep,
} from "@/lib/simulations/backtracking";
import { ChoiceButton, PlaybackPanel, useStepPlayer } from "./step-player";

const BT_SLUGS = new Set([
  "n-queens",
  "sudoku",
  "rat-in-a-maze",
  "subsets",
  "permutations",
]);

export function hasBacktrackViz(slug: string): boolean {
  return BT_SLUGS.has(slug);
}

// ── N-Queens ────────────────────────────────────────────────────────────
const QUEEN_LEGEND = [
  { label: "trying", dot: "bg-amber-400" },
  { label: "placed", dot: "bg-emerald-500" },
  { label: "conflict", dot: "bg-rose-500" },
  { label: "backtrack", dot: "bg-violet-500" },
];

const QUEEN_DOT: Record<QueenStatus, string> = {
  try: "bg-amber-400",
  place: "bg-emerald-500",
  conflict: "bg-rose-500",
  backtrack: "bg-violet-500",
  solved: "bg-emerald-500",
};

function activeCellTone(
  status: QueenStatus | SudokuStatus | MazeStatus
): string {
  switch (status) {
    case "place":
    case "move":
    case "try":
      return status === "try"
        ? "border-amber-400/70 bg-amber-400/25"
        : "border-emerald-500/70 bg-emerald-500/20";
    case "conflict":
    case "reject":
    case "blocked":
      return "border-rose-500/70 bg-rose-500/20";
    case "backtrack":
      return "border-violet-500/70 bg-violet-500/20";
    case "scan":
      return "border-sky-500/70 bg-sky-500/15";
    default:
      return "border-emerald-500/70 bg-emerald-500/20";
  }
}

function QueensViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const [n, setN] = useState(6);
  const steps = useMemo(() => nQueensSteps(n), [n]);
  const player = useStepPlayer(steps.length, speed);
  const step: QueensStep = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const cell = 46;

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      dotClass={QUEEN_DOT[step.status]}
      legend={QUEEN_LEGEND}
      extra={
        <>
          <span className="mr-1 text-[11px] font-medium text-zinc-400">
            Board size
          </span>
          {[4, 5, 6, 7, 8].map((size) => (
            <ChoiceButton
              key={size}
              active={size === n}
              onClick={() => setN(size)}
            >
              {size}×{size}
            </ChoiceButton>
          ))}
        </>
      }
    >
      <div
        className="grid overflow-hidden rounded-lg border border-zinc-300 shadow-sm dark:border-zinc-700"
        style={{
          gridTemplateColumns: `repeat(${n}, ${cell}px)`,
        }}
      >
        {Array.from({ length: n * n }, (_, idx) => {
          const row = Math.floor(idx / n);
          const col = idx % n;
          const dark = (row + col) % 2 === 1;
          const hasQueen = step.queens[row] === col;
          const isActive =
            step.active?.[0] === row && step.active?.[1] === col;
          return (
            <div
              key={idx}
              className={`flex items-center justify-center border ${
                isActive
                  ? activeCellTone(step.status)
                  : dark
                    ? "border-transparent bg-zinc-200 dark:bg-zinc-800"
                    : "border-transparent bg-zinc-50 dark:bg-zinc-900"
              }`}
              style={{ width: cell, height: cell }}
            >
              {hasQueen && (
                <motion.span
                  layoutId={`queen-${row}`}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                >
                  <Crown
                    className={`size-6 ${
                      step.status === "solved"
                        ? "text-emerald-500"
                        : "text-zinc-700 dark:text-zinc-200"
                    }`}
                    fill="currentColor"
                  />
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </PlaybackPanel>
  );
}

// ── Sudoku ──────────────────────────────────────────────────────────────
const SUDOKU_LEGEND = [
  { label: "scanning", dot: "bg-sky-500" },
  { label: "trying", dot: "bg-amber-400" },
  { label: "placed", dot: "bg-emerald-500" },
  { label: "reject/backtrack", dot: "bg-rose-500" },
];

const SUDOKU_DOT: Record<SudokuStatus, string> = {
  scan: "bg-sky-500",
  try: "bg-amber-400",
  place: "bg-emerald-500",
  reject: "bg-rose-500",
  backtrack: "bg-violet-500",
  solved: "bg-emerald-500",
};

function SudokuViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  // Puzzle is fixed per mount; `fixed` marks the given (non-editable) clues.
  const { grid, fixed } = useMemo(() => makeSudokuGrid(), []);
  const steps = useMemo(() => sudokuSteps(grid), [grid]);
  const player = useStepPlayer(steps.length, speed);
  const step: SudokuStep = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      dotClass={SUDOKU_DOT[step.status]}
      legend={SUDOKU_LEGEND}
      extra={
        <span className="text-[11px] text-zinc-400">
          Solving one preset puzzle — watch digits get tried, placed and undone.
        </span>
      }
    >
      <div className="grid grid-cols-9 overflow-hidden rounded-lg border-2 border-zinc-400 dark:border-zinc-600">
        {step.grid.map((rowVals, r) =>
          rowVals.map((val, c) => {
            const isActive = step.active?.[0] === r && step.active?.[1] === c;
            const given = fixed[r][c];
            const showDigit =
              isActive && val === 0 && step.digit ? step.digit : val;
            return (
              <div
                key={`${r}-${c}`}
                className={`flex size-9 items-center justify-center font-mono text-sm font-medium sm:size-10 ${
                  c % 3 === 2 && c !== 8
                    ? "border-r-2 border-r-zinc-400 dark:border-r-zinc-600"
                    : "border-r border-r-zinc-200 dark:border-r-zinc-800"
                } ${
                  r % 3 === 2 && r !== 8
                    ? "border-b-2 border-b-zinc-400 dark:border-b-zinc-600"
                    : "border-b border-b-zinc-200 dark:border-b-zinc-800"
                } ${
                  isActive
                    ? `${activeCellTone(step.status)} border`
                    : given
                      ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100"
                      : "bg-white text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400"
                }`}
              >
                {showDigit === 0 ? "" : showDigit}
              </div>
            );
          })
        )}
      </div>
    </PlaybackPanel>
  );
}

// ── Rat in a Maze ───────────────────────────────────────────────────────
const MAZE_LEGEND = [
  { label: "trying", dot: "bg-amber-400" },
  { label: "on path", dot: "bg-emerald-500" },
  { label: "dead end", dot: "bg-rose-500" },
  { label: "backtrack", dot: "bg-violet-500" },
];

const MAZE_DOT: Record<MazeStatus, string> = {
  try: "bg-amber-400",
  move: "bg-emerald-500",
  blocked: "bg-rose-500",
  backtrack: "bg-violet-500",
  solved: "bg-emerald-500",
};

function MazeViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const steps = useMemo(() => mazeSteps(SAMPLE_MAZE), []);
  const player = useStepPlayer(steps.length, speed);
  const step: MazeStep = steps[player.index];
  const N = step.maze.length;

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      dotClass={MAZE_DOT[step.status]}
      legend={MAZE_LEGEND}
      extra={
        <span className="text-[11px] text-zinc-400">
          Rat starts top-left, exit is bottom-right. Walls are dark cells.
        </span>
      }
    >
      <div
        className="grid overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700"
        style={{ gridTemplateColumns: `repeat(${N}, 56px)` }}
      >
        {step.maze.map((row, r) =>
          row.map((cell, c) => {
            const isActive = step.active?.[0] === r && step.active?.[1] === c;
            const onPath = step.path[r][c];
            const isStart = r === 0 && c === 0;
            const isExit = r === N - 1 && c === N - 1;
            return (
              <div
                key={`${r}-${c}`}
                className={`relative flex size-14 items-center justify-center border border-zinc-200 text-[10px] font-medium dark:border-zinc-800 ${
                  cell === 0
                    ? "bg-zinc-700 dark:bg-zinc-900"
                    : isActive
                      ? activeCellTone(step.status)
                      : onPath
                        ? "bg-emerald-500/25"
                        : "bg-zinc-50 dark:bg-zinc-800/40"
                }`}
              >
                {onPath && cell !== 0 && (
                  <motion.span
                    layoutId={`rat-dot-${r}-${c}`}
                    className="size-3 rounded-full bg-emerald-500"
                  />
                )}
                {(isStart || isExit) && (
                  <span className="absolute left-1 top-1 text-[9px] uppercase text-zinc-400">
                    {isStart ? "S" : "E"}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </PlaybackPanel>
  );
}

// ── Subsets & Permutations (choice tree) ────────────────────────────────
const CHOICE_LEGEND = [
  { label: "choose", dot: "bg-amber-400" },
  { label: "backtrack", dot: "bg-violet-500" },
  { label: "recorded", dot: "bg-emerald-500" },
];

const CHOICE_DOT: Record<ChoiceStatus, string> = {
  add: "bg-amber-400",
  skip: "bg-zinc-400",
  recurse: "bg-sky-500",
  backtrack: "bg-violet-500",
  complete: "bg-emerald-500",
};

function ChoiceViz({
  speed,
  onLine,
  generate,
  input,
  kind,
}: {
  speed: number;
  onLine: (line: number) => void;
  generate: (a: number[]) => ChoiceStep[];
  input: number[];
  kind: "subset" | "permutation";
}) {
  const steps = useMemo(() => generate(input), [generate, input]);
  const player = useStepPlayer(steps.length, speed);
  const step: ChoiceStep = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const brackets = kind === "subset" ? ["{", "}"] : ["[", "]"];

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      dotClass={CHOICE_DOT[step.status]}
      legend={CHOICE_LEGEND}
      extra={
        <span className="text-[11px] text-zinc-400">
          {kind === "subset" ? "Set" : "Elements"}: {input.join(", ")} ·
          found {step.results.length}
          {kind === "subset"
            ? ` / ${2 ** input.length}`
            : ` / ${factorial(input.length)}`}
        </span>
      }
    >
      <div className="flex w-full max-w-lg flex-col items-center gap-5">
        {/* Current candidate */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            building
          </span>
          <div className="flex min-h-11 items-center gap-1.5">
            <span className="font-mono text-lg text-zinc-400">
              {brackets[0]}
            </span>
            {step.current.length === 0 && (
              <span className="px-2 text-xs text-zinc-400">empty</span>
            )}
            {step.current.map((v, i) => {
              const locked =
                kind === "permutation" &&
                step.fixed !== undefined &&
                i < step.fixed;
              const hot = step.highlight === i;
              return (
                <span
                  key={i}
                  className={`flex size-10 items-center justify-center rounded-lg border font-mono text-sm font-medium transition-colors ${
                    hot
                      ? "border-amber-400 bg-amber-400/25 text-amber-700 dark:text-amber-200"
                      : locked
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {v}
                </span>
              );
            })}
            <span className="font-mono text-lg text-zinc-400">
              {brackets[1]}
            </span>
          </div>
        </div>

        {/* Results collected so far */}
        <div className="flex w-full flex-col items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            recorded ({step.results.length})
          </span>
          <div className="flex max-h-40 flex-wrap items-center justify-center gap-1.5 overflow-auto">
            {step.results.length === 0 && (
              <span className="text-xs text-zinc-400">none yet</span>
            )}
            {step.results.map((res, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono text-[11px] text-emerald-700 dark:text-emerald-300"
              >
                {brackets[0]}
                {res.join(",")}
                {brackets[1]}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </PlaybackPanel>
  );
}

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

export default function BacktrackViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  if (slug === "n-queens") return <QueensViz speed={speed} onLine={onLine} />;
  if (slug === "sudoku") return <SudokuViz speed={speed} onLine={onLine} />;
  if (slug === "rat-in-a-maze")
    return <MazeViz speed={speed} onLine={onLine} />;
  if (slug === "subsets")
    return (
      <ChoiceViz
        speed={speed}
        onLine={onLine}
        generate={subsetsSteps}
        input={[1, 2, 3]}
        kind="subset"
      />
    );
  if (slug === "permutations")
    return (
      <ChoiceViz
        speed={speed}
        onLine={onLine}
        generate={permutationsSteps}
        input={[1, 2, 3]}
        kind="permutation"
      />
    );
  return null;
}
