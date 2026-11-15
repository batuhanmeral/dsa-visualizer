"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Gauge,
  Pause,
  Play,
  RotateCcw,
  StepBack,
  StepForward,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useStepNote } from "@/lib/use-step-note";
import type { Note } from "@/lib/simulations/note";
import { usePublishTransport, useUserAdvanced } from "./playback-bridge";

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
export function useStepPlayer(
  count: number,
  speed: number,
  /**
   * The step list itself. Pass it whenever one is available: identity is the
   * only reliable signal that a *different* run is being shown. Keying the
   * rewind off `count` alone silently fails for runs that happen to be the
   * same length — BFS and DFS, for instance, emit exactly 47 and 44 steps from
   * every start node, so switching the source would resume mid-traversal.
   */
  steps?: readonly unknown[]
) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prevRun, setPrevRun] = useState<unknown>(steps ?? count);
  const atEnd = index >= count - 1;
  const userAdvanced = useUserAdvanced();

  // Rewind whenever the run changes (new input / start node / N).
  // Adjusting state during render is the recommended alternative to an effect.
  const run: unknown = steps ?? count;
  if (run !== prevRun) {
    setPrevRun(run);
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
    // Every handler below is a user action; pausing is not an advance.
    toggle: () => {
      if (!playing) userAdvanced();
      if (atEnd) {
        setIndex(0);
        setIsPlaying(true);
      } else {
        setIsPlaying((p) => !p);
      }
    },
    reset: () => {
      userAdvanced();
      setIsPlaying(false);
      setIndex(0);
    },
    stepBy: (delta: number) => {
      userAdvanced();
      setIsPlaying(false);
      setIndex((i) => Math.min(Math.max(i + delta, 0), count - 1));
    },
    seek: (i: number) => {
      userAdvanced();
      setIsPlaying(false);
      setIndex(i);
    },
  };
}

export type StepPlayer = ReturnType<typeof useStepPlayer>;

// ── Speed control ───────────────────────────────────────────────────────
// The speed state lives in `Workspace`, but the selector renders inside the
// panel below each simulation (bottom-right). The context carries the pair
// down without threading a setter through every visualizer.
export const SPEEDS = [0.5, 1, 1.5, 2] as const;

export const SpeedContext = createContext<{
  speed: number;
  setSpeed: (s: (typeof SPEEDS)[number]) => void;
} | null>(null);

/**
 * The current algorithm's loop invariant, supplied once by the Workspace.
 *
 * The visualizer families nest several components deep (TreeViz → BSTViz →
 * TreeFrame → PlaybackPanel) and the inner ones do not know the slug, so a
 * context beats threading the same prop through every level — same reasoning as
 * `SpeedContext` above.
 */
export const InvariantContext = createContext<Note | null>(null);

/** The fixed mobile top bar (h-14): a row tucked under it is out of view. */
const MOBILE_HEADER_PX = 56;

/** Whether the element is on screen, for handing playback to the mobile dock. */
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: `-${MOBILE_HEADER_PX}px 0px 0px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, onScreen] as const;
}

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-claude-500";

/**
 * Segmented buttons when the card has room; a native select in a narrow card,
 * where four 40px buttons would push the selector off the transport row.
 */
export function SpeedSelect() {
  const ctx = useContext(SpeedContext);
  const { t } = useLang();
  if (!ctx) return null;
  return (
    <>
      <div
        role="group"
        aria-label={t("ws.speed")}
        className="ml-auto hidden shrink-0 items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 @sm:flex dark:border-zinc-800 dark:bg-zinc-950"
      >
        <Gauge className="ml-1 size-3.5 text-zinc-400" />
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ctx.setSpeed(s)}
            className={`min-h-10 min-w-10 rounded-md px-2 py-1 text-[11px] font-medium transition-colors lg:min-h-0 lg:min-w-0 ${FOCUS_RING} ${
              ctx.speed === s
                ? "bg-claude-500/15 text-claude-600 dark:text-claude-400"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
      <select
        aria-label={t("ws.speed")}
        value={ctx.speed}
        onChange={(e) => {
          const next = SPEEDS.find((s) => String(s) === e.target.value);
          if (next !== undefined) ctx.setSpeed(next);
        }}
        className={`ml-auto h-10 shrink-0 cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-[11px] font-medium text-zinc-600 @sm:hidden lg:h-8 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 ${FOCUS_RING}`}
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {s}x
          </option>
        ))}
      </select>
    </>
  );
}

