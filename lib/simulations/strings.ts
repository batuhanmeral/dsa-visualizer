// Pure step generators for the String-matching visualizers (KMP, Rabin-Karp,
// Z-Algorithm, Manacher). Same shape as the other "precomputed step list"
// families: a generator returns the full `StringStep[]`, and `string-viz.tsx`
// scrubs through them. `codeLine` is the 0-based line into the matching C
// snippet in `lib/data.ts`.

import { msg, type Note } from "./note";

export type Tone =
  | "idle"
  | "active" // pointer currently under inspection
  | "match" // characters compared equal
  | "mismatch" // characters compared unequal
  | "window" // current alignment / scan window
  | "done"; // confirmed match region

/** One horizontal row of character boxes, optionally with a number row below. */
export interface Track {
  label: string;
  chars: string[];
  tones: Tone[];
  /** Left padding in cells — lets the pattern slide under the text. */
  offset?: number;
  /** Aligned numeric row under the chars (failure/Z/radius arrays). */
  arr?: (number | null)[];
  arrTones?: Tone[];
}

export interface StrVar {
  label: string;
  value: string;
  tone?: Tone;
}

export interface StringStep {
  codeLine: number;
  note: Note;
  tracks: Track[];
  vars?: StrVar[];
  status: Tone;
}

const idle = (n: number): Tone[] => new Array(n).fill("idle");

// ── KMP ─────────────────────────────────────────────────────────────────
export function kmpSteps(text: string, pattern: string): StringStep[] {
  const t = text;
  const p = pattern;
  const n = t.length;
  const m = p.length;
  const steps: StringStep[] = [];

  const lps = new Array(m).fill(0);
  const shown: (number | null)[] = new Array(m).fill(null);

  const buildTrack = (iActive: number, lenActive: number): Track => {
    const tones = idle(m);
    if (iActive >= 0 && iActive < m) tones[iActive] = "active";
    if (lenActive >= 0 && lenActive < m) tones[lenActive] = "match";
    const arrTones = idle(m);
    for (let k = 0; k < m; k++) if (shown[k] !== null) arrTones[k] = "window";
    if (iActive >= 0 && iActive < m) arrTones[iActive] = "active";
    return { label: "pattern", chars: p.split(""), tones, arr: [...shown], arrTones };
  };

  const emitBuild = (
    codeLine: number,
    note: Note,
    i: number,
    len: number,
    status: Tone
  ) => {
    steps.push({
      codeLine,
      note,
      status,
      tracks: [buildTrack(i, len)],
      vars: [
        { label: "i", value: String(i) },
        { label: "len", value: String(len) },
      ],
    });
  };

  // Phase 1 — build the longest-proper-prefix-suffix table.
  shown[0] = 0;
  emitBuild(2, msg("n.kmp.lps0"), 0, 0, "window");
  let len = 0;
  let i = 1;
  while (i < m) {
    emitBuild(4, msg("n.kmp.compare", { i, pi: p[i], len, pl: p[len] }), i, len, "active");
    if (p[i] === p[len]) {
      len++;
      lps[i] = len;
      shown[i] = len;
      emitBuild(5, msg("n.kmp.extend", { i, len }), i, len - 1, "match");
      i++;
    } else if (len > 0) {
      const from = len - 1;
      len = lps[from];
      emitBuild(7, msg("n.kmp.fallback", { from, len }), i, len, "mismatch");
    } else {
      lps[i] = 0;
      shown[i] = 0;
      emitBuild(9, msg("n.kmp.zero", { i }), i, len, "mismatch");
      i++;
    }
  }

  // Phase 2 — scan the text.
  const matched = new Array(n).fill(false);
  const searchTracks = (ti: number, pj: number): Track[] => {
    const tTones = idle(n);
    for (let k = 0; k < n; k++) if (matched[k]) tTones[k] = "done";
    if (ti >= 0 && ti < n) tTones[ti] = "active";
    const pTones = idle(m);
    if (pj >= 0 && pj < m) pTones[pj] = "active";
    return [
      { label: "text", chars: t.split(""), tones: tTones },
      { label: "pattern", chars: p.split(""), tones: pTones, offset: ti - pj },
    ];
  };
  const emitSearch = (
    codeLine: number,
    note: Note,
    ti: number,
    pj: number,
    status: Tone
  ) => {
    steps.push({
      codeLine,
      note,
      status,
      tracks: searchTracks(ti, pj),
      vars: [
        { label: "i", value: String(ti) },
        { label: "j", value: String(pj) },
      ],
    });
  };

  i = 0;
  let j = 0;
  const hits: number[] = [];
  while (i < n) {
    emitSearch(21, msg("n.kmp.scan", { i, ti: t[i], j, pj: p[j] }), i, j, "active");
    if (t[i] === p[j]) {
      i++;
      j++;
      if (j === m) {
        const start = i - j;
        for (let k = start; k < i; k++) matched[k] = true;
        hits.push(start);
        emitSearch(24, msg("n.kmp.hit", { start }), i - 1, j - 1, "done");
        j = lps[j - 1];
        emitSearch(25, msg("n.kmp.continue", { j }), i, j, "window");
      } else {
        emitSearch(22, msg("n.kmp.advance"), i - 1, j - 1, "match");
      }
    } else if (j > 0) {
      j = lps[j - 1];
      emitSearch(28, msg("n.kmp.reuse", { j }), i, j, "mismatch");
    } else {
      i++;
      emitSearch(30, msg("n.kmp.advanceI"), i - 1, 0, "mismatch");
    }
  }
  steps.push({
    codeLine: 20,
    note: matchSummary(hits),
    status: "done",
    tracks: searchTracks(-1, -1),
  });
  return steps;
}

