/**
 * Math / number-theory engines — pure step generators the math renderer
 * replays. `codeLine` values are 0-based and MUST match the C code in
 * lib/data.ts. Step `note` strings stay English for now (same convention as
 * the other generator families — see .docs/PROGRESS.md).
 */

import { msg, type Note } from "./note";

// ── Sieve of Eratosthenes ───────────────────────────────────────────────
export type CellState = "unknown" | "prime" | "crossed";

export interface SieveStep {
  codeLine: number;
  note: Note;
  /** status[i] for 0..n (0 and 1 start crossed). */
  status: CellState[];
  /** Prime whose multiples are being crossed out. */
  p: number | null;
  /** Multiple being crossed this step. */
  m: number | null;
}

export interface SieveResult {
  n: number;
  steps: SieveStep[];
}

export function sieveSteps(n: number): SieveResult {
  const status: CellState[] = new Array(n + 1).fill("unknown");
  const steps: SieveStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    p: number | null,
    m: number | null
  ) => steps.push({ codeLine, note, status: [...status], p, m });

  snap(2, msg("n.sieve.assume", { n }), null, null);
  status[0] = "crossed";
  status[1] = "crossed";
  snap(3, msg("n.sieve.zeroOne"), null, null);

  for (let p = 2; p * p <= n; p++) {
    if (status[p] === "crossed") {
      snap(6, msg("n.sieve.already", { p }), p, null);
      continue;
    }
    status[p] = "prime";
    snap(5, msg("n.sieve.prime", { p, sq: p * p }), p, null);
    for (let m = p * p; m <= n; m += p) {
      status[m] = "crossed";
      snap(8, msg("n.sieve.cross", { m, p }), p, m);
    }
  }

  for (let i = 2; i <= n; i++) {
    if (status[i] === "unknown") status[i] = "prime";
  }
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) if (status[i] === "prime") primes.push(i);
  snap(11, msg("n.sieve.survivors"), null, null);
  snap(
    12,
    primes.length
      ? msg("n.sieve.done", {
          count: primes.length,
          n,
          primes: primes.join(", "),
        })
      : msg("n.sieve.none", { n }),
    null,
    null
  );
  return { n, steps };
}

// ── Euclidean Algorithm (GCD) ───────────────────────────────────────────
export interface GcdRow {
  a: number;
  b: number;
  q: number;
  r: number;
}

export interface GcdStep {
  codeLine: number;
  note: Note;
  a: number;
  b: number;
  /** Completed division rows (a = q·b + r). */
  rows: GcdRow[];
  /** Set on the final step. */
  result?: number;
}

export interface GcdResult {
  a: number;
  b: number;
  steps: GcdStep[];
}

export function gcdSteps(aIn: number, bIn: number): GcdResult {
  let a = Math.max(1, Math.floor(aIn));
  let b = Math.max(0, Math.floor(bIn));
  const rows: GcdRow[] = [];
  const steps: GcdStep[] = [];
  const snap = (codeLine: number, note: Note, result?: number) =>
    steps.push({ codeLine, note, a, b, rows: rows.map((r) => ({ ...r })), result });

  snap(0, msg("n.gcd.start", { a, b }), undefined);

  while (b !== 0) {
    snap(1, msg("n.gcd.loop", { b }));
    const q = Math.floor(a / b);
    const r = a % b;
    rows.push({ a, b, q, r });
    snap(2, msg("n.gcd.divide", { a, q, b, r }));
    const oldB = b;
    a = oldB;
    b = r;
    snap(4, msg("n.gcd.shift", { a, b }));
  }

  snap(1, msg("n.gcd.stop"));
  snap(6, msg("n.gcd.done", { g: a }), a);
  return { a: Math.max(1, Math.floor(aIn)), b: Math.max(0, Math.floor(bIn)), steps };
}

// ── Extended Euclidean Algorithm ────────────────────────────────────────
export interface ExtRow {
  /** Quotient that produced this row (null for the two seed rows). */
  q: number | null;
  r: number;
  s: number;
  t: number;
}

export interface ExtStep {
  codeLine: number;
  note: Note;
  rows: ExtRow[];
  /** Set on the final step: gcd and the Bézout pair. */
  result?: { g: number; x: number; y: number };
}

