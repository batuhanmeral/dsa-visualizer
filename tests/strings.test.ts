import { test } from "node:test";
import assert from "node:assert/strict";
import {
  boyerMooreSteps,
  kmpSteps,
  manacherSteps,
  rabinKarpSteps,
  zSteps,
  type StringStep,
} from "../lib/simulations/strings";
import { rng } from "./helpers";

const naive = (t: string, p: string) => {
  const out: number[] = [];
  if (!p.length) return out;
  for (let i = 0; i + p.length <= t.length; i++)
    if (t.slice(i, i + p.length) === p) out.push(i);
  return out;
};

/** The cells the final step paints as confirmed matches. */
const markedCells = (steps: StringStep[]) => {
  const track = steps.at(-1)!.tracks.find((x) => x.label === "text");
  return track
    ? track.tones.map((v, i) => (v === "done" ? i : -1)).filter((i) => i >= 0)
    : [];
};

const coveredBy = (hits: number[], m: number) => {
  const cells = new Set<number>();
  for (const h of hits) for (let k = 0; k < m; k++) cells.add(h + k);
  return [...cells].sort((a, b) => a - b);
};

const matchers = [
  ["kmp", kmpSteps],
  ["rabin-karp", rabinKarpSteps],
  ["boyer-moore", boyerMooreSteps],
] as const;

const letters = (rand: () => number, n: number, alphabet: string) =>
  Array.from({ length: n }, () => alphabet[Math.floor(rand() * alphabet.length)]).join("");

for (const [name, run] of matchers) {
  test(`${name} marks exactly the true match positions`, () => {
    const rand = rng(89);
    for (let k = 0; k < 200; k++) {
      const alphabet = k % 3 === 0 ? "AB" : "ABC";
      const t = letters(rand, 1 + (k % 18), alphabet);
      const p = letters(rand, 1 + (k % 4), alphabet);
      const steps = run(t, p);
      const hits = naive(t, p);
      assert.deepEqual(
        markedCells(steps),
        coveredBy(hits, p.length),
        `${name} on t="${t}" p="${p}"`
      );
    }
  });

  test(`${name} reports the right number of matches, even overlapping ones`, () => {
    // Deriving the count from the highlight mask (marked cells / m) undercounts
    // overlaps and produced fractions: "ABABA" / "ABA" once reported 1.67.
    const cases: [string, string][] = [
      ["AAAA", "AA"],
      ["AAAAA", "AA"],
      ["ABABABA", "ABA"],
      ["AAAAAA", "AAA"],
      ["AA", "A"],
      ["ABABA", "ABA"],
      ["ABCABC", "ABC"],
      ["ABAAABCDBBABCDDEBCABC", "ABC"],
      ["ABC", "XY"],
    ];
    for (const [t, p] of cases) {
      const last = run(t, p).at(-1)!;
      const hits = naive(t, p);
      if (hits.length === 0) {
        assert.equal(last.note.k, "n.str.countNone", `${name} t="${t}" p="${p}"`);
        continue;
      }
      const key = hits.length === 1 ? "n.str.countOne" : "n.str.countMany";
      assert.equal(last.note.k, key, `${name} t="${t}" p="${p}"`);
      if (hits.length > 1)
        assert.equal(
          last.note.v!.count,
          hits.length,
          `${name} t="${t}" p="${p}"`
        );
      assert.equal(
        last.note.v!.indices,
        hits.join(", "),
        `${name} t="${t}" p="${p}" indices`
      );
    }
  });

  test(`${name} explains impossible inputs instead of going blank`, () => {
    for (const [t, p] of [["", "A"], ["A", ""], ["", ""], ["AB", "ABCDE"]]) {
      const steps = run(t, p);
      assert.ok(steps.length > 0, `${name} returned no steps for t="${t}" p="${p}"`);
      assert.ok(
        ["n.str.noPattern", "n.str.noText", "n.str.tooLong"].includes(
          steps.at(-1)!.note.k
        ),
        `${name} t="${t}" p="${p}" ended on ${steps.at(-1)!.note.k}`
      );
    }
  });
}

test("the Z-array matches a naive computation", () => {
  const rand = rng(97);
  const ref = (s: string) => {
    const z = new Array<number>(s.length).fill(0);
    z[0] = s.length;
    for (let i = 1; i < s.length; i++) {
      let k = 0;
      while (i + k < s.length && s[k] === s[i + k]) k++;
      z[i] = k;
    }
    return z;
  };
  for (let k = 0; k < 200; k++) {
    const s = letters(rand, 1 + (k % 20), k % 2 ? "AB" : "ABC");
    const arr = zSteps(s).at(-1)!.tracks[0].arr!;
    assert.deepEqual(arr.slice(0, s.length), ref(s), `z("${s}")`);
  }
});

test("Manacher finds a genuine longest palindrome", () => {
  const rand = rng(101);
  const ref = (s: string) => {
    let best = "";
    for (let i = 0; i < s.length; i++)
      for (let j = i; j < s.length; j++) {
        const sub = s.slice(i, j + 1);
        if (sub === [...sub].reverse().join("") && sub.length > best.length)
          best = sub;
      }
    return best;
  };
  const cases = [
    "A",
    "AA",
    "ABA",
    "ABBA",
    "AAAA",
    "#",
    "^",
    "$",
    "A#A",
    "^#$",
    "abcba",
    "racecar",
    "a b a",
    "12321",
    "Aa",
    ...Array.from({ length: 200 }, (_, k) =>
      letters(rand, 1 + (k % 16), k % 2 ? "AB" : "ABC")
    ),
  ];
  for (const s of cases) {
    const last = manacherSteps(s).at(-1)!;
    assert.equal(last.note.k, "n.man.done", `"${s}"`);
    const pal = String(last.note.v!.pal);
    const want = ref(s);
    assert.equal(last.note.v!.len, want.length, `"${s}" length`);
    assert.equal(pal.length, want.length, `"${s}" reported "${pal}"`);
    assert.equal(pal, [...pal].reverse().join(""), `"${pal}" is not a palindrome`);
    assert.ok(s.includes(pal), `"${pal}" is not a substring of "${s}"`);
  }
});

test("Manacher on empty text asks for input rather than reporting a palindrome", () => {
  assert.equal(manacherSteps("").at(-1)!.note.k, "n.man.empty");
});

test("an empty Z-algorithm input is handled without crashing", () => {
  const steps = zSteps("");
  assert.equal(steps.length, 1);
  assert.equal(steps[0].note.k, "n.str.noText");
});