/**
 * Final tally for the matchers.
 *
 * Counting distinct start positions, not highlighted cells: deriving the count
 * from the highlight mask (`marked / m`) undercounts overlapping matches and
 * can even yield a fraction — "ABABA" / "ABA" reported 1.67 matches.
 */
function matchSummary(hits: number[]): Note {
  if (hits.length === 0) return msg("n.str.countNone");
  const indices = hits.join(", ");
  return hits.length === 1
    ? msg("n.str.countOne", { indices })
    : msg("n.str.countMany", { count: hits.length, indices });
}

// ── Rabin-Karp ──────────────────────────────────────────────────────────
const RK_BASE = 256;
const RK_MOD = 1_000_000_007;

export function rabinKarpSteps(text: string, pattern: string): StringStep[] {
  const t = text;
  const p = pattern;
  const n = t.length;
  const m = p.length;
  const steps: StringStep[] = [];
  const matched = new Array(n).fill(false);

  const tracks = (winStart: number, compareLen: number, hit: boolean): Track[] => {
    const tTones = idle(n);
    for (let k = 0; k < n; k++) if (matched[k]) tTones[k] = "done";
    if (winStart >= 0) {
      for (let k = winStart; k < winStart + m && k < n; k++)
        tTones[k] = hit ? "done" : "window";
      for (let k = winStart; k < winStart + compareLen && k < n; k++)
        tTones[k] = "active";
    }
    const pTones = idle(m);
    for (let k = 0; k < compareLen; k++) pTones[k] = "active";
    return [
      { label: "text", chars: t.split(""), tones: tTones },
      { label: "pattern", chars: p.split(""), tones: pTones, offset: winStart < 0 ? 0 : winStart },
    ];
  };

  const hits: number[] = [];
  let ph = 0;
  let th = 0;
  let pow = 1;
  for (let k = 0; k < m; k++) {
    ph = (ph * RK_BASE + p.charCodeAt(k)) % RK_MOD;
    th = (th * RK_BASE + t.charCodeAt(k)) % RK_MOD;
    if (k) pow = (pow * RK_BASE) % RK_MOD;
  }
  const short = (h: number) => String(h % 100000);
  steps.push({
    codeLine: 6,
    note: msg("n.rk.precompute"),
    status: "window",
    tracks: tracks(0, 0, false),
    vars: [
      { label: "patHash", value: short(ph) },
      { label: "winHash", value: short(th) },
    ],
  });

  for (let i = 0; i + m <= n; i++) {
    const equalHash = ph === th;
    steps.push({
      codeLine: 12,
      note: msg(equalHash ? "n.rk.equal" : "n.rk.differ", {
        i,
        th: short(th),
        ph: short(ph),
      }),
      status: equalHash ? "match" : "window",
      tracks: tracks(i, 0, false),
      vars: [
        { label: "patHash", value: short(ph) },
        { label: "winHash", value: short(th) },
      ],
    });
    if (equalHash) {
      // Verify character by character (guard against hash collisions).
      let k = 0;
      while (k < m && t[i + k] === p[k]) {
        k++;
        steps.push({
          codeLine: 14,
          note: msg("n.rk.verify", { k, m }),
          status: "active",
          tracks: tracks(i, k, false),
        });
      }
      if (k === m) {
        for (let q = i; q < i + m; q++) matched[q] = true;
        hits.push(i);
        steps.push({
          codeLine: 15,
          note: msg("n.rk.confirmed", { i }),
          status: "done",
          tracks: tracks(i, m, true),
        });
      } else {
        steps.push({
          codeLine: 14,
          note: msg("n.rk.spurious", { k }),
          status: "mismatch",
          tracks: tracks(i, k + 1, false),
        });
      }
    }
    if (i + m < n) {
      th =
        (((th - t.charCodeAt(i) * pow) % RK_MOD) * RK_BASE + t.charCodeAt(i + m)) %
        RK_MOD;
      th = ((th % RK_MOD) + RK_MOD) % RK_MOD;
      steps.push({
        codeLine: 18,
        note: msg("n.rk.roll", { out: t[i], in: t[i + m] }),
        status: "window",
        tracks: tracks(i + 1, 0, false),
        vars: [
          { label: "patHash", value: short(ph) },
          { label: "winHash", value: short(th) },
        ],
      });
    }
  }
  steps.push({
    codeLine: 11,
    note: matchSummary(hits),
    status: "done",
    tracks: tracks(-1, 0, false),
  });
  return steps;
}

