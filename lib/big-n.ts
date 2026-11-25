/**
 * Large-n mode: the sorting canvas with hundreds or thousands of values, drawn
 * on a plain Canvas 2D (ADR-002) from a compact trace (`simulations/trace.ts`).
 */

/**
 * The sizes offered: the same for every sort and search. A 2000-value bubble
 * sort is ~3 million steps, ~35 MB of trace and about two seconds to build in
 * the worker; the view shows a preparing message meanwhile.
 */
export const BIG_N_SIZES: readonly number[] = [500, 1000, 2000];

export const BIG_N_SHAPES = ["random", "sorted", "reversed", "nearly", "fewUnique"] as const;
export type BigNShape = (typeof BIG_N_SHAPES)[number];

/** `n` values between 1 and n in the given shape. `rand` returns [0, 1). */
export function bigInput(shape: BigNShape, n: number, rand: () => number = Math.random): number[] {
  const ordered = Array.from({ length: n }, (_, i) => i + 1);
  const pick = (k: number) => Math.floor(rand() * k);
  switch (shape) {
    case "sorted":
      return ordered;
    case "reversed":
      return ordered.reverse();
    case "nearly": {
      // One adjacent swap per 50 values: the "almost done" case.
      for (let s = 0; s < n / 50; s++) {
        const i = pick(n - 1);
        [ordered[i], ordered[i + 1]] = [ordered[i + 1], ordered[i]];
      }
      return ordered;
    }
    case "fewUnique": {
      const levels = [1, 2, 3, 4, 5].map((l) => Math.round((l * n) / 5));
      return Array.from({ length: n }, () => levels[pick(levels.length)]);
    }
    default: {
      // A shuffled permutation: every height once, the classic picture.
      for (let i = n - 1; i > 0; i--) {
        const j = pick(i + 1);
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
      return ordered;
    }
  }
}

/** How long a long run plays at 1x, whatever its length. */
export const BIG_N_RUN_SECONDS = 20;
/** The small canvas's step time at 1x; a short run (a binary search) is never faster. */
const MIN_STEP_MS = 900;

/**
 * Steps per second at `speed`: the run lasts BIG_N_RUN_SECONDS / speed, unless
 * that would show each step for less than the small canvas does. The player
 * carries the fraction from frame to frame.
 */
export function stepsPerSecond(count: number, speed: number): number {
  return Math.max(count / BIG_N_RUN_SECONDS, 1000 / MIN_STEP_MS) * speed;
}

/** A target that is in the list, for the searches. */
export function bigTarget(values: readonly number[], rand: () => number = Math.random): number {
  return values[Math.floor(rand() * values.length)];
}
