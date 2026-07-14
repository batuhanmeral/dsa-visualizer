"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  coinChangeSteps,
  editDistanceSteps,
  fibonacciSteps,
  knapsackSteps,
  lcsSteps,
  lisSteps,
  type DPStep,
  type KnapItem,
} from "@/lib/simulations/dp";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { ChoiceButton, PlaybackPanel, useStepPlayer } from "./step-player";

const DP_SLUGS = new Set([
  "lcs",
  "knapsack",
  "edit-distance",
  "coin-change",
  "fibonacci",
  "lis",
]);

export function hasDpViz(slug: string): boolean {
  return DP_SLUGS.has(slug);
}

/** Values at/above this render as ∞ (unreachable sentinel, e.g. coin change). */
const INF_DISPLAY = 900;
const cellText = (v: number | null): string =>
  v === null ? "·" : v >= INF_DISPLAY ? "∞" : String(v);

const LEGEND_KEYS: { key: TKey; dot: string }[] = [
  { key: "dp.legend.computing", dot: "bg-emerald-500" },
  { key: "dp.legend.readsFrom", dot: "bg-amber-400" },
  { key: "dp.legend.filled", dot: "bg-sky-500" },
];

/** Shared: build the translated legend for the DP views. */
function useDpLegend() {
  const { t } = useLang();
  return LEGEND_KEYS.map((l) => ({ label: t(l.key), dot: l.dot }));
}

