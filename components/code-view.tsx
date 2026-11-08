"use client";

import { useMemo, type ReactNode } from "react";
import { collapseCommentPadding, leadingIndent } from "@/lib/code-layout";
import { tokenize, type CodeLang, type Token, type TokenType } from "@/lib/highlight";

/**
 * Syntax-highlighted code panel, for either the C source or the pseudocode. Tokenizes the snippet once (memoized on the
 * source) and renders it line by line so the workspace's active-line highlight
 * — driven by the current simulation step — can style each row independently.
 * Token colours stay visible on the active line; the orange left border and
 * tint mark which line is executing.
 */
const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-zinc-500 italic",
  preprocessor: "text-rose-600 dark:text-rose-400",
  keyword: "text-violet-600 dark:text-violet-400",
  type: "text-sky-700 dark:text-sky-400",
  constant: "text-orange-700 dark:text-orange-400",
  string: "text-amber-700 dark:text-amber-300",
  number: "text-orange-700 dark:text-orange-400",
  function: "text-yellow-700 dark:text-yellow-200",
  plain: "text-zinc-800 dark:text-zinc-300",
};

/** Continuation rows of a wrapped line start this far inside its indent. */
const HANGING_INDENT_CH = 2;
/** Matches the `pr-4` on the other side of each line. */
const LINE_PADDING = "1rem";

// Leading spaces always sit in the first token (a plain run or a comment
// continuation), so trimming that token is enough.
function dropIndent(tokens: Token[], indent: number): Token[] {
  if (indent === 0 || tokens.length === 0) return tokens;
  const [first, ...rest] = tokens;
  const value = first.value.slice(indent);
  return value ? [{ ...first, value }, ...rest] : rest;
}

export default function CodeView({
  code,
  activeLine,
  lang = "c",
  corner,
}: {
  code: string;
  activeLine: number;
  lang?: CodeLang;
  /** Floated into the top-right corner; the first lines wrap around it. */
  corner?: ReactNode;
}) {
  const lines = useMemo(() => {
    const shown = code.split("\n").map((line) => collapseCommentPadding(line, lang));
    // Tokenize the joined text so C block-comment state carries across lines.
    return tokenize(shown.join("\n"), lang).map((tokens, i) => {
      const indent = leadingIndent(shown[i]);
      return { indent, tokens: dropIndent(tokens, indent) };
    });
  }, [code, lang]);

  return (
    <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto py-3">
      {corner && <div className="float-right mr-2 flex gap-0.5">{corner}</div>}
      <pre className="font-mono text-[11px] leading-5 wrap-anywhere whitespace-pre-wrap">
        {lines.map(({ indent, tokens }, i) => (
          <div
            key={i}
            // Indent via padding so wrapped rows hang 2ch inside the line's own indent.
            style={{
              paddingLeft: `calc(${indent + HANGING_INDENT_CH}ch + ${LINE_PADDING})`,
              textIndent: `-${HANGING_INDENT_CH}ch`,
            }}
            className={`pr-4 transition-colors ${
              i === activeLine
                ? "border-l-2 border-claude-500 bg-claude-500/10 dark:border-claude-400 dark:bg-claude-400/10"
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
    </div>
  );
}
