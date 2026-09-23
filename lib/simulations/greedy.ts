/**
 * Greedy-algorithm engines — pure step generators the greedy renderer replays.
 * `codeLine` values are 0-based and MUST match the C code in lib/data.ts.
 * Step `note` strings stay English for now (same convention as the other
 * generator families — see .docs/PROGRESS.md).
 */

import { msg, type Note } from "./note";

// ── Activity Selection ──────────────────────────────────────────────────
export interface Activity {
  start: number;
  end: number;
}

export interface ActivityStep {
  codeLine: number;
  note: Note;
  /** Index (in the sorted list) being considered right now. */
  current: number | null;
  selected: number[];
  rejected: number[];
  /** Finish time of the last selected activity (the greedy frontier). */
  lastFinish: number | null;
}

export interface ActivityResult {
  activities: Activity[];
  steps: ActivityStep[];
}

export function activitySelectionSteps(input: Activity[]): ActivityResult {
  const activities = [...input].sort((x, y) => x.end - y.end);
  const steps: ActivityStep[] = [];
  const selected: number[] = [];
  const rejected: number[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    current: number | null,
    lastFinish: number | null
  ) =>
    steps.push({
      codeLine,
      note,
      current,
      selected: [...selected],
      rejected: [...rejected],
      lastFinish,
    });

  if (activities.length === 0) {
    snap(0, msg("n.activity.empty"), null, null);
    return { activities, steps };
  }

  snap(0, msg("n.activity.sorted"), null, null);

  let lastFinish = activities[0].end;
  selected.push(0);
  snap(
    3,
    msg("n.activity.first", {
      start: activities[0].start,
      end: activities[0].end,
    }),
    0,
    lastFinish
  );

  for (let i = 1; i < activities.length; i++) {
    const a = activities[i];
    snap(
      5,
      msg("n.activity.ask", { start: a.start, end: a.end, last: lastFinish }),
      i,
      lastFinish
    );
    if (a.start >= lastFinish) {
      selected.push(i);
      snap(6, msg("n.activity.take", { start: a.start, end: a.end }), i, lastFinish);
      lastFinish = a.end;
      snap(7, msg("n.activity.frontier", { last: lastFinish }), i, lastFinish);
    } else {
      rejected.push(i);
      snap(
        5,
        msg("n.activity.reject", { start: a.start, last: lastFinish }),
        i,
        lastFinish
      );
    }
  }

  snap(
    10,
    msg("n.activity.done", {
      selected: selected.length,
      total: activities.length,
    }),
    null,
    lastFinish
  );
  return { activities, steps };
}

// ── Fractional Knapsack ─────────────────────────────────────────────────
export interface FracItem {
  weight: number;
  value: number;
}

export interface FracTaken {
  index: number;
  /** 0..1 — how much of the item went into the bag. */
  fraction: number;
}

export interface FracStep {
  codeLine: number;
  note: Note;
  current: number | null;
  taken: FracTaken[];
  remaining: number;
  total: number;
}

export interface FracResult {
  items: FracItem[];
  capacity: number;
  steps: FracStep[];
}

export function fractionalKnapsackSteps(
  input: FracItem[],
  capacity: number
): FracResult {
  const items = [...input].sort(
    (x, y) => y.value / y.weight - x.value / x.weight
  );
  const steps: FracStep[] = [];
  const taken: FracTaken[] = [];
  let remaining = capacity;
  let total = 0;
  const snap = (codeLine: number, note: Note, current: number | null) =>
    steps.push({
      codeLine,
      note,
      current,
      taken: taken.map((t) => ({ ...t })),
      remaining,
      total,
    });

  if (items.length === 0) {
    snap(0, msg("n.frac.empty"), null);
    return { items, capacity, steps };
  }

  snap(0, msg("n.frac.sorted"), null);
  snap(3, msg("n.frac.start", { capacity }), null);

  for (let i = 0; i < items.length && remaining > 0; i++) {
    const it = items[i];
    const ratio = (it.value / it.weight).toFixed(1);
    snap(
      5,
      msg("n.frac.ask", {
        i: i + 1,
        w: it.weight,
        v: it.value,
        ratio,
        remaining,
      }),
      i
    );
    if (it.weight <= remaining) {
      remaining -= it.weight;
      taken.push({ index: i, fraction: 1 });
      snap(6, msg("n.frac.whole", { remaining }), i);
      total += it.value;
      snap(7, msg("n.frac.addWhole", { total: roundShow(total) }), i);
    } else {
      const frac = remaining / it.weight;
      snap(9, msg("n.frac.partial", { remaining, w: it.weight }), i);
      total += it.value * frac;
      taken.push({ index: i, fraction: frac });
      snap(
        10,
        msg("n.frac.addPartial", {
          v: it.value,
          remaining,
          w: it.weight,
          part: (it.value * frac).toFixed(1),
          total: roundShow(total),
        }),
        i
      );
      remaining = 0;
      snap(11, msg("n.frac.full"), i);
    }
  }

  snap(14, msg("n.frac.done", { total: roundShow(total) }), null);
  return { items, capacity, steps };
}

