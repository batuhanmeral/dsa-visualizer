"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Database, ScanEye } from "lucide-react";
import { categories, type Algorithm, type Category } from "@/lib/data";
import type { AlgoCode } from "@/lib/algo-code";
import { codeFor } from "@/lib/code-layout";
import { getSimulation, holdsValue, type StepKind } from "@/lib/simulations";
import { shareQuery } from "@/lib/share-url";
import { invariantFor, staticInvariantFor } from "@/lib/invariants";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { algoName, catName } from "@/lib/content-i18n";
import CodePanel, { GROWTH_SECTION_ID } from "./code-panel";
import {
  PlaybackBridgeContext,
  type PlaybackBridge,
  type PublishedTransport,
} from "./playback-bridge";
import PlaybackDock from "./playback-dock";
import PanelSplitter from "./panel-splitter";
import { SPLIT_MIN_CANVAS_PX } from "@/lib/split-ratio";
import type { CodeLang } from "@/lib/highlight";
import { availableTabs, initialTab, tabAfterUserAdvance } from "@/lib/panel-tab";
import SortInputForm, { type InputShape } from "./sort-input-form";
import {
  SPEEDS,
  InvariantContext,
  PlaybackPanel,
  SpeedContext,
  type StepPlayer,
} from "./step-player";
import {
  hasBacktrackViz,
  hasDataStructureViz,
  hasDpViz,
  hasGraphViz,
  hasGreedyViz,
  hasMathViz,
  hasStringViz,
  hasTreeViz,
} from "@/lib/viz-families";

// Render SVG tooltips on the client so their titles hydrate correctly.
const GrowthChart = dynamic(() => import("./growth-chart"), { ssr: false });

// Each page draws one family, so the others stay out of its bundle; the one in
// use is still rendered on the server, so the first paint does not wait for it.
const CompareView = dynamic(() => import("./compare-view"));
const DataStructureViz = dynamic(() => import("./data-structure-viz"));
const GraphViz = dynamic(() => import("./graph-viz"));
const DpViz = dynamic(() => import("./dp-viz"));
const BacktrackViz = dynamic(() => import("./backtracking-viz"));
const TreeViz = dynamic(() => import("./tree-viz"));
const StringViz = dynamic(() => import("./string-viz"));
const GreedyViz = dynamic(() => import("./greedy-viz"));
const MathViz = dynamic(() => import("./math-viz"));

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

/**
 * Step-kind colours.
 *
 * `found`/`done` sit a step darker than the accent (600, not 500) because
 * `compare`/`probe` are amber: with the accent now orange, the two would
 * otherwise be neighbours on the wheel, and "being compared" versus "settled
 * in place" is the distinction the canvas exists to make. 600 against amber-400
 * is a ~26-point lightness gap, which survives being read at a glance and in
 * greyscale.
 */
const KIND_STYLES: Record<StepKind, { bar: string; dot: string }> = {
  compare: { bar: "bg-amber-400", dot: "bg-amber-400" },
  swap: { bar: "bg-rose-500", dot: "bg-rose-500" },
  shift: { bar: "bg-violet-500", dot: "bg-violet-500" },
  select: { bar: "bg-sky-500", dot: "bg-sky-500" },
  probe: { bar: "bg-amber-400", dot: "bg-amber-400" },
  found: { bar: "bg-claude-600", dot: "bg-claude-600" },
  info: { bar: "bg-zinc-400", dot: "bg-zinc-400" },
  done: { bar: "bg-claude-600", dot: "bg-claude-600" },
};

const SORT_LEGEND: { key: TKey; dot: string }[] = [
  { key: "legend.compare", dot: "bg-amber-400" },
  { key: "legend.swap", dot: "bg-rose-500" },
  { key: "legend.shift", dot: "bg-violet-500" },
  { key: "legend.select", dot: "bg-sky-500" },
  { key: "legend.sorted", dot: "bg-claude-600" },
];

