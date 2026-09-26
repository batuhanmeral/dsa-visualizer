"use client";

import { useEffect, useMemo, useState } from "react";
import {
  activitySelectionSteps,
  fractionalKnapsackSteps,
  huffmanSteps,
  jobSequencingSteps,
  type Activity,
  type FracItem,
  type HuffNode,
  type Job,
} from "@/lib/simulations/greedy";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { PlaybackPanel, useStepPlayer } from "./step-player";

const GREEDY_SLUGS = new Set([
  "activity-selection",
  "fractional-knapsack",
  "job-sequencing",
  "huffman-coding",
]);

export function hasGreedyViz(slug: string): boolean {
  return GREEDY_SLUGS.has(slug);
}

const PICK_LEGEND: { key: TKey; dot: string }[] = [
  { key: "greedy.legend.considering", dot: "bg-amber-400" },
  { key: "greedy.legend.selected", dot: "bg-claude-500" },
  { key: "greedy.legend.rejected", dot: "bg-rose-500" },
];

function useGreedyLegend(keys: { key: TKey; dot: string }[]) {
  const { t } = useLang();
  return keys.map((l) => ({ label: t(l.key), dot: l.dot }));
}

// ── Activity Selection ──────────────────────────────────────────────────
const ACTIVITIES: Activity[] = [
  { start: 1, end: 2 },
  { start: 3, end: 4 },
  { start: 0, end: 6 },
  { start: 5, end: 7 },
  { start: 8, end: 9 },
  { start: 5, end: 9 },
  { start: 6, end: 10 },
  { start: 8, end: 11 },
];

function ActivityViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useGreedyLegend(PICK_LEGEND);
  const { activities, steps } = useMemo(
    () => activitySelectionSteps(ACTIVITIES),
    []
  );
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];
  const maxEnd = Math.max(...activities.map((a) => a.end));

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const tone = (i: number): string => {
    if (step.selected.includes(i))
      return "border-claude-500/70 bg-claude-500/25 text-claude-700 dark:text-claude-200";
    if (step.rejected.includes(i))
      return "border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-300 opacity-70";
    if (step.current === i)
      return "border-amber-400/80 bg-amber-400/25 text-amber-700 dark:text-amber-200";
    return "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-400";
  };

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <span className="text-[11px] font-medium text-zinc-400">
          {t("greedy.activityHint")}
        </span>
      }
    >
      <div className="w-full max-w-xl">
        {/* Time axis */}
        <div className="relative mb-1 h-4 font-mono text-[9px] text-zinc-400">
          {Array.from({ length: maxEnd + 1 }, (_, tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2"
              style={{ left: `${(tick / maxEnd) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="relative flex flex-col gap-1.5 border-l border-zinc-200 dark:border-zinc-800">
          {/* Greedy frontier: finish time of the last selected activity */}
          {step.lastFinish !== null && (
            <div
              className="absolute inset-y-0 z-10 w-px bg-claude-500/70 transition-all duration-300"
              style={{ left: `${(step.lastFinish / maxEnd) * 100}%` }}
            />
          )}
          {activities.map((a, i) => (
            <div key={i} className="relative h-7">
              <div
                className={`absolute inset-y-0 flex items-center justify-center rounded-md border font-mono text-[10px] font-medium transition-colors ${tone(i)}`}
                style={{
                  left: `${(a.start / maxEnd) * 100}%`,
                  width: `${((a.end - a.start) / maxEnd) * 100}%`,
                }}
              >
                {a.start}–{a.end}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PlaybackPanel>
  );
}

// ── Fractional Knapsack ─────────────────────────────────────────────────
const FRAC_ITEMS: FracItem[] = [
  { weight: 10, value: 60 },
  { weight: 20, value: 100 },
  { weight: 30, value: 120 },
];
const FRAC_CAP = 50;

function FracKnapViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useGreedyLegend([
    { key: "greedy.legend.considering", dot: "bg-amber-400" },
    { key: "greedy.legend.taken", dot: "bg-claude-500" },
    { key: "greedy.legend.fraction", dot: "bg-sky-500" },
  ]);
  const { items, capacity, steps } = useMemo(
    () => fractionalKnapsackSteps(FRAC_ITEMS, FRAC_CAP),
    []
  );
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const takenOf = (i: number) => step.taken.find((tk) => tk.index === i);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <span className="text-[11px] font-medium text-zinc-400">
            {t("greedy.capacity", { n: capacity })}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-claude-500/30 bg-claude-500/10 px-2 py-1 font-mono text-[11px] text-claude-700 dark:text-claude-300">
            {t("greedy.total")}
            <span className="font-semibold tabular-nums">
              {Number.isInteger(step.total)
                ? step.total
                : step.total.toFixed(1)}
            </span>
          </span>
        </>
      }
    >
      <div className="flex w-full max-w-lg flex-col gap-6">
        {/* Items, best ratio first */}
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((it, i) => {
            const tk = takenOf(i);
            const active = step.current === i;
            const tone = tk
              ? tk.fraction === 1
                ? "border-claude-500/70 bg-claude-500/15"
                : "border-sky-500/70 bg-sky-500/15"
              : active
                ? "border-amber-400/80 bg-amber-400/15"
                : "border-zinc-200 dark:border-zinc-800";
            return (
              <div
                key={i}
                className={`flex w-28 flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${tone}`}
              >
                <span className="font-mono text-xs font-semibold">
                  w{it.weight} · v{it.value}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {(it.value / it.weight).toFixed(1)}/kg
                </span>
                <span className="text-[10px] font-medium">
                  {tk
                    ? tk.fraction === 1
                      ? "100%"
                      : `${Math.round(tk.fraction * 100)}%`
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bag fill bar */}
        <div>
          <div className="mb-1 flex justify-between font-mono text-[10px] text-zinc-400">
            <span>{t("greedy.bag")}</span>
            <span>
              {capacity - step.remaining}/{capacity}
            </span>
          </div>
          <div className="flex h-6 w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            {step.taken.map((tk) => {
              const it = items[tk.index];
              const w = it.weight * tk.fraction;
              return (
                <div
                  key={tk.index}
                  className={`flex items-center justify-center font-mono text-[9px] font-medium text-white transition-all duration-300 ${
                    tk.fraction === 1 ? "bg-claude-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${(w / capacity) * 100}%` }}
                >
                  {tk.fraction === 1
                    ? it.weight
                    : `${Math.round(tk.fraction * 100)}%`}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PlaybackPanel>
  );
}

// ── Job Sequencing ──────────────────────────────────────────────────────
const JOBS: Job[] = [
  { id: "A", deadline: 2, profit: 100 },
  { id: "B", deadline: 1, profit: 19 },
  { id: "C", deadline: 2, profit: 27 },
  { id: "D", deadline: 1, profit: 25 },
  { id: "E", deadline: 3, profit: 15 },
];

function JobSeqViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useGreedyLegend(PICK_LEGEND);
  const { jobs, steps } = useMemo(() => jobSequencingSteps(JOBS), []);
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const jobTone = (i: number): string => {
    if (step.scheduled.includes(i))
      return "border-claude-500/70 bg-claude-500/15 text-claude-700 dark:text-claude-300";
    if (step.skipped.includes(i))
      return "border-rose-500/50 bg-rose-500/10 text-rose-600 opacity-70 dark:text-rose-300";
    if (step.current === i)
      return "border-amber-400/80 bg-amber-400/15 text-amber-700 dark:text-amber-200";
    return "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400";
  };

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <span className="text-[11px] font-medium text-zinc-400">
            {t("greedy.jobsHint")}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-md border border-claude-500/30 bg-claude-500/10 px-2 py-1 font-mono text-[11px] text-claude-700 dark:text-claude-300">
            {t("greedy.total")}
            <span className="font-semibold tabular-nums">{step.total}</span>
          </span>
        </>
      }
    >
      <div className="flex flex-col items-center gap-8">
        {/* Jobs, highest profit first */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className={`flex w-20 flex-col items-center rounded-xl border px-2 py-2 transition-colors ${jobTone(i)}`}
            >
              <span className="text-sm font-semibold">{job.id}</span>
              <span className="font-mono text-[10px]">d≤{job.deadline}</span>
              <span className="font-mono text-[10px]">+{job.profit}</span>
            </div>
          ))}
        </div>

        {/* Hour slots */}
        <div className="flex gap-2">
          {step.slots.map((jobIdx, s) => {
            const hour = s + 1;
            const probing = step.probe === hour;
            const tone =
              jobIdx !== null
                ? "border-claude-500/70 bg-claude-500/15 text-claude-700 dark:text-claude-300"
                : probing
                  ? "border-amber-400/80 bg-amber-400/15 text-amber-700 dark:text-amber-200"
                  : "border-dashed border-zinc-300 text-zinc-300 dark:border-zinc-700 dark:text-zinc-600";
            return (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-14 items-center justify-center rounded-xl border text-lg font-semibold transition-colors ${tone}`}
                >
                  {jobIdx !== null ? jobs[jobIdx].id : "·"}
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  {t("greedy.hour")} {hour}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PlaybackPanel>
  );
}

// ── Huffman Coding ──────────────────────────────────────────────────────
const HUFF_DEFAULT_TEXT = "ABRACADABRA";
const SLOT_W = 60;
const LEVEL_H = 54;
const PAD = 26;
const R = 16;

/** Bottom-aligned forest layout: leaves on the last row, parents above. */
function layoutForest(nodes: Record<number, HuffNode>, roots: number[]) {
  let slot = 0;
  const pos = new Map<number, { x: number; h: number }>();
  const walk = (id: number): { x: number; h: number } => {
    const n = nodes[id];
    if (n.left === null || n.right === null) {
      const p = { x: slot++, h: 0 };
      pos.set(id, p);
      return p;
    }
    const l = walk(n.left);
    const r = walk(n.right);
    const p = { x: (l.x + r.x) / 2, h: Math.max(l.h, r.h) + 1 };
    pos.set(id, p);
    return p;
  };
  let maxH = 0;
  for (const r of roots) maxH = Math.max(maxH, walk(r).h);
  return { pos, slots: slot, maxH };
}

function textToFreqs(text: string): { ch: string; freq: number }[] {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 24);
  const counts = new Map<string, number>();
  for (const ch of clean) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const freqs = [...counts.entries()].map(([ch, freq]) => ({ ch, freq }));
  // Need ≥2 distinct characters for a meaningful tree; cap at 8 leaves.
  if (freqs.length < 2) return textToFreqs(HUFF_DEFAULT_TEXT);
  return freqs.sort((a, b) => b.freq - a.freq).slice(0, 8);
}

function HuffmanViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useGreedyLegend([
    { key: "greedy.legend.picked", dot: "bg-amber-400" },
    { key: "greedy.legend.merged", dot: "bg-claude-500" },
    { key: "greedy.legend.codeEmitted", dot: "bg-sky-500" },
  ]);
  const [text, setText] = useState(HUFF_DEFAULT_TEXT);
  const { steps } = useMemo(() => huffmanSteps(textToFreqs(text)), [text]);
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const { pos, slots, maxH } = useMemo(
    () => layoutForest(step.nodes, step.roots),
    [step]
  );
  const width = slots * SLOT_W + PAD * 2;
  const height = maxH * LEVEL_H + PAD * 2 + 24;
  const px = (x: number) => PAD + x * SLOT_W + SLOT_W / 2;
  const py = (h: number) => PAD + (maxH - h) * LEVEL_H;

  const nodeTone = (id: number): string => {
    if (step.highlight.includes(id))
      return step.phase === "pick"
        ? "fill-amber-400/25 stroke-amber-500"
        : step.phase === "code"
          ? "fill-sky-500/25 stroke-sky-500"
          : "fill-claude-500/25 stroke-claude-500";
    return "fill-zinc-100 stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-700";
  };

  // Every node reachable from the current roots.
  const visible: number[] = [];
  const collect = (id: number) => {
    visible.push(id);
    const n = step.nodes[id];
    if (n.left !== null) collect(n.left);
    if (n.right !== null) collect(n.right);
  };
  for (const r of step.roots) collect(r);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            {t("greedy.text")}
            <input
              type="text"
              value={text}
              maxLength={24}
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
              className="w-44 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wide text-zinc-700 outline-none focus:border-claude-500/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
            />
          </label>
          {Object.keys(step.codes).length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-400">
                {t("greedy.codes")}
              </span>
              {Object.entries(step.codes).map(([ch, code]) => (
                <span
                  key={ch}
                  className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-700 dark:text-sky-300"
                >
                  {ch}={code}
                </span>
              ))}
            </div>
          )}
        </>
      }
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="max-h-full w-full max-w-2xl"
        role="img"
        aria-label="Huffman forest"
      >
        {/* Edges (0 = left, 1 = right) */}
        {visible.map((id) => {
          const n = step.nodes[id];
          if (n.left === null || n.right === null) return null;
          const p = pos.get(id);
          if (!p) return null;
          return [n.left, n.right].map((childId, k) => {
            const c = pos.get(childId);
            if (!c) return null;
            const x1 = px(p.x);
            const y1 = py(p.h);
            const x2 = px(c.x);
            const y2 = py(c.h);
            return (
              <g key={`${id}-${childId}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-zinc-300 dark:stroke-zinc-700"
                  strokeWidth={1.5}
                />
                <text
                  x={(x1 + x2) / 2 + (k === 0 ? -7 : 7)}
                  y={(y1 + y2) / 2}
                  textAnchor="middle"
                  className="fill-zinc-400 font-mono text-[9px]"
                >
                  {k}
                </text>
              </g>
            );
          });
        })}

        {/* Nodes */}
        {visible.map((id) => {
          const n = step.nodes[id];
          const p = pos.get(id);
          if (!p) return null;
          const x = px(p.x);
          const y = py(p.h);
          const leaf = n.left === null && n.right === null;
          return (
            <g key={id}>
              <circle
                cx={x}
                cy={y}
                r={R}
                strokeWidth={1.5}
                className={`transition-colors ${nodeTone(id)}`}
              />
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                className="fill-zinc-700 font-mono text-[10px] font-semibold dark:fill-zinc-200"
              >
                {n.freq}
              </text>
              {leaf && (
                <text
                  x={x}
                  y={y + R + 13}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono text-[11px] font-semibold dark:fill-zinc-400"
                >
                  {n.ch}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </PlaybackPanel>
  );
}

export default function GreedyViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  if (slug === "activity-selection")
    return <ActivityViz speed={speed} onLine={onLine} />;
  if (slug === "fractional-knapsack")
    return <FracKnapViz speed={speed} onLine={onLine} />;
  if (slug === "job-sequencing")
    return <JobSeqViz speed={speed} onLine={onLine} />;
  if (slug === "huffman-coding")
    return <HuffmanViz speed={speed} onLine={onLine} />;
  return null;
}
