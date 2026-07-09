import {
  bubbleSortSteps,
  insertionSortSteps,
  selectionSortSteps,
} from "./sorting";
import type { StepGenerator } from "./types";

/** Algorithm slug → step generator. Add new entries here as engines land. */
const registry: Record<string, StepGenerator> = {
  "bubble-sort": bubbleSortSteps,
  "selection-sort": selectionSortSteps,
  "insertion-sort": insertionSortSteps,
};

export function getSimulation(slug: string): StepGenerator | undefined {
  return registry[slug];
}

export type { SimulationStep, StepGenerator, StepKind } from "./types";
