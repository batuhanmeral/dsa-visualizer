"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  avlSteps,
  bstSteps,
  heapSteps,
  segmentTreeSteps,
  trieSteps,
  type ArrayView,
  type NodeTone,
  type TreeStep,
} from "@/lib/simulations/trees";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { ChoiceButton, PlaybackPanel, useStepPlayer } from "./step-player";

const TREE_SLUGS = new Set(["bst", "avl", "heap", "trie", "segment-tree"]);

export function hasTreeViz(slug: string): boolean {
  return TREE_SLUGS.has(slug);
}

const LEGEND_KEYS: { key: TKey; dot: string }[] = [
  { key: "tree.legend.current", dot: "bg-emerald-500" },
  { key: "tree.legend.compare", dot: "bg-amber-400" },
  { key: "tree.legend.insert", dot: "bg-sky-500" },
  { key: "tree.legend.remove", dot: "bg-rose-500" },
  { key: "tree.legend.rotate", dot: "bg-violet-500" },
];

const NODE_TONE: Record<NodeTone, { circle: string; text: string }> = {
  idle: { circle: "fill-white stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-700", text: "fill-zinc-600 dark:fill-zinc-300" },
  current: { circle: "fill-emerald-500 stroke-emerald-500", text: "fill-white" },
  path: { circle: "fill-emerald-500/15 stroke-emerald-500/60", text: "fill-emerald-700 dark:fill-emerald-300" },
  compare: { circle: "fill-amber-400/20 stroke-amber-400", text: "fill-amber-700 dark:fill-amber-200" },
  insert: { circle: "fill-sky-500 stroke-sky-500", text: "fill-white" },
  remove: { circle: "fill-rose-500 stroke-rose-500", text: "fill-white" },
  rotate: { circle: "fill-violet-500/25 stroke-violet-500", text: "fill-violet-700 dark:fill-violet-200" },
  found: { circle: "fill-emerald-500 stroke-emerald-500", text: "fill-white" },
  result: { circle: "fill-emerald-500/20 stroke-emerald-500", text: "fill-emerald-700 dark:fill-emerald-300" },
};

const GAP_X = 52;
const GAP_Y = 72;
const NODE_R = 17;
const PAD = 28;

