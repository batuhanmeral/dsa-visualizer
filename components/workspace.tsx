"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Crosshair,
  Database,
  Dices,
  Gauge,
  Hash,
  Pause,
  Play,
  RotateCcw,
  ScanEye,
  StepBack,
  StepForward,
  TerminalSquare,
} from "lucide-react";
import type { Algorithm, Category } from "@/lib/data";
import { getSimulation, type StepKind } from "@/lib/simulations";
import DataStructureViz, {
  hasDataStructureViz,
} from "./data-structure-viz";
import GraphViz, { hasGraphViz } from "./graph-viz";
import DpViz, { hasDpViz } from "./dp-viz";
import BacktrackViz, { hasBacktrackViz } from "./backtracking-viz";

type CustomViz = "ds" | "graph" | "dp" | "backtrack";

function pickCustomViz(slug: string, isDsCategory: boolean): CustomViz | null {
  if (isDsCategory && hasDataStructureViz(slug)) return "ds";
  if (hasGraphViz(slug)) return "graph";
  if (hasDpViz(slug)) return "dp";
  if (hasBacktrackViz(slug)) return "backtrack";
  return null;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;
const MAX_VALUES = 16;
const DEFAULT_INPUT = "23, 7, 41, 15, 3, 34, 9, 28";
const DEFAULT_TARGET = "15";

const KIND_STYLES: Record<StepKind, { bar: string; dot: string }> = {
  compare: { bar: "bg-amber-400", dot: "bg-amber-400" },
  swap: { bar: "bg-rose-500", dot: "bg-rose-500" },
  shift: { bar: "bg-violet-500", dot: "bg-violet-500" },
  select: { bar: "bg-sky-500", dot: "bg-sky-500" },
  probe: { bar: "bg-amber-400", dot: "bg-amber-400" },
  found: { bar: "bg-emerald-500", dot: "bg-emerald-500" },
  info: { bar: "bg-zinc-400", dot: "bg-zinc-400" },
  done: { bar: "bg-emerald-500", dot: "bg-emerald-500" },
};

const SORT_LEGEND: { label: string; dot: string }[] = [
  { label: "compare", dot: "bg-amber-400" },
  { label: "swap", dot: "bg-rose-500" },
  { label: "shift", dot: "bg-violet-500" },
  { label: "select", dot: "bg-sky-500" },
  { label: "sorted", dot: "bg-emerald-500" },
];

const SEARCH_LEGEND: { label: string; dot: string }[] = [
  { label: "checking", dot: "bg-amber-400" },
  { label: "found", dot: "bg-emerald-500" },
  { label: "eliminated", dot: "bg-zinc-300 dark:bg-zinc-700" },
];

function parseValues(text: string): number[] {
  return text
    .split(/[,\s]+/)
    .map((token) => Number.parseInt(token, 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 999)
    .slice(0, MAX_VALUES);
}

interface WorkspaceProps {
  category: Pick<Category, "name" | "slug">;
  algorithm: Algorithm;
}

export default function Workspace({ category, algorithm }: WorkspaceProps) {
  const codeLines = useMemo(() => algorithm.code.split("\n"), [algorithm.code]);
  const hasInput = algorithm.inputKind !== undefined;
  const hasTarget = algorithm.inputKind === "array-target";
  const generator = getSimulation(algorithm.slug);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [demoLine, setDemoLine] = useState(0);
  const [dsLine, setDsLine] = useState(0);
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [values, setValues] = useState(() => parseValues(DEFAULT_INPUT));
  const [targetText, setTargetText] = useState(DEFAULT_TARGET);
  const [target, setTarget] = useState(() =>
    Number.parseInt(DEFAULT_TARGET, 10)
  );

  const steps = useMemo(
    () => (generator && values.length > 0 ? generator(values, target) : undefined),
    [generator, values, target]
  );
  const step = steps ? steps[Math.min(stepIndex, steps.length - 1)] : undefined;
  const atEnd = steps !== undefined && stepIndex >= steps.length - 1;
  // Derived: playback halts by itself once the simulation reaches its last step.
  const playing = isPlaying && !atEnd;

  // Playback: advance real simulation steps, or (fallback for algorithms
  // without an engine yet) cycle the code highlight as a demo.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => {
        if (steps) {
          setStepIndex((s) => Math.min(s + 1, steps.length - 1));
        } else {
          setDemoLine((line) => (line + 1) % codeLines.length);
        }
      },
      (steps ? 900 : 600) / speed
    );
    return () => clearInterval(id);
  }, [playing, speed, steps, codeLines.length]);

  const reset = () => {
    setIsPlaying(false);
    setStepIndex(0);
    setDemoLine(0);
  };

  const stepBy = (delta: number) => {
    setIsPlaying(false);
    if (steps) {
      setStepIndex((s) => Math.min(Math.max(s + delta, 0), steps.length - 1));
    } else {
      setDemoLine(
        (line) => (line + delta + codeLines.length) % codeLines.length
      );
    }
  };

  const togglePlay = () => {
    if (atEnd) {
      setStepIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  };

  const applyInput = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseValues(inputText);
    if (parsed.length > 0) {
      setValues(parsed);
      setInputText(parsed.join(", "));
    }
    if (hasTarget) {
      const t = Number.parseInt(targetText, 10);
      if (Number.isFinite(t)) setTarget(t);
    }
    reset();
  };

  const shuffle = () => {
    const count = 8 + Math.floor(Math.random() * 5);
    const random = Array.from(
      { length: count },
      () => 5 + Math.floor(Math.random() * 95)
    );
    setValues(random);
    setInputText(random.join(", "));
    reset();
  };

  const displayValues = useMemo(
    () =>
      algorithm.sortedInput ? [...values].sort((a, b) => a - b) : values,
    [values, algorithm.sortedInput]
  );
  const renderValues = step ? step.array : displayValues;
  const maxValue = Math.max(...renderValues, 1);
  const asBoxes = category.slug === "data-structures";
  const customViz = pickCustomViz(
    algorithm.slug,
    category.slug === "data-structures"
  );
  // Custom canvases (data structures, graphs, DP, backtracking) drive their own
  // transport + code-line highlight; the shared bar/step engine steps aside.
  const useCustomViz = customViz !== null;
  const fileExtension = algorithm.language ?? "c";
  const activeLine = useCustomViz ? dsLine : step ? step.codeLine : demoLine;

  const barColor = (i: number): string => {
    if (step) {
      if (step.kind === "done") return "bg-emerald-500";
      if (step.highlights.includes(i)) return KIND_STYLES[step.kind].bar;
      if (step.sorted.includes(i)) return "bg-emerald-500";
      // Outside the active window → eliminated / not being worked on: dim it.
      if (step.range && (i < step.range[0] || i > step.range[1]))
        return "bg-zinc-200 dark:bg-zinc-800/70";
      return "bg-zinc-300 dark:bg-zinc-700";
    }
    if (hasTarget && renderValues[i] === target) return "bg-emerald-500";
    return "bg-zinc-300 dark:bg-zinc-700";
  };

  const legend = category.slug === "searching" ? SEARCH_LEGEND : SORT_LEGEND;

  const barIsColored = (i: number): boolean =>
    step !== undefined &&
    (step.kind === "done" ||
      step.highlights.includes(i) ||
      step.sorted.includes(i));

  return (
    <div className="flex flex-col gap-4 p-4 lg:h-dvh lg:p-6">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-lg font-semibold tracking-tight">
                {algorithm.name}
              </h1>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {category.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Clock className="size-3" /> {algorithm.time}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                <Database className="size-3" /> {algorithm.space}
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              {algorithm.summary}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!useCustomViz && (
              <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
                <ControlButton label="Reset" onClick={reset}>
                  <RotateCcw className="size-4" />
                </ControlButton>
                <ControlButton label="Step back" onClick={() => stepBy(-1)}>
                  <StepBack className="size-4" />
                </ControlButton>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-500"
                >
                  {playing ? (
                    <Pause className="size-4" fill="currentColor" />
                  ) : (
                    <Play className="size-4 translate-x-px" fill="currentColor" />
                  )}
                </button>
                <ControlButton label="Step forward" onClick={() => stepBy(1)}>
                  <StepForward className="size-4" />
                </ControlButton>
              </div>
            )}

            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
              <Gauge className="ml-1.5 size-4 text-zinc-400" />
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    speed === s
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom input */}
        {hasInput && !useCustomViz && (
          <form
            onSubmit={applyInput}
            className="flex flex-wrap items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800"
          >
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-emerald-500/60 dark:border-zinc-800 dark:bg-zinc-950">
              <Hash className="size-4 shrink-0 text-zinc-400" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 23, 7, 41, 15"
                spellCheck={false}
                aria-label="Input numbers"
                className="w-full min-w-32 bg-transparent font-mono text-xs outline-none placeholder:text-zinc-400"
              />
            </label>
            {hasTarget && (
              <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-emerald-500/60 dark:border-zinc-800 dark:bg-zinc-950">
                <Crosshair className="size-4 shrink-0 text-zinc-400" />
                <input
                  type="text"
                  value={targetText}
                  onChange={(e) => setTargetText(e.target.value)}
                  aria-label="Target value"
                  className="w-14 bg-transparent font-mono text-xs outline-none"
                />
              </label>
            )}
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={shuffle}
              title="Random input"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Dices className="size-4" />
              Random
            </button>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              max {MAX_VALUES} numbers (0–999)
              {algorithm.sortedInput && " · input is sorted automatically"}
            </span>
          </form>
        )}
      </header>

      {/* ── Panels ──────────────────────────────────────────────── */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,13fr)_minmax(0,7fr)]">
        {/* Visualization canvas */}
        <section
          aria-label="Visualization area"
          className="relative flex min-h-95 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          {/* Dotted grid backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(rgb(113_113_122/0.18)_1px,transparent_1px)] bg-size-[22px_22px]"
          />

          {/* Status chip */}
          {!useCustomViz && (
            <span
              className={`absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
                playing || (steps && atEnd)
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  playing
                    ? "animate-pulse bg-emerald-500"
                    : steps && atEnd
                      ? "bg-emerald-500"
                      : "bg-zinc-400"
                }`}
              />
              {playing
                ? `Running · ${speed}x`
                : steps && atEnd
                  ? "Done"
                  : "Idle"}
            </span>
          )}

          {customViz === "ds" ? (
            <DataStructureViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "graph" ? (
            <GraphViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "dp" ? (
            <DpViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "backtrack" ? (
            <BacktrackViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : hasInput ? (
            asBoxes ? (
              /* Data structure preview: boxes */
              <div className="relative flex w-full flex-col items-center gap-6 px-6 py-10">
                <div className="flex max-w-full flex-wrap items-center justify-center gap-y-3">
                  {renderValues.map((value, i) => (
                    <span key={`${i}-${value}`} className="flex items-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex size-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 font-mono text-sm font-medium text-emerald-700 dark:text-emerald-300"
                      >
                        {value}
                      </motion.span>
                      {algorithm.slug === "linked-list" &&
                        i < renderValues.length - 1 && (
                          <ArrowRight className="mx-1.5 size-4 text-zinc-400" />
                        )}
                      {algorithm.slug !== "linked-list" &&
                        i < renderValues.length - 1 && (
                          <span className="w-2" />
                        )}
                    </span>
                  ))}
                </div>
                <p className="max-w-sm text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Your input, staged as {algorithm.name.toLowerCase()} elements.
                  Interactive operations (insert, remove, …) arrive with the
                  simulation engine.
                </p>
              </div>
            ) : (
              /* Sorting / searching: animated bars */
              <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
                <div className="flex min-h-0 flex-1 items-end justify-center gap-1.5 sm:gap-2">
                  {renderValues.map((value, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        height: `${Math.max((value / maxValue) * 100, 6)}%`,
                      }}
                      transition={{ type: "tween", duration: 0.25 }}
                      className={`flex w-full max-w-12 flex-col justify-end rounded-t-md transition-colors duration-200 ${barColor(i)}`}
                    >
                      <span
                        className={`pb-1 text-center font-mono text-[10px] ${
                          barIsColored(i) ||
                          (!step && hasTarget && value === target)
                            ? "font-semibold text-white"
                            : "text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        {value}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {steps && step ? (
                  /* Step strip: note + counter + scrubber + legend */
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-white/85 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                        <span
                          className={`size-2 shrink-0 rounded-full ${KIND_STYLES[step.kind].dot}`}
                        />
                        <span className="truncate">{step.note}</span>
                      </p>
                      <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                        {Math.min(stepIndex, steps.length - 1) + 1}/
                        {steps.length}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={steps.length - 1}
                      value={Math.min(stepIndex, steps.length - 1)}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setStepIndex(Number(e.target.value));
                      }}
                      aria-label="Simulation timeline"
                      className="mt-2 h-1 w-full cursor-pointer accent-emerald-600"
                    />
                    <div className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 sm:flex">
                      {legend.map((item) => (
                        <span
                          key={item.label}
                          className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500"
                        >
                          <span
                            className={`size-1.5 rounded-full ${item.dot}`}
                          />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {hasTarget
                      ? `Looking for ${target} — matches are highlighted. Step-by-step animation coming next.`
                      : "Your input, ready to sort. Step-by-step animation coming next."}
                  </p>
                )}
              </div>
            )
          ) : (
            /* Placeholder for algorithms without numeric input */
            <div className="relative flex flex-col items-center gap-4 px-6 text-center">
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                <ScanEye className="size-7" />
              </motion.span>
              <div>
                <p className="text-sm font-medium">Visualization Area</p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  The animated {algorithm.name} visualization will render here.
                  Use the controls above to drive playback.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Code viewer */}
        <section
          aria-label="Code viewer"
          className="flex min-h-85 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 lg:min-h-0"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <TerminalSquare className="size-4 text-emerald-400" />
              {algorithm.slug}.{fileExtension}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              line {activeLine + 1}/{codeLines.length}
            </span>
          </div>
          <pre className="scrollbar-slim flex-1 overflow-auto py-3 font-mono text-[13px] leading-6">
            {codeLines.map((line, i) => (
              <div
                key={i}
                className={`flex px-4 transition-colors ${
                  i === activeLine
                    ? "border-l-2 border-emerald-400 bg-emerald-400/10"
                    : "border-l-2 border-transparent"
                }`}
              >
                <span className="w-8 shrink-0 select-none text-right pr-4 text-zinc-600">
                  {i + 1}
                </span>
                <code
                  className={
                    i === activeLine ? "text-emerald-300" : "text-zinc-300"
                  }
                >
                  {line || " "}
                </code>
              </div>
            ))}
          </pre>
        </section>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {children}
    </button>
  );
}
