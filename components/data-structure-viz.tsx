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
import { AnimatePresence, motion } from "framer-motion";
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
import { msg, type Note } from "@/lib/simulations/note";
import { InvariantContext, SpeedSelect } from "./step-player";

/**
 * Interactive data-structure playground. Unlike the sorting/searching engines
 * (which replay a precomputed step list), data structures are driven by the
 * user clicking operations. Each operation emits a list of `OpFrame`s that the
 * shared runner walks through at the selected speed: every frame highlights a
 * C-code line, updates the status note, and optionally mutates the live state
 * via `apply` — so the box animation and the highlighted line stay in sync.
 */

interface OpFrame {
  /** 0-based line of the algorithm's C code (must match lib/data.ts). */
  line: number;
  note: Note;
  /** State mutation applied exactly when this frame fires. */
  apply?: () => void;
}

interface Item {
  id: number;
  value: number;
}

let _id = 0;
const nextId = () => ++_id;
const toItems = (vals: number[]): Item[] =>
  vals.map((v) => ({ id: nextId(), value: v }));

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
    (frames: OpFrame[]) => {
      clear();
      if (!frames.length) return;
      setBusy(true);
      const step = 720 / speedRef.current;
      frames.forEach((f, i) => {
        timers.current.push(
          window.setTimeout(() => {
            onLine(f.line);
            setNote(f.note);
            f.apply?.();
            if (i === frames.length - 1) {
              timers.current.push(
                window.setTimeout(() => setBusy(false), step)
              );
            }
          }, i * step)
        );
      });
    },
    [clear, onLine]
  );

  return { run, note, busy };
}

