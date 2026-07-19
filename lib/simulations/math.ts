/**
 * Math / number-theory engines — pure step generators the math renderer
 * replays. `codeLine` values are 0-based and MUST match the C code in
 * lib/data.ts. Step `note` strings stay English for now (same convention as
 * the other generator families — see .docs/PROGRESS.md).
 */

// ── Sieve of Eratosthenes ───────────────────────────────────────────────
export type CellState = "unknown" | "prime" | "crossed";

export interface SieveStep {
  codeLine: number;
  note: string;
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
    note: string,
    p: number | null,
    m: number | null
  ) => steps.push({ codeLine, note, status: [...status], p, m });

  snap(2, `Assume every number from 2 to ${n} is prime.`, null, null);
  status[0] = "crossed";
  status[1] = "crossed";
  snap(3, "0 and 1 are not prime — cross them out.", null, null);

  for (let p = 2; p * p <= n; p++) {
    if (status[p] === "crossed") {
      snap(6, `${p} is already crossed out — its multiples are handled.`, p, null);
      continue;
    }
    status[p] = "prime";
    snap(
      5,
      `${p} survived — it is prime. Cross out its multiples starting at ${p}² = ${p * p}.`,
      p,
      null
    );
    for (let m = p * p; m <= n; m += p) {
      status[m] = "crossed";
      snap(8, `Cross out ${m} (a multiple of ${p}).`, p, m);
    }
  }

  for (let i = 2; i <= n; i++) {
    if (status[i] === "unknown") status[i] = "prime";
  }
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) if (status[i] === "prime") primes.push(i);
  snap(
    11,
    "Every survivor is prime — nothing left could cross it out.",
    null,
    null
  );
  snap(
    12,
    `Done. ${primes.length} primes up to ${n}: ${primes.join(", ")}.`,
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
  note: string;
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
  const snap = (codeLine: number, note: string, result?: number) =>
    steps.push({ codeLine, note, a, b, rows: rows.map((r) => ({ ...r })), result });

  snap(0, `Find gcd(${a}, ${b}).`, undefined);

  while (b !== 0) {
    snap(1, `b = ${b} ≠ 0 — keep dividing.`);
    const q = Math.floor(a / b);
    const r = a % b;
    rows.push({ a, b, q, r });
    snap(2, `${a} = ${q}·${b} + ${r} — the remainder is ${r}.`);
    const oldB = b;
    a = oldB;
    b = r;
    snap(4, `Shift the pair: gcd(${a}, ${b}). The gcd never changes.`);
  }

  snap(1, `b = 0 — the chain stops.`);
  snap(6, `Done. gcd = ${a}: the last non-zero remainder divides everything above.`, a);
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
  note: string;
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
    note: string,
    result?: { g: number; x: number; y: number }
  ) => steps.push({ codeLine, note, rows: rows.map((r) => ({ ...r })), result });

  let oldR = a,
    r = b;
  let oldS = 1,
    s = 0;
  let oldT = 0,
    t = 1;

  snap(
    3,
    `Seed two rows: ${a} = 1·a + 0·b and ${b} = 0·a + 1·b — every row keeps r = s·a + t·b.`
  );

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    snap(5, `q = ⌊${oldR} / ${r}⌋ = ${q}.`);
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
      `New row: r = ${newR}, s = ${newS}, t = ${newT} — check: ${newS}·${a} + ${newT}·${b} = ${newS * a + newT * b}.`
    );
  }

  snap(
    12,
    `Done. gcd(${a}, ${b}) = ${oldR} = ${oldS}·${a} + ${oldT}·${b} — the Bézout identity.`,
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
  note: string;
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
    note: string,
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

  snap(1, `Compute ${base0}^${exp0} mod ${mod}. Start with result = 1.`, null);
  snap(2, `Reduce the base: ${base0} mod ${mod} = ${base}.`, null);

  while (exp > 0) {
    const idx = bits.length - 1 - round;
    const bit = exp & 1;
    snap(
      4,
      `exp = ${exp} (${exp.toString(2)}₂) — its low bit is ${bit}.`,
      idx
    );
    if (bit === 1) {
      const prev = result;
      result = (result * base) % mod;
      snap(
        5,
        `Bit is 1 — multiply it in: result = ${prev} × ${base} mod ${mod} = ${result}.`,
        idx
      );
    }
    const prevBase = base;
    base = (base * base) % mod;
    rows.push({ bit, result, base });
    snap(
      6,
      `Square the base for the next bit: ${prevBase}² mod ${mod} = ${base}.`,
      idx
    );
    exp >>= 1;
    round++;
    snap(7, `Shift the exponent right: exp = ${exp}.`, exp > 0 ? bits.length - 1 - round : null);
  }

  snap(9, `Done. ${base0}^${exp0} mod ${mod} = ${result}.`, null, result);
  return { base: base0, exp: exp0, mod, steps };
}
