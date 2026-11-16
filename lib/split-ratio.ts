/** Canvas share of the lg+ panel row, in percent (unitless). */
export const SPLIT_DEFAULT = 65,
  SPLIT_MIN = 30,
  SPLIT_MAX = 70,
  SPLIT_STEP = 2,
  SPLIT_STORAGE_KEY = "split",
  SPLIT_CSS_VAR = "--split";

/** Narrowest canvas (px) whose playback card holds the checked families' controls; the AVL insert field sets it. */
export const SPLIT_MIN_CANVAS_PX = 340;

export function clampSplit(v: number): number {
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, v));
}

// Mirrored by splitBootSnippet; the unit test pins both to the same results.
export function parseStoredSplit(raw: string | null): number {
  if (raw === null || raw.trim() === "") return SPLIT_DEFAULT;
  const n = Number(raw);
  return Number.isFinite(n) ? clampSplit(Math.round(n)) : SPLIT_DEFAULT;
}

export function splitForKey(current: number, key: string): number | null {
  if (key === "ArrowLeft") return clampSplit(current - SPLIT_STEP);
  if (key === "ArrowRight") return clampSplit(current + SPLIT_STEP);
  if (key === "Home") return SPLIT_DEFAULT;
  return null;
}

export function splitFromPointer(x: number, left: number, width: number): number {
  return clampSplit(Math.round(((x - left) / width) * 100));
}

/** Lowest share the splitter offers for this usable width (grid minus separator), so the
 *  canvas keeps SPLIT_MIN_CANVAS_PX; capped at SPLIT_MAX so the side panel keeps its 30%. */
export function effectiveMinSplit(usableWidth: number): number {
  const floor = Math.ceil((SPLIT_MIN_CANVAS_PX / usableWidth) * 100);
  return Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, floor));
}

/** ES5 text for the pre-paint boot script, so the stored ratio lays out the first paint. */
export function splitBootSnippet(): string {
  const key = JSON.stringify(SPLIT_STORAGE_KEY);
  const cssVar = JSON.stringify(SPLIT_CSS_VAR);
  return (
    `(function(){try{var r=localStorage.getItem(${key}),n=Number(r);` +
    `if(r===null||r.trim()===''||!isFinite(n))n=${SPLIT_DEFAULT};` +
    `n=Math.min(${SPLIT_MAX},Math.max(${SPLIT_MIN},Math.round(n)));` +
    `document.documentElement.style.setProperty(${cssVar},String(n));}catch(e){}})();`
  );
}
