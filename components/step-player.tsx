"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  StepBack,
  StepForward,
} from "lucide-react";

/**
 * Shared playback engine for the "precomputed step list" visualizers
 * (graphs, DP, backtracking). Unlike the operation-driven data structures,
 * these algorithms run start-to-finish: a pure generator produces the full
 * `Step[]`, and this hook + panel scrub through them at the selected speed.
 *
 * The parent `Workspace` hides its own transport controls for these views
 * (like it does for data structures) and drives the code-line highlight from
 * the active step via `onLine`. Speed comes from the Workspace speed selector.
 */
export function useStepPlayer(count: number, speed: number) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const atEnd = index >= count - 1;

  // Rewind whenever the step list changes (new input / start node / N).
  // Adjusting state during render is the recommended alternative to an effect.
  if (count !== prevCount) {
    setPrevCount(count);
    setIndex(0);
    setIsPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying || atEnd) return;
    const id = setInterval(
      () => setIndex((i) => Math.min(i + 1, count - 1)),
      900 / speed
    );
    return () => clearInterval(id);
  }, [isPlaying, atEnd, speed, count]);

  const playing = isPlaying && !atEnd;

  return {
    index: Math.min(index, Math.max(count - 1, 0)),
    playing,
    atEnd,
    toggle: () => {
      if (atEnd) {
        setIndex(0);
        setIsPlaying(true);
      } else {
        setIsPlaying((p) => !p);
      }
    },
    reset: () => {
      setIsPlaying(false);
      setIndex(0);
    },
    stepBy: (delta: number) => {
      setIsPlaying(false);
      setIndex((i) => Math.min(Math.max(i + delta, 0), count - 1));
    },
    seek: (i: number) => {
      setIsPlaying(false);
      setIndex(i);
    },
  };
}

export type StepPlayer = ReturnType<typeof useStepPlayer>;

// ── Canvas layout + transport bar ───────────────────────────────────────
export function PlaybackPanel({
  player,
  count,
  note,
  dotClass = "bg-emerald-500",
  legend,
  extra,
  children,
}: {
  player: StepPlayer;
  count: number;
  note: string;
  /** Tailwind bg-* class for the status dot, keyed to the step kind. */
  dotClass?: string;
  legend?: { label: string; dot: string }[];
  /** Algorithm-specific controls (start node, board size, inputs…). */
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
      <div className="scrollbar-slim flex min-h-0 flex-1 items-center justify-center overflow-auto">
        {children}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white/85 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        {extra && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2.5 dark:border-zinc-800">
            {extra}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
            <TransportButton label="Reset" onClick={player.reset}>
              <RotateCcw className="size-3.5" />
            </TransportButton>
            <TransportButton label="Step back" onClick={() => player.stepBy(-1)}>
              <StepBack className="size-3.5" />
            </TransportButton>
            <button
              type="button"
              onClick={player.toggle}
              aria-label={player.playing ? "Pause" : "Play"}
              className="flex size-8 items-center justify-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-500"
            >
              {player.playing ? (
                <Pause className="size-3.5" fill="currentColor" />
              ) : (
                <Play className="size-3.5 translate-x-px" fill="currentColor" />
              )}
            </button>
            <TransportButton
              label="Step forward"
              onClick={() => player.stepBy(1)}
            >
              <StepForward className="size-3.5" />
            </TransportButton>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(count - 1, 0)}
            value={player.index}
            onChange={(e) => player.seek(Number(e.target.value))}
            aria-label="Simulation timeline"
            className="h-1 flex-1 cursor-pointer accent-emerald-600"
          />
          <span className="shrink-0 font-mono text-[11px] text-zinc-400">
            {player.index + 1}/{count}
          </span>
        </div>

        <p className="mt-2.5 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <span className={`size-2 shrink-0 rounded-full ${dotClass}`} />
          <span className="truncate">{note}</span>
        </p>

        {legend && (
          <div className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 sm:flex">
            {legend.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500"
              >
                <span className={`size-1.5 rounded-full ${item.dot}`} />
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TransportButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

/** Small pill button used for start-node / board-size / preset selectors. */
export function ChoiceButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
        active
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}
