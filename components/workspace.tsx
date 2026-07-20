"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Crosshair,
  Database,
  Dices,
  Gauge,
  GitCompareArrows,
  Hash,
  Link2,
  Pause,
  Play,
  RotateCcw,
  ScanEye,
  StepBack,
  StepForward,
  TerminalSquare,
} from "lucide-react";
import { categories, type Algorithm, type Category } from "@/lib/data";
import { getSimulation, type StepKind } from "@/lib/simulations";
import { getAlgoInfo } from "@/lib/algo-info";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { algoName, algoSummary, catName } from "@/lib/content-i18n";
import CodeView from "./code-view";
import GrowthChart from "./growth-chart";
import {
  SPEEDS,
  SpeedContext,
  SpeedSelect,
  TransportControls,
} from "./step-player";
import CompareView from "./compare-view";
import DataStructureViz, {
  hasDataStructureViz,
} from "./data-structure-viz";
import GraphViz, { hasGraphViz } from "./graph-viz";
import DpViz, { hasDpViz } from "./dp-viz";
import BacktrackViz, { hasBacktrackViz } from "./backtracking-viz";
import TreeViz, { hasTreeViz } from "./tree-viz";
import StringViz, { hasStringViz } from "./string-viz";
import GreedyViz, { hasGreedyViz } from "./greedy-viz";
import MathViz, { hasMathViz } from "./math-viz";

type CustomViz =
  | "ds"
  | "graph"
  | "dp"
  | "backtrack"
  | "tree"
  | "string"
  | "greedy"
  | "math";

function pickCustomViz(slug: string, isDsCategory: boolean): CustomViz | null {
  if (isDsCategory && hasDataStructureViz(slug)) return "ds";
  if (hasGraphViz(slug)) return "graph";
  if (hasDpViz(slug)) return "dp";
  if (hasBacktrackViz(slug)) return "backtrack";
  if (hasTreeViz(slug)) return "tree";
  if (hasStringViz(slug)) return "string";
  if (hasGreedyViz(slug)) return "greedy";
  if (hasMathViz(slug)) return "math";
  return null;
}

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

const SORT_LEGEND: { key: TKey; dot: string }[] = [
  { key: "legend.compare", dot: "bg-amber-400" },
  { key: "legend.swap", dot: "bg-rose-500" },
  { key: "legend.shift", dot: "bg-violet-500" },
  { key: "legend.select", dot: "bg-sky-500" },
  { key: "legend.sorted", dot: "bg-emerald-500" },
];

const SEARCH_LEGEND: { key: TKey; dot: string }[] = [
  { key: "legend.checking", dot: "bg-amber-400" },
  { key: "legend.found", dot: "bg-emerald-500" },
  { key: "legend.eliminated", dot: "bg-zinc-300 dark:bg-zinc-700" },
];

/**
 * Operation counters derived purely from step `kind`s — running totals up to the
 * current step. Only the kinds an algorithm actually emits are shown, so the set
 * stays stable across the run.
 */
