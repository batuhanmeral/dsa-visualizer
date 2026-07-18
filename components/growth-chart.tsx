"use client";

import { useMemo } from "react";
import { categories, type Algorithm } from "@/lib/data";
import { getSimulation } from "@/lib/simulations";
import { useLang } from "@/lib/i18n";
import { algoName } from "@/lib/content-i18n";

/**
 * Growth tab: measured step counts of the current algorithm (accent line)
 * against its same-family siblings (context lines) on identical inputs of
 * increasing size. Empirical, not asymptotic — but the O(n²) vs O(n log n)
 * separation shows up clearly by n = 24.
 */

const SIZES = [4, 8, 12, 16, 20, 24];
/** Absent from the 5..99 input range → worst case for every search. */
const ABSENT_TARGET = 997;

/** Deterministic PRNG so the chart is stable across renders and languages. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inputFor(n: number): number[] {
  const rnd = mulberry32(n * 2654435761);
  return Array.from({ length: n }, () => 5 + Math.floor(rnd() * 95));
}

interface Series {
  slug: string;
  name: string;
  points: { n: number; steps: number }[];
}

const W = 340;
const H = 210;
const M = { top: 14, right: 16, bottom: 28, left: 40 };

export default function GrowthChart({
  algorithm,
  categorySlug,
}: {
  algorithm: Algorithm;
  categorySlug: string;
}) {
  const { t, lang } = useLang();

  const { current, others } = useMemo(() => {
    const cat = categories.find((c) => c.slug === categorySlug);
    const family = (cat?.algorithms ?? []).filter(
      (a) =>
        a.inputKind === algorithm.inputKind && getSimulation(a.slug) !== undefined
    );
    const inputs = SIZES.map((n) => ({ n, values: inputFor(n) }));
    const measure = (slug: string): Series | null => {
      const gen = getSimulation(slug);
      if (!gen) return null;
      return {
        slug,
        name: slug,
        points: inputs.map(({ n, values }) => ({
          n,
          steps: gen([...values], ABSENT_TARGET).length,
        })),
      };
    };
    const cur = measure(algorithm.slug);
    const rest = family
      .filter((a) => a.slug !== algorithm.slug)
      .map((a) => measure(a.slug))
      .filter((s): s is Series => s !== null);
    return { current: cur, others: rest };
  }, [algorithm.slug, algorithm.inputKind, categorySlug]);

  if (!current) return null;

  const maxSteps = Math.max(
    ...current.points.map((p) => p.steps),
    ...others.flatMap((s) => s.points.map((p) => p.steps)),
    1
  );
  // Nice y ticks: 4 intervals rounded to 1/2/5 × 10^k.
  const rawStep = maxSteps / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const niceStep = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const yMax = niceStep * Math.ceil(maxSteps / niceStep);
  const yTicks = Array.from({ length: 5 }, (_, i) => i * niceStep);

  const px = (n: number) =>
    M.left + ((n - SIZES[0]) / (SIZES[SIZES.length - 1] - SIZES[0])) * (W - M.left - M.right);
  const py = (s: number) => H - M.bottom - (s / yMax) * (H - M.top - M.bottom);

  const path = (s: Series) =>
    s.points.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.n)},${py(p.steps)}`).join(" ");

  const label = (slug: string) => {
    const cat = categories.find((c) => c.slug === categorySlug);
    const algo = cat?.algorithms.find((a) => a.slug === slug);
    return algo ? algoName(slug, algo.name, lang) : slug;
  };

  return (
    <div className="scrollbar-slim flex-1 overflow-y-auto p-5">
      <p className="mb-3 text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
        {t("growth.hint")}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Step growth of ${label(algorithm.slug)}`}
      >
        {/* Grid + y axis (recessive) */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={M.left}
              y1={py(v)}
              x2={W - M.right}
              y2={py(v)}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth={1}
            />
            <text
              x={M.left - 6}
              y={py(v) + 3}
              textAnchor="end"
              className="fill-zinc-400 text-[9px] tabular-nums dark:fill-zinc-500"
            >
              {v}
            </text>
          </g>
        ))}
        {/* x axis ticks */}
        {SIZES.map((n) => (
          <text
            key={n}
            x={px(n)}
            y={H - M.bottom + 14}
            textAnchor="middle"
            className="fill-zinc-400 text-[9px] tabular-nums dark:fill-zinc-500"
          >
            {n}
          </text>
        ))}
        <text
          x={W - M.right}
          y={H - 4}
          textAnchor="end"
          className="fill-zinc-400 text-[9px] font-medium dark:fill-zinc-500"
        >
          n
        </text>
        <text
          x={M.left}
          y={M.top - 4}
          textAnchor="start"
          className="fill-zinc-400 text-[9px] font-medium dark:fill-zinc-500"
        >
          {t("growth.steps")}
        </text>

        {/* Context: sibling curves (hover a line for its name) */}
        {others.map((s) => (
          <g key={s.slug}>
            <path
              d={path(s)}
              fill="none"
              className="stroke-zinc-300 dark:stroke-zinc-700"
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Wider invisible hover target with a native tooltip */}
            <path d={path(s)} fill="none" stroke="transparent" strokeWidth={10}>
              <title>
                {label(s.slug)} — {s.points.map((p) => `n=${p.n}: ${p.steps}`).join(", ")}
              </title>
            </path>
          </g>
        ))}

        {/* Current algorithm: accent line + markers + endpoint value */}
        <path
          d={path(current)}
          fill="none"
          className="stroke-emerald-600 dark:stroke-emerald-500"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {current.points.map((p) => (
          <circle
            key={p.n}
            cx={px(p.n)}
            cy={py(p.steps)}
            r={4}
            className="fill-emerald-600 stroke-white dark:fill-emerald-500 dark:stroke-zinc-900"
            strokeWidth={1.5}
          >
            <title>{`${label(current.slug)} — n=${p.n}: ${p.steps} ${t("growth.steps")}`}</title>
          </circle>
        ))}
        <text
          x={px(current.points[current.points.length - 1].n)}
          y={py(current.points[current.points.length - 1].steps) - 8}
          textAnchor="end"
          className="fill-emerald-600 text-[9px] font-semibold tabular-nums dark:fill-emerald-500"
        >
          {current.points[current.points.length - 1].steps}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="h-0.5 w-4 rounded-full bg-emerald-600 dark:bg-emerald-500" />
          {label(current.slug)}
        </span>
        {others.length > 0 && (
          <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            <span className="h-0.5 w-4 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            {t("growth.others", { n: others.length })}
          </span>
        )}
      </div>

      {/* Table view (accessibility relief for the context lines) */}
      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          {t("growth.table")}
        </summary>
        <div className="scrollbar-slim mt-2 overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="text-zinc-400 dark:text-zinc-500">
                <th className="py-1 pr-3 font-medium">n</th>
                {SIZES.map((n) => (
                  <th key={n} className="py-1 pr-3 font-mono font-medium tabular-nums">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[current, ...others].map((s) => (
                <tr
                  key={s.slug}
                  className={
                    s.slug === current.slug
                      ? "font-semibold text-emerald-700 dark:text-emerald-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }
                >
                  <td className="py-1 pr-3">{label(s.slug)}</td>
                  {s.points.map((p) => (
                    <td key={p.n} className="py-1 pr-3 font-mono tabular-nums">
                      {p.steps}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