const roundShow = (v: number): string =>
  Number.isInteger(v) ? String(v) : v.toFixed(1);

// ── Job Sequencing with Deadlines ───────────────────────────────────────
export interface Job {
  id: string;
  deadline: number;
  profit: number;
}

export interface JobStep {
  codeLine: number;
  note: Note;
  /** Index (in the sorted list) being placed right now. */
  current: number | null;
  /** 1-based hour being probed for a free slot. */
  probe: number | null;
  /** slots[t-1] = index of the job scheduled in hour t (null = free). */
  slots: (number | null)[];
  scheduled: number[];
  skipped: number[];
  total: number;
}

export interface JobResult {
  jobs: Job[];
  maxDeadline: number;
  steps: JobStep[];
}

export function jobSequencingSteps(input: Job[]): JobResult {
  const jobs = [...input].sort((x, y) => y.profit - x.profit);
  // Math.max of an empty list is -Infinity, which `new Array()` rejects.
  const maxDeadline = jobs.length
    ? Math.max(1, ...jobs.map((j) => j.deadline))
    : 0;
  const slots: (number | null)[] = new Array(maxDeadline).fill(null);
  const steps: JobStep[] = [];
  const scheduled: number[] = [];
  const skipped: number[] = [];
  let total = 0;
  const snap = (
    codeLine: number,
    note: Note,
    current: number | null,
    probe: number | null
  ) =>
    steps.push({
      codeLine,
      note,
      current,
      probe,
      slots: [...slots],
      scheduled: [...scheduled],
      skipped: [...skipped],
      total,
    });

  if (jobs.length === 0) {
    snap(0, msg("n.job.empty"), null, null);
    return { jobs, maxDeadline, steps };
  }

  snap(0, msg("n.job.sorted"), null, null);
  snap(4, msg("n.job.freeHours", { hours: maxDeadline }), null, null);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    let placed = false;
    for (let t = job.deadline; t >= 1; t--) {
      snap(
        9,
        msg("n.job.ask", {
          id: job.id,
          deadline: job.deadline,
          profit: job.profit,
          t,
        }),
        i,
        t
      );
      if (slots[t - 1] === null) {
        slots[t - 1] = i;
        scheduled.push(i);
        snap(10, msg("n.job.schedule", { t, id: job.id }), i, t);
        total += job.profit;
        snap(11, msg("n.job.addProfit", { total }), i, t);
        placed = true;
        break;
      }
    }
    if (!placed) {
      skipped.push(i);
      snap(14, msg("n.job.skip", { id: job.id }), i, null);
    }
  }

  snap(16, msg("n.job.done", { count: scheduled.length, total }), null, null);
  return { jobs, maxDeadline, steps };
}

// ── Huffman Coding ──────────────────────────────────────────────────────
export interface HuffNode {
  id: number;
  /** Leaf character, or null for internal merge nodes. */
  ch: string | null;
  freq: number;
  left: number | null;
  right: number | null;
}

export type HuffPhase = "init" | "pick" | "merge" | "code" | "done";