const STAT_KINDS: { kind: StepKind; key: TKey; dot: string }[] = [
  { kind: "compare", key: "stat.comparisons", dot: "bg-amber-400" },
  { kind: "swap", key: "stat.swaps", dot: "bg-rose-500" },
  { kind: "shift", key: "stat.moves", dot: "bg-violet-500" },
  { kind: "probe", key: "stat.probes", dot: "bg-amber-400" },
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
  const { t, lang } = useLang();
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
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [panelTab, setPanelTab] = useState<"code" | "about" | "growth">(
    "code"
  );
  const restored = useRef(false);

  const info = getAlgoInfo(algorithm.slug, lang);
  const hasGrowth = getSimulation(algorithm.slug) !== undefined;
  const panelTabs = (["code", "about", "growth"] as const).filter(
    (tab) =>
      tab === "code" ||
      (tab === "about" && info !== undefined) ||
      (tab === "growth" && hasGrowth)
  );
  const activeTab = panelTabs.includes(panelTab) ? panelTab : "code";
  const showCode = activeTab === "code";

  // Sibling algorithms (same category, same input shape, with an engine) that
  // this one can be raced against in compare mode.
  const siblings = useMemo(() => {
    const cat = categories.find((c) => c.slug === category.slug);
    return (cat?.algorithms ?? []).filter(
      (a) =>
        a.slug !== algorithm.slug &&
        a.inputKind === algorithm.inputKind &&
        getSimulation(a.slug) !== undefined
    );
  }, [category.slug, algorithm.slug, algorithm.inputKind]);

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
  // Compare mode: race this algorithm against a sibling on the same input.
  const compareAvailable =
    !useCustomViz && generator !== undefined && siblings.length > 0;
  const comparing = compareMode && compareAvailable;
  const activeLine =
    useCustomViz || comparing ? dsLine : step ? step.codeLine : demoLine;

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

  // Which operation counters this algorithm emits (stable across the run).
  const activeStats = useMemo(
    () => (steps ? STAT_KINDS.filter((s) => steps.some((st) => st.kind === s.kind)) : []),
    [steps]
  );
  // Running totals up to (and including) the current step.
  const runningCounts = useMemo(() => {
    const counts = {} as Partial<Record<StepKind, number>>;
    if (steps) {
      const upto = Math.min(stepIndex, steps.length - 1);
      for (let i = 0; i <= upto; i++) {
        const k = steps[i].kind;
        counts[k] = (counts[k] ?? 0) + 1;
      }
    }
    return counts;
  }, [steps, stepIndex]);

  // Restore shareable state (input · target · step) from the URL once on mount.
  // One-time URL→state hydration: defaults render on the server, the link's
  // params are applied after mount (hence the scoped set-state-in-effect waiver).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (useCustomViz || !hasInput) {
      restored.current = true;
      return;
    }
    const p = new URLSearchParams(window.location.search);
    const inputParam = p.get("input");
    if (inputParam) {
      const parsed = parseValues(inputParam);
      if (parsed.length > 0) {
        setValues(parsed);
        setInputText(parsed.join(", "));
      }
    }
    if (hasTarget) {
      const t = p.get("target");
      const n = t === null ? NaN : Number.parseInt(t, 10);
      if (Number.isFinite(n)) {
        setTarget(n);
        setTargetText(String(n));
      }
    }
    const s = p.get("step");
    const si = s === null ? NaN : Number.parseInt(s, 10);
    if (Number.isFinite(si) && si >= 0) setStepIndex(si);
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Mirror it back into the URL (replaceState — shareable, no history spam).
  useEffect(() => {
    if (!restored.current || useCustomViz || !hasInput) return;
    const p = new URLSearchParams();
    p.set("input", values.join(","));
    if (hasTarget) p.set("target", String(target));
    p.set("step", String(Math.min(stepIndex, (steps?.length ?? 1) - 1)));
    window.history.replaceState(null, "", `${window.location.pathname}?${p}`);
  }, [values, target, stepIndex, steps, useCustomViz, hasInput, hasTarget]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(algorithm.code);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  // Keyboard shortcuts for the shared transport: space = play/pause, ←/→ = step.
  // Skipped while a custom canvas or compare mode owns playback, and while the
  // user is typing in an input. The handlers are read through a ref so the
  // listener always sees fresh state (atEnd, steps) without re-subscribing.
  const shortcutsActive = !useCustomViz && !comparing && steps !== undefined;
  const transportRef = useRef({ togglePlay, stepBy });
  useEffect(() => {
    transportRef.current = { togglePlay, stepBy };
  });
  useEffect(() => {
    if (!shortcutsActive) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        transportRef.current.togglePlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        transportRef.current.stepBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        transportRef.current.stepBy(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcutsActive]);

  const barIsColored = (i: number): boolean =>
    step !== undefined &&
    (step.kind === "done" ||
      step.highlights.includes(i) ||
      step.sorted.includes(i));

  return (
    <SpeedContext.Provider value={{ speed, setSpeed }}>
    <div className="flex flex-col gap-4 p-4 lg:h-dvh lg:p-6">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-lg font-semibold tracking-tight">
                {algoName(algorithm.slug, algorithm.name, lang)}
              </h1>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {catName(category.slug, category.name, lang)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <Clock className="size-3" /> {algorithm.time}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                <Database className="size-3" /> {algorithm.space}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {algoSummary(algorithm.slug, algorithm.summary, lang)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {compareAvailable && (
              <button
                type="button"
                onClick={() => setCompareMode((c) => !c)}
                title={t("ws.compare.title")}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  comparing
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <GitCompareArrows className="size-4" />
                {t("ws.compare")}
              </button>
            )}
            {/* Fallback-only controls: algorithms without a step engine have no
                panel below the canvas, so the demo transport + speed stay here. */}
            {!useCustomViz && !comparing && !steps && (
              <>
                <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
                  <ControlButton label={t("reset")} onClick={reset}>
                    <RotateCcw className="size-4" />
                  </ControlButton>
                  <ControlButton label={t("stepBack")} onClick={() => stepBy(-1)}>
                    <StepBack className="size-4" />
                  </ControlButton>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? t("pause") : t("play")}
                    className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-colors hover:bg-emerald-500"
                  >
                    {playing ? (
                      <Pause className="size-4" fill="currentColor" />
                    ) : (
                      <Play className="size-4 translate-x-px" fill="currentColor" />
                    )}
                  </button>
                  <ControlButton label={t("stepForward")} onClick={() => stepBy(1)}>
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
              </>
            )}
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
                placeholder={t("ws.input.placeholder")}
                spellCheck={false}
                aria-label={t("ws.input.aria")}
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
                  aria-label={t("ws.target.aria")}
                  className="w-14 bg-transparent font-mono text-xs outline-none"
                />
              </label>
            )}
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-500"
            >
              {t("ws.apply")}
            </button>
            <button
              type="button"
              onClick={shuffle}
              title={t("ws.random.title")}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Dices className="size-4" />
              {t("ws.random")}
            </button>
            <button
              type="button"
              onClick={copyLink}
              title={t("ws.share.title")}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                copied
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  {t("ws.copied")}
                </>
              ) : (
                <>
                  <Link2 className="size-4" />
                  {t("ws.share")}
                </>
              )}
            </button>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {t("ws.maxNumbers", { n: MAX_VALUES })}
              {algorithm.sortedInput && t("ws.autoSorted")}
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
          {!useCustomViz && !comparing && (
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
                ? `${t("ws.status.running")} · ${speed}x`
                : steps && atEnd
                  ? t("ws.status.done")
                  : t("ws.status.idle")}
            </span>
          )}

          {comparing ? (
            <CompareView
              key={algorithm.slug}
              left={algorithm}
              opponents={siblings}
              values={values}
              target={target}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "ds" ? (
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
          ) : customViz === "tree" ? (
            <TreeViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "string" ? (
            <StringViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "greedy" ? (
            <GreedyViz
              key={algorithm.slug}
              slug={algorithm.slug}
              speed={speed}
              onLine={setDsLine}
            />
          ) : customViz === "math" ? (
            <MathViz
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
                  {t("ws.ds.preview", {
                    name: algoName(
                      algorithm.slug,
                      algorithm.name,
                      lang
                    ).toLowerCase(),
                  })}
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
                    <p className="flex min-w-0 items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <span
                        className={`size-2 shrink-0 rounded-full ${KIND_STYLES[step.kind].dot}`}
                      />
                      <span className="truncate">{step.note}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={steps.length - 1}
                        value={Math.min(stepIndex, steps.length - 1)}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setStepIndex(Number(e.target.value));
                        }}
                        aria-label={t("ws.timeline")}
                        className="h-1 flex-1 cursor-pointer accent-emerald-600"
                      />
                      <span className="shrink-0 font-mono text-[11px] text-zinc-400">
                        {Math.min(stepIndex, steps.length - 1) + 1}/
                        {steps.length}
                      </span>
                      <TransportControls
                        playing={playing}
                        onToggle={togglePlay}
                        onReset={reset}
                        onStep={stepBy}
                      />
                    </div>
                    <div className="mt-2.5 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        {(activeStats.length > 0 || (step.vars && step.vars.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {activeStats.map((s) => (
                              <span
                                key={s.kind}
                                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                              >
                                <span className={`size-1.5 rounded-full ${s.dot}`} />
                                {t(s.key)}
                                <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                                  {runningCounts[s.kind] ?? 0}
                                </span>
                              </span>
                            ))}
                            {step.vars && step.vars.length > 0 && (
                              <>
                                <span className="mx-0.5 h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />
                                {step.vars.map((v) => (
                                  <span
                                    key={v.label}
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300"
                                  >
                                    {v.label}
                                    <span className="tabular-nums font-semibold">
                                      {v.value}
                                    </span>
                                  </span>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                        <div className="mt-2.5 hidden flex-wrap gap-x-4 gap-y-1 sm:flex">
                          {legend.map((item) => (
                            <span
                              key={item.key}
                              className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500"
                            >
                              <span
                                className={`size-1.5 rounded-full ${item.dot}`}
                              />
                              {t(item.key)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <SpeedSelect />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {hasTarget
                      ? t("ws.hint.search", { target })
                      : t("ws.hint.sort")}
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
                <p className="text-sm font-medium">{t("ws.viz.title")}</p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {t("ws.viz.desc", {
                    name: algoName(algorithm.slug, algorithm.name, lang),
                  })}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Code viewer / About */}
        <section
          aria-label="Code viewer"
          className={`flex min-h-85 flex-col overflow-hidden rounded-2xl border lg:min-h-0 ${
            showCode
              ? "border-zinc-800 bg-zinc-950"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 border-b px-4 py-2.5 ${
              showCode
                ? "border-zinc-800"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-400">
              <TerminalSquare className="size-4 shrink-0 text-emerald-400" />
              <span className="truncate">{algorithm.slug}.c</span>
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {panelTabs.length > 1 && (
                <div
                  className={`flex items-center gap-0.5 rounded-lg p-0.5 ${
                    showCode ? "bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-950"
                  }`}
                >
                  {panelTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPanelTab(tab)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400"
                          : showCode
                            ? "text-zinc-500 hover:text-zinc-200"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      {t(
                        tab === "code"
                          ? "ws.tab.code"
                          : tab === "about"
                            ? "ws.tab.about"
                            : "ws.tab.growth"
                      )}
                    </button>
                  ))}
                </div>
              )}
              {showCode && (
                <button
                  type="button"
                  onClick={copyCode}
                  title={t("ws.copy")}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    codeCopied
                      ? "text-emerald-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  {codeCopied ? (
                    <>
                      <Check className="size-3.5" />
                      {t("ws.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      {t("ws.copy")}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          {showCode ? (
            <CodeView code={algorithm.code} activeLine={activeLine} />
          ) : activeTab === "growth" ? (
            <GrowthChart algorithm={algorithm} categorySlug={category.slug} />
          ) : (
            <div className="scrollbar-slim flex-1 space-y-5 overflow-y-auto p-5">
              <InfoBlock title={t("info.how")} accent="text-emerald-600 dark:text-emerald-400">
                {info!.how}
              </InfoBlock>
              {info!.best && (
                <InfoBlock title={t("info.best")} accent="text-sky-600 dark:text-sky-400">
                  {info!.best}
                </InfoBlock>
              )}
              {info!.worst && (
                <InfoBlock title={t("info.worst")} accent="text-rose-600 dark:text-rose-400">
                  {info!.worst}
                </InfoBlock>
              )}
              <InfoBlock title={t("info.use")} accent="text-amber-600 dark:text-amber-400">
                {info!.use}
              </InfoBlock>
            </div>
          )}
        </section>
      </div>
    </div>
    </SpeedContext.Provider>
  );
}

function InfoBlock({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        className={`mb-1.5 text-[11px] font-semibold uppercase tracking-wide ${accent}`}
      >
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
        {children}
      </p>
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