// ── Shared UI atoms ─────────────────────────────────────────────────────
function VizShell({
  children,
  controls,
  note,
  busy,
}: {
  children: ReactNode;
  controls: ReactNode;
  note: Note;
  busy: boolean;
}) {
  const { t, tn } = useLang();
  const invariant = useContext(InvariantContext);
  return (
    <div className="relative flex h-full w-full flex-col px-6 pb-4 pt-14 sm:px-8">
      <div className="scrollbar-slim flex min-h-0 flex-1 items-center justify-center overflow-auto">
        {children}
      </div>
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white/85 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="flex flex-wrap items-center gap-2">{controls}</div>
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span
              className={`size-2 shrink-0 rounded-full ${
                busy ? "animate-pulse bg-claude-500" : "bg-zinc-400"
              }`}
            />
            <span className="truncate">{tn(note)}</span>
          </p>
          {invariant && (
            /* Why the operation is safe, not what it did. */
            <p className="mt-1.5 flex min-w-0 items-start gap-2 border-l-2 border-sky-500/40 pl-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              <span className="shrink-0 font-medium text-sky-600 dark:text-sky-400">
                {t("ws.invariant")}
              </span>
              <span>{tn(invariant)}</span>
            </p>
          )}
          <SpeedSelect />
        </div>
      </div>
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
  const [items, setItems] = useState<Item[]>(() => toItems([12, 5, 27]));
  const [val, setVal] = useState("42");

  const push = () => {
    const v = clampInt(val);
    if (v === null) return;
    const item = { id: nextId(), value: v };
    run([
      { line: 7, note: msg("n.stack.pushCall", { v }) },
      { line: 8, note: msg("n.stack.room") },
      {
        line: 9,
        note: msg("n.stack.store", { v }),
        apply: () => setItems((s) => [...s, item]),
      },
    ]);
  };

  const pop = () => {
    if (!items.length) {
      run([
        { line: 12, note: msg("n.stack.popCall") },
        { line: 13, note: msg("n.stack.popEmpty") },
      ]);
      return;
    }
    const top = items[items.length - 1];
    run([
      { line: 12, note: msg("n.stack.popCall") },
      { line: 13, note: msg("n.stack.notEmpty") },
      {
        line: 14,
        note: msg("n.stack.popReturn", { v: top.value }),
        apply: () => setItems((s) => s.slice(0, -1)),
      },
    ]);
  };

  return (
    <VizShell
      busy={busy}
      note={note}
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
              setItems([]);
              run([{ line: 4, note: msg("n.stack.cleared") }]);
            }}
            disabled={busy}
          >
            {t("ds.clear")}
          </OpBtn>
        </>
      }
    >
      <div className="flex flex-col-reverse items-center gap-1.5">
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
  const [items, setItems] = useState<Item[]>(() => toItems([12, 5, 27]));
  const [val, setVal] = useState("42");

  const enqueue = () => {
    const v = clampInt(val);
    if (v === null) return;
    const item = { id: nextId(), value: v };
    run([
      { line: 7, note: msg("n.queue.enqueueCall", { v }) },
      { line: 8, note: msg("n.queue.room") },
      { line: 9, note: msg("n.queue.advanceRear") },
      {
        line: 10,
        note: msg("n.queue.write", { v }),
        apply: () => setItems((s) => [...s, item]),
      },
      { line: 11, note: msg("n.queue.sizeUp") },
    ]);
  };

  const dequeue = () => {
    if (!items.length) {
      run([
        { line: 14, note: msg("n.queue.dequeueCall") },
        { line: 15, note: msg("n.queue.dequeueEmpty") },
      ]);
      return;
    }
    const front = items[0];
    run([
      { line: 14, note: msg("n.queue.dequeueCall") },
      { line: 15, note: msg("n.queue.notEmpty") },
      { line: 16, note: msg("n.queue.readFront", { v: front.value }) },
      { line: 17, note: msg("n.queue.advanceFront") },
      { line: 18, note: msg("n.queue.sizeDown") },
      {
        line: 19,
        note: msg("n.queue.return", { v: front.value }),
        apply: () => setItems((s) => s.slice(1)),
      },
    ]);
  };

  return (
    <VizShell
      busy={busy}
      note={note}
      controls={
        <>
          <ValueInput
            value={val}
            onChange={setVal}
            onSubmit={enqueue}
            disabled={busy}
          />
          <OpBtn icon={Plus} onClick={enqueue} disabled={busy}>
            {t("ds.enqueue")}
          </OpBtn>
          <OpBtn tone="neutral" icon={Minus} onClick={dequeue} disabled={busy}>
            {t("ds.dequeue")}
          </OpBtn>
          <OpBtn
            tone="neutral"
            icon={Eraser}
            onClick={() => {
              setItems([]);
              run([{ line: 4, note: msg("n.queue.cleared") }]);
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
  const [items, setItems] = useState<Item[]>(() => toItems([27, 5, 12]));
  const [cursor, setCursor] = useState<number | null>(null);
  const [val, setVal] = useState("9");

  const pushFront = () => {
    const v = clampInt(val);
    if (v === null) return;
    const item = { id: nextId(), value: v };
    run([
      { line: 5, note: msg("n.list.pushCall", { v }) },
      { line: 6, note: msg("n.list.allocate") },
      { line: 7, note: msg("n.list.setData", { v }) },
      { line: 8, note: msg("n.list.setNext") },
      {
        line: 9,
        note: msg("n.list.returnHead"),
        apply: () => {
          setCursor(null);
          setItems((s) => [item, ...s]);
        },
      },
    ]);
  };

  const remove = () => {
    const v = clampInt(val);
    if (v === null) return;
    const frames: OpFrame[] = [{ line: 12, note: msg("n.list.removeCall", { v }) }];
    let matched = false;
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      frames.push({
        line: 13,
        note: msg(i === 0 ? "n.list.headNotNull" : "n.list.subNotNull"),
        apply: () => setCursor(node.id),
      });
      frames.push({ line: 14, note: msg("n.list.compare", { value: node.value, v }) });
      if (node.value === v) {
        frames.push({ line: 15, note: msg("n.list.match") });
        frames.push({
          line: 16,
          note: msg("n.list.free", { v }),
          apply: () => {
            setItems((s) => s.filter((x) => x.id !== node.id));
            setCursor(null);
          },
        });
        matched = true;
        break;
      }
      frames.push({ line: 19, note: msg("n.list.recurse") });
    }
    if (!matched) {
      frames.push({
        line: 13,
        note: msg("n.list.absent", { v }),
        apply: () => setCursor(null),
      });
    }
    run(frames);
  };

  return (
    <VizShell
      busy={busy}
      note={note}
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
              setItems([]);
              setCursor(null);
              run([{ line: 13, note: msg("n.list.cleared") }]);
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
const BUCKETS = 8;

function HashTableViz({ speed, onLine }: VizProps) {
  const { t } = useLang();
  const { run, note, busy } = useRunner(onLine, speed);
  const [buckets, setBuckets] = useState<Item[][]>(() => {
    const b: Item[][] = Array.from({ length: BUCKETS }, () => []);
    [12, 5, 27, 20].forEach((k) => b[k % BUCKETS].unshift({ id: nextId(), value: k }));
    return b;
  });
  const [activeBucket, setActiveBucket] = useState<number | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [flash, setFlash] = useState<"found" | "missing" | null>(null);
  const [val, setVal] = useState("36");

  const insert = () => {
    const k = clampInt(val);
    if (k === null) return;
    const b = k % BUCKETS;
    const collided = buckets[b].length > 0;
    const item = { id: nextId(), value: k };
    run([
      { line: 13, note: msg("n.hash.insertCall", { k }) },
      {
        line: 14,
        note: msg("n.hash.hash", { k, buckets: BUCKETS, b }),
        apply: () => {
          setFlash(null);
          setCursor(null);
          setActiveBucket(b);
        },
      },
      { line: 15, note: msg("n.hash.allocate") },
      { line: 16, note: msg("n.hash.setKey", { k }) },
      {
        line: 17,
        note: msg(collided ? "n.hash.collision" : "n.hash.noCollision"),
      },
      {
        line: 18,
        note: msg("n.hash.store", { b }),
        apply: () =>
          setBuckets((bs) =>
            bs.map((chain, i) => (i === b ? [item, ...chain] : chain))
          ),
      },
    ]);
  };

  const contains = () => {
    const k = clampInt(val);
    if (k === null) return;
    const b = k % BUCKETS;
    const chain = buckets[b];
    const frames: OpFrame[] = [
      { line: 21, note: msg("n.hash.containsCall", { k }) },
      {
        line: 22,
        note: msg("n.hash.walk", { k, b }),
        apply: () => {
          setFlash(null);
          setCursor(null);
          setActiveBucket(b);
        },
      },
    ];
    let matched = false;
    for (const entry of chain) {
      frames.push({
        line: 22,
        note: msg("n.hash.visit", { value: entry.value }),
        apply: () => setCursor(entry.id),
      });
      frames.push({ line: 23, note: msg("n.hash.compare", { value: entry.value, k }) });
      if (entry.value === k) {
        frames.push({
          line: 23,
          note: msg("n.hash.found", { k }),
          apply: () => setFlash("found"),
        });
        matched = true;
        break;
      }
    }
    if (!matched) {
      frames.push({
        line: 24,
        note: msg("n.hash.missing", { k, b }),
        apply: () => {
          setCursor(null);
          setFlash("missing");
        },
      });
    }
    run(frames);
  };

  return (
    <VizShell
      busy={busy}
      note={note}
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
              setBuckets(Array.from({ length: BUCKETS }, () => []));
              setActiveBucket(null);
              setCursor(null);
              setFlash(null);
              run([{ line: 7, note: msg("n.hash.cleared") }]);
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

export function hasDataStructureViz(slug: string): boolean {
  return slug in VIZ;
}

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
