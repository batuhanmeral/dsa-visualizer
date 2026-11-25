import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extGcdSteps,
  fastPowSteps,
  gcdSteps,
  sieveSteps,
} from "../lib/simulations/math";
import { rng } from "./helpers";

// ── References ──────────────────────────────────────────────────────────
const isPrime = (k: number): boolean => {
  if (k < 2) return false;
  for (let d = 2; d * d <= k; d++) if (k % d === 0) return false;
  return true;
};

const refGcd = (a: number, b: number): number => (b === 0 ? a : refGcd(b, a % b));

const refModPow = (base: number, exp: number, mod: number): number => {
  let r = BigInt(1);
  const m = BigInt(mod);
  for (let i = 0; i < exp; i++) r = (r * BigInt(base)) % m;
  return Number(r % m);
};

/** The inputs the math page accepts: 1 to 99999, plus a seeded spread. */
function pairs(): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a <= 40; a++) for (let b = 1; b <= 40; b++) out.push([a, b]);
  const rand = rng(7919);
  for (let k = 0; k < 300; k++)
    out.push([1 + Math.floor(rand() * 99999), 1 + Math.floor(rand() * 99999)]);
  // Consecutive Fibonacci numbers: the worst case for Euclid.
  out.push([75025, 46368], [46368, 75025], [99999, 99999], [1, 99999]);
  return out;
}

// ── Sieve of Eratosthenes ───────────────────────────────────────────────
test("the sieve leaves exactly the primes up to n", () => {
  for (let n = 0; n <= 200; n++) {
    const { steps } = sieveSteps(n);
    const final = steps.at(-1)!.status;
    assert.equal(final.length, n + 1, `n=${n}: status has ${final.length} cells`);
    for (let k = 0; k <= n; k++)
      assert.equal(
        final[k] === "prime",
        isPrime(k),
        `n=${n}: ${k} ends as "${final[k]}"`
      );
  }
});

test("the sieve only crosses multiples of p, starting at p squared", () => {
  for (const n of [30, 60, 100, 200]) {
    for (const s of sieveSteps(n).steps) {
      if (s.m === null) continue;
      assert.ok(s.p !== null && isPrime(s.p), `n=${n}: crossing with p=${s.p}`);
      assert.equal(s.m % s.p!, 0, `n=${n}: ${s.m} is not a multiple of ${s.p}`);
      assert.ok(s.m >= s.p! * s.p!, `n=${n}: ${s.m} is below ${s.p}^2`);
      assert.equal(s.status[s.m], "crossed");
    }
  }
});

test("the sieve never crosses out a number it has called prime", () => {
  for (const n of [30, 60, 100, 200]) {
    const steps = sieveSteps(n).steps;
    for (let i = 1; i < steps.length; i++)
      steps[i - 1].status.forEach((st, k) => {
        if (st === "prime")
          assert.equal(steps[i].status[k], "prime", `n=${n}: ${k} lost its prime mark`);
        if (st === "crossed")
          assert.equal(steps[i].status[k], "crossed", `n=${n}: ${k} was uncrossed`);
      });
  }
});

test("the sieve's last note lists the primes it found", () => {
  const last = sieveSteps(30).steps.at(-1)!;
  assert.deepEqual(last.note, {
    k: "n.sieve.done",
    v: { count: 10, n: 30, primes: "2, 3, 5, 7, 11, 13, 17, 19, 23, 29" },
  });
  assert.equal(sieveSteps(1).steps.at(-1)!.note.k, "n.sieve.none");
});

// ── Euclidean GCD ───────────────────────────────────────────────────────
test("gcd matches the reference on every input pair", () => {
  for (const [a, b] of pairs()) {
    const last = gcdSteps(a, b).steps.at(-1)!;
    assert.equal(last.result, refGcd(a, b), `gcd(${a}, ${b})`);
  }
});

