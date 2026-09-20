import type { StepNoteKey } from "../step-notes";

/**
 * A step explanation as data, not prose.
 *
 * Generators are pure and language-agnostic: they emit a dictionary key plus
 * the numbers/strings to interpolate, and the renderer resolves it against the
 * active language. Switching languages therefore re-renders the notes without
 * regenerating a single step.
 */
export interface Note {
  /** Key into the step-note dictionary (`lib/step-notes/`). */
  k: StepNoteKey;
  /**
   * Values for the `{name}` placeholders in the template. A value may itself
   * be a `Note` (rendered first, then interpolated) or the shorthand
   * `"@some.key"` for a note that needs no values of its own — that is how
   * enumerated words and composite labels stay translatable.
   */
  v?: NoteVars;
}

export type NoteValue = string | number | Note;
export type NoteVars = Record<string, NoteValue>;

/** Build a {@link Note}. Named `msg` so it never shadows a loop variable. */
export const msg = (k: StepNoteKey, v?: NoteVars): Note =>
  v ? { k, v } : { k };

export type { StepNoteKey };
