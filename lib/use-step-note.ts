import { useLang } from "./i18n";
import type { Note, NoteValue } from "./simulations/note";
import { interpolate, type Vars } from "./translate";
import { stepNotesEn, stepNotesTr, type StepNoteKey } from "./step-notes";

/**
 * Renders a generator's step note in the active language. Separate from
 * `LangProvider` so the note tables load only on pages that play steps.
 */
export function useStepNote(): (note: Note) => string {
  const { lang } = useLang();

  const noteTemplate = (key: StepNoteKey): string =>
    (lang === "tr" ? stepNotesTr[key] : undefined) ?? stepNotesEn[key] ?? key;

  const tn = (note: Note): string => {
    // Values are resolved before interpolation so a note can be composed from
    // other notes: a nested Note carries its own values, and the shorthand
    // "@some.key" borrows the outer ones. Either way, enumerated words and
    // composite labels get translated instead of being baked into the
    // generator as English.
    let vars: Vars | undefined;
    if (note.v) {
      const resolved: Vars = {};
      for (const [name, value] of Object.entries<NoteValue>(note.v)) {
        resolved[name] =
          typeof value === "object"
            ? tn(value)
            : typeof value === "string" && value.startsWith("@")
              ? noteTemplate(value.slice(1) as StepNoteKey)
              : value;
      }
      // Second pass: an "@key" template may reference the outer values.
      for (const [name, value] of Object.entries(resolved))
        if (typeof value === "string") resolved[name] = interpolate(value, resolved);
      vars = resolved;
    }
    return interpolate(noteTemplate(note.k), vars);
  };

  return tn;
}
