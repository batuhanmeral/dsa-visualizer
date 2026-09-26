"use client";

import { useMemo } from "react";
import { tokenize, type CodeLang, type TokenType } from "@/lib/highlight";

/**
 * Syntax-highlighted code panel, for either the C source or the pseudocode. Tokenizes the snippet once (memoized on the
 * source) and renders it line by line so the workspace's active-line highlight
 * — driven by the current simulation step — can style each row independently.
 * Token colours stay visible on the active line; the orange left border and
 * tint mark which line is executing.
 */
const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-zinc-500 italic",
  preprocessor: "text-rose-400",
  keyword: "text-violet-400",
  type: "text-sky-400",
  constant: "text-orange-400",
  string: "text-amber-300",
  number: "text-orange-400",
  function: "text-yellow-200",
  plain: "text-zinc-300",
};

export default function CodeView({
  code,
  activeLine,
  lang = "c",
}: {
  code: string;
  activeLine: number;
  lang?: CodeLang;
}) {
  const lines = useMemo(() => tokenize(code, lang), [code, lang]);

  return (
    <pre className="scrollbar-slim flex-1 overflow-auto py-3 font-mono text-[11px] leading-5">
      {lines.map((tokens, i) => (
        <div
          key={i}
          className={`flex px-4 transition-colors ${
            i === activeLine
              ? "border-l-2 border-claude-400 bg-claude-400/10"
              : "border-l-2 border-transparent"
          }`}
        >
          <code>
            {tokens.length === 0
              ? " "
              : tokens.map((t, j) => (
                  <span key={j} className={TOKEN_CLASS[t.type]}>
                    {t.value}
                  </span>
                ))}
          </code>
        </div>
      ))}
    </pre>
  );
}