export interface ExtResult {
  a: number;
  b: number;
  steps: ExtStep[];
}

export function extGcdSteps(aIn: number, bIn: number): ExtResult {
  const a = Math.max(1, Math.floor(aIn));
  const b = Math.max(1, Math.floor(bIn));
  const rows: ExtRow[] = [
    { q: null, r: a, s: 1, t: 0 },
    { q: null, r: b, s: 0, t: 1 },
  ];
  const steps: ExtStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    result?: { g: number; x: number; y: number }
  ) => steps.push({ codeLine, note, rows: rows.map((r) => ({ ...r })), result });

  let oldR = a,
    r = b;
  let oldS = 1,
    s = 0;
  let oldT = 0,
    t = 1;

  snap(3, msg("n.ext.seed", { a, b }));

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    snap(5, msg("n.ext.quotient", { oldR, r, q }));
    const newR = oldR - q * r;
    const newS = oldS - q * s;
    const newT = oldT - q * t;
    oldR = r;
    r = newR;
    oldS = s;
    s = newS;
    oldT = t;
    t = newT;
    rows.push({ q, r: newR, s: newS, t: newT });
    snap(
      9,
      msg("n.ext.row", {
        r: newR,
        s: newS,
        t: newT,
        a,
        b,
        check: newS * a + newT * b,
      })
    );
  }

  snap(
    12,
    msg("n.ext.done", { a, b, g: oldR, x: oldS, y: oldT }),
    { g: oldR, x: oldS, y: oldT }
  );
  return { a, b, steps };
}

// ── Fast (modular) exponentiation ───────────────────────────────────────
export interface PowRow {
  /** Bit value processed this round (LSB first). */
  bit: number;
  result: number;
  base: number;
}

export interface PowStep {
  codeLine: number;
  note: Note;
  /** Binary digits of the original exponent, MSB → LSB. */
  bits: number[];
  /** Index into `bits` of the bit being processed (null outside the loop). */
  bitIndex: number | null;
  result: number;
  base: number;
  exp: number;
  rows: PowRow[];
  /** Set on the final step. */
  final?: number;
}

export interface PowResult {
  base: number;
  exp: number;
  mod: number;
  steps: PowStep[];
}

export function fastPowSteps(baseIn: number, expIn: number, modIn: number): PowResult {
  const base0 = Math.max(0, Math.floor(baseIn));
  const exp0 = Math.max(0, Math.floor(expIn));
  const mod = Math.max(2, Math.floor(modIn));
  const bits = exp0 > 0 ? exp0.toString(2).split("").map(Number) : [0];
  const steps: PowStep[] = [];
  const rows: PowRow[] = [];

  let result = 1;
  let base = base0 % mod;
  let exp = exp0;
  let round = 0; // how many bits (from the LSB) are done

  const snap = (
    codeLine: number,
    note: Note,
    bitIndex: number | null,
    final?: number
  ) =>
    steps.push({
      codeLine,
      note,
      bits,
      bitIndex,
      result,
      base,
      exp,
      rows: rows.map((r) => ({ ...r })),
      final,
    });

  snap(1, msg("n.pow.start", { base: base0, exp: exp0, mod }), null);
  snap(2, msg("n.pow.reduce", { base: base0, mod, reduced: base }), null);

  while (exp > 0) {
    const idx = bits.length - 1 - round;
    const bit = exp & 1;
    snap(4, msg("n.pow.bit", { exp, bits: exp.toString(2), bit }), idx);
    if (bit === 1) {
      const prev = result;
      result = (result * base) % mod;
      snap(5, msg("n.pow.multiply", { prev, base, mod, result }), idx);
    }
    const prevBase = base;
    base = (base * base) % mod;
    rows.push({ bit, result, base });
    snap(6, msg("n.pow.square", { prev: prevBase, mod, base }), idx);
    exp >>= 1;
    round++;
    snap(7, msg("n.pow.shift", { exp }), exp > 0 ? bits.length - 1 - round : null);
  }

  snap(9, msg("n.pow.done", { base: base0, exp: exp0, mod, result }), null, result);
  return { base: base0, exp: exp0, mod, steps };
}
