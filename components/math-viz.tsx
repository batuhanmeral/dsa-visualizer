"use client";

import { useEffect, useMemo, useState } from "react";
import {
  extGcdSteps,
  fastPowSteps,
  gcdSteps,
  sieveSteps,
} from "@/lib/simulations/math";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { ChoiceButton, PlaybackPanel, useStepPlayer } from "./step-player";

const MATH_SLUGS = new Set([
  "sieve-of-eratosthenes",
  "euclidean-gcd",
  "extended-euclidean",
  "fast-exponentiation",
]);

export function hasMathViz(slug: string): boolean {
  return MATH_SLUGS.has(slug);
}

function useMathLegend(keys: { key: TKey; dot: string }[]) {
  const { t } = useLang();
  return keys.map((l) => ({ label: t(l.key), dot: l.dot }));
}

// ── Sieve of Eratosthenes ───────────────────────────────────────────────
const SIEVE_SIZES = [30, 60, 100] as const;

function SieveViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useMathLegend([
    { key: "math.legend.prime", dot: "bg-claude-500" },
    { key: "math.legend.crossing", dot: "bg-rose-500" },
    { key: "math.legend.crossed", dot: "bg-zinc-300 dark:bg-zinc-700" },
  ]);
  const [n, setN] = useState<number>(60);
  const { steps } = useMemo(() => sieveSteps(n), [n]);
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const cellTone = (i: number): string => {
    if (step.m === i)
      return "border-rose-500/70 bg-rose-500/25 text-rose-700 dark:text-rose-200";
    if (step.p === i)
      return "border-claude-500 bg-claude-500/25 text-claude-700 ring-1 ring-claude-500/60 dark:text-claude-200";
    const s = step.status[i];
    if (s === "prime")
      return "border-claude-500/50 bg-claude-500/10 text-claude-700 dark:text-claude-300";
    if (s === "crossed")
      return "border-zinc-200 bg-zinc-100 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-700";
    return "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300";
  };

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <span className="mr-1 text-[11px] font-medium text-zinc-400">
            {t("math.n")}
          </span>
          {SIEVE_SIZES.map((size) => (
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
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
      >
        {Array.from({ length: n - 1 }, (_, k) => {
          const i = k + 2;
          return (
            <div
              key={i}
              className={`flex size-8 items-center justify-center rounded-md border font-mono text-[11px] font-medium transition-colors sm:size-9 ${cellTone(i)}`}
            >
              {i}
            </div>
          );
        })}
      </div>
    </PlaybackPanel>
  );
}

// ── Euclidean GCD ───────────────────────────────────────────────────────
function NumField({
  label,
  value,
  onChange,
  width = "w-20",
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
        inputMode="numeric"
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        className={`${width} rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs text-zinc-700 outline-none focus:border-claude-500/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200`}
      />
    </label>
  );
}

const parseNum = (text: string, fallback: number, max: number): number => {
  const v = Number.parseInt(text, 10);
  return Number.isFinite(v) && v >= 1 && v <= max ? v : fallback;
};

function GcdViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const [aText, setAText] = useState("252");
  const [bText, setBText] = useState("105");
  const a = parseNum(aText, 252, 99999);
  const b = parseNum(bText, 105, 99999);
  const { steps } = useMemo(() => gcdSteps(a, b), [a, b]);
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      extra={
        <>
          <NumField label={t("math.a")} value={aText} onChange={setAText} />
          <NumField label={t("math.b")} value={bText} onChange={setBText} />
        </>
      }
    >
      <div className="flex flex-col items-center gap-5">
        {/* Current pair */}
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-zinc-400">gcd(</span>
          <span className="rounded-lg border border-claude-500/50 bg-claude-500/10 px-3 py-1.5 font-semibold text-claude-700 dark:text-claude-300">
            {step.a}
          </span>
          <span className="text-zinc-400">,</span>
          <span
            className={`rounded-lg border px-3 py-1.5 font-semibold ${
              step.b === 0
                ? "border-zinc-200 text-zinc-400 dark:border-zinc-800"
                : "border-amber-400/60 bg-amber-400/10 text-amber-700 dark:text-amber-200"
            }`}
          >
            {step.b}
          </span>
          <span className="text-zinc-400">)</span>
        </div>

        {/* Division chain */}
        <div className="flex flex-col gap-1.5">
          {step.rows.map((row, i) => {
            const isLast = i === step.rows.length - 1;
            return (
              <div
                key={i}
                className={`rounded-lg border px-4 py-1.5 text-center font-mono text-xs transition-colors ${
                  isLast && step.result === undefined
                    ? "border-amber-400/60 bg-amber-400/10 text-amber-700 dark:text-amber-200"
                    : "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
                }`}
              >
                {row.a} = {row.q}·{row.b} +{" "}
                <span
                  className={
                    row.r === 0
                      ? "font-semibold text-zinc-400"
                      : "font-semibold text-claude-600 dark:text-claude-400"
                  }
                >
                  {row.r}
                </span>
              </div>
            );
          })}
        </div>

        {step.result !== undefined && (
          <div className="rounded-xl border border-claude-500/50 bg-claude-500/10 px-5 py-2 font-mono text-sm font-semibold text-claude-700 dark:text-claude-300">
            gcd = {step.result}
          </div>
        )}
      </div>
    </PlaybackPanel>
  );
}

