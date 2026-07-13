// Pure step generators for the String-matching visualizers (KMP, Rabin-Karp,
// Z-Algorithm, Manacher). Same shape as the other "precomputed step list"
// families: a generator returns the full `StringStep[]`, and `string-viz.tsx`
// scrubs through them. `codeLine` is the 0-based line into the matching C
// snippet in `lib/data.ts`.

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
  note: string;
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
    note: string,
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
  emitBuild(2, "lps[0] = 0 — a single character has no proper prefix", 0, 0, "window");
  let len = 0;
  let i = 1;
  while (i < m) {
    emitBuild(4, `Compare p[${i}]='${p[i]}' with p[${len}]='${p[len]}'`, i, len, "active");
    if (p[i] === p[len]) {
      len++;
      lps[i] = len;
      shown[i] = len;
      emitBuild(5, `Match — extend prefix, lps[${i}] = ${len}`, i, len - 1, "match");
      i++;
    } else if (len > 0) {
      len = lps[len - 1];
      emitBuild(7, `Mismatch — fall back to len = lps[${len === 0 ? 0 : len - 1}] = ${len}`, i, len, "mismatch");
    } else {
      lps[i] = 0;
      shown[i] = 0;
      emitBuild(9, `Mismatch with len 0 — lps[${i}] = 0`, i, len, "mismatch");
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
    note: string,
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
  while (i < n) {
    emitSearch(21, `Compare t[${i}]='${t[i]}' with p[${j}]='${p[j]}'`, i, j, "active");
    if (t[i] === p[j]) {
      i++;
      j++;
      if (j === m) {
        const start = i - j;
        for (let k = start; k < i; k++) matched[k] = true;
        emitSearch(24, `Full match found at index ${start}`, i - 1, j - 1, "done");
        j = lps[j - 1];
        emitSearch(25, `Continue — shift j to lps[m-1] = ${j}`, i, j, "window");
      } else {
        emitSearch(22, `Match — advance both pointers`, i - 1, j - 1, "match");
      }
    } else if (j > 0) {
      j = lps[j - 1];
      emitSearch(28, `Mismatch — reuse table, j = lps[j-1] = ${j}`, i, j, "mismatch");
    } else {
      i++;
      emitSearch(30, `Mismatch with j = 0 — advance i`, i - 1, 0, "mismatch");
    }
  }
  steps.push({
    codeLine: 20,
    note: `Scan complete — ${matched.filter(Boolean).length > 0 ? "pattern located" : "pattern not present"}`,
    status: "done",
    tracks: searchTracks(-1, -1),
  });
  return steps;
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
    note: `Precompute pattern hash and hash of the first window`,
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
      note: `Window at ${i}: compare hashes ${short(th)} vs ${short(ph)}${equalHash ? " — equal" : " — differ"}`,
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
          note: `Hash hit — verifying characters (${k}/${m})`,
          status: "active",
          tracks: tracks(i, k, false),
        });
      }
      if (k === m) {
        for (let q = i; q < i + m; q++) matched[q] = true;
        steps.push({
          codeLine: 15,
          note: `Confirmed match at index ${i}`,
          status: "done",
          tracks: tracks(i, m, true),
        });
      } else {
        steps.push({
          codeLine: 14,
          note: `Spurious hit — characters differ at offset ${k}`,
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
        note: `Roll the hash forward: drop '${t[i]}', add '${t[i + m]}'`,
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
    note: `Scan complete — ${matched.filter(Boolean).length > 0 ? "pattern located" : "pattern not present"}`,
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
    note: string,
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
  emit(1, "z[0] = n by definition", 0, 0, 0, "window");
  for (let i = 1; i < n; i++) {
    if (i < r) {
      z[i] = Math.min(r - i, z[i - l]);
      shown[i] = z[i];
      emit(5, `Inside [l,r): seed z[${i}] = min(${r - i}, z[${i - l}]) = ${z[i]}`, i, l, r, "match", [i - l]);
    } else {
      shown[i] = 0;
    }
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
      shown[i] = z[i];
      emit(8, `Extend match: s[${z[i] - 1}]='${s[z[i] - 1]}' == s[${i + z[i] - 1}]`, i, l, r, "active", [z[i] - 1]);
    }
    shown[i] = z[i];
    emit(8, `z[${i}] = ${z[i]}`, i, l, r, z[i] > 0 ? "match" : "mismatch");
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
      emit(11, `New rightmost window [${l}, ${r})`, i, l, r, "window");
    }
  }
  steps.push({
    codeLine: 3,
    note: "Z-array complete",
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
    note: string,
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
  emit(2, "Center c and right edge r start at 0", 0, 0, 0, "window");
  for (let i = 1; i < n - 1; i++) {
    if (i < r) {
      const mirror = 2 * c - i;
      p[i] = Math.min(r - i, p[mirror]);
      shown[i] = p[i];
      emit(5, `Inside window: mirror p[${i}] from p[${mirror}] → ${p[i]}`, i, c, r, "match", [mirror]);
    } else {
      shown[i] = 0;
    }
    while (t[i + p[i] + 1] === t[i - p[i] - 1]) {
      p[i]++;
      shown[i] = p[i];
      emit(7, `Expand: '${t[i + p[i]]}' == '${t[i - p[i]]}'`, i, c, r, "active");
    }
    shown[i] = p[i];
    if (i + p[i] > r) {
      c = i;
      r = i + p[i];
      emit(10, `New center c=${c}, right edge r=${r}`, i, c, r, "window");
    } else {
      emit(7, `p[${i}] = ${p[i]}`, i, c, r, p[i] > 0 ? "match" : "mismatch");
    }
    if (p[i] > best) {
      best = p[i];
      bestCenter = i;
    }
  }
  // Map best center back to the original string.
  const start = (bestCenter - best) / 2;
  emit(
    12,
    `Longest palindrome: "${raw.slice(start, start + best)}" (length ${best})`,
    bestCenter,
    bestCenter,
    r,
    "done"
  );
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
};
