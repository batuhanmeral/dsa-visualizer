"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Minimize2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";
import {
  BIG_N_SHAPES,
  bigInput,
  BIG_N_SIZES,
  bigTarget,
  stepsPerSecond,
  type BigNShape,
} from "@/lib/big-n";
import {
  STEP_KINDS,
  createReplay,
  stepHighlights,
  stepRange,
  traceRun,
  type RunTrace,
} from "@/lib/simulations/trace";
import type { TraceReply, TraceRequest } from "@/lib/simulations/trace-worker";
import type { StepKind } from "@/lib/simulations";
import { tonesForStep, valueBounds } from "@/lib/sound";
import { KIND_STYLES } from "./kind-styles";
import { useUserAdvanced } from "./playback-bridge";
import { playTones } from "./step-sound";
import { ChoiceButton, CounterBadge, PlaybackPanel, type StepPlayer } from "./step-player";

/**
 * Large-n mode of the sorting and searching canvas: 500 to 2000 values, drawn
 * on a plain Canvas 2D (ADR-002) from a compact trace of the same engine,
 * built in a web worker.
 *
 * While playing, the canvas is redrawn every animation frame from refs and
 * React state is refreshed only a few times a second: re-rendering the page
 * 60 times a second would cost more than the drawing.
 */

const SHAPE_KEYS: Record<BigNShape, TKey> = {
  random: "ws.shape.random",
  sorted: "ws.shape.sorted",
  reversed: "ws.shape.reversed",
  nearly: "ws.shape.nearly",
  fewUnique: "ws.shape.fewUnique",
};

const COUNTED: { kind: StepKind; key: TKey }[] = [
  { kind: "compare", key: "stat.comparisons" },
  { kind: "swap", key: "stat.swaps" },
  { kind: "shift", key: "stat.moves" },
  { kind: "probe", key: "stat.probes" },
];

/** Colours the canvas reads from real elements, so they follow the theme. */
const PALETTE: [string, string][] = [
  ["neutral", "bg-zinc-300 dark:bg-zinc-700"],
  ["eliminated", "bg-zinc-200 dark:bg-zinc-800/70"],
  ["done", KIND_STYLES.done.bar],
  ["compare", KIND_STYLES.compare.bar],
  ["swap", KIND_STYLES.swap.bar],
  ["shift", KIND_STYLES.shift.bar],
  ["select", KIND_STYLES.select.bar],
  ["probe", KIND_STYLES.probe.bar],
  ["found", KIND_STYLES.found.bar],
];

/** How often React state follows the run while it plays. */
const UI_INTERVAL_MS = 80;
/** At most one sound per this interval when steps go by faster. */
const SOUND_INTERVAL_MS = 70;
/** Steps of the current frame whose highlights are drawn. */
const TRAIL = 64;

interface BigNViewProps {
  slug: string;
  /** Searching pages: pick a target and draw the search window. */
  search: boolean;
  speed: number;
  onLine: (line: number) => void;
  soundOn: boolean;
  /** The sound toggle, for the transport row. */
  tools: ReactNode;
  legend: { label: string; dot: string }[];
  onExit: () => void;
}

/**
 * The trace for this input, built in a worker; null until it arrives. Each
 * request gets its own worker, terminated when the input changes, so a stale
 * reply can never land. Without workers (or if one fails to load) the trace is
 * built here instead.
 */
