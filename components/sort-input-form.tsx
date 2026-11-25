"use client";

import { useId, useState, type FormEvent } from "react";
import {
  ChartColumnIncreasing,
  Check,
  Crosshair,
  Dices,
  GitCompareArrows,
  Hash,
  Link2,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/dictionaries";

/** Input shapes offered by the preset menu. */
export type InputShape =
  | "random"
  | "sorted"
  | "reversed"
  | "nearly"
  | "equal"
  | "fewUnique"
  | "wideRange";

export const INPUT_SHAPES: { shape: InputShape; key: TKey }[] = [
  { shape: "random", key: "ws.shape.random" },
  { shape: "sorted", key: "ws.shape.sorted" },
  { shape: "reversed", key: "ws.shape.reversed" },
  { shape: "nearly", key: "ws.shape.nearly" },
  { shape: "equal", key: "ws.shape.equal" },
  { shape: "fewUnique", key: "ws.shape.fewUnique" },
  { shape: "wideRange", key: "ws.shape.wideRange" },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-claude-500";
// Below lg the row is touched, not clicked: 40px targets; desktop keeps it compact.
const CONTROL =
  "flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors lg:min-h-0";
const NEUTRAL =
  "border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100";
const ACTIVE =
  "border-claude-500/40 bg-claude-500/10 text-claude-600 dark:text-claude-400";
// While the input shares its row with the buttons (card 448-768px), the secondary
// buttons go icon-only so the array stays readable; the label stays for screen readers.
// Searching adds a target field, so there the input takes its own row up to @3xl instead.
const ROW_LABEL = "@md:@max-3xl:sr-only";
const FIELD =
  "flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-claude-500/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-claude-500 lg:min-h-0 dark:border-zinc-800 dark:bg-zinc-950";

/** The sorting / searching input row at the top of the playback card. */
export default function SortInputForm({
  inputText,
  onInputText,
  targetText,
  onTargetText,
  onApply,
  onShape,
  onShare,
  copied,
  maxNumbersHint,
  compare,
  onBigN,
}: {
  inputText: string;
  onInputText: (text: string) => void;
  /** Present only for searching, which takes a target value. */
  targetText?: string;
  onTargetText?: (text: string) => void;
  onApply: (e: FormEvent) => void;
  onShape: (shape: InputShape) => void;
  onShare: () => void;
  copied: boolean;
  maxNumbersHint: string;
  /** Present only when a sibling algorithm can be raced against this one. */
  compare?: { active: boolean; onToggle: () => void };
  /** Present only on sorting and searching pages: switches to the large-n canvas. */
  onBigN?: () => void;
}) {
  const { t } = useLang();
  const [shapesOpen, setShapesOpen] = useState(false);
  const hintId = useId();
  const shapesId = useId();

  const hasTarget = targetText !== undefined && onTargetText !== undefined;
  const rowLabel = hasTarget ? undefined : ROW_LABEL;
  return (
    <form onSubmit={onApply} className="flex w-full flex-wrap items-center gap-2">
      {/* Full width on a narrow card so the numbers stay readable; the
          buttons wrap below it instead of squeezing it. */}
      <label
        className={`${FIELD} min-w-30 basis-full ${hasTarget ? "@3xl:flex-1 @3xl:basis-40" : "@md:flex-1 @md:basis-40"}`}
      >
        <Hash className="size-4 shrink-0 text-zinc-400" />
        <input
          type="text"
          value={inputText}
          onChange={(e) => onInputText(e.target.value)}
          placeholder={t("ws.input.placeholder")}
          spellCheck={false}
          aria-label={t("ws.input.aria")}
          aria-describedby={hintId}
          className="w-full min-w-0 bg-transparent font-mono text-xs outline-none placeholder:text-zinc-400"
        />
      </label>
      {hasTarget && (
        <label className={FIELD}>
          <Crosshair className="size-4 shrink-0 text-zinc-400" />
          <input
            type="text"
            value={targetText}
            onChange={(e) => onTargetText(e.target.value)}
            aria-label={t("ws.target.aria")}
            className="w-14 bg-transparent font-mono text-xs outline-none"
          />
        </label>
      )}
      <button
        type="submit"
        className={`flex min-h-10 items-center rounded-lg bg-claude-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-claude-500 lg:min-h-0 ${FOCUS_RING}`}
      >
        {t("ws.apply")}
      </button>
      <button
        type="button"
        onClick={() => setShapesOpen((o) => !o)}
        aria-expanded={shapesOpen}
        aria-controls={shapesOpen ? shapesId : undefined}
        title={t("ws.shape.title")}
        className={`${CONTROL} ${shapesOpen ? ACTIVE : NEUTRAL} ${FOCUS_RING}`}
      >
        <Dices className="size-4" />
        <span className={rowLabel}>{t("ws.shape")}</span>
      </button>
      <button
        type="button"
        onClick={onShare}
        title={t("ws.share.title")}
        className={`${CONTROL} ${copied ? ACTIVE : NEUTRAL} ${FOCUS_RING}`}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        <span className={rowLabel}>{copied ? t("ws.copied") : t("ws.share")}</span>
      </button>
      {compare && (
        <button
          type="button"
          onClick={compare.onToggle}
          aria-pressed={compare.active}
          title={t("ws.compare.title")}
          className={`${CONTROL} ${compare.active ? ACTIVE : NEUTRAL} ${FOCUS_RING}`}
        >
          <GitCompareArrows className="size-4" />
          <span className={rowLabel}>{t("ws.compare")}</span>
        </button>
      )}
      {onBigN && (
        <button
          type="button"
          onClick={onBigN}
          title={t("bign.enter.title")}
          className={`${CONTROL} ${NEUTRAL} ${FOCUS_RING}`}
        >
          <ChartColumnIncreasing className="size-4" />
          {t("bign.enter")}
        </button>
      )}
      {/* In the flow, not a popup: the canvas clips overflow, and a popup
          had no room above or below the card on tablets. */}
      {shapesOpen && (
        <div
          id={shapesId}
          role="group"
          aria-label={t("ws.shape.title")}
          className="flex basis-full flex-wrap gap-1.5"
        >
          {INPUT_SHAPES.map(({ shape, key }) => (
            <button
              key={shape}
              type="button"
              onClick={() => {
                onShape(shape);
                setShapesOpen(false);
              }}
              className={`${CONTROL} ${NEUTRAL} ${FOCUS_RING}`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}
      <p
        id={hintId}
        className="basis-full text-[11px] text-zinc-500 dark:text-zinc-400"
      >
        {maxNumbersHint}
      </p>
    </form>
  );
}
