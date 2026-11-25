import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BUCKETS,
  CAPACITY,
  dequeue,
  emptyTable,
  enqueue,
  hashClear,
  hashContains,
  hashInsert,
  hashOf,
  listClear,
  listPushFront,
  listRemove,
  queueClear,
  stackClear,
  stackPop,
  stackPush,
  type Cell,
  type Op,
} from "../lib/simulations/structures";
import { rng } from "./helpers";

let id = 0;
const cell = (value: number): Cell => ({ id: ++id, value });
const values = (cells: Cell[]) => cells.map((c) => c.value);

/** The last state a frame publishes is the state the operation reports. */
function assertConsistent<S>(o: Op<S>, label: string) {
  const published = o.frames.filter((f) => f.state !== undefined).at(-1)?.state;
  if (published !== undefined) assert.deepEqual(published, o.final, label);
  assert.ok(o.frames.length > 0, `${label}: no frames`);
}

/** A seeded mix of operations: mostly inserts, then removals and lookups. */
function script(seed: number, length = 400): { kind: number; value: number }[] {
  const rand = rng(seed);
  return Array.from({ length }, () => ({
    kind: Math.floor(rand() * 3),
    value: Math.floor(rand() * 40),
  }));
}

test("the stack matches an array used as a LIFO", () => {
  for (const seed of [1, 2, 3]) {
    let s: Cell[] = [];
    const ref: number[] = [];
    for (const [i, { kind, value }] of script(seed).entries()) {
      if (kind < 2) {
        const o = stackPush(s, cell(value));
        assertConsistent(o, `push #${i}`);
        s = o.final;
        if (ref.length < CAPACITY) ref.push(value);
      } else {
        const o = stackPop(s);
        assertConsistent(o, `pop #${i}`);
        const want = ref.pop();
        const ret = o.frames.at(-1)!.note;
        if (want === undefined) assert.equal(ret.k, "n.stack.popEmpty");
        else assert.deepEqual(ret, { k: "n.stack.popReturn", v: { v: want } });
        s = o.final;
      }
      assert.deepEqual(values(s), ref, `seed ${seed}, op #${i}`);
    }
  }
});

test("a full stack ignores a push, as the snippet's overflow check does", () => {
  let s: Cell[] = [];
  for (let i = 0; i < CAPACITY; i++) s = stackPush(s, cell(i)).final;
  const o = stackPush(s, cell(7));
  assert.equal(o.final, s);
  assert.equal(o.frames.at(-1)!.note.k, "n.stack.overflow");
  assert.equal(o.frames.at(-1)!.line, 8);
});

test("the queue matches an array used as a FIFO", () => {
  for (const seed of [4, 5, 6]) {
    let q: Cell[] = [];
    const ref: number[] = [];
    for (const [i, { kind, value }] of script(seed).entries()) {
      if (kind < 2) {
        const o = enqueue(q, cell(value));
        assertConsistent(o, `enqueue #${i}`);
        q = o.final;
        if (ref.length < CAPACITY) ref.push(value);
      } else {
        const o = dequeue(q);
        assertConsistent(o, `dequeue #${i}`);
        const want = ref.shift();
        const ret = o.frames.at(-1)!.note;
        if (want === undefined) assert.equal(ret.k, "n.queue.dequeueEmpty");
        else assert.deepEqual(ret, { k: "n.queue.return", v: { v: want } });
        q = o.final;
      }
      assert.deepEqual(values(q), ref, `seed ${seed}, op #${i}`);
    }
  }
});

test("a full queue ignores an enqueue", () => {
  let q: Cell[] = [];
  for (let i = 0; i < CAPACITY; i++) q = enqueue(q, cell(i)).final;
  const o = enqueue(q, cell(7));
  assert.equal(o.final, q);
  assert.equal(o.frames.at(-1)!.note.k, "n.queue.full");
});

test("the linked list pushes at the head and removes the first match only", () => {
  for (const seed of [7, 8, 9]) {
    let l = { items: [] as Cell[], cursor: null as number | null };
    const ref: number[] = [];
    for (const [i, { kind, value }] of script(seed, 300).entries()) {
      if (kind === 0) {
        const o = listPushFront(l, cell(value));
        assertConsistent(o, `push #${i}`);
        l = o.final;
        ref.unshift(value);
      } else {
        const o = listRemove(l, value);
        assertConsistent(o, `remove #${i}`);
        const at = ref.indexOf(value);
        if (at >= 0) ref.splice(at, 1);
        // One visit per node walked: up to and including the match, or all.
        const visits = o.frames.filter((f) => f.line === 14).length;
        assert.equal(visits, at >= 0 ? at + 1 : l.items.length, `remove #${i} visits`);
        l = o.final;
      }
      assert.deepEqual(values(l.items), ref, `seed ${seed}, op #${i}`);
      assert.equal(l.cursor, null, "the cursor is cleared after every operation");
    }
  }
});

test("the hash table chains at the bucket head and answers lookups like a Set", () => {
  for (const seed of [10, 11, 12]) {
    let h = emptyTable();
    const ref: number[][] = Array.from({ length: BUCKETS }, () => []);
    for (const [i, { kind, value }] of script(seed, 300).entries()) {
      if (kind < 2) {
        const o = hashInsert(h, cell(value));
        assertConsistent(o, `insert #${i}`);
        const collided = ref[hashOf(value)].length > 0;
        assert.ok(
          o.frames.some(
            (f) => f.note.k === (collided ? "n.hash.collision" : "n.hash.noCollision")
          ),
          `insert #${i} collision note`
        );
        ref[hashOf(value)].unshift(value);
        h = o.final;
      } else {
        const o = hashContains(h, value);
        assertConsistent(o, `contains #${i}`);
        const present = ref[hashOf(value)].includes(value);
        assert.equal(o.final.flash, present ? "found" : "missing", `contains(${value})`);
        assert.equal(o.final.active, hashOf(value));
        h = o.final;
      }
      assert.deepEqual(h.buckets.map(values), ref, `seed ${seed}, op #${i}`);
    }
  }
});

test("hashOf maps every key into a bucket, negative ones included", () => {
  for (let k = -50; k <= 50; k++) {
    const b = hashOf(k);
    assert.ok(b >= 0 && b < BUCKETS, `hash(${k}) = ${b}`);
    assert.equal((((k - b) % BUCKETS) + BUCKETS) % BUCKETS, 0, `hash(${k})`);
  }
});

test("clear empties every structure", () => {
  assert.deepEqual(stackClear().final, []);
  assert.deepEqual(queueClear().final, []);
  assert.deepEqual(listClear().final, { items: [], cursor: null });
  assert.deepEqual(hashClear().final, emptyTable());
});
