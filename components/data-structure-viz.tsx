"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Eraser,
  Minus,
  Plus,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useStepNote } from "@/lib/use-step-note";
import { msg, type Note } from "@/lib/simulations/note";
import {
  dequeue,
  emptyTable,
  enqueue,
  hashClear,
  hashContains,
  hashInsert,
  listClear,
  listPushFront,
  listRemove,
  queueClear,
  stackClear,
  stackPop,
  stackPush,
  type Cell,
  type HashState,
  type ListState,
  type OpFrame,
} from "@/lib/simulations/structures";
import {
  InvariantContext,
  InvariantLine,
  PlaybackCard,
  SpeedSelect,
  StepNoteLine,
} from "./step-player";
import { useUserAdvanced } from "./playback-bridge";
import { FitStage, useFitScale } from "./fit-stage";

/**
 * Interactive data-structure playground. Unlike the sorting/searching engines
 * (which replay a precomputed step list), data structures are driven by the
 * user clicking operations. Each operation (`lib/simulations/structures.ts`)
 * returns frames that the shared runner walks through at the selected speed:
 * every frame highlights a C-code line, updates the status note, and may carry
 * the state after that line, applied when the frame fires, so the box
 * animation and the highlighted line stay in sync.
 */

let _id = 0;
const nextId = () => ++_id;
const toItems = (vals: number[]): Cell[] =>
  vals.map((v) => ({ id: nextId(), value: v }));
const newCell = (value: number): Cell => ({ id: nextId(), value });

function clampInt(text: string): number | null {
  const n = Number.parseInt(text, 10);
  if (!Number.isFinite(n) || n < 0 || n > 999) return null;
  return n;
}

interface VizProps {
  speed: number;
  onLine: (line: number) => void;
}

// ── Shared code-walk runner ─────────────────────────────────────────────
function useRunner(onLine: (line: number) => void, speed: number) {
  const [note, setNote] = useState<Note>(() => msg("n.ds.pickOp"));
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);
  const userAdvanced = useUserAdvanced();
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const clear = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => clear, [clear]);

  const run = useCallback(
    <S,>(frames: OpFrame<S>[], apply: (state: S) => void) => {
      clear();
      if (!frames.length) return;
      // Only user operations call run, and each one walks code lines.
      userAdvanced();
      setBusy(true);
      const step = 720 / speedRef.current;
      frames.forEach((f, i) => {
        timers.current.push(
          window.setTimeout(() => {
            onLine(f.line);
            setNote(f.note);
            if (f.state !== undefined) apply(f.state);
            if (i === frames.length - 1) {
              timers.current.push(
                window.setTimeout(() => setBusy(false), step)
              );
            }
          }, i * step)
        );
      });
    },
    [clear, onLine, userAdvanced]
  );

  return { run, note, busy };
}

// ── Shared UI atoms ─────────────────────────────────────────────────────
/** Upper limit for the canvas scale: a three-box stack should not fill the screen. */
const MAX_SCALE = 1.75;

/** Layout animations measure screen pixels; undo the stage scale so the boxes start where they were. */
function ScaledLayout({ children }: { children: ReactNode }) {
  const scale = useFitScale();
  const toLocal = useCallback(
    (p: { x: number; y: number }) => ({ x: p.x / scale, y: p.y / scale }),
    [scale]
  );
  return <MotionConfig transformPagePoint={toLocal}>{children}</MotionConfig>;
}