test("every gcd row is a valid division and feeds the next row", () => {
  for (const [a, b] of pairs()) {
    const rows = gcdSteps(a, b).steps.at(-1)!.rows;
    rows.forEach((row, i) => {
      assert.equal(row.a, row.q * row.b + row.r, `gcd(${a}, ${b}) row ${i}`);
      assert.ok(row.r >= 0 && row.r < row.b, `gcd(${a}, ${b}) row ${i}: remainder ${row.r}`);
      if (i > 0) {
        assert.equal(row.a, rows[i - 1].b, `gcd(${a}, ${b}) row ${i}: a`);
        assert.equal(row.b, rows[i - 1].r, `gcd(${a}, ${b}) row ${i}: b`);
      }
    });
    assert.equal(rows[0]?.a, a, `gcd(${a}, ${b}) starts from a`);
    assert.equal(rows.at(-1)?.r, 0, `gcd(${a}, ${b}) stops on a zero remainder`);
  }
});

test("gcd with a zero second argument returns the first", () => {
  assert.equal(gcdSteps(7, 0).steps.at(-1)!.result, 7);
  assert.deepEqual(gcdSteps(7, 0).steps.at(-1)!.rows, []);
});

// ── Extended Euclid ─────────────────────────────────────────────────────
test("extended Euclid returns the gcd and a valid Bezout pair", () => {
  for (const [a, b] of pairs()) {
    const { g, x, y } = extGcdSteps(a, b).steps.at(-1)!.result!;
    assert.equal(g, refGcd(a, b), `extGcd(${a}, ${b}) gcd`);
    assert.equal(x * a + y * b, g, `extGcd(${a}, ${b}): ${x}*${a} + ${y}*${b} != ${g}`);
  }
});

test("every extended Euclid row keeps r = s*a + t*b", () => {
  for (const [a, b] of pairs()) {
    const rows = extGcdSteps(a, b).steps.at(-1)!.rows;
    rows.forEach((row, i) =>
      assert.equal(row.s * a + row.t * b, row.r, `extGcd(${a}, ${b}) row ${i}`)
    );
    assert.equal(rows.at(-1)!.r, 0, `extGcd(${a}, ${b}) ends on r = 0`);
    assert.equal(rows.at(-2)!.r, refGcd(a, b), `extGcd(${a}, ${b}) last nonzero r`);
  }
});

// ── Fast exponentiation ─────────────────────────────────────────────────
test("fast exponentiation matches repeated multiplication", () => {
  const rand = rng(104729);
  const cases: [number, number, number][] = [
    [3, 13, 100],
    [2, 0, 7],
    [0, 0, 5],
    [0, 5, 5],
    [1, 9999, 2],
    [999, 9999, 99999],
  ];
  for (let base = 0; base <= 12; base++)
    for (let exp = 0; exp <= 40; exp++) cases.push([base, exp, 2 + (base * 7 + exp) % 50]);
  for (let k = 0; k < 200; k++)
    cases.push([
      Math.floor(rand() * 1000),
      Math.floor(rand() * 2000),
      2 + Math.floor(rand() * 99998),
    ]);
  for (const [base, exp, mod] of cases) {
    const last = fastPowSteps(base, exp, mod).steps.at(-1)!;
    assert.equal(last.final, refModPow(base, exp, mod), `${base}^${exp} mod ${mod}`);
  }
});

test("fast exponentiation multiplies once per set bit and squares once per bit", () => {
  for (const exp of [0, 1, 2, 13, 255, 256, 1000, 9999]) {
    const { steps } = fastPowSteps(5, exp, 97);
    const bits = exp > 0 ? exp.toString(2) : "0";
    assert.equal(steps[0].bits.join(""), bits, `exp=${exp} bits`);
    const multiplies = steps.filter((s) => s.note.k === "n.pow.multiply").length;
    const squares = steps.filter((s) => s.note.k === "n.pow.square").length;
    assert.equal(multiplies, [...bits].filter((c) => c === "1").length, `exp=${exp}`);
    assert.equal(squares, exp > 0 ? bits.length : 0, `exp=${exp}`);
  }
});

test("fast exponentiation keeps result * base^exp constant across rounds", () => {
  // The loop invariant: result * base^exp = base0^exp0 (mod m) after every step.
  for (const [b0, e0, m] of [[3, 13, 100], [7, 255, 1009], [12, 1000, 99991]]) {
    const want = refModPow(b0, e0, m);
    for (const s of fastPowSteps(b0, e0, m).steps)
      if (s.note.k === "n.pow.shift" || s.note.k === "n.pow.reduce")
        assert.equal(
          (s.result * refModPow(s.base, s.exp, m)) % m,
          want,
          `${b0}^${e0} mod ${m}: invariant broken at exp=${s.exp}`
        );
  }
});
