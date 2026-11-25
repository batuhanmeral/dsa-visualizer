/**
 * Data-structure operations as pure frame generators.
 *
 * Unlike the other engines these are driven by clicks: each operation takes
 * the current state and returns the frames that walk its C code. A frame may
 * carry the state as it is after that line runs, and the UI applies it when
 * the frame fires, so the drawing and the highlighted line stay in step.
 * `codeLine` values are 0-based and MUST match the C code in lib/algo-code.ts.
 */

import { msg, type Note } from "./note";

/** One stored value. `id` keeps its box identity across moves for animation. */
export interface Cell {
  id: number;
  value: number;
}

export interface OpFrame<S> {
  line: number;
  note: Note;
  /** State after this line; absent when the line changes nothing visible. */
  state?: S;
}

export interface Op<S> {
  frames: OpFrame<S>[];
  /** State after the whole operation. */
  final: S;
}

/** `#define MAX 100` in the stack and queue snippets. */
export const CAPACITY = 100;
/** `#define BUCKETS 8` in the hash-table snippet. */
export const BUCKETS = 8;

const op = <S>(frames: OpFrame<S>[], final: S): Op<S> => ({ frames, final });

// ── Stack ───────────────────────────────────────────────────────────────
/** Bottom first; the last cell is the top. */
export type StackState = Cell[];

export function stackPush(s: StackState, cell: Cell): Op<StackState> {
  const call = { line: 7, note: msg("n.stack.pushCall", { v: cell.value }) };
  if (s.length === CAPACITY)
    return op([call, { line: 8, note: msg("n.stack.overflow", { v: cell.value }) }], s);
  const next = [...s, cell];
  return op(
    [
      call,
      { line: 8, note: msg("n.stack.room") },
      { line: 9, note: msg("n.stack.store", { v: cell.value }), state: next },
    ],
    next
  );
}

export function stackPop(s: StackState): Op<StackState> {
  const call = { line: 12, note: msg("n.stack.popCall") };
  if (s.length === 0) return op([call, { line: 13, note: msg("n.stack.popEmpty") }], s);
  const next = s.slice(0, -1);
  return op(
    [
      call,
      { line: 13, note: msg("n.stack.notEmpty") },
      { line: 14, note: msg("n.stack.popReturn", { v: s[s.length - 1].value }), state: next },
    ],
    next
  );
}

export const stackClear = (): Op<StackState> =>
  op([{ line: 4, note: msg("n.stack.cleared"), state: [] }], []);

// ── Queue ───────────────────────────────────────────────────────────────
/** Front first. */
export type QueueState = Cell[];

export function enqueue(q: QueueState, cell: Cell): Op<QueueState> {
  const call = { line: 7, note: msg("n.queue.enqueueCall", { v: cell.value }) };
  if (q.length === CAPACITY)
    return op([call, { line: 8, note: msg("n.queue.full", { v: cell.value }) }], q);
  const next = [...q, cell];
  return op(
    [
      call,
      { line: 8, note: msg("n.queue.room") },
      { line: 9, note: msg("n.queue.advanceRear") },
      { line: 10, note: msg("n.queue.write", { v: cell.value }), state: next },
      { line: 11, note: msg("n.queue.sizeUp") },
    ],
    next
  );
}

export function dequeue(q: QueueState): Op<QueueState> {
  const call = { line: 14, note: msg("n.queue.dequeueCall") };
  if (q.length === 0) return op([call, { line: 15, note: msg("n.queue.dequeueEmpty") }], q);
  const v = q[0].value;
  const next = q.slice(1);
  return op(
    [
      call,
      { line: 15, note: msg("n.queue.notEmpty") },
      { line: 16, note: msg("n.queue.readFront", { v }) },
      { line: 17, note: msg("n.queue.advanceFront") },
      { line: 18, note: msg("n.queue.sizeDown") },
      { line: 19, note: msg("n.queue.return", { v }), state: next },
    ],
    next
  );
}

export const queueClear = (): Op<QueueState> =>
  op([{ line: 4, note: msg("n.queue.cleared"), state: [] }], []);

// ── Singly linked list ──────────────────────────────────────────────────
export interface ListState {
  /** Head first. */
  items: Cell[];
  /** Id of the node the recursion is looking at. */
  cursor: number | null;
}