function VizShell({
  children,
  controls,
  note,
  busy,
  resetKey,
}: {
  children: ReactNode;
  controls: ReactNode;
  note: Note;
  busy: boolean;
  /** Bumped by Clear: the scale may grow back only on a fresh start. */
  resetKey: number;
}) {
  const tn = useStepNote();
  const invariant = useContext(InvariantContext);
  return (
    <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
      <div className="scrollbar-slim flex min-h-0 flex-1 items-center justify-center overflow-auto">
        {/* Never re-fit mid-operation: the boxes would grow and shrink while they move. */}
        <FitStage resetKey={resetKey} maxScale={MAX_SCALE} frozen={busy}>
          <ScaledLayout>{children}</ScaledLayout>
        </FitStage>
      </div>
      <PlaybackCard>
        <div className="flex flex-wrap items-center gap-2">
          {controls}
          <SpeedSelect />
        </div>
        <StepNoteLine
          dotClass={busy ? "animate-pulse bg-claude-500" : "bg-zinc-400"}
        >
          {tn(note)}
        </StepNoteLine>
        {invariant && <InvariantLine note={invariant} />}
      </PlaybackCard>
    </div>
  );
}

function ValueInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const { t } = useLang();
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
      }}
      disabled={disabled}
      aria-label={t("ds.value")}
      className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs outline-none focus:border-claude-500/60 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
    />
  );
}

