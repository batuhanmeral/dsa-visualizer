import type { StepKind } from "@/lib/simulations";

/**
 * Step-kind colours.
 *
 * `found`/`done` sit a step darker than the accent (600, not 500) because
 * `compare`/`probe` are amber: with the accent now orange, the two would
 * otherwise be neighbours on the wheel, and "being compared" versus "settled
 * in place" is the distinction the canvas exists to make. 600 against amber-400
 * is a ~26-point lightness gap, which survives being read at a glance and in
 * greyscale.
 */
export const KIND_STYLES: Record<StepKind, { bar: string; dot: string }> = {
  compare: { bar: "bg-amber-400", dot: "bg-amber-400" },
  swap: { bar: "bg-rose-500", dot: "bg-rose-500" },
  shift: { bar: "bg-violet-500", dot: "bg-violet-500" },
  select: { bar: "bg-sky-500", dot: "bg-sky-500" },
  probe: { bar: "bg-amber-400", dot: "bg-amber-400" },
  found: { bar: "bg-claude-600", dot: "bg-claude-600" },
  info: { bar: "bg-zinc-400", dot: "bg-zinc-400" },
  done: { bar: "bg-claude-600", dot: "bg-claude-600" },
};
