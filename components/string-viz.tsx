"use client";

import { useEffect, useMemo, useState } from "react";
import { STRING_ALGOS, type StringStep, type Tone, type Track } from "@/lib/simulations/strings";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import { PlaybackPanel, useStepPlayer } from "./step-player";

export function hasStringViz(slug: string): boolean {
  return slug in STRING_ALGOS;
}

const LEGEND_KEYS: { key: TKey; dot: string }[] = [
  { key: "str.legend.pointer", dot: "bg-emerald-500" },
  { key: "str.legend.match", dot: "bg-sky-500" },
  { key: "str.legend.mismatch", dot: "bg-rose-500" },
  { key: "str.legend.window", dot: "bg-amber-400/70" },
];

const CELL_TONE: Record<Tone, string> = {
  idle: "border-zinc-200 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
  active:
    "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200",
  match: "border-sky-500/60 bg-sky-500/15 text-sky-700 dark:text-sky-200",
  mismatch: "border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-200",
  window: "border-amber-400/60 bg-amber-400/15 text-amber-700 dark:text-amber-200",
  done: "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

const ARR_TONE: Record<Tone, string> = {
  idle: "text-zinc-300 dark:text-zinc-700",
  active: "text-emerald-600 dark:text-emerald-400 font-semibold",
  match: "text-sky-600 dark:text-sky-300",
  mismatch: "text-rose-600 dark:text-rose-300",
  window: "text-zinc-500 dark:text-zinc-300",
  done: "text-emerald-600 dark:text-emerald-400",
};

function TrackRow({ track }: { track: Track }) {
  const offset = track.offset ?? 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="pl-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {track.label}
      </span>
      <div className="flex gap-1">
        {Array.from({ length: Math.max(offset, 0) }).map((_, k) => (
          <span key={`pad-${k}`} className="size-8 shrink-0 sm:size-9" />
        ))}
        {track.chars.map((ch, k) => (
          <div key={k} className="flex flex-col items-center gap-1">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-medium transition-colors sm:size-9 ${
                CELL_TONE[track.tones[k] ?? "idle"]
              }`}
            >
              {ch === " " ? "␣" : ch}
            </span>
            {track.arr && (
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  ARR_TONE[track.arrTones?.[k] ?? "idle"]
                }`}
              >
                {track.arr[k] === null ? "·" : track.arr[k]}
              </span>
            )}
            <span className="font-mono text-[9px] text-zinc-300 dark:text-zinc-700">
              {k}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StringField({
  label,
  value,
  onChange,
  width = "w-52",
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
        maxLength={28}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className={`${width} rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wide text-zinc-700 outline-none focus:border-emerald-500/60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200`}
      />
    </label>
  );
}

export default function StringViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  const { t } = useLang();
  const config = STRING_ALGOS[slug];
  const [text, setText] = useState(config?.defaultText ?? "");
  const [pattern, setPattern] = useState(config?.defaultPattern ?? "");

  const steps: StringStep[] = useMemo(() => {
    if (!config) return [];
    const t = text.length ? text : config.defaultText;
    const p = pattern.length ? pattern : config.defaultPattern;
    return config.generate(t, p);
  }, [config, text, pattern]);

  const player = useStepPlayer(steps.length, speed);
  const step = steps[player.index];
  const legend = LEGEND_KEYS.map((l) => ({ label: t(l.key), dot: l.dot }));

  useEffect(() => {
    if (step) onLine(step.codeLine);
  }, [step, onLine]);

  if (!config || !step) return null;

  return (
    <PlaybackPanel
      player={player}
      count={steps.length}
      note={step.note}
      dotClass={
        step.status === "mismatch"
          ? "bg-rose-500"
          : step.status === "match"
            ? "bg-sky-500"
            : step.status === "done"
              ? "bg-emerald-500"
              : "bg-amber-400"
      }
      legend={legend}
      extra={
        <>
          <StringField label={t("str.text")} value={text} onChange={setText} />
          {config.usesPattern && (
            <StringField
              label={t("str.pattern")}
              value={pattern}
              onChange={setPattern}
              width="w-32"
            />
          )}
          {step.vars && (
            <div className="ml-auto flex items-center gap-1.5">
              {step.vars.map((v) => (
                <span
                  key={v.label}
                  className="rounded-md border border-zinc-200 px-2 py-1 font-mono text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
                >
                  {v.label}=
                  <span className="text-zinc-800 dark:text-zinc-200">
                    {v.value}
                  </span>
                </span>
              ))}
            </div>
          )}
        </>
      }
    >
      <div className="scrollbar-slim flex max-w-full flex-col gap-5 overflow-auto p-2">
        {step.tracks.map((track, i) => (
          <TrackRow key={i} track={track} />
        ))}
      </div>
    </PlaybackPanel>
  );
}