function OpBtn({
  onClick,
  disabled,
  tone = "primary",
  icon: Icon,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  tone?: "primary" | "neutral";
  icon: LucideIcon;
  children: ReactNode;
}) {
  const cls =
    tone === "primary"
      ? "bg-claude-600 text-white hover:bg-claude-500"
      : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${cls}`}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
      {children}
    </span>
  );
}

const BOX_BASE =
  "flex items-center justify-center rounded-lg border font-mono text-sm font-medium transition-colors";
const BOX_IDLE =
  "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
const BOX_ACTIVE =
  "border-claude-500/60 bg-claude-500/15 text-claude-700 dark:text-claude-300";

// ── Stack (LIFO) ────────────────────────────────────────────────────────
function StackViz({ speed, onLine }: VizProps) {
  const { t } = useLang();
  const { run, note, busy } = useRunner(onLine, speed);
  const [clears, setClears] = useState(0);
  const [items, setItems] = useState<Cell[]>(() => toItems([12, 5, 27]));
  const [val, setVal] = useState("42");

  const push = () => {
    const v = clampInt(val);
    if (v === null) return;
    run(stackPush(items, newCell(v)).frames, setItems);
  };

  const pop = () => run(stackPop(items).frames, setItems);

  return (
    <VizShell
      busy={busy}
      note={note}
      resetKey={clears}
      controls={
        <>
          <ValueInput
            value={val}
            onChange={setVal}
            onSubmit={push}
            disabled={busy}
          />
          <OpBtn icon={Plus} onClick={push} disabled={busy}>
            {t("ds.push")}
          </OpBtn>
          <OpBtn tone="neutral" icon={Minus} onClick={pop} disabled={busy}>
            {t("ds.pop")}
          </OpBtn>
          <OpBtn
            tone="neutral"
            icon={Eraser}
            onClick={() => {
              setClears((c) => c + 1);
              run(stackClear().frames, setItems);
            }}
            disabled={busy}
          >
            {t("ds.clear")}
          </OpBtn>
        </>
      }
    >
      {/* Side padding keeps the "← top" label inside the measured, scaled box. */}
      <div className="flex flex-col-reverse items-center gap-1.5 px-12">
        <div className="mt-1 h-1 w-32 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <AnimatePresence mode="popLayout">
          {items.map((it, i) => {
            const isTop = i === items.length - 1;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: -28, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -28, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={`relative h-11 w-32 ${BOX_BASE} ${
                  isTop ? BOX_ACTIVE : BOX_IDLE
                }`}
              >
                {it.value}
                {isTop && (
                  <span className="absolute -right-12 text-[10px] font-medium text-claude-500">
                    {t("ds.top")}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && <EmptyHint>{t("ds.stackEmpty")}</EmptyHint>}
      </div>
    </VizShell>
  );
}

// ── Queue (FIFO) ────────────────────────────────────────────────────────
function QueueViz({ speed, onLine }: VizProps) {
  const { t } = useLang();
  const { run, note, busy } = useRunner(onLine, speed);
  const [clears, setClears] = useState(0);
  const [items, setItems] = useState<Cell[]>(() => toItems([12, 5, 27]));
  const [val, setVal] = useState("42");

  const add = () => {
    const v = clampInt(val);
    if (v === null) return;
    run(enqueue(items, newCell(v)).frames, setItems);
  };

  const take = () => run(dequeue(items).frames, setItems);

  return (
    <VizShell
      busy={busy}
      note={note}
      resetKey={clears}
      controls={
        <>
          <ValueInput
            value={val}
            onChange={setVal}
            onSubmit={add}
            disabled={busy}
          />
          <OpBtn icon={Plus} onClick={add} disabled={busy}>
            {t("ds.enqueue")}
          </OpBtn>
          <OpBtn tone="neutral" icon={Minus} onClick={take} disabled={busy}>
            {t("ds.dequeue")}
          </OpBtn>
          <OpBtn
            tone="neutral"
            icon={Eraser}
            onClick={() => {
              setClears((c) => c + 1);
              run(queueClear().frames, setItems);
            }}
            disabled={busy}
          >
            {t("ds.clear")}
          </OpBtn>
        </>
      }
    >
      <div className="flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          {items.map((it, i) => {
            const isFront = i === 0;
            const isRear = i === items.length - 1;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, x: 28, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -28, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="relative flex flex-col items-center"
              >
                <div
                  className={`h-12 w-14 ${BOX_BASE} ${
                    isFront || isRear ? BOX_ACTIVE : BOX_IDLE
                  }`}
                >
                  {it.value}
                </div>
                <span className="mt-1 h-3 text-[10px] font-medium text-claude-500">
                  {isFront ? t("ds.front") : isRear ? t("ds.rear") : ""}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {items.length === 0 && <EmptyHint>{t("ds.queueEmpty")}</EmptyHint>}
      </div>
    </VizShell>
  );
}

// ── Linked List ─────────────────────────────────────────────────────────
function LinkedListViz({ speed, onLine }: VizProps) {
  const { t } = useLang();
  const { run, note, busy } = useRunner(onLine, speed);
  const [clears, setClears] = useState(0);
  const [list, setList] = useState<ListState>(() => ({
    items: toItems([27, 5, 12]),
    cursor: null,
  }));
  const { items, cursor } = list;
  const [val, setVal] = useState("9");

  const pushFront = () => {
    const v = clampInt(val);
    if (v === null) return;
    run(listPushFront(list, newCell(v)).frames, setList);
  };

  const remove = () => {
    const v = clampInt(val);
    if (v === null) return;
    run(listRemove(list, v).frames, setList);
  };

  return (
    <VizShell
      busy={busy}
      note={note}
      resetKey={clears}
      controls={
        <>
          <ValueInput
            value={val}
            onChange={setVal}
            onSubmit={pushFront}
            disabled={busy}
          />
          <OpBtn icon={Plus} onClick={pushFront} disabled={busy}>
            {t("ds.pushFront")}
          </OpBtn>
          <OpBtn tone="neutral" icon={Minus} onClick={remove} disabled={busy}>
            {t("ds.remove")}
          </OpBtn>
          <OpBtn
            tone="neutral"
            icon={Eraser}
            onClick={() => {
              setClears((c) => c + 1);
              run(listClear().frames, setList);
            }}
            disabled={busy}
          >
            {t("ds.clear")}
          </OpBtn>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-y-4">
        <span className="mr-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {t("ds.head")}
        </span>
        <AnimatePresence mode="popLayout">
          {items.map((it) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, x: -24, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="flex items-center"
            >
              <div
                className={`h-11 w-14 ${BOX_BASE} ${
                  cursor === it.id ? "border-amber-400 bg-amber-400/20 text-amber-700 dark:text-amber-300" : BOX_IDLE
                }`}
              >
                {it.value}
              </div>
              <ArrowRight className="mx-1 size-4 shrink-0 text-zinc-400" />
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="rounded-md border border-zinc-300 px-2 py-1 font-mono text-[11px] text-zinc-400 dark:border-zinc-700">
          NULL
        </span>
      </div>
    </VizShell>
  );
}

// ── Hash Table (chaining) ───────────────────────────────────────────────
function HashTableViz({ speed, onLine }: VizProps) {
  const { t } = useLang();
  const { run, note, busy } = useRunner(onLine, speed);
  const [clears, setClears] = useState(0);
  const [table, setTable] = useState<HashState>(() => ({
    ...[12, 5, 27, 20].reduce((t, k) => hashInsert(t, newCell(k)).final, emptyTable()),
    active: null,
  }));
  const { buckets, active: activeBucket, cursor, flash } = table;
  const [val, setVal] = useState("36");

  const insert = () => {
    const k = clampInt(val);
    if (k === null) return;
    run(hashInsert(table, newCell(k)).frames, setTable);
  };

  const contains = () => {
    const k = clampInt(val);
    if (k === null) return;
    run(hashContains(table, k).frames, setTable);
  };

  return (
    <VizShell
      busy={busy}
      note={note}
      resetKey={clears}
      controls={
        <>
          <ValueInput
            value={val}
            onChange={setVal}
            onSubmit={insert}
            disabled={busy}
          />
          <OpBtn icon={Plus} onClick={insert} disabled={busy}>
            {t("ds.insert")}
          </OpBtn>
          <OpBtn tone="neutral" icon={Search} onClick={contains} disabled={busy}>
            {t("ds.contains")}
          </OpBtn>
          <OpBtn
            tone="neutral"
            icon={Eraser}
            onClick={() => {
              setClears((c) => c + 1);
              run(hashClear().frames, setTable);
            }}
            disabled={busy}
          >
            {t("ds.clear")}
          </OpBtn>
        </>
      }
    >
      <div className="flex w-full max-w-md flex-col gap-1">
        {buckets.map((chain, b) => (
          <div key={b} className="flex items-center gap-2">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-md border font-mono text-[11px] transition-colors ${
                activeBucket === b
                  ? "border-claude-500/60 bg-claude-500/15 text-claude-600 dark:text-claude-400"
                  : "border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
              }`}
            >
              {b}
            </span>
            <div className="flex min-h-8 flex-1 flex-wrap items-center gap-1">
              <AnimatePresence mode="popLayout">
                {chain.map((entry) => {
                  const isCursor = cursor === entry.id;
                  const tone =
                    isCursor && flash === "found"
                      ? "border-claude-500/70 bg-claude-500/20 text-claude-700 dark:text-claude-300"
                      : isCursor && flash === "missing"
                        ? "border-rose-500/70 bg-rose-500/15 text-rose-600 dark:text-rose-300"
                        : isCursor
                          ? "border-amber-400 bg-amber-400/20 text-amber-700 dark:text-amber-300"
                          : BOX_IDLE;
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="flex items-center"
                    >
                      <div
                        className={`h-8 w-11 ${BOX_BASE} text-xs ${tone}`}
                      >
                        {entry.value}
                      </div>
                      <ArrowRight className="mx-0.5 size-3 shrink-0 text-zinc-300 dark:text-zinc-600" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {chain.length === 0 && (
                <span className="text-[11px] text-zinc-300 dark:text-zinc-600">
                  ∅
                </span>
              )}
            </div>
            {activeBucket === b && flash && (
              <span
                className={`shrink-0 ${
                  flash === "found" ? "text-claude-500" : "text-rose-500"
                }`}
              >
                {flash === "found" ? (
                  <Check className="size-4" />
                ) : (
                  <X className="size-4" />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </VizShell>
  );
}

// ── Dispatcher ──────────────────────────────────────────────────────────
const VIZ: Record<string, ComponentType<VizProps>> = {
  stack: StackViz,
  queue: QueueViz,
  "linked-list": LinkedListViz,
  "hash-table": HashTableViz,
};

export default function DataStructureViz({
  slug,
  speed,
  onLine,
}: {
  slug: string;
  speed: number;
  onLine: (line: number) => void;
}) {
  const Viz = VIZ[slug];
  if (!Viz) return null;
  return <Viz speed={speed} onLine={onLine} />;
}
