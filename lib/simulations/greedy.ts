/**
 * Greedy-algorithm engines — pure step generators the greedy renderer replays.
 * `codeLine` values are 0-based and MUST match the C code in lib/data.ts.
 * Step `note` strings stay English for now (same convention as the other
 * generator families — see .docs/PROGRESS.md).
 */

// ── Activity Selection ──────────────────────────────────────────────────
export interface Activity {
  start: number;
  end: number;
}

export interface ActivityStep {
  codeLine: number;
  note: string;
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
    note: string,
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

  snap(0, "Activities are sorted by finish time — earliest finisher first.", null, null);

  let lastFinish = activities[0].end;
  selected.push(0);
  snap(
    3,
    `The earliest finisher [${activities[0].start}, ${activities[0].end}] is always safe — select it.`,
    0,
    lastFinish
  );

  for (let i = 1; i < activities.length; i++) {
    const a = activities[i];
    snap(
      5,
      `Does [${a.start}, ${a.end}] start after the last finish (${lastFinish})?`,
      i,
      lastFinish
    );
    if (a.start >= lastFinish) {
      selected.push(i);
      snap(6, `Yes — no overlap. Select [${a.start}, ${a.end}].`, i, lastFinish);
      lastFinish = a.end;
      snap(7, `Move the frontier: last finish is now ${lastFinish}.`, i, lastFinish);
    } else {
      rejected.push(i);
      snap(
        5,
        `No — it starts at ${a.start} < ${lastFinish}, so it overlaps. Reject it.`,
        i,
        lastFinish
      );
    }
  }

  snap(
    10,
    `Done. Selected ${selected.length} of ${activities.length} activities — the maximum possible.`,
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
  note: string;
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
  const snap = (codeLine: number, note: string, current: number | null) =>
    steps.push({
      codeLine,
      note,
      current,
      taken: taken.map((t) => ({ ...t })),
      remaining,
      total,
    });

  snap(0, "Items are sorted by value/weight ratio — best value per kg first.", null);
  snap(3, `Start with an empty bag: capacity ${capacity} remaining.`, null);

  for (let i = 0; i < items.length && remaining > 0; i++) {
    const it = items[i];
    const ratio = (it.value / it.weight).toFixed(1);
    snap(
      5,
      `Item ${i + 1} (w=${it.weight}, v=${it.value}, ratio ${ratio}): does it fit in the remaining ${remaining}?`,
      i
    );
    if (it.weight <= remaining) {
      remaining -= it.weight;
      taken.push({ index: i, fraction: 1 });
      snap(6, `It fits — take all of it. Remaining capacity: ${remaining}.`, i);
      total += it.value;
      snap(7, `Add its full value: total = ${total}.`, i);
    } else {
      const frac = remaining / it.weight;
      snap(
        9,
        `Only ${remaining} of ${it.weight} fits — take a ${remaining}/${it.weight} fraction.`,
        i
      );
      total += it.value * frac;
      taken.push({ index: i, fraction: frac });
      snap(
        10,
        `Add the partial value ${it.value} × ${remaining}/${it.weight} = ${(it.value * frac).toFixed(1)} → total = ${roundShow(total)}.`,
        i
      );
      remaining = 0;
      snap(11, "The bag is full.", i);
    }
  }

  snap(14, `Done. Maximum value in the bag: ${roundShow(total)}.`, null);
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
  note: string;
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
  const maxDeadline = Math.max(...jobs.map((j) => j.deadline));
  const slots: (number | null)[] = new Array(maxDeadline).fill(null);
  const steps: JobStep[] = [];
  const scheduled: number[] = [];
  const skipped: number[] = [];
  let total = 0;
  const snap = (
    codeLine: number,
    note: string,
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

  snap(0, "Jobs are sorted by profit — most profitable first.", null, null);
  snap(4, `All ${maxDeadline} hours start free.`, null, null);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    let placed = false;
    for (let t = job.deadline; t >= 1; t--) {
      snap(
        9,
        `Job ${job.id} (deadline ${job.deadline}, profit ${job.profit}): is hour ${t} free?`,
        i,
        t
      );
      if (slots[t - 1] === null) {
        slots[t - 1] = i;
        scheduled.push(i);
        snap(10, `Hour ${t} is free — schedule job ${job.id} there.`, i, t);
        total += job.profit;
        snap(11, `Add its profit: total = ${total}.`, i, t);
        placed = true;
        break;
      }
    }
    if (!placed) {
      skipped.push(i);
      snap(
        14,
        `No free hour at or before job ${job.id}'s deadline — skip it.`,
        i,
        null
      );
    }
  }

  snap(16, `Done. Scheduled ${scheduled.length} jobs for a total profit of ${total}.`, null, null);
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
  note: string;
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
    note: string,
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

  snap(
    6,
    `Start with ${roots.length} single-leaf trees, one per character.`,
    "init",
    []
  );

  while (roots.length > 1) {
    // Two smallest roots (the forest is kept sorted by frequency).
    roots.sort((x, y) => nodes[x].freq - nodes[y].freq);
    const a = roots[0];
    const b = roots[1];
    snap(
      8,
      `Pick the two lightest trees: ${label(nodes[a])} and ${label(nodes[b])}.`,
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
      `Merge them under a new node of frequency ${nodes[merged.id].freq} (${nodes[a].freq} + ${nodes[b].freq}).`,
      "merge",
      [merged.id]
    );
    snap(
      15,
      `The forest shrinks to ${roots.length} tree${roots.length > 1 ? "s" : ""}.`,
      "merge",
      [merged.id]
    );
  }

  snap(17, "One tree left — the Huffman tree is complete.", "merge", [roots[0]]);

  // Emit codes: DFS with left=0, right=1.
  const emit = (id: number, path: string) => {
    const n = nodes[id];
    if (n.left === null && n.right === null) {
      codes[n.ch ?? "?"] = path || "0";
      snap(
        23,
        `Leaf '${n.ch}' reached along ${path || "the root"} → code ${path || "0"}.`,
        "code",
        [id]
      );
      return;
    }
    if (n.left !== null) emit(n.left, path + "0");
    if (n.right !== null) emit(n.right, path + "1");
  };
  emit(roots[0], "");

  snap(
    27,
    `Done. Frequent characters got short codes: ${Object.entries(codes)
      .map(([c, code]) => `${c}=${code}`)
      .join(", ")}.`,
    "done",
    []
  );
  return { freqs: sorted, steps };
}

const label = (n: HuffNode): string =>
  n.ch ? `'${n.ch}' (${n.freq})` : `internal (${n.freq})`;