// ── Extended Euclid ─────────────────────────────────────────────────────
function ExtGcdViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const [aText, setAText] = useState("240");
  const [bText, setBText] = useState("46");
  const a = parseNum(aText, 240, 99999);
  const b = parseNum(bText, 46, 99999);
  const { steps } = useMemo(() => extGcdSteps(a, b), [a, b]);
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      extra={
        <>
          <NumField label={t("math.a")} value={aText} onChange={setAText} />
          <NumField label={t("math.b")} value={bText} onChange={setBText} />
          <span className="ml-auto text-[11px] text-zinc-400">
            {t("math.extNote")}
          </span>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <table className="border-separate border-spacing-x-3 border-spacing-y-1 font-mono text-xs">
          <thead>
            <tr className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              <th className="text-right">q</th>
              <th className="text-right">r</th>
              <th className="text-right">s</th>
              <th className="text-right">t</th>
            </tr>
          </thead>
          <tbody>
            {step.rows.map((row, i) => {
              const isLast = i === step.rows.length - 1 && i > 1;
              const isGcdRow =
                step.result !== undefined && i === step.rows.length - 2;
              return (
                <tr
                  key={i}
                  className={
                    isGcdRow
                      ? "text-claude-700 dark:text-claude-300"
                      : isLast
                        ? "text-amber-700 dark:text-amber-200"
                        : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  <td className="text-right text-zinc-400">{row.q ?? "—"}</td>
                  <td
                    className={`rounded-md border px-2 py-0.5 text-right tabular-nums ${
                      isGcdRow
                        ? "border-claude-500/60 bg-claude-500/10 font-semibold"
                        : isLast
                          ? "border-amber-400/60 bg-amber-400/10"
                          : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {row.r}
                  </td>
                  <td className="text-right tabular-nums">{row.s}</td>
                  <td className="text-right tabular-nums">{row.t}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {step.result && (
          <div className="rounded-xl border border-claude-500/50 bg-claude-500/10 px-5 py-2 font-mono text-sm font-semibold text-claude-700 dark:text-claude-300">
            gcd = {step.result.g} = {step.result.x}·{a} + {step.result.y}·{b}
          </div>
        )}
      </div>
    </PlaybackPanel>
  );
}

// ── Fast exponentiation ─────────────────────────────────────────────────
function PowViz({
  speed,
  onLine,
}: {
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const legend = useMathLegend([
    { key: "math.legend.currentBit", dot: "bg-amber-400" },
    { key: "math.legend.doneBit", dot: "bg-zinc-300 dark:bg-zinc-700" },
  ]);
  const [baseText, setBaseText] = useState("3");
  const [expText, setExpText] = useState("13");
  const [modText, setModText] = useState("100");
  const base = parseNum(baseText, 3, 999);
  const exp = parseNum(expText, 13, 9999);
  const mod = Math.max(2, parseNum(modText, 100, 99999));
  const { steps } = useMemo(
    () => fastPowSteps(base, exp, mod),
    [base, exp, mod]
  );
  const player = useStepPlayer(steps.length, speed, steps);
  const step = steps[player.index];

  useEffect(() => {
    onLine(step.codeLine);
  }, [step.codeLine, onLine]);

  const doneCount = step.rows.length;

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      legend={legend}
      extra={
        <>
          <NumField
            label={t("math.base")}
            value={baseText}
            onChange={setBaseText}
            width="w-14"
          />
          <NumField
            label={t("math.exp")}
            value={expText}
            onChange={setExpText}
            width="w-14"
          />
          <NumField
            label={t("math.mod")}
            value={modText}
            onChange={setModText}
            width="w-16"
          />
        </>
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* Exponent bits, MSB → LSB (processed right to left) */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] text-zinc-400">
            {exp} = {exp.toString(2)}₂
          </span>
          <div className="flex gap-1.5">
            {step.bits.map((bit, i) => {
              const processed = i >= step.bits.length - doneCount;
              const active = step.bitIndex === i;
              const tone = active
                ? "border-amber-400/80 bg-amber-400/20 text-amber-700 dark:text-amber-200"
                : processed
                  ? "border-zinc-200 bg-zinc-100 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-700"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300";
              return (
                <div
                  key={i}
                  className={`flex size-9 items-center justify-center rounded-md border font-mono text-sm font-semibold transition-colors ${tone}`}
                >
                  {bit}
                </div>
              );
            })}
          </div>
        </div>

        {/* Accumulators */}
        <div className="flex flex-wrap justify-center gap-2 font-mono text-xs">
          <span className="rounded-lg border border-claude-500/50 bg-claude-500/10 px-3 py-1.5 text-claude-700 dark:text-claude-300">
            result = <span className="font-semibold">{step.result}</span>
          </span>
          <span className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sky-700 dark:text-sky-300">
            base = <span className="font-semibold">{step.base}</span>
          </span>
          <span className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            exp = <span className="font-semibold">{step.exp}</span>
          </span>
        </div>

        {step.final !== undefined && (
          <div className="rounded-xl border border-claude-500/50 bg-claude-500/10 px-5 py-2 font-mono text-sm font-semibold text-claude-700 dark:text-claude-300">
            {base}^{exp} mod {mod} = {step.final}
          </div>
        )}
      </div>
    </PlaybackPanel>
  );
}

export default function MathViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  if (slug === "sieve-of-eratosthenes")
    return <SieveViz speed={speed} onLine={onLine} />;
  if (slug === "euclidean-gcd") return <GcdViz speed={speed} onLine={onLine} />;
  if (slug === "extended-euclidean")
    return <ExtGcdViz speed={speed} onLine={onLine} />;
  if (slug === "fast-exponentiation")
    return <PowViz speed={speed} onLine={onLine} />;
  return null;
}