export function listPushFront(l: ListState, cell: Cell): Op<ListState> {
  const v = cell.value;
  const next = { items: [cell, ...l.items], cursor: null };
  return op(
    [
      { line: 5, note: msg("n.list.pushCall", { v }) },
      { line: 6, note: msg("n.list.allocate") },
      { line: 7, note: msg("n.list.setData", { v }) },
      { line: 8, note: msg("n.list.setNext") },
      { line: 9, note: msg("n.list.returnHead"), state: next },
    ],
    next
  );
}

/** `removeValue`: unlinks the first node holding `v`, if any. */
export function listRemove(l: ListState, v: number): Op<ListState> {
  const frames: OpFrame<ListState>[] = [{ line: 12, note: msg("n.list.removeCall", { v }) }];
  for (const [i, node] of l.items.entries()) {
    frames.push({
      line: 13,
      note: msg(i === 0 ? "n.list.headNotNull" : "n.list.subNotNull"),
      state: { items: l.items, cursor: node.id },
    });
    frames.push({ line: 14, note: msg("n.list.compare", { value: node.value, v }) });
    if (node.value === v) {
      const next = { items: l.items.filter((x) => x.id !== node.id), cursor: null };
      frames.push({ line: 15, note: msg("n.list.match") });
      frames.push({ line: 16, note: msg("n.list.free", { v }), state: next });
      return op(frames, next);
    }
    frames.push({ line: 19, note: msg("n.list.recurse") });
  }
  const next = { items: l.items, cursor: null };
  frames.push({ line: 13, note: msg("n.list.absent", { v }), state: next });
  return op(frames, next);
}

export const listClear = (): Op<ListState> => {
  const empty = { items: [], cursor: null };
  return op([{ line: 13, note: msg("n.list.cleared"), state: empty }], empty);
};

// ── Hash table with separate chaining ───────────────────────────────────
export interface HashState {
  /** `BUCKETS` chains, each head first. */
  buckets: Cell[][];
  /** Bucket the current operation hashed to. */
  active: number | null;
  /** Id of the entry being compared. */
  cursor: number | null;
  /** Outcome of the last lookup. */
  flash: "found" | "missing" | null;
}

/** `hash()` from the snippet: non-negative even for negative keys. */
export const hashOf = (key: number): number => ((key % BUCKETS) + BUCKETS) % BUCKETS;

export function emptyTable(): HashState {
  return {
    buckets: Array.from({ length: BUCKETS }, () => []),
    active: null,
    cursor: null,
    flash: null,
  };
}

export function hashInsert(h: HashState, cell: Cell): Op<HashState> {
  const k = cell.value;
  const b = hashOf(k);
  const hashed = { ...h, active: b, cursor: null, flash: null };
  const next = {
    ...hashed,
    buckets: h.buckets.map((chain, i) => (i === b ? [cell, ...chain] : chain)),
  };
  return op(
    [
      { line: 13, note: msg("n.hash.insertCall", { k }) },
      { line: 14, note: msg("n.hash.hash", { k, buckets: BUCKETS, b }), state: hashed },
      { line: 15, note: msg("n.hash.allocate") },
      { line: 16, note: msg("n.hash.setKey", { k }) },
      {
        line: 17,
        note: msg(h.buckets[b].length > 0 ? "n.hash.collision" : "n.hash.noCollision"),
      },
      { line: 18, note: msg("n.hash.store", { b }), state: next },
    ],
    next
  );
}

export function hashContains(h: HashState, k: number): Op<HashState> {
  const b = hashOf(k);
  const walking = { ...h, active: b, cursor: null, flash: null };
  const frames: OpFrame<HashState>[] = [
    { line: 21, note: msg("n.hash.containsCall", { k }) },
    { line: 22, note: msg("n.hash.walk", { k, b }), state: walking },
  ];
  for (const entry of h.buckets[b]) {
    const at = { ...walking, cursor: entry.id };
    frames.push({ line: 22, note: msg("n.hash.visit", { value: entry.value }), state: at });
    frames.push({ line: 23, note: msg("n.hash.compare", { value: entry.value, k }) });
    if (entry.value === k) {
      const found = { ...at, flash: "found" as const };
      frames.push({ line: 23, note: msg("n.hash.found", { k }), state: found });
      return op(frames, found);
    }
  }
  const missing = { ...walking, flash: "missing" as const };
  frames.push({ line: 24, note: msg("n.hash.missing", { k, b }), state: missing });
  return op(frames, missing);
}

export const hashClear = (): Op<HashState> => {
  const empty = emptyTable();
  return op([{ line: 7, note: msg("n.hash.cleared"), state: empty }], empty);
};