// ── Shared 2-D table renderer ───────────────────────────────────────────
function DPTable({
  step,
  rowHeads,
  colHeads,
  corner,
}: {
  step: DPStep;
  rowHeads: string[];
  colHeads: string[];
  corner: string;
}) {
  const isActive = (i: number, j: number) =>
    step.active?.[0] === i && step.active?.[1] === j;
  const isDep = (i: number, j: number) =>
    step.deps.some((d) => d[0] === i && d[1] === j);

  return (
    <div className="scrollbar-slim max-w-full overflow-auto">
      <table className="border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="size-9 text-[11px] font-medium text-zinc-400">
              {corner}
            </th>
            {colHeads.map((h, j) => (
              <th
                key={j}
                className={`size-9 rounded-md text-center text-xs font-semibold ${
                  step.active?.[1] === j
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {step.table.map((row, i) => (
            <tr key={i}>
              <th
                className={`size-9 rounded-md text-center text-xs font-semibold ${
                  step.active?.[0] === i
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {rowHeads[i]}
              </th>
              {row.map((cell, j) => {
                const active = isActive(i, j);
                const dep = isDep(i, j);
                const tone = active
                  ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200"
                  : dep
                    ? "border-amber-400/70 bg-amber-400/20 text-amber-700 dark:text-amber-200"
                    : cell !== null
                      ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200"
                      : "border-zinc-200 bg-transparent text-zinc-300 dark:border-zinc-800 dark:text-zinc-700";
                return (
                  <td
                    key={j}
                    className={`size-9 rounded-md border text-center font-mono text-xs font-medium transition-colors ${tone}`}
                  >
                    {cellText(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── String-pair DP (LCS + Edit Distance share this) ─────────────────────
type StringPairGen = (
  a: string,
  b: string
) => { a: string; b: string; steps: DPStep[] };

function StringPairViz({
  speed,
  onLine,
  generate,
  defaultA,
  defaultB,
  matchKeys,
}: {
  speed: number;
  onLine: (line: number) => void;
  generate: StringPairGen;
  defaultA: string;
  defaultB: string;
  /** Badge keys for [match, noMatch] on the compared characters. */
  matchKeys: [TKey, TKey];
}) {
  const { t } = useLang();
  const legend = useDpLegend();
  const [a, setA] = useState(defaultA);
  const [b, setB] = useState(defaultB);
  const { a: ca, b: cb, steps } = useMemo(() => generate(a, b), [generate, a, b]);
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <StringField label={t("dp.stringA")} value={a} onChange={setA} />
          <StringField label={t("dp.stringB")} value={b} onChange={setB} />
          {step.match !== undefined && (
            <span
              className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                step.match
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {step.match && <Check className="size-3" />}
              {step.match ? t(matchKeys[0]) : t(matchKeys[1])}
            </span>
          )}
        </>
      }
    >
      <DPTable
        step={step}
        corner="ε"
        rowHeads={["ε", ...ca.split("")]}
        colHeads={["ε", ...cb.split("")]}
      />
    </PlaybackPanel>
  );
}

// ── Knapsack ────────────────────────────────────────────────────────────
const KNAP_ITEMS: KnapItem[] = [
  { weight: 1, value: 6 },
  { weight: 2, value: 10 },
  { weight: 3, value: 12 },
];
const KNAP_CAP = 5;

function KnapsackViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useDpLegend();
  const { items, capacity, steps } = useMemo(
    () => knapsackSteps(KNAP_ITEMS, KNAP_CAP),
    []
  );
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];
  const activeItem = step.active ? step.active[0] : 0;

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium text-zinc-400">
            {t("dp.items")}
          </span>
          {items.map((it, i) => (
            <span
              key={i}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] transition-colors ${
                activeItem === i + 1
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
              }`}
            >
              w{it.weight}·v{it.value}
            </span>
          ))}
          <span className="ml-1 text-[11px] text-zinc-400">
            {t("dp.cap", { n: capacity })}
          </span>
        </div>
      }
    >
      <DPTable
        step={step}
        corner="i\c"
        rowHeads={["∅", ...items.map((_, i) => `#${i + 1}`)]}
        colHeads={Array.from({ length: capacity + 1 }, (_, c) => String(c))}
      />
    </PlaybackPanel>
  );
}

// ── Coin Change ─────────────────────────────────────────────────────────
const COINS = [1, 3, 4];
const COIN_AMOUNT = 6;

function CoinChangeViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useDpLegend();
  const { coins, amount, steps } = useMemo(
    () => coinChangeSteps(COINS, COIN_AMOUNT),
    []
  );
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];
  const activeCoin = step.active ? step.active[0] : 0;

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium text-zinc-400">
            {t("dp.coins")}
          </span>
          {coins.map((c, i) => (
            <span
              key={i}
              className={`flex size-7 items-center justify-center rounded-full border font-mono text-[11px] transition-colors ${
                activeCoin === i + 1
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {c}
            </span>
          ))}
          <span className="ml-1 text-[11px] text-zinc-400">
            {t("dp.amount", { n: amount })}
          </span>
        </div>
      }
    >
      <DPTable
        step={step}
        corner="c\a"
        rowHeads={["∅", ...coins.map((c) => `${c}`)]}
        colHeads={Array.from({ length: amount + 1 }, (_, a) => String(a))}
      />
    </PlaybackPanel>
  );
}

// ── Fibonacci (single-row table) ────────────────────────────────────────
function FibonacciViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useDpLegend();
  const [n, setN] = useState(8);
  const { steps } = useMemo(() => fibonacciSteps(n), [n]);
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <span className="mr-1 text-[11px] font-medium text-zinc-400">
            {t("dp.n")}
          </span>
          {[6, 8, 10, 12].map((size) => (
            <ChoiceButton
              key={size}
              active={size === n}
              onClick={() => setN(size)}
            >
              {size}
            </ChoiceButton>
          ))}
        </>
      }
    >
      <DPTable
        step={step}
        corner="i"
        rowHeads={["fib"]}
        colHeads={Array.from({ length: n + 1 }, (_, i) => String(i))}
      />
    </PlaybackPanel>
  );
}

// ── Longest Increasing Subsequence (single-row table) ───────────────────
function LISViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const [text, setText] = useState("10, 9, 2, 5, 3, 7, 101, 18");
  const values = useMemo(
    () =>
      text
        .split(/[,\s]+/)
        .map((t) => Number.parseInt(t, 10))
        .filter((v) => Number.isFinite(v))
        .slice(0, 8),
    [text]
  );
  const { t } = useLang();
  const legend = useDpLegend();
  const { values: v, steps } = useMemo(
    () => lisSteps(values.length ? values : [3, 1, 2]),
    [values]
  );
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
          {t("dp.sequence")}
          <input
            type="text"
            value={text}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            className="w-56 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs text-zinc-700 outline-none focus:border-emerald-500/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          />
        </label>
      }
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {t("dp.lisNote")}
        </span>
        <DPTable
          step={step}
          corner="a"
          rowHeads={["dp"]}
          colHeads={v.map((x) => String(x))}
        />
      </div>
    </PlaybackPanel>
  );
}

function StringField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
      {label}
      <input
        type="text"
        value={value}
        maxLength={8}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wide text-zinc-700 outline-none focus:border-emerald-500/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      />
    </label>
  );
}

export default function DpViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  if (slug === "lcs")
    return (
      <StringPairViz
        speed={speed}
        onLine={onLine}
        generate={lcsSteps}
        defaultA="AGCAT"
        defaultB="GAC"
        matchKeys={["dp.match", "dp.noMatch"]}
      />
    );
  if (slug === "edit-distance")
    return (
      <StringPairViz
        speed={speed}
        onLine={onLine}
        generate={editDistanceSteps}
        defaultA="SUNDAY"
        defaultB="SATURDAY"
        matchKeys={["dp.match", "dp.charsDiffer"]}
      />
    );
  if (slug === "knapsack")
    return <KnapsackViz speed={speed} onLine={onLine} />;
  if (slug === "coin-change")
    return <CoinChangeViz speed={speed} onLine={onLine} />;
  if (slug === "fibonacci")
    return <FibonacciViz speed={speed} onLine={onLine} />;
  if (slug === "lis") return <LISViz speed={speed} onLine={onLine} />;
  return null;
}
