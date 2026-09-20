"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { en, tr, type TKey } from "./dictionaries";
import type { Note, NoteValue } from "./simulations/note";
import { stepNotesEn, stepNotesTr, type StepNoteKey } from "./step-notes";

export type Lang = "en" | "tr";

/** Substitute `{name}` placeholders from a vars map. */
type Vars = Record<string, string | number>;
function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a key for the active language, English as fallback. */
  t: (key: TKey, vars?: Vars) => string;
  /** Render a generator's step note in the active language. */
  tn: (note: Note) => string;
}

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // The inline boot script in the root layout has already stamped the resolved
  // language onto <html data-lang> before paint; mirror it into React state
  // after mount (server + first client render use the "en" default, so there is
  // no hydration mismatch — this only re-renders post-hydration).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const l = document.documentElement.dataset.lang;
    if (l === "tr" || l === "en") setLangState(l);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.dataset.lang = l;
    document.documentElement.lang = l;
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* localStorage unavailable — ignore */
    }
  };

  const t = (key: TKey, vars?: Vars) => {
    const template = (lang === "tr" ? tr[key] : undefined) ?? en[key] ?? key;
    return interpolate(template, vars);
  };

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
    <LangContext.Provider value={{ lang, setLang, t, tn }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