// ── Z-Algorithm ─────────────────────────────────────────────────────────
export function zSteps(text: string): StringStep[] {
  const s = text;
  const n = s.length;
  const steps: StringStep[] = [];
  const z = new Array(n).fill(0);
  const shown: (number | null)[] = new Array(n).fill(null);

  const track = (i: number, l: number, r: number, extra: number[]): Track => {
    const tones = idle(n);
    if (l >= 0 && r > l) for (let k = l; k < r && k < n; k++) tones[k] = "window";
    for (const e of extra) if (e >= 0 && e < n) tones[e] = "match";
    if (i >= 0 && i < n) tones[i] = "active";
    const arrTones = idle(n);
    for (let k = 0; k < n; k++) if (shown[k] !== null) arrTones[k] = "window";
    if (i >= 0 && i < n) arrTones[i] = "active";
    return { label: "text", chars: s.split(""), tones, arr: [...shown], arrTones };
  };
  const emit = (
    codeLine: number,
    note: Note,
    i: number,
    l: number,
    r: number,
    status: Tone,
    extra: number[] = []
  ) => {
    steps.push({
      codeLine,
      note,
      status,
      tracks: [track(i, l, r, extra)],
      vars: [
        { label: "i", value: String(i) },
        { label: "l", value: String(l) },
        { label: "r", value: String(r) },
      ],
    });
  };

  z[0] = n;
  shown[0] = n;
  let l = 0;
  let r = 0;
  emit(1, msg("n.z.first"), 0, 0, 0, "window");
  for (let i = 1; i < n; i++) {
    if (i < r) {
      z[i] = Math.min(r - i, z[i - l]);
      shown[i] = z[i];
      emit(5, msg("n.z.seed", { i, a: r - i, b: i - l, value: z[i] }), i, l, r, "match", [i - l]);
    } else {
      shown[i] = 0;
    }
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
      shown[i] = z[i];
      emit(8, msg("n.z.extend", { a: z[i] - 1, ca: s[z[i] - 1], b: i + z[i] - 1 }), i, l, r, "active", [z[i] - 1]);
    }
    shown[i] = z[i];
    emit(8, msg("n.z.value", { i, value: z[i] }), i, l, r, z[i] > 0 ? "match" : "mismatch");
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
      emit(11, msg("n.z.window", { l, r }), i, l, r, "window");
    }
  }
  steps.push({
    codeLine: 14,
    note: msg("n.z.done"),
    status: "done",
    tracks: [track(-1, -1, -1, [])],
  });
  return steps;
}

