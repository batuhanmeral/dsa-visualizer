import {
  linearSearchSteps,
  binarySearchSteps,
  jumpSearchSteps,
  interpolationSearchSteps,
} from "./searching";
import {
  bubbleSortSteps,
  bucketSortSteps,
  countingSortSteps,
  heapSortSteps,
  insertionSortSteps,
  mergeSortSteps,
  quickSortSteps,
  radixSortSteps,
  selectionSortSteps,
  shellSortSteps,
} from "./sorting";
import type { StepGenerator } from "./types";

/** Algorithm slug → step generator. Add new entries here as engines land. */
const registry: Record<string, StepGenerator> = {
  "bubble-sort": bubbleSortSteps,
  "selection-sort": selectionSortSteps,
  "insertion-sort": insertionSortSteps,
  "shell-sort": shellSortSteps,
  "merge-sort": mergeSortSteps,
  "quick-sort": quickSortSteps,
  "heap-sort": heapSortSteps,
  "radix-sort": radixSortSteps,
  "counting-sort": countingSortSteps,
  "bucket-sort": bucketSortSteps,
  "linear-search": linearSearchSteps,
  "binary-search": binarySearchSteps,
  "jump-search": jumpSearchSteps,
  "interpolation-search": interpolationSearchSteps,
};

export function getSimulation(slug: string): StepGenerator | undefined {
  return registry[slug];
}

export type { SimulationStep, StepGenerator, StepKind } from "./types";
