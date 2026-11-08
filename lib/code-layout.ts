// Display-only reshaping of code lines for the wrapping code viewer. The
// copied text never goes through here, so it stays byte-for-byte original.
// Type-only: the code table itself must stay on the server.
import type { AlgoCode } from "./algo-code";
import type { CodeLang } from "./highlight";

/** Code followed by ≥ 2 spaces and a trailing remark (`▸` or a C comment). */
const TRAILING_REMARK: Record<CodeLang, RegExp> = {
  pseudo: /^(.*?\S) {2,}(▸.*)$/,
  c: /^(.*?\S) {2,}(\/\*.*|\/\/.*)$/,
};

/** The snippet a view shows: pseudocode and C are line-aligned, so one active line fits both. */
export function codeFor(code: AlgoCode, lang: CodeLang): string {
  return lang === "pseudo" ? code.pseudo : code.code;
}

/** Number of leading spaces. */
export function leadingIndent(line: string): number {
  return line.length - line.trimStart().length;
}

/** Shrinks the alignment padding before a trailing remark to two spaces. */
export function collapseCommentPadding(line: string, lang: CodeLang): string {
  return line.replace(TRAILING_REMARK[lang], "$1  $2");
}
