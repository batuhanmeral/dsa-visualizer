/**
 * Step-note dictionaries, split per algorithm family.
 *
 * `en` is the source of truth for the key set: `StepNoteKey` is derived from it,
 * so a typo in a generator is a compile error. `tr` is partial — a missing
 * translation falls back to English, exactly like the UI dictionary.
 */
import * as backtracking from "./backtracking";
import * as common from "./common";
import * as dp from "./dp";
import * as graphs from "./graphs";
import * as invariants from "./invariants";
import * as greedy from "./greedy";
import * as math from "./math";
import * as searching from "./searching";
import * as sorting from "./sorting";
import * as strings from "./strings";
import * as structures from "./structures";
import * as trees from "./trees";

export const stepNotesEn = {
  ...common.en,
  ...sorting.en,
  ...searching.en,
  ...graphs.en,
  ...invariants.en,
  ...trees.en,
  ...dp.en,
  ...greedy.en,
  ...math.en,
  ...strings.en,
  ...backtracking.en,
  ...structures.en,
} as const;

export type StepNoteKey = keyof typeof stepNotesEn;

export const stepNotesTr: Partial<Record<StepNoteKey, string>> = {
  ...common.tr,
  ...sorting.tr,
  ...searching.tr,
  ...graphs.tr,
  ...invariants.tr,
  ...trees.tr,
  ...dp.tr,
  ...greedy.tr,
  ...math.tr,
  ...strings.tr,
  ...backtracking.tr,
  ...structures.tr,
};