const SEARCH_LEGEND: { key: TKey; dot: string }[] = [
  { key: "legend.checking", dot: "bg-amber-400" },
  { key: "legend.found", dot: "bg-claude-600" },
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

/**
 * Input shapes worth trying, not just "another random list".
 *
 * Best and worst cases only separate on particular inputs: insertion sort is
 * O(n) on sorted data and O(n²) reversed, quick sort's textbook worst case is
 * sorted input, and counting sort's cost tracks the value range rather than the
 * length. Handing those over as one click is the difference between reading
 * that and seeing it.
 */
function buildInput(shape: InputShape): number[] {
  const count = 10;
  const rand = () => 5 + Math.floor(Math.random() * 95);
  switch (shape) {
    case "sorted":
      return Array.from({ length: count }, rand).sort((a, b) => a - b);
    case "reversed":
      return Array.from({ length: count }, rand).sort((a, b) => b - a);
    case "nearly": {
      // Sorted, then two adjacent pairs swapped: the "almost done" case.
      const a = Array.from({ length: count }, rand).sort((x, y) => x - y);
      for (const i of [2, 6]) [a[i], a[i + 1]] = [a[i + 1], a[i]];
      return a;
    }
    case "equal":
      return new Array(count).fill(rand());
    case "fewUnique": {
      const pool = [rand(), rand(), rand()];
      return Array.from(
        { length: count },
        () => pool[Math.floor(Math.random() * pool.length)]
      );
    }
    case "wideRange":
      // Same length, far larger value range — counting/radix sort feel this.
      return Array.from({ length: count }, () => Math.floor(Math.random() * 999));
    default:
      return Array.from(
        { length: 8 + Math.floor(Math.random() * 5) },
        rand
      );
  }
}

interface WorkspaceProps {
  category: Pick<Category, "name" | "slug">;
  algorithm: Algorithm;
  /** Only this page's code is sent; the full table stays on the server. */
  code: AlgoCode;
  /** The About tab, rendered on the server so its text is in the initial HTML. */
  about?: ReactNode;
}

export default function Workspace({
  category,
  algorithm,
  code,
  about,
}: WorkspaceProps) {
  const { t, lang } = useLang();
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
  const [codeLang, setCodeLang] = useState<CodeLang>("c");
  const shownCode = codeFor(code, codeLang);
  const codeLines = useMemo(() => shownCode.split("\n"), [shownCode]);
  const [compareMode, setCompareMode] = useState(false);
  const restored = useRef(false);

  const hasGrowth = generator !== undefined;
  const panelTabs = availableTabs(about !== undefined);
  const [panelTab, setPanelTab] = useState(() => initialTab(panelTabs));
  const [transport, setTransport] = useState<PublishedTransport | null>(null);
  const bridge = useMemo<PlaybackBridge>(
    () => ({
      userAdvanced: () => setPanelTab(tabAfterUserAdvance),
      publish: setTransport,
    }),
    []
  );
  const activeTab = panelTabs.includes(panelTab) ? panelTab : initialTab(panelTabs);

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

  // Which view the reader prefers is a lasting preference, not per-algorithm.
  // Read after mount for the same reason LangProvider does: the server render
  // has no localStorage, so the default has to be what both sides produce.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("codeLang");
      if (saved === "c" || saved === "pseudo") setCodeLang(saved);
    } catch {
      /* localStorage unavailable — keep the default */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const pickCodeLang = (next: CodeLang) => {
    setCodeLang(next);
    try {
      localStorage.setItem("codeLang", next);
    } catch {
      /* localStorage unavailable — the choice just will not persist */
    }
  };

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

  const applyShape = (shape: InputShape) => {
    const next = buildInput(shape);
    setValues(next);
    setInputText(next.join(", "));
    // Keep the target reachable: aim at a value that is actually in the list.
    if (hasTarget) {
      const pick = next[Math.floor(next.length / 2)];
      setTarget(pick);
      setTargetText(String(pick));
    }
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
  // Pages with a step player (not the DS family) can show the mobile dock.
  const hasDock =
    customViz !== null ? customViz !== "ds" : hasInput && !asBoxes && steps !== undefined;

  const barColor = (i: number): string => {
    if (step) {
      if (step.kind === "done") return "bg-claude-600";
      if (step.highlights.includes(i)) return KIND_STYLES[step.kind].bar;
      if (step.sorted.includes(i)) return "bg-claude-600";
      // Outside the active window → eliminated / not being worked on: dim it.
      if (step.range && (i < step.range[0] || i > step.range[1]))
        return "bg-zinc-200 dark:bg-zinc-800/70";
      return "bg-zinc-300 dark:bg-zinc-700";
    }
    if (hasTarget && renderValues[i] === target) return "bg-claude-600";
    return "bg-zinc-300 dark:bg-zinc-700";
  };

  const legend = category.slug === "searching" ? SEARCH_LEGEND : SORT_LEGEND;

  // The statement that is true at this point in the run. Phase-aware for the
  // array canvas; the other families get one statement via InvariantContext,
  // since their phases are already legible from the drawing.
  const invariant = step ? invariantFor(algorithm.slug, step) : null;
  const staticInvariant = useMemo(
    () => staticInvariantFor(algorithm.slug),
    [algorithm.slug]
  );

  // Which operation counters this algorithm emits (stable across the run).
  const activeStats = useMemo(
    () => (steps ? STAT_KINDS.filter((s) => steps.some((st) => st.kind === s.kind)) : []),
    [steps]
  );
  /** Operations so far — the sum the complexity bound is about. */
  const totalOperations = useMemo(() => {
    if (!steps) return 0;
    const upto = Math.min(stepIndex, steps.length - 1);
    let total = 0;
    for (let i = 0; i <= upto; i++)
      if (STAT_KINDS.some((k) => k.kind === steps[i].kind)) total++;
    return total;
  }, [steps, stepIndex]);

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
    const query = shareQuery(
      {
        values,
        target: hasTarget ? target : undefined,
        step: Math.min(stepIndex, (steps?.length ?? 1) - 1),
      },
      {
        values: parseValues(DEFAULT_INPUT),
        target: hasTarget ? Number.parseInt(DEFAULT_TARGET, 10) : undefined,
      }
    );
    const { pathname, search } = window.location;
    if (query) {
      window.history.replaceState(null, "", `${pathname}?${query}`);
    } else if (search) {
      // Back at the defaults: drop the stale query, otherwise leave the URL alone.
      window.history.replaceState(null, "", pathname);
    }
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

  // The bar canvas rides the shared playback card; its state stays here
  // because the URL sync and the keyboard shortcuts read it too. These are the
  // user's controls, so they report the advance; applyInput's reset does not.
  const { userAdvanced } = bridge;
  const sortPlayer: StepPlayer | undefined = steps && {
    index: Math.min(stepIndex, steps.length - 1),
    playing,
    atEnd,
    toggle: () => {
      if (!playing) userAdvanced();
      togglePlay();
    },
    reset: () => {
      userAdvanced();
      reset();
    },
    stepBy: (delta: number) => {
      userAdvanced();
      stepBy(delta);
    },
    seek: (i: number) => {
      userAdvanced();
      setIsPlaying(false);
      setStepIndex(i);
    },
  };

  // Keyboard shortcuts for the shared transport: space = play/pause, ←/→ = step.
  // Skipped while a custom canvas or compare mode owns playback, and while the
  // user is typing or choosing in a field. The player is read through a ref so
  // the listener always sees fresh state (atEnd, steps) without re-subscribing.
  const shortcutsActive = !useCustomViz && !comparing && steps !== undefined;
  const transportRef = useRef(sortPlayer);
  const panelsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transportRef.current = sortPlayer;
  });
  useEffect(() => {
    if (!shortcutsActive) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      // Arrows belong to the focused tab list or splitter, not to the run.
      if (el?.closest?.('[role="tablist"],[role="separator"]')) return;
      const player = transportRef.current;
      if (!player) return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        player.toggle();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        player.stepBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        player.stepBy(1);
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

  const bars = renderValues.map((value, i) => (
    <motion.div
      key={i}
      initial={false}
      animate={{
        height: `${Math.max((value / maxValue) * 100, 6)}%`,
      }}
      transition={{ type: "tween", duration: 0.25 }}
      className={`relative flex w-full max-w-12 flex-col justify-end rounded-t-md transition-colors duration-200 ${
        step?.held?.hole === i
          ? "border-2 border-dashed border-violet-400 bg-transparent dark:border-violet-500"
          : barColor(i)
      }`}
    >
      {/* Insertion and shell sort lift a value into a local
          `key` and shift others into its slot. Without this the
          canvas shows that stale copy as a real element — two
          bars with the same value and one apparently lost. */}
      {step?.held?.hole === i && (
        <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-violet-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white shadow-sm">
          {step.held.value}
        </span>
      )}
      <span
        className={`pb-1 text-center font-mono text-[10px] ${
          barIsColored(i) ||
          (!step && hasTarget && value === target)
            ? "font-semibold text-white"
            : "text-zinc-600 dark:text-zinc-300"
        }`}
      >
        {step?.held?.hole === i ? "" : value}
      </span>
    </motion.div>
  ));

  const showGrowth = () => {
    // Reveal the hidden panel before measuring its scroll target.
    flushSync(() => setPanelTab("about"));
    document.getElementById(GROWTH_SECTION_ID)?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const sortStats =
    step && (activeStats.length > 0 || (step.vars && step.vars.length > 0)) ? (
      <>
        {activeStats.length > 0 && (
          <button
            type="button"
            onClick={showGrowth}
            title={t("stat.totalHint", {
              o: algorithm.time,
              n: values.length,
            })}
            className="inline-flex items-center gap-1.5 rounded-md border border-claude-500/30 bg-claude-500/10 px-2 py-1 text-[10px] font-medium text-claude-700 transition-colors hover:bg-claude-500/20 focus-visible:outline-2 focus-visible:outline-claude-500 dark:text-claude-300"
          >
            {t("stat.total")}
            <span className="font-mono tabular-nums font-semibold">
              {totalOperations}
            </span>
            <span className="font-mono text-claude-600/70 dark:text-claude-400/70">
              {algorithm.time}
            </span>
          </button>
        )}
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
                className="inline-flex items-center gap-1 rounded-md border border-claude-500/30 bg-claude-500/10 px-2 py-1 font-mono text-[10px] text-claude-700 dark:text-claude-300"
              >
                {v.label}
                <span className="tabular-nums font-semibold">{v.value}</span>
              </span>
            ))}
          </>
        )}
      </>
    ) : undefined;

  // One element, so the row follows the reader into compare mode and back.
  const inputRow =
    hasInput && !useCustomViz ? (
      <SortInputForm
        inputText={inputText}
        onInputText={setInputText}
        targetText={hasTarget ? targetText : undefined}
        onTargetText={hasTarget ? setTargetText : undefined}
        onApply={applyInput}
        onShape={applyShape}
        onShare={copyLink}
        copied={copied}
        maxNumbersHint={`${t("ws.maxNumbers", { n: MAX_VALUES })}${
          algorithm.sortedInput ? t("ws.autoSorted") : ""
        }`}
        compare={
          compareAvailable
            ? { active: comparing, onToggle: () => setCompareMode((c) => !c) }
            : undefined
        }
      />
    ) : undefined;

  return (
    <PlaybackBridgeContext.Provider value={bridge}>
    <SpeedContext.Provider value={{ speed, setSpeed }}>
      <InvariantContext.Provider value={staticInvariant}>
    {/* Room for the dock (h-20) plus the usual gutter, reserved from the
        first paint so the dock appearing never moves the page. */}
    <div
      className={`flex flex-col gap-4 p-4 lg:h-dvh lg:p-6 ${
        hasDock ? "pb-[calc(--spacing(24)+env(safe-area-inset-bottom))] lg:pb-6" : ""
      }`}
    >
      {/* ── Panels ──────────────────────────────────────────────── */}
      {/* lg+: the splitter column is the gutter and the ratio splits what is left, with a px floor
          so the playback card fits; 65 mirrors SPLIT_DEFAULT for a page whose boot script could not run. */}
      <div
        ref={panelsRef}
        style={{ "--split-floor": `${SPLIT_MIN_CANVAS_PX}px` } as CSSProperties}
        className="grid flex-1 grid-cols-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,max(var(--split-floor),calc((100%_-_--spacing(4))*var(--split,65)/100)))_--spacing(4)_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-0 lg:[&>[role=separator]]:col-start-2 lg:[&>[role=separator]]:row-span-2 lg:[&>[role=separator]]:row-start-1 lg:[&>section:last-child]:col-start-3 lg:[&>section:last-child]:row-start-2"
      >
        <header className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 lg:col-start-3 lg:row-start-1 dark:bg-zinc-900/60">
          <h1 className="min-w-0 wrap-break-word text-lg font-semibold tracking-tight">
            {algoName(algorithm.slug, algorithm.name, lang)}
          </h1>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {catName(category.slug, category.name, lang)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-claude-500/10 px-2.5 py-0.5 text-[11px] font-medium text-claude-600 dark:text-claude-400">
            <Clock className="size-3" /> {algorithm.time}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
            <Database className="size-3" /> {algorithm.space}
          </span>
        </header>

        {/* Visualization canvas */}
        <section
          aria-label="Visualization area"
          className="relative flex min-h-95 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:min-h-0 dark:border-zinc-800 dark:bg-zinc-900/60"
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
                  ? "bg-claude-500/10 text-claude-600 dark:text-claude-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  playing
                    ? "animate-pulse bg-claude-500"
                    : steps && atEnd
                      ? "bg-claude-500"
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
              inputRow={inputRow}
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
                {inputRow}
                <div className="flex max-w-full flex-wrap items-center justify-center gap-y-3">
                  {renderValues.map((value, i) => (
                    <span key={`${i}-${value}`} className="flex items-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex size-12 items-center justify-center rounded-xl border border-claude-500/40 bg-claude-500/10 font-mono text-sm font-medium text-claude-700 dark:text-claude-300"
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
              steps && step && sortPlayer ? (
                <PlaybackPanel
                  player={sortPlayer}
                  count={steps.length}
                  note={step.note}
                  invariant={invariant}
                  dotClass={KIND_STYLES[step.kind].dot}
                  legend={legend.map((item) => ({
                    label: t(item.key),
                    dot: item.dot,
                  }))}
                  stats={sortStats}
                  extra={inputRow}
                >
                  {/* Top padding keeps the held-value tag of a full-height bar
                      inside the panel's scroll box; only engines that lift a value pay it. */}
                  <div
                    className={`flex h-full w-full items-end justify-center gap-1.5 sm:gap-2 ${
                      holdsValue(algorithm.slug) ? "pt-6" : ""
                    }`}
                  >
                    {bars}
                  </div>
                </PlaybackPanel>
              ) : (
                <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
                  <div className="flex min-h-0 flex-1 items-end justify-center gap-1.5 sm:gap-2">
                    {bars}
                  </div>
                  <div className="mt-4">{inputRow}</div>
                  <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {hasTarget
                      ? t("ws.hint.search", { target })
                      : t("ws.hint.sort")}
                  </p>
                </div>
              )
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
                className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-claude-500/40 bg-claude-500/10 text-claude-600 dark:text-claude-400"
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

        <PanelSplitter containerRef={panelsRef} />

        <CodePanel
          tabs={panelTabs}
          activeTab={activeTab}
          onTabChange={setPanelTab}
          about={about}
          growth={
            hasGrowth && (
              <GrowthChart
                algorithm={algorithm}
                categorySlug={category.slug}
                liveValues={values}
                liveTarget={target}
              />
            )
          }
          code={code}
          codeLang={codeLang}
          onCodeLangChange={pickCodeLang}
          activeLine={activeLine}
        />
      </div>
      {transport && !comparing && <PlaybackDock transport={transport} />}
    </div>
      </InvariantContext.Provider>
    </SpeedContext.Provider>
    </PlaybackBridgeContext.Provider>
  );
}
