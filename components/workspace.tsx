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

const SPEEDS = [0.5, 1, 1.5, 2] as const;
const MAX_VALUES = 16;
const DEFAULT_INPUT = "23, 7, 41, 15, 3, 34, 9, 28";
const DEFAULT_TARGET = "15";

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

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [activeLine, setActiveLine] = useState(0);
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [values, setValues] = useState(() => parseValues(DEFAULT_INPUT));
  const [targetText, setTargetText] = useState(DEFAULT_TARGET);
  const [target, setTarget] = useState(() =>
    Number.parseInt(DEFAULT_TARGET, 10)
  );

  // Placeholder playback: walk the code highlight until real steppers land.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setActiveLine((line) => (line + 1) % codeLines.length);
    }, 600 / speed);
    return () => clearInterval(id);
  }, [isPlaying, speed, codeLines.length]);

  const step = (delta: number) => {
    setIsPlaying(false);
    setActiveLine(
      (line) => (line + delta + codeLines.length) % codeLines.length
    );
  };

  const reset = () => {
    setIsPlaying(false);
    setActiveLine(0);
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
  const maxValue = Math.max(...displayValues, 1);
  const asBoxes = category.slug === "data-structures";
  const fileExtension = algorithm.language ?? "c";

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
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
              <ControlButton label="Reset" onClick={reset}>
                <RotateCcw className="size-4" />
              </ControlButton>
              <ControlButton label="Step back" onClick={() => step(-1)}>
                <StepBack className="size-4" />
              </ControlButton>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-500"
              >
                {isPlaying ? (
                  <Pause className="size-4" fill="currentColor" />
                ) : (
                  <Play className="size-4 translate-x-px" fill="currentColor" />
                )}
              </button>
              <ControlButton label="Step forward" onClick={() => step(1)}>
                <StepForward className="size-4" />
              </ControlButton>
            </div>

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
        {hasInput && (
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
          className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          {/* Dotted grid backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 [background-image:radial-gradient(rgb(113_113_122/0.18)_1px,transparent_1px)] [background-size:22px_22px]"
          />

          {/* Status chip */}
          <span
            className={`absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
              isPlaying
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isPlaying ? "animate-pulse bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            {isPlaying ? `Running · ${speed}x` : "Idle"}
          </span>

          {hasInput ? (
            asBoxes ? (
              /* Data structure preview: boxes */
              <div className="relative flex w-full flex-col items-center gap-6 px-6 py-10">
                <div className="flex max-w-full flex-wrap items-center justify-center gap-y-3">
                  {displayValues.map((value, i) => (
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
                        i < displayValues.length - 1 && (
                          <ArrowRight className="mx-1.5 size-4 text-zinc-400" />
                        )}
                      {algorithm.slug !== "linked-list" &&
                        i < displayValues.length - 1 && (
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
              /* Sorting / searching preview: bars */
              <div className="relative flex h-full w-full flex-col justify-end px-8 pb-8 pt-14">
                <div className="flex h-full items-end justify-center gap-1.5 sm:gap-2">
                  {displayValues.map((value, i) => {
                    const isTargetMatch = hasTarget && value === target;
                    return (
                      <motion.div
                        key={`${i}-${value}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${Math.max((value / maxValue) * 100, 6)}%`,
                          opacity: 1,
                        }}
                        transition={{ delay: i * 0.04, type: "tween" }}
                        className={`flex w-full max-w-12 flex-col justify-end rounded-t-md ${
                          isTargetMatch
                            ? "bg-emerald-500"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`pb-1 text-center font-mono text-[10px] ${
                            isTargetMatch
                              ? "font-semibold text-white"
                              : "text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          {value}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {hasTarget
                    ? `Looking for ${target} — matches are highlighted. Step-by-step animation coming next.`
                    : "Your input, ready to sort. Step-by-step animation coming next."}
                </p>
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
          className="flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 lg:min-h-0"
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
