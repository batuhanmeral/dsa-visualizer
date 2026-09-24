/**
 * Turns the complexity strings in `lib/data.ts` ("O(n log n)", "O(n²)", …) into
 * functions of n, so the Growth tab can draw the textbook curve next to the
 * operation counts the engines actually produce.
 *
 * Deliberately small: it recognises the shapes this project uses and returns
 * `null` for anything else, which the chart reads as "no curve to draw" rather
 * than guessing. Constants are meaningless here — the curve is fitted to the
 * measurements, so only its *shape* is claimed.
 */

export interface Complexity {
  /** The source string, e.g. "O(n log n)". */
  label: string;
  /** Relative cost at size n. Only ratios between sizes are meaningful. */
  at: (n: number) => number;
}

const lg = (n: number) => Math.log2(Math.max(n, 2));

/**
 * Patterns are tried in order, so more specific ones come first: "n log² n"
 * has to win over "n log n", and "log log n" over "log n".
 */
const PATTERNS: [RegExp, (n: number) => number][] = [
  [/^1$/, () => 1],
  [/^log\s*log\s*n$/, (n) => lg(lg(n))],
  [/^log\s*n$/, lg],
  [/^√n$/, Math.sqrt],
  [/^n\s*log²\s*n$/, (n) => n * lg(n) * lg(n)],
  [/^n\s*log\s*n$/, (n) => n * lg(n)],
  [/^n²$/, (n) => n * n],
  [/^n\s*\+\s*k$/, (n) => n],
  [/^d\s*[·*]?\s*\(?\s*n\s*\+\s*k\s*\)?$/, (n) => n],
  [/^n\s*k$/, (n) => n],
  [/^n$/, (n) => n],
];

/** Parse "O(n log n)" into a growth function, or `null` if unrecognised. */
export function parseComplexity(label: string): Complexity | null {
  // Greedy: the inner expression may itself contain parentheses, as in
  // "O(d · (n + k))".
  const inner = /^O\((.*)\)$/.exec(label.trim())?.[1]?.trim();
  if (!inner) return null;
  for (const [pattern, at] of PATTERNS)
    if (pattern.test(inner)) return { label, at };
  return null;
}

/**
 * Scale `curve` so it passes through the measurements, by least squares on the
 * single unknown constant. That is the honest comparison: big-O fixes the shape
 * and says nothing about the constant, so the constant is read off the data.
 *
 * Returns `null` when the measurements are all zero and nothing can be fitted.
 */
export function fitCurve(
  curve: Complexity,
  points: { n: number; value: number }[]
): ((n: number) => number) | null {
  let num = 0;
  let den = 0;
  for (const { n, value } of points) {
    const c = curve.at(n);
    num += c * value;
    den += c * c;
  }
  if (den === 0 || num <= 0) return null;
  const scale = num / den;
  return (n: number) => scale * curve.at(n);
}
