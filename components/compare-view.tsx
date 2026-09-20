"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import type { Algorithm } from "@/lib/data";
import { getSimulation, type SimulationStep, type StepKind } from "@/lib/simulations";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { algoName } from "@/lib/content-i18n";
import { ChoiceButton, PlaybackPanel, useStepPlayer } from "./step-player";

/**
 * Race two algorithms from the same category on one shared input and a single
 * timeline. Each side runs its own precomputed `SimulationStep[]`; the global
 * step index (from `useStepPlayer`) drives both, clamped independently, so the
 * one that finishes in fewer steps "wins". Reuses the sorting/searching step
 * model — the left side is the page's algorithm, the right side is selectable
 * among its siblings (matched on `inputKind` by the caller).
 */

const KIND_BAR: Record<StepKind, string> = {
  compare: "bg-amber-400",
  swap: "bg-rose-500",
  shift: "bg-violet-500",
  select: "bg-sky-500",
  probe: "bg-amber-400",
  found: "bg-emerald-500",
  info: "bg-zinc-300 dark:bg-zinc-700",
  done: "bg-emerald-500",
};

const STAT_KINDS: { kind: StepKind; key: TKey }[] = [
  { kind: "compare", key: "stat.comparisons" },
  { kind: "swap", key: "stat.swaps" },
  { kind: "shift", key: "stat.moves" },
  { kind: "probe", key: "stat.probes" },
];

function barClass(step: SimulationStep, i: number): string {
  if (step.kind === "done" || step.sorted.includes(i)) return "bg-emerald-500";
  if (step.highlights.includes(i)) return KIND_BAR[step.kind];
  if (step.range && (i < step.range[0] || i > step.range[1]))
    return "bg-zinc-200 dark:bg-zinc-800/70";
  return "bg-zinc-300 dark:bg-zinc-700";
}

function runningCounts(steps: SimulationStep[], upto: number) {
  const counts = {} as Partial<Record<StepKind, number>>;
  for (let i = 0; i <= upto && i < steps.length; i++) {
    const k = steps[i].kind;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

function Racer({
  name,
  steps,
  index,
  maxValue,
  outcome,
}: {
  name: string;
  steps: SimulationStep[];
  index: number;
  maxValue: number;
  /** "win" | "lose" | "tie" once the race ends, else null. */
  outcome: "win" | "lose" | "tie" | null;
}) {
  const { t, tn } = useLang();
  const clamped = Math.min(index, steps.length - 1);
  const step = steps[clamped];
  const done = index >= steps.length - 1;
  const counts = runningCounts(steps, clamped);
  const activeStats = STAT_KINDS.filter((s) => steps.some((st) => st.kind === s.kind));

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-zinc-200 bg-white/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
          {outcome === "win" && (
            <Trophy className="size-3.5 shrink-0 text-amber-500" />
          )}
          <span className="truncate">{name}</span>
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${
            outcome === "win"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : done
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {t("cmp.steps", { n: steps.length })}
        </span>
      </div>

      <div className="mt-3 flex h-32 items-end justify-center gap-1 sm:gap-1.5">
        {step.array.map((value, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ height: `${Math.max((value / maxValue) * 100, 6)}%` }}
            transition={{ type: "tween", duration: 0.25 }}
            className={`w-full max-w-8 rounded-t-sm transition-colors duration-200 ${barClass(step, i)}`}
          />
        ))}
      </div>

      <p className="mt-2.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
        {tn(step.note)}
      </p>

      {activeStats.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {activeStats.map((s) => (
            <span
              key={s.kind}
              className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {t(s.key)}
              <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {counts[s.kind] ?? 0}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompareView({
  left,
  opponents,
  values,
  target,
  speed,
  onLine,
}: {
  left: Algorithm;
  opponents: Algorithm[];
  values: number[];
  target: number;
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t, lang } = useLang();
  const [rightSlug, setRightSlug] = useState(opponents[0]?.slug ?? "");
  const right =
    opponents.find((o) => o.slug === rightSlug) ?? opponents[0];
  const leftName = algoName(left.slug, left.name, lang);
  const rightName = algoName(right.slug, right.name, lang);

  const genLeft = getSimulation(left.slug);
  const genRight = getSimulation(right.slug);

  const stepsLeft = useMemo(
    () => (genLeft ? genLeft(values, target) : []),
    [genLeft, values, target]
  );
  const stepsRight = useMemo(
    () => (genRight ? genRight(values, target) : []),
    [genRight, values, target]
  );

  const maxLen = Math.max(stepsLeft.length, stepsRight.length, 1);
  // Both lists identify the run: either one changing means a different race.
  const race = useMemo(() => [stepsLeft, stepsRight], [stepsLeft, stepsRight]);
  const player = useStepPlayer(maxLen, speed, race);
  const { index } = player;

  // Drive the code viewer from the left (page) algorithm's current line.
  const leftLine = stepsLeft[Math.min(index, stepsLeft.length - 1)]?.codeLine ?? 0;
  useEffect(() => {
    onLine(leftLine);
  }, [leftLine, onLine]);

  const maxValue = Math.max(...values, 1);

  // Winner = fewer total steps; only revealed once the race reaches the end.
  const finished = index >= maxLen - 1;
  let leftOutcome: "win" | "lose" | "tie" | null = null;
  let rightOutcome: "win" | "lose" | "tie" | null = null;
  if (finished) {
    if (stepsLeft.length === stepsRight.length) {
      leftOutcome = rightOutcome = "tie";
    } else if (stepsLeft.length < stepsRight.length) {
      leftOutcome = "win";
      rightOutcome = "lose";
    } else {
      leftOutcome = "lose";
      rightOutcome = "win";
    }
  }

  const note = !finished
    ? t("cmp.racing", { a: leftName, b: rightName })
    : leftOutcome === "tie"
      ? t("cmp.tie", { n: stepsLeft.length })
      : t("cmp.wins", {
          name: stepsLeft.length < stepsRight.length ? leftName : rightName,
          a: Math.min(stepsLeft.length, stepsRight.length),
          b: Math.max(stepsLeft.length, stepsRight.length),
        });

  const selector = (
    <>
      <span className="text-[11px] font-medium text-zinc-400">{t("cmp.vs")}</span>
      {opponents.map((o) => (
        <ChoiceButton
          key={o.slug}
          active={o.slug === right.slug}
          onClick={() => setRightSlug(o.slug)}
        >
          {algoName(o.slug, o.name, lang)}
        </ChoiceButton>
      ))}
    </>
  );

  return (
    <PlaybackPanel player={player} count={maxLen} note={note} extra={selector}>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        <Racer
          name={leftName}
          steps={stepsLeft}
          index={index}
          maxValue={maxValue}
          outcome={leftOutcome}
        />
        <Racer
          name={rightName}
          steps={stepsRight}
          index={index}
          maxValue={maxValue}
          outcome={rightOutcome}
        />
      </div>
    </PlaybackPanel>
  );
}
