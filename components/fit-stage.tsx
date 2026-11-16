"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fitScale, nextScale, type Size } from "@/lib/fit-scale";

const FitScaleContext = createContext(1);

/** The scale the nearest FitStage applies, for children that measure themselves (layout animations). */
export function useFitScale(): number {
  return useContext(FitScaleContext);
}

const sameSize = (a: Size, b: Size) =>
  Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5;

/**
 * Scales its content to fill the free canvas area, up to `maxScale`.
 * With `extent` the content's size is fixed for the run; without it the content is
 * measured and, for the same `resetKey` and stage size, the scale only shrinks.
 * The scale is a transform only, so nothing in the page flow moves (CLS 0).
 */
export function FitStage({
  resetKey,
  maxScale,
  extent,
  frozen = false,
  children,
}: {
  resetKey: unknown;
  maxScale: number;
  extent?: Size;
  frozen?: boolean;
  children: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // What the current scale was fitted to: a new run or a resized stage starts over.
  const fitted = useRef<{ key: unknown; avail: Size; scale: number } | null>(null);
  const frozenRef = useRef(frozen);
  const extentW = extent?.width;
  const extentH = extent?.height;

  const update = useCallback(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;
    const avail = { width: stage.clientWidth, height: stage.clientHeight };
    const hasExtent = extentW !== undefined && extentH !== undefined;
    const size = hasExtent
      ? { width: extentW, height: extentH }
      : { width: content.offsetWidth, height: content.offsetHeight };
    const fit = fitScale(avail, size, maxScale);
    const last = fitted.current;
    const sameRun =
      !hasExtent && last !== null && last.key === resetKey && sameSize(last.avail, avail);
    const next = sameRun ? nextScale(last.scale, fit) : fit;
    fitted.current = { key: resetKey, avail, scale: next };
    setScale(next);
  }, [resetKey, maxScale, extentW, extentH]);

  // Layout effect: the first fit lands before paint, and an unfrozen DS re-fits right after its op.
  useLayoutEffect(() => {
    frozenRef.current = frozen;
    if (!frozen) update();
  }, [frozen, update]);

  useEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;
    const observer = new ResizeObserver(() => {
      if (!frozenRef.current) update();
    });
    observer.observe(stage);
    observer.observe(content);
    return () => observer.disconnect();
  }, [update]);

  return (
    // The content stays in flow: below lg the canvas has no set height, so the unscaled content sizes it.
    <div
      ref={stageRef}
      data-fit-stage
      className="flex min-h-0 min-w-0 flex-1 items-center justify-center self-stretch overflow-hidden"
    >
      <div
        ref={contentRef}
        data-fit-content
        data-fit-scale
        className="transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          transform: `scale(${scale})`,
          ...(extent && { width: extent.width, height: extent.height, flexShrink: 0 }),
        }}
      >
        <FitScaleContext value={scale}>{children}</FitScaleContext>
      </div>
    </div>
  );
}