// ── Manacher ────────────────────────────────────────────────────────────
export function manacherSteps(text: string): StringStep[] {
  const raw = text;
  // Transform so every palindrome has odd length: a|b -> ^ # a # b # $
  const chars: string[] = ["^"];
  for (const ch of raw) {
    chars.push("#");
    chars.push(ch);
  }
  chars.push("#");
  chars.push("$");
  const t = chars;
  const n = t.length;
  const steps: StringStep[] = [];
  const p = new Array(n).fill(0);
  const shown: (number | null)[] = new Array(n).fill(null);

  const track = (i: number, c: number, r: number, extra: number[]): Track => {
    const tones = idle(n);
    if (i >= 0) {
      const lo = Math.max(1, i - p[i]);
      const hi = Math.min(n - 2, i + p[i]);
      for (let k = lo; k <= hi; k++) tones[k] = "window";
    }
    for (const e of extra) if (e >= 0 && e < n) tones[e] = "match";
    if (i >= 0 && i < n) tones[i] = "active";
    if (c >= 0 && c < n && c !== i) tones[c] = "match";
    const arrTones = idle(n);
    for (let k = 0; k < n; k++) if (shown[k] !== null) arrTones[k] = "window";
    if (i >= 0 && i < n) arrTones[i] = "active";
    return { label: "transform", chars: t, tones, arr: [...shown], arrTones };
  };
  const emit = (
    codeLine: number,
    note: Note,
    i: number,
    c: number,
    r: number,
    status: Tone,
    extra: number[] = []
  ) => {
    steps.push({
      codeLine,
      note,
      status,
      tracks: [track(i, c, r, extra)],
      vars: [
        { label: "i", value: String(i) },
        { label: "c", value: String(c) },
        { label: "r", value: String(r) },
      ],
    });
  };

  let c = 0;
  let r = 0;
  let best = 0;
  let bestCenter = 0;
  emit(2, msg("n.man.start"), 0, 0, 0, "window");
  for (let i = 1; i < n - 1; i++) {
    if (i < r) {
      const mirror = 2 * c - i;
      p[i] = Math.min(r - i, p[mirror]);
      shown[i] = p[i];
      emit(5, msg("n.man.mirror", { i, mirror, value: p[i] }), i, c, r, "match", [mirror]);
    } else {
      shown[i] = 0;
    }
    while (t[i + p[i] + 1] === t[i - p[i] - 1]) {
      p[i]++;
      shown[i] = p[i];
      emit(7, msg("n.man.expand", { a: t[i + p[i]], b: t[i - p[i]] }), i, c, r, "active");
    }
    shown[i] = p[i];
    if (i + p[i] > r) {
      c = i;
      r = i + p[i];
      emit(10, msg("n.man.center", { c, r }), i, c, r, "window");
    } else {
      emit(7, msg("n.man.value", { i, value: p[i] }), i, c, r, p[i] > 0 ? "match" : "mismatch");
    }
    if (p[i] > best) {
      best = p[i];
      bestCenter = i;
    }
  }
  // Map best center back to the original string.
  const start = Math.floor((bestCenter - best) / 2);
  emit(
    14,
    msg("n.man.done", { pal: raw.slice(start, start + best), len: best }),
    bestCenter,
    bestCenter,
    r,
    "done"
  );
  return steps;
}

