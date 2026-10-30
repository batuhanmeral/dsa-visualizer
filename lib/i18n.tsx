"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TKey } from "./dictionaries";
import type { Lang } from "./locale";
import type { Note, NoteValue } from "./simulations/note";
import { interpolate, translate, type Vars } from "./translate";
import { stepNotesEn, stepNotesTr, type StepNoteKey } from "./step-notes";

export type { Lang };

interface Ctx {
  lang: Lang;
  /** Translate a key for the active language, English as fallback. */
  t: (key: TKey, vars?: Vars) => string;
  /** Render a generator's step note in the active language. */
  tn: (note: Note) => string;
}

const LangContext = createContext<Ctx | null>(null);

/** The language comes from the route's root layout, so it is known on the server. */
export function LangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  const t = (key: TKey, vars?: Vars) => translate(lang, key, vars);

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

  return (
    <LangContext.Provider value={{ lang, t, tn }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