function TreeCanvas({ step }: { step: TreeStep }) {
  const width = PAD * 2 + Math.max(step.cols - 1, 0) * GAP_X + NODE_R * 2;
  const height = PAD * 2 + Math.max(step.depth - 1, 0) * GAP_Y + NODE_R * 2;
  const cx = (x: number) => PAD + NODE_R + x * GAP_X;
  const cy = (y: number) => PAD + NODE_R + y * GAP_Y;
  const coord = new Map(step.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto max-h-full w-auto max-w-full"
      style={{ minWidth: Math.min(width, 320) }}
    >
      {step.edges.map((e) => {
        const a = coord.get(e.from);
        const b = coord.get(e.to);
        if (!a || !b) return null;
        return (
          <motion.line
            key={`${e.from}-${e.to}`}
            initial={false}
            animate={{ x1: cx(a.x), y1: cy(a.y), x2: cx(b.x), y2: cy(b.y) }}
            className={
              e.tone === "active"
                ? "stroke-emerald-500"
                : e.tone === "path"
                  ? "stroke-emerald-500/40"
                  : "stroke-zinc-300 dark:stroke-zinc-700"
            }
            strokeWidth={e.tone === "idle" ? 1.5 : 2.5}
          />
        );
      })}
      {step.nodes.map((n) => {
        const tone = NODE_TONE[n.tone];
        return (
          <motion.g
            key={n.id}
            initial={false}
            animate={{ x: cx(n.x), y: cy(n.y) }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <circle r={NODE_R} strokeWidth={2} className={tone.circle} />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className={`font-mono text-[13px] font-semibold ${tone.text}`}
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                y={NODE_R + 11}
                textAnchor="middle"
                className="fill-zinc-400 font-mono text-[10px] dark:fill-zinc-500"
              >
                {n.sub}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

function ArrayStrip({ view }: { view: ArrayView }) {
  const inRange = (i: number) =>
    view.range ? i >= view.range[0] && i <= view.range[1] : false;
  return (
    <div className="flex flex-col items-center gap-1">
      {view.label && (
        <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {view.label}
        </span>
      )}
      <div className="flex gap-1">
        {view.values.map((v, i) => {
          const active = view.active?.includes(i);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span
                className={`flex size-8 items-center justify-center rounded-md border font-mono text-xs font-medium transition-colors ${
                  active
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200"
                    : inRange(i)
                      ? "border-amber-400/60 bg-amber-400/15 text-amber-700 dark:text-amber-200"
                      : "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {v === null ? "·" : v}
              </span>
              <span className="font-mono text-[9px] text-zinc-300 dark:text-zinc-700">
                {i}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TreeFrame({
  steps,
  speed,
  onLine,
  extra,
}: {
  steps: TreeStep[];
  speed: number;
  onLine: (line: number) => void;
  extra?: ReactNode;
}) {
  const { t } = useLang();
  const legend = LEGEND_KEYS.map((l) => ({ label: t(l.key), dot: l.dot }));
  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];

  useEffect(() => {
    if (step) onLine(step.codeLine);
  }, [step, onLine]);

  if (!step) return null;

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          {extra}
          {step.vars && (
            <div className="ml-auto flex items-center gap-1.5">
              {step.vars.map((v) => (
                <span
                  key={v.label}
                  className="rounded-md border border-zinc-200 px-2 py-1 font-mono text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
                >
                  {v.label}=
                  <span className="text-zinc-800 dark:text-zinc-200">{v.value}</span>
                </span>
              ))}
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <TreeCanvas step={step} />
        {step.arrayView && <ArrayStrip view={step.arrayView} />}
      </div>
    </PlaybackPanel>
  );
}

// ── Small input helpers ─────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  width = "w-40",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  width?: string;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
      {label}
      <input
        type="text"
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className={`${width} rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs text-zinc-700 outline-none focus:border-emerald-500/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200`}
      />
    </label>
  );
}

const parseNums = (text: string, max = 12): number[] =>
  text
    .split(/[,\s]+/)
    .map((t) => Number.parseInt(t, 10))
    .filter((n) => Number.isFinite(n))
    .slice(0, max);

// ── Per-algorithm wrappers ──────────────────────────────────────────────
function BSTViz({ speed, onLine }: { speed: number; onLine: (l: number) => void }) {
  const { t } = useLang();
  const [seq, setSeq] = useState("50, 30, 70, 20, 40, 60, 80");
  const [search, setSearch] = useState("40");
  const [del, setDel] = useState("30");
  const steps = useMemo(() => {
    const s = parseNums(seq);
    return bstSteps(
      s.length ? s : [50, 30, 70],
      Number.parseInt(search, 10) || 0,
      Number.parseInt(del, 10) || 0
    );
  }, [seq, search, del]);
  return (
    <TreeFrame
      steps={steps}
      speed={speed}
      onLine={onLine}
      extra={
        <>
          <Field label={t("tree.insert")} value={seq} onChange={setSeq} width="w-56" />
          <Field label={t("tree.search")} value={search} onChange={setSearch} width="w-14" />
          <Field label={t("tree.delete")} value={del} onChange={setDel} width="w-14" />
        </>
      }
    />
  );
}

function AVLViz({ speed, onLine }: { speed: number; onLine: (l: number) => void }) {
  const { t } = useLang();
  const [seq, setSeq] = useState("10, 20, 30, 40, 50, 25");
  const steps = useMemo(() => {
    const s = parseNums(seq);
    return avlSteps(s.length ? s : [10, 20, 30]);
  }, [seq]);
  return (
    <TreeFrame
      steps={steps}
      speed={speed}
      onLine={onLine}
      extra={<Field label={t("tree.insert")} value={seq} onChange={setSeq} width="w-56" />}
    />
  );
}

function HeapViz({ speed, onLine }: { speed: number; onLine: (l: number) => void }) {
  const { t } = useLang();
  const [seq, setSeq] = useState("15, 40, 30, 50, 20, 60, 45");
  const [pops, setPops] = useState(2);
  const steps = useMemo(() => {
    const s = parseNums(seq);
    return heapSteps(s.length ? s : [15, 40, 30], pops);
  }, [seq, pops]);
  return (
    <TreeFrame
      steps={steps}
      speed={speed}
      onLine={onLine}
      extra={
        <>
          <Field label={t("tree.push")} value={seq} onChange={setSeq} width="w-56" />
          <span className="text-[11px] font-medium text-zinc-400">{t("tree.pops")}</span>
          {[0, 1, 2, 3].map((p) => (
            <ChoiceButton key={p} active={p === pops} onClick={() => setPops(p)}>
              {p}
            </ChoiceButton>
          ))}
        </>
      }
    />
  );
}

function TrieViz({ speed, onLine }: { speed: number; onLine: (l: number) => void }) {
  const { t } = useLang();
  const [words, setWords] = useState("CAT, CAR, CARD, DOG, DO");
  const [query, setQuery] = useState("CARD");
  const steps = useMemo(() => {
    const list = words
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase().replace(/[^a-z]/g, ""))
      .filter(Boolean)
      .slice(0, 8);
    return trieSteps(list.length ? list : ["cat"], query.toLowerCase().replace(/[^a-z]/g, ""));
  }, [words, query]);
  return (
    <TreeFrame
      steps={steps}
      speed={speed}
      onLine={onLine}
      extra={
        <>
          <Field label={t("tree.words")} value={words} onChange={setWords} width="w-56" />
          <Field label={t("tree.search")} value={query} onChange={setQuery} width="w-24" />
        </>
      }
    />
  );
}

function SegmentTreeViz({ speed, onLine }: { speed: number; onLine: (l: number) => void }) {
  const { t } = useLang();
  const [arr, setArr] = useState("2, 5, 1, 4, 9, 3, 7, 6");
  const [lo, setLo] = useState("2");
  const [hi, setHi] = useState("5");
  const steps = useMemo(() => {
    const a = parseNums(arr, 8);
    const values = a.length ? a : [2, 5, 1, 4];
    const n = values.length;
    const l = Math.max(0, Math.min(Number.parseInt(lo, 10) || 0, n - 1));
    const r = Math.max(l, Math.min(Number.parseInt(hi, 10) || 0, n - 1));
    return segmentTreeSteps(values, l, r);
  }, [arr, lo, hi]);
  return (
    <TreeFrame
      steps={steps}
      speed={speed}
      onLine={onLine}
      extra={
        <>
          <Field label={t("tree.array")} value={arr} onChange={setArr} width="w-52" />
          <Field label={t("tree.queryLo")} value={lo} onChange={setLo} width="w-12" />
          <Field label={t("tree.queryHi")} value={hi} onChange={setHi} width="w-12" />
        </>
      }
    />
  );
}

export default function TreeViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  if (slug === "bst") return <BSTViz speed={speed} onLine={onLine} />;
  if (slug === "avl") return <AVLViz speed={speed} onLine={onLine} />;
  if (slug === "heap") return <HeapViz speed={speed} onLine={onLine} />;
  if (slug === "trie") return <TrieViz speed={speed} onLine={onLine} />;
  if (slug === "segment-tree")
    return <SegmentTreeViz speed={speed} onLine={onLine} />;
  return null;
}