// ── Transport buttons (reset · back · play/pause · forward) ─────────────
// Rendered to the right of the step counter in every playback panel.
export function TransportControls({
  playing,
  onToggle,
  onReset,
  onStep,
}: {
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
  onStep: (delta: number) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
      <TransportButton label={t("reset")} onClick={onReset}>
        <RotateCcw className="size-3.5" />
      </TransportButton>
      <TransportButton label={t("stepBack")} onClick={() => onStep(-1)}>
        <StepBack className="size-3.5" />
      </TransportButton>
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? t("pause") : t("play")}
        className={`flex size-10 items-center justify-center rounded-md bg-claude-600 text-white transition-colors hover:bg-claude-500 lg:size-8 ${FOCUS_RING}`}
      >
        {playing ? (
          <Pause className="size-3.5" fill="currentColor" />
        ) : (
          <Play className="size-3.5 translate-x-px" fill="currentColor" />
        )}
      </button>
      <TransportButton label={t("stepForward")} onClick={() => onStep(1)}>
        <StepForward className="size-3.5" />
      </TransportButton>
    </div>
  );
}

// ── Canvas layout + transport bar ───────────────────────────────────────
export function PlaybackPanel({
  player,
  count,
  note,
  invariant,
  dotClass = "bg-claude-500",
  legend,
  extra,
  stats,
  children,
}: {
  player: StepPlayer;
  count: number;
  /**
   * A generator's step note, or an already-translated string for panels whose
   * caption comes from the UI dictionary rather than a step (compare mode).
   */
  note: Note | string;
  /** The algorithm's invariant, shown under the note as the "why". */
  invariant?: Note | null;
  /** Tailwind bg-* class for the status dot, keyed to the step kind. */
  dotClass?: string;
  legend?: { label: string; dot: string }[];
  /** Algorithm-specific controls (start node, board size, inputs…). */
  extra?: ReactNode;
  /** Running counters and variable badges, shown under the invariant. */
  stats?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLang();
  const tn = useStepNote();
  const contextInvariant = useContext(InvariantContext);
  const shownInvariant = invariant ?? contextInvariant;
  const noteText = typeof note === "string" ? note : tn(note);
  const [rowRef, rowVisible] = useOnScreen<HTMLDivElement>();
  usePublishTransport({
    index: player.index,
    count,
    playing: player.playing,
    note: noteText,
    rowVisible,
    toggle: player.toggle,
    reset: player.reset,
    stepBy: player.stepBy,
  });
  return (
    <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
      <div className="scrollbar-slim flex min-h-0 flex-1 items-center justify-center overflow-auto">
        {children}
      </div>

      <PlaybackCard>
        {extra && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-2.5 dark:border-zinc-800">
            {extra}
          </div>
        )}

        {/* The timeline takes its own line until the card is wide enough to
            leave it a usable track beside the buttons and the speed selector. */}
        <div ref={rowRef} className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 basis-full items-center gap-2 @lg:flex-1 @lg:basis-0">
            <input
              type="range"
              min={0}
              max={Math.max(count - 1, 0)}
              value={player.index}
              onChange={(e) => player.seek(Number(e.target.value))}
              aria-label={t("ws.timeline")}
              className="h-1 min-w-0 flex-1 cursor-pointer accent-claude-600"
            />
            <span className="shrink-0 font-mono text-[11px] text-zinc-400">
              {player.index + 1}/{count}
            </span>
          </div>
          <TransportControls
            playing={player.playing}
            onToggle={player.toggle}
            onReset={player.reset}
            onStep={player.stepBy}
          />
          <SpeedSelect />
        </div>

        <StepNoteLine dotClass={dotClass}>{noteText}</StepNoteLine>
        {shownInvariant && <InvariantLine note={shownInvariant} />}
        {stats && (
          <div
            data-playback-stats
            className="mt-2.5 flex flex-wrap items-center gap-1.5"
          >
            {stats}
          </div>
        )}
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
      </PlaybackCard>
    </div>
  );
}

// ── Card pieces shared with the data-structure shell ────────────────────
/** A container, so the rows reflow by the card's width, not the viewport's. */
export function PlaybackCard({ children }: { children: ReactNode }) {
  return (
    <div
      data-playback-card
      className="@container mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
    >
      {children}
    </div>
  );
}

/** The step note wraps instead of truncating: it is the sentence being taught. */
export function StepNoteLine({
  dotClass,
  children,
}: {
  dotClass: string;
  children: ReactNode;
}) {
  return (
    <p
      data-playback-note
      className="mt-2.5 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300"
    >
      <span className={`mt-1 size-2 shrink-0 rounded-full ${dotClass}`} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function InvariantLine({ note }: { note: Note }) {
  const { t } = useLang();
  const tn = useStepNote();
  return (
    /* Why the step is allowed, not what it did. */
    <p
      data-playback-invariant
      className="mt-1.5 flex min-w-0 items-start gap-2 border-l-2 border-sky-500/40 pl-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400"
    >
      <span className="shrink-0 font-medium text-sky-600 dark:text-sky-400">
        {t("ws.invariant")}
      </span>
      <span>{tn(note)}</span>
    </p>
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
      className={`flex size-10 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 lg:size-8 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${FOCUS_RING}`}
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
          ? "bg-claude-500/15 text-claude-600 dark:text-claude-400"
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}