export interface HuffStep {
  codeLine: number;
  note: Note;
  phase: HuffPhase;
  /** Every node created so far, keyed by id. */
  nodes: Record<number, HuffNode>;
  /** Current forest roots, in queue order. */
  roots: number[];
  /** Node ids to spotlight (the two minima, or the freshly merged node). */
  highlight: number[];
  /** Prefix codes emitted so far (char → bit string). */
  codes: Record<string, string>;
}

export interface HuffResult {
  freqs: { ch: string; freq: number }[];
  steps: HuffStep[];
}

export function huffmanSteps(freqs: { ch: string; freq: number }[]): HuffResult {
  const sorted = [...freqs].sort((a, b) => a.freq - b.freq);
  const nodes: Record<number, HuffNode> = {};
  let nextId = 0;
  const roots: number[] = [];
  for (const f of sorted) {
    nodes[nextId] = { id: nextId, ch: f.ch, freq: f.freq, left: null, right: null };
    roots.push(nextId);
    nextId++;
  }
  const codes: Record<string, string> = {};
  const steps: HuffStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    phase: HuffPhase,
    highlight: number[]
  ) =>
    steps.push({
      codeLine,
      note,
      phase,
      nodes: structuredClone(nodes),
      roots: [...roots],
      highlight,
      codes: { ...codes },
    });

  if (roots.length === 0) {
    snap(6, msg("n.huff.empty"), "init", []);
    return { freqs: sorted, steps };
  }
  if (roots.length === 1) {
    // The merge loop never runs, so there is no tree — but the single symbol
    // still needs a code. Emit it directly instead of walking a missing root.
    const only = nodes[roots[0]];
    codes[only.ch ?? "?"] = "0";
    snap(23, msg("n.huff.single"), "code", [only.id]);
    snap(
      27,
      msg("n.huff.done", {
        codes: Object.entries(codes)
          .map(([c, code]) => `${c}=${code}`)
          .join(", "),
      }),
      "done",
      []
    );
    return { freqs: sorted, steps };
  }

  snap(6, msg("n.huff.start", { count: roots.length }), "init", []);

  while (roots.length > 1) {
    // Two smallest roots (the forest is kept sorted by frequency).
    roots.sort((x, y) => nodes[x].freq - nodes[y].freq);
    const a = roots[0];
    const b = roots[1];
    snap(
      8,
      msg("n.huff.pick", { a: label(nodes[a]), b: label(nodes[b]) }),
      "pick",
      [a, b]
    );
    const merged: HuffNode = {
      id: nextId,
      ch: null,
      freq: nodes[a].freq + nodes[b].freq,
      left: a,
      right: b,
    };
    nodes[nextId] = merged;
    roots.splice(0, 2, nextId);
    nextId++;
    snap(
      10,
      msg("n.huff.merge", {
        sum: nodes[merged.id].freq,
        fa: nodes[a].freq,
        fb: nodes[b].freq,
      }),
      "merge",
      [merged.id]
    );
    snap(15, msg("n.huff.shrink", { count: roots.length }), "merge", [merged.id]);
  }

  snap(17, msg("n.huff.complete"), "merge", [roots[0]]);

  // Emit codes: DFS with left=0, right=1.
  const emit = (id: number, path: string) => {
    const n = nodes[id];
    if (n.left === null && n.right === null) {
      codes[n.ch ?? "?"] = path || "0";
      // A single-symbol alphabet returns above, so every leaf here has a path.
      snap(23, msg("n.huff.leaf", { ch: n.ch ?? "?", path, code: path }), "code", [id]);
      return;
    }
    if (n.left !== null) emit(n.left, path + "0");
    if (n.right !== null) emit(n.right, path + "1");
  };
  emit(roots[0], "");

  snap(
    27,
    msg("n.huff.done", {
      codes: Object.entries(codes)
        .map(([c, code]) => `${c}=${code}`)
        .join(", "),
    }),
    "done",
    []
  );
  return { freqs: sorted, steps };
}

/**
 * A forest root as a nested note, so "internal" is translated and each label
 * carries its own values (the two picked roots may both be internal nodes).
 */
const label = (n: HuffNode): Note =>
  n.ch
    ? msg("n.huff.leafLabel", { ch: n.ch, freq: n.freq })
    : msg("n.huff.internal", { freq: n.freq });