function useTrace(request: TraceRequest): RunTrace | null {
  const [result, setResult] = useState<{ for: TraceRequest; trace: RunTrace } | null>(null);
  useEffect(() => {
    let live = true;
    const done = (trace: RunTrace | undefined) => {
      if (live && trace) setResult({ for: request, trace });
    };
    const local = () => done(traceRun(request.slug, request.input, request.target));
    if (typeof Worker === "undefined") {
      void Promise.resolve().then(local);
      return () => {
        live = false;
      };
    }
    const worker = new Worker(new URL("../lib/simulations/trace-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (e: MessageEvent<TraceReply>) => done(e.data.trace);
    worker.onerror = local;
    worker.postMessage(request);
    return () => {
      live = false;
      worker.terminate();
    };
  }, [request]);
  return result?.for === request ? result.trace : null;
}

export default function BigNView(props: BigNViewProps) {
  const { t } = useLang();
  const sizes = BIG_N_SIZES;
  const [n, setN] = useState(sizes[0]);
  const [shape, setShape] = useState<BigNShape>("random");
  const [request, setRequest] = useState<TraceRequest>(() => {
    const input = bigInput("random", sizes[0]);
    return { slug: props.slug, input, target: props.search ? bigTarget(input) : undefined };
  });
  const trace = useTrace(request);

  const load = (nextShape: BigNShape, nextN: number) => {
    const input = bigInput(nextShape, nextN);
    setShape(nextShape);
    setN(nextN);
    setRequest({ slug: props.slug, input, target: props.search ? bigTarget(input) : undefined });
  };

  const controls = (
    <>
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-[11px] font-medium text-zinc-400">{t("bign.size")}</span>
        {sizes.map((s) => (
          <ChoiceButton key={s} active={s === n} onClick={() => load(shape, s)}>
            {s}
          </ChoiceButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {BIG_N_SHAPES.map((s) => (
          <ChoiceButton key={s} active={s === shape} onClick={() => load(s, n)}>
            {t(SHAPE_KEYS[s])}
          </ChoiceButton>
        ))}
      </div>
      <button
        type="button"
        onClick={props.onExit}
        className="ml-auto flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-claude-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <Minimize2 className="size-3.5" />
        {t("bign.exit")}
      </button>
    </>
  );

  if (!trace) {
    // Until the worker replies: the controls stay usable, the canvas waits.
    return (
      <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
        <p
          role="status"
          className="flex min-h-56 flex-1 items-center justify-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          {t("bign.loading", { n })}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          {controls}
        </div>
      </div>
    );
  }
  // A new input passes through the loading state, so each run mounts afresh.
  return (
    <BigNRun
      {...props}
      trace={trace}
      n={n}
      target={request.target}
      controls={controls}
    />
  );
}

function BigNRun({
  trace,
  n,
  target,
  speed,
  onLine,
  soundOn,
  tools,
  legend,
  controls,
}: BigNViewProps & { trace: RunTrace; n: number; target?: number; controls: ReactNode }) {
  const { t } = useLang();
  const userAdvanced = useUserAdvanced();
  const count = trace.count;
  const replay = useMemo(() => createReplay(trace), [trace]);
  const bounds = useMemo(() => valueBounds(Array.from(trace.initial)), [trace]);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const atEnd = index >= count - 1;
  const playing = isPlaying && !atEnd;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  /** The step on screen; ahead of `index` while playing. */
  const pos = useRef(0);
  /** First step drawn with its highlights (the steps of the last frame). */
  const trailFrom = useRef(0);
  const soundRef = useRef(soundOn);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || canvas.width === 0) return;
    const colors: Record<string, string> = {};
    for (const el of paletteRef.current?.children ?? [])
      colors[(el as HTMLElement).dataset.color!] = getComputedStyle(el).backgroundColor;

    const { width: W, height: H } = canvas;
    const dpr = W / Math.max(canvas.clientWidth, 1);
    const values = replay.values;
    const bw = W / values.length;
    const gap = bw >= 3 ? 1 : 0;
    const top = Math.max(bounds.max, 1);
    const k = replay.at;
    const kind = STEP_KINDS[trace.kinds[k]];
    const barAt = (i: number, w: number) => {
      const h = Math.max(1, Math.round((values[i] / top) * H));
      ctx.fillRect(Math.floor(i * bw + (bw - w) / 2), H - h, w, h);
    };

    ctx.clearRect(0, 0, W, H);
    const w = Math.max(1, Math.ceil(bw) - gap);
    // Outside a search's window the values are ruled out: dimmed.
    const range = stepRange(trace, k);
    for (let i = 0; i < values.length; i++) {
      ctx.fillStyle =
        kind === "done"
          ? colors.done
          : range && (i < range[0] || i > range[1])
            ? colors.eliminated
            : colors.neutral;
      barAt(i, w);
    }
    if (kind === "done") return;

    // Highlights are drawn wider than a bar: at 2000 values a bar is under a pixel.
    const mark = Math.max(w, Math.round(3 * dpr));
    for (let s = Math.max(trailFrom.current, k - TRAIL + 1, 0); s <= k; s++) {
      const color = colors[STEP_KINDS[trace.kinds[s]]];
      if (!color) continue;
      ctx.fillStyle = color;
      for (const i of stepHighlights(trace, s)) if (i >= 0 && i < values.length) barAt(i, mark);
    }
  }, [replay, trace, bounds]);

  // Size the canvas to its box at device resolution, and redraw on theme changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };
    const resize = new ResizeObserver(fit);
    resize.observe(canvas);
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      resize.disconnect();
      theme.disconnect();
    };
  }, [draw]);

  // Paused: the canvas shows `index`.
  useEffect(() => {
    if (playing) return;
    pos.current = index;
    trailFrom.current = index;
    replay.seek(index);
    draw();
  }, [index, playing, replay, draw]);

  // Playing: advance by elapsed time, a batch of steps per frame for a long
  // run, one step every 900 ms / speed for a short one.
  useEffect(() => {
    if (!playing) return;
    const perSecond = stepsPerSecond(count, speed);
    const toneMs = Math.max(SOUND_INTERVAL_MS, 1000 / perSecond);
    let raf = 0;
    let last = performance.now();
    let lastUi = last;
    let lastSound = -Infinity;
    let carry = 0;
    const tick = (now: number) => {
      carry += ((now - last) * perSecond) / 1000;
      last = now;
      const advance = Math.floor(carry);
      if (advance === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      carry -= advance;
      const from = pos.current;
      const to = Math.min(from + advance, count - 1);
      pos.current = to;
      trailFrom.current = from + 1;
      replay.seek(to);
      draw();
      if (soundRef.current && now - lastSound >= toneMs) {
        // The latest step of the batch that makes a sound.
        for (let s = to; s > from && s > to - TRAIL; s--) {
          const kind = STEP_KINDS[trace.kinds[s]];
          if (kind === "info") continue;
          const highlights = stepHighlights(trace, s);
          playTones(tonesForStep({ kind, highlights, array: replay.values }, bounds, toneMs));
          lastSound = now;
          break;
        }
      }
      if (to >= count - 1) {
        setIndex(to);
        setIsPlaying(false);
        return;
      }
      if (now - lastUi >= UI_INTERVAL_MS) {
        lastUi = now;
        setIndex(to);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, count, replay, trace, bounds, draw]);

  useEffect(() => {
    onLine(trace.lines[index]);
  }, [index, trace, onLine]);

  // The kinds this run emits at all, so the badge set stays put while it plays.
  const counted = useMemo(
    () => COUNTED.filter((c) => trace.kinds.includes(STEP_KINDS.indexOf(c.kind))),
    [trace]
  );
  const counts = useMemo(() => {
    const totals = new Array<number>(STEP_KINDS.length).fill(0);
    for (let s = 0; s <= index; s++) totals[trace.kinds[s]]++;
    return totals;
  }, [index, trace]);

  const clamp = (k: number) => Math.min(Math.max(k, 0), count - 1);
  const player: StepPlayer = {
    index,
    playing,
    atEnd,
    toggle: () => {
      if (playing) {
        setIndex(pos.current);
        setIsPlaying(false);
        return;
      }
      userAdvanced();
      if (atEnd) setIndex(0);
      setIsPlaying(true);
    },
    reset: () => {
      userAdvanced();
      setIsPlaying(false);
      setIndex(0);
    },
    stepBy: (delta: number) => {
      userAdvanced();
      setIsPlaying(false);
      setIndex(clamp(pos.current + delta));
    },
    seek: (k: number) => {
      userAdvanced();
      setIsPlaying(false);
      setIndex(clamp(k));
    },
  };

  const kind = STEP_KINDS[trace.kinds[index]];
  return (
    <PlaybackPanel
      player={player}
      count={count}
      note={target === undefined ? t("bign.note", { n }) : t("bign.note.search", { n, target })}
      dotClass={KIND_STYLES[kind].dot}
      legend={legend}
      extra={controls}
      tools={tools}
      stats={counted.map((c) => (
        <CounterBadge
          key={c.kind}
          label={t(c.key)}
          value={counts[STEP_KINDS.indexOf(c.kind)]}
          dot={KIND_STYLES[c.kind].dot}
        />
      ))}
    >
      <div className="relative h-56 w-full lg:h-full">
        <canvas
          ref={canvasRef}
          data-big-n-canvas
          role="img"
          aria-label={t("bign.canvas", { n })}
          className="absolute inset-0 size-full"
        />
        <div ref={paletteRef} hidden>
          {PALETTE.map(([name, cls]) => (
            <span key={name} data-color={name} className={cls} />
          ))}
        </div>
      </div>
    </PlaybackPanel>
  );
}
