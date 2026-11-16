"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { useLang } from "@/lib/i18n";
import {
  SPLIT_CSS_VAR,
  SPLIT_DEFAULT,
  SPLIT_MAX,
  SPLIT_MIN,
  SPLIT_STORAGE_KEY,
  effectiveMinSplit,
  parseStoredSplit,
  splitForKey,
  splitFromPointer,
} from "@/lib/split-ratio";

// Written to <html>, where the boot script puts it, so the grid reads one source.
function applySplit(v: number) {
  document.documentElement.style.setProperty(SPLIT_CSS_VAR, String(v));
}

function persistSplit(v: number) {
  try {
    localStorage.setItem(SPLIT_STORAGE_KEY, String(v));
  } catch {
    /* localStorage unavailable — the ratio just will not persist */
  }
}

/** Drag / keyboard handle between the canvas and the side panel (lg+ only).
 *  The column is the 16px gutter; ::before widens the hit area to 24px. */
export default function PanelSplitter({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const { t } = useLang();
  const [value, setValue] = useState(SPLIT_DEFAULT);
  const [min, setMin] = useState(SPLIT_MIN);
  const live = useRef(SPLIT_DEFAULT);
  const grabOffset = useRef(0);
  const self = useRef<HTMLDivElement>(null);

  // The server render cannot know the stored ratio; mirror what the boot script
  // already laid out (a one-time read of a value that only exists after mount).
  useEffect(() => {
    const applied = getComputedStyle(document.documentElement).getPropertyValue(SPLIT_CSS_VAR);
    live.current = parseStoredSplit(applied);
    setValue(live.current);
  }, []);

  // The grid's CSS max() keeps the canvas at SPLIT_MIN_CANVAS_PX; mirror that floor in the
  // range so the handle and the ARIA values match the layout whenever the grid resizes.
  useEffect(() => {
    const grid = containerRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() =>
      setMin(effectiveMinSplit(grid.getBoundingClientRect().width - (self.current?.offsetWidth ?? 0)))
    );
    observer.observe(grid);
    return () => observer.disconnect();
  }, [containerRef]);

  // A stored value below today's floor stays stored; the layout and the handle show the floor.
  const shown = Math.max(min, value);

  const show = (v: number) => {
    applySplit(v);
    live.current = v;
    setValue(v);
  };
  const commit = (v: number) => {
    show(v);
    persistSplit(v);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = splitForKey(shown, e.key);
    if (next === null) return;
    e.preventDefault();
    commit(Math.max(min, next));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Keep the handle where it was grabbed instead of jumping its edge to the pointer.
    grabOffset.current = e.clientX - e.currentTarget.getBoundingClientRect().left;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    // The ratio splits the grid minus this column, so measure against the same width.
    const usable = box.width - e.currentTarget.offsetWidth;
    show(Math.max(effectiveMinSplit(usable), splitFromPointer(e.clientX - grabOffset.current, box.left, usable)));
  };

  return (
    <div
      ref={self}
      role="separator"
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={SPLIT_MAX}
      aria-valuenow={shown}
      aria-label={t("ws.split.label")}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onLostPointerCapture={() => persistSplit(live.current)}
      onDoubleClick={() => commit(Math.max(min, SPLIT_DEFAULT))}
      className="group relative hidden cursor-col-resize touch-none select-none items-center justify-center rounded-lg before:absolute before:inset-y-0 before:-inset-x-1 before:z-10 before:content-[''] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-claude-500 lg:flex"
    >
      <span
        aria-hidden
        className="h-10 w-1 rounded-full bg-zinc-500 transition-colors group-hover:bg-claude-600 group-active:bg-claude-600 dark:group-hover:bg-claude-400 dark:group-active:bg-claude-400"
      />
    </div>
  );
}
