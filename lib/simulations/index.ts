import { linearSearchSteps, binarySearchSteps } from "./searching";
import {
  bubbleSortSteps,
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
  "linear-search": linearSearchSteps,
  "binary-search": binarySearchSteps,
};

export function getSimulation(slug: string): StepGenerator | undefined {
  return registry[slug];
}

export type { SimulationStep, StepGenerator, StepKind } from "./types";