// ── Boyer-Moore (bad-character rule) ────────────────────────────────────
export function boyerMooreSteps(text: string, pattern: string): StringStep[] {
  const t = text;
  const p = pattern;
  const n = t.length;
  const m = p.length;
  const steps: StringStep[] = [];
  if (m === 0 || n === 0 || m > n) return steps;

  // Phase 1 — last-occurrence ("bad character") table over the pattern.
  const last = new Map<string, number>();
  const shown: (number | null)[] = new Array(m).fill(null);
  const emitBuild = (codeLine: number, note: Note, i: number, status: Tone) => {
    const tones = idle(m);
    tones[i] = "active";
    const arrTones = idle(m);
    for (let k = 0; k < m; k++) if (shown[k] !== null) arrTones[k] = "window";
    arrTones[i] = "active";
    steps.push({
      codeLine,
      note,
      status,
      tracks: [{ label: "pattern", chars: p.split(""), tones, arr: [...shown], arrTones }],
      vars: [{ label: "i", value: String(i) }],
    });
  };
  for (let i = 0; i < m; i++) {
    const prev = last.get(p[i]);
    last.set(p[i], i);
    shown[i] = i;
    emitBuild(
      5,
      prev === undefined
        ? msg("n.bm.lastNew", { ch: p[i], i })
        : msg("n.bm.lastOver", { ch: p[i], i, prev }),
      i,
      "window"
    );
  }

  // Phase 2 — scan alignments left to right, compare right to left.
  const matched = new Array(n).fill(false);
  const searchTracks = (s: number, j: number, tone?: Tone): Track[] => {
    const tTones = idle(n);
    for (let k = 0; k < n; k++) if (matched[k]) tTones[k] = "done";
    for (let k = 0; k < m; k++)
      if (s + k >= 0 && s + k < n && tTones[s + k] === "idle")
        tTones[s + k] = "window";
    if (j >= 0 && j < m && s + j < n && tone) tTones[s + j] = tone;
    const pTones = idle(m);
    if (j >= 0 && j < m && tone) pTones[j] = tone;
    return [
      { label: "text", chars: t.split(""), tones: tTones },
      { label: "pattern", chars: p.split(""), tones: pTones, offset: s },
    ];
  };
  const emitSearch = (
    codeLine: number,
    note: Note,
    s: number,
    j: number,
    status: Tone,
    tone?: Tone
  ) => {
    steps.push({
      codeLine,
      note,
      status,
      tracks: searchTracks(s, j, tone),
      vars: [
        { label: "s", value: String(s) },
        { label: "j", value: String(j) },
      ],
    });
  };

  let s = 0;
  const hits: number[] = [];
  while (s <= n - m) {
    let j = m - 1;
    emitSearch(15, msg("n.bm.align", { s }), s, j, "window", "active");
    while (j >= 0 && p[j] === t[s + j]) {
      emitSearch(16, msg("n.bm.match", { j, pj: p[j], ti: s + j, tv: t[s + j] }), s, j, "match", "match");
      j--;
    }
    if (j < 0) {
      for (let k = 0; k < m; k++) matched[s + k] = true;
      hits.push(s);
      emitSearch(19, msg("n.bm.full", { s }), s, -1, "done");
      s += 1;
    } else {
      const bad = t[s + j];
      emitSearch(16, msg("n.bm.mismatch", { j, pj: p[j], ti: s + j, bad }), s, j, "mismatch", "mismatch");
      const lo = last.get(bad) ?? -1;
      const shift = Math.max(1, j - lo);
      emitSearch(
        23,
        lo === -1
          ? msg("n.bm.jumpPast", { bad, shift })
          : msg("n.bm.alignUnder", { bad, lo, shift }),
        s,
        j,
        "active"
      );
      s += shift;
    }
  }
  steps.push({
    codeLine: 25,
    note: matchSummary(hits),
    status: "done",
    tracks: searchTracks(n, -1),
  });
  return steps;
}

export interface StringAlgoConfig {
  usesPattern: boolean;
  defaultText: string;
  defaultPattern: string;
  generate: (text: string, pattern: string) => StringStep[];
}

export const STRING_ALGOS: Record<string, StringAlgoConfig> = {
  kmp: {
    usesPattern: true,
    defaultText: "ABABDABACDABABCABAB",
    defaultPattern: "ABABCABAB",
    generate: (t, p) => kmpSteps(t, p),
  },
  "rabin-karp": {
    usesPattern: true,
    defaultText: "GEEKSFORGEEKS",
    defaultPattern: "GEEK",
    generate: (t, p) => rabinKarpSteps(t, p),
  },
  "z-algorithm": {
    usesPattern: false,
    defaultText: "AABXAAYAAB",
    defaultPattern: "",
    generate: (t) => zSteps(t),
  },
  manacher: {
    usesPattern: false,
    defaultText: "ABABABA",
    defaultPattern: "",
    generate: (t) => manacherSteps(t),
  },
  "boyer-moore": {
    usesPattern: true,
    defaultText: "ABAAABCDBBABCDDEBCABC",
    defaultPattern: "ABC",
    generate: (t, p) => boyerMooreSteps(t, p),
  },
};
