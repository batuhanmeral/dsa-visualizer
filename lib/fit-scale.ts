export interface Size {
  width: number;
  height: number;
}

/** Floor for a stage with no room yet (hidden or collapsed), so the content never scales to 0. */
const MIN_SCALE = 0.05;

/** Largest scale at which `content` fits `avail`, capped at the family's `maxScale`. */
export function fitScale(avail: Size, content: Size, maxScale: number): number {
  if (content.width <= 0 || content.height <= 0) return 1;
  const fitted = Math.min(
    avail.width / content.width,
    avail.height / content.height,
    maxScale
  );
  return Math.max(fitted, MIN_SCALE);
}

/** Within one run the scale only shrinks, so growing content never makes it jump back up. */
export function nextScale(prev: number | null, fitted: number): number {
  return prev === null ? fitted : Math.min(prev, fitted);
}
