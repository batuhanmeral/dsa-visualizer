"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TKey } from "./dictionaries";
import type { Lang } from "./locale";
import { translate, type Vars } from "./translate";

export type { Lang };

interface Ctx {
  lang: Lang;
  /** Translate a key for the active language, English as fallback. */
  t: (key: TKey, vars?: Vars) => string;
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

  return (
    <LangContext.Provider value={{ lang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
