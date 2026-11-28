import type { SimulationStep, StepKind } from "./simulations/types";

/**
 * Sound effects for the array canvas, as pure data.
 *
 * A step becomes a short list of tones: the value of each element the step
 * touches sets the pitch, the step kind sets the timbre and length. Nothing
 * here touches Web Audio; the component turns these tones into oscillators,
 * so the mapping can be tested without a browser.
 */

/** Lowest pitch (A3), for the smallest value of the run. */
export const PITCH_LOW_HZ = 220;
/** Range in semitones: two octaves, up to A5. */
const PITCH_SEMITONES = 24;
export const PITCH_HIGH_HZ = PITCH_LOW_HZ * 2 ** (PITCH_SEMITONES / 12);

export const SOUND_STORAGE_KEY = "sound";

export type Wave = "sine" | "triangle" | "square" | "sawtooth";

export interface Voice {
  wave: Wave;
  /** Seconds, before it is shortened to fit the step. */
  duration: number;
  /** Peak gain, 0..1. Square and sawtooth are louder per unit, so lower. */
  gain: number;
}

/**
 * The timbre of each step kind. `null` is silent: an `info` step explains, it
 * does not touch the data.
 */
export const VOICES: Record<StepKind, Voice | null> = {
  compare: { wave: "triangle", duration: 0.08, gain: 0.22 },
  swap: { wave: "square", duration: 0.1, gain: 0.07 },
  shift: { wave: "sawtooth", duration: 0.09, gain: 0.07 },
  select: { wave: "sine", duration: 0.12, gain: 0.2 },
  probe: { wave: "sine", duration: 0.1, gain: 0.22 },
  found: { wave: "triangle", duration: 0.16, gain: 0.24 },
  done: { wave: "triangle", duration: 0.14, gain: 0.2 },
  info: null,
};

/** One note to play, `at` seconds after the step starts. */
export interface Tone {
  freq: number;
  wave: Wave;
  at: number;
  duration: number;
  gain: number;
}

/** Share of the step interval the tones may use, so they never overlap the next step. */
const STEP_BUDGET = 0.9;

/** Semitones above the root: a major arpeggio up to the octave. */
const DONE_ARPEGGIO = [0, 4, 7, 12];
/** Found rises a fifth above the value it found. */
const FOUND_INTERVAL = 7;

/**
 * Value to frequency. Exponential in the value, so equal value steps sound
 * like equal musical intervals, and snapped to semitones so a run sounds like
 * notes rather than a siren. A flat range (all values equal) sits mid-range.
 */
export function pitchFor(value: number, min: number, max: number): number {
  const t = max > min ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0.5;
  return PITCH_LOW_HZ * 2 ** (Math.round(t * PITCH_SEMITONES) / 12);
}

/** The value range a run is pitched against; fixed for the run so a value keeps its note. */
export function valueBounds(values: readonly number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 1 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

/** Lays `freqs` out one after another within the step's time budget. */
function sequence(freqs: number[], voice: Voice, intervalMs: number): Tone[] {
  if (freqs.length === 0) return [];
  const slot = ((intervalMs / 1000) * STEP_BUDGET) / freqs.length;
  const duration = Math.min(voice.duration, slot);
  return freqs.map((freq, i) => ({
    freq,
    wave: voice.wave,
    at: i * duration,
    duration,
    gain: voice.gain,
  }));
}

/** What a step needs to be heard: an array-canvas step, or a large-n trace step. */
export type SoundStep = Pick<SimulationStep, "kind" | "held"> & {
  highlights: ArrayLike<number>;
  array: ArrayLike<number>;
};

/** The tones for one step of the array canvas, given the run's value range. */
export function tonesForStep(
  step: SoundStep,
  bounds: { min: number; max: number },
  intervalMs: number
): Tone[] {
  const voice = VOICES[step.kind];
  if (!voice) return [];
  const pitch = (v: number) => pitchFor(v, bounds.min, bounds.max);

  if (step.kind === "done") {
    return sequence(
      DONE_ARPEGGIO.map((s) => PITCH_LOW_HZ * 2 ** ((12 + s) / 12)),
      voice,
      intervalMs
    );
  }

  // The values the step touches. A slot holding a lifted value shows a stale
  // copy; the value being moved is the held one.
  const values = Array.from(step.highlights)
    .filter((i) => i >= 0 && i < step.array.length)
    .map((i) => (step.held?.hole === i ? step.held.value : step.array[i]));
  const freqs = values.map(pitch);

  if (step.kind === "found" && freqs.length > 0) {
    freqs.push(freqs[0] * 2 ** (FOUND_INTERVAL / 12));
  }
  return sequence(freqs, voice, intervalMs);
}

/** Sound is on by default: only an explicit stored "off" turns it off. */
export function parseSoundPref(raw: string | null): boolean {
  return raw !== "off";
}
