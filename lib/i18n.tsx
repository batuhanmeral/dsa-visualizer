"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { en, tr, type TKey } from "./dictionaries";

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

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
