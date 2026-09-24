/** Shared fixtures and reference implementations for the engine tests. */

/** Deterministic PRNG so a failure is always reproducible. */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x1_0000_0000;
  };
}

/** Multiset signature — equal iff two arrays are permutations of each other. */
export const bag = (a: readonly number[]) =>
  [...a].sort((x, y) => x - y).join(",");

export const ascending = (a: readonly number[]) =>
  [...a].sort((x, y) => x - y);

/**
 * The array inputs the workspace can actually produce: `parseValues` keeps
 * 0…999 and caps the list at 16, so the engines never see negatives.
 */
export function arrayCases(): number[][] {
  const cases: number[][] = [
    [],
    [1],
    [2, 1],
    [1, 1, 1, 1],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
    [0, 0, 999, 0],
    [999, 0, 500],
    [7, 7, 3, 3, 9, 9, 1, 1],
    [23, 7, 41, 15, 3, 34, 9, 28],
  ];
  const rand = rng(20240229);
  for (let k = 0; k < 120; k++) {
    const n = 1 + (k % 16);
    cases.push(Array.from({ length: n }, () => Math.floor(rand() * 1000)));
  }
  return cases;
}
