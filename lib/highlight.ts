// Tiny dependency-free C tokenizer for the code viewer. The workspace renders
// the snippet line by line (each line gets its own active-line styling), so we
// tokenize into `Token[]` per line while carrying block-comment state across
// lines. Purpose-built for the hand-written C in `lib/data.ts` — not a general
// C parser, but robust for that controlled input.

export type TokenType =
  | "comment"
  | "preprocessor"
  | "keyword"
  | "type"
  | "constant"
  | "string"
  | "number"
  | "function"
  | "plain";

export interface Token {
  value: string;
  type: TokenType;
}

const KEYWORDS = new Set([
  "auto", "break", "case", "const", "continue", "default", "do", "else",
  "enum", "extern", "for", "goto", "if", "register", "return", "sizeof",
  "static", "struct", "switch", "typedef", "union", "volatile", "while",
]);

const TYPES = new Set([
  "bool", "char", "double", "float", "int", "long", "short", "signed",
  "size_t", "unsigned", "void",
]);

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdent = (c: string) => /[A-Za-z0-9_]/.test(c);
const isDigit = (c: string) => c >= "0" && c <= "9";

function classifyIdent(word: string, nextNonSpace: string): TokenType {
  if (KEYWORDS.has(word)) return "keyword";
  if (TYPES.has(word)) return "type";
  // ALL_CAPS → macro / constant (NULL, INF, MAX, V, BUCKETS…).
  if (/^[A-Z][A-Z0-9_]*$/.test(word)) return "constant";
  // PascalCase → user-defined type (Node, Stack, Entry, Trie…).
  if (/^[A-Z][A-Za-z0-9]*$/.test(word)) return "type";
  if (nextNonSpace === "(") return "function";
  return "plain";
}

interface State {
  inBlockComment: boolean;
}

function tokenizeLine(line: string, state: State): Token[] {
  const tokens: Token[] = [];
  const n = line.length;
  let i = 0;
  let plain = "";

  const push = (value: string, type: TokenType) => {
    if (value) tokens.push({ value, type });
  };
  const flush = () => {
    if (plain) {
      tokens.push({ value: plain, type: "plain" });
      plain = "";
    }
  };

  // Continuation of a `/* … */` block from a previous line.
  if (state.inBlockComment) {
    const end = line.indexOf("*/");
    if (end === -1) {
      push(line, "comment");
      return tokens;
    }
    push(line.slice(0, end + 2), "comment");
    state.inBlockComment = false;
    i = end + 2;
  }

  while (i < n) {
    const c = line[i];
    const two = line.slice(i, i + 2);

    if (two === "/*") {
      flush();
      const end = line.indexOf("*/", i + 2);
      if (end === -1) {
        push(line.slice(i), "comment");
        state.inBlockComment = true;
        return tokens;
      }
      push(line.slice(i, end + 2), "comment");
      i = end + 2;
      continue;
    }
    if (two === "//") {
      flush();
      push(line.slice(i), "comment");
      return tokens;
    }
    if (c === '"' || c === "'") {
      flush();
      let j = i + 1;
      while (j < n && line[j] !== c) {
        if (line[j] === "\\") j++;
        j++;
      }
      push(line.slice(i, Math.min(j + 1, n)), "string");
      i = j + 1;
      continue;
    }
    if (c === "#") {
      flush();
      let j = i + 1;
      while (j < n && isIdent(line[j])) j++;
      push(line.slice(i, j), "preprocessor");
      i = j;
      continue;
    }
    if (isDigit(c)) {
      flush();
      let j = i;
      while (j < n && /[0-9a-fA-FxX.]/.test(line[j])) j++;
      push(line.slice(i, j), "number");
      i = j;
      continue;
    }
    if (isIdentStart(c)) {
      flush();
      let j = i;
      while (j < n && isIdent(line[j])) j++;
      const word = line.slice(i, j);
      let k = j;
      while (k < n && /\s/.test(line[k])) k++;
      push(word, classifyIdent(word, line[k] ?? ""));
      i = j;
      continue;
    }
    plain += c;
    i++;
  }
  flush();
  return tokens;
}

// ── Pseudocode ──────────────────────────────────────────────────────────
// The pseudocode snippets in `lib/data.ts` are their own small language:
// `←` for assignment, `▸` to end of line for a remark, and spelled-out
// control words. Reusing the C tokenizer would colour `for`/`if` but miss all
// of that, so they get their own pass.

const PSEUDO_KEYWORDS = new Set([
  "and", "append", "break", "by", "continue", "do", "down", "each", "else",
  "end", "for", "function", "if", "in", "is", "let", "logfn", "loop", "mod",
  "new", "not", "of", "or", "output", "procedure", "record", "repeat",
  "report", "return", "select", "skip", "sort", "step", "swap", "then",
  "times", "to", "while", "with",
]);

const PSEUDO_CONSTANTS = new Set(["NIL", "true", "false", "empty", "∞"]);

/** Characters that read as operators rather than prose. */
const PSEUDO_OPERATORS = new Set([
  "←", "≤", "≥", "≠", "=", "<", ">", "+", "-", "·", "/", "±", "→",
]);

function tokenizePseudoLine(line: string): Token[] {
  const tokens: Token[] = [];
  const n = line.length;
  let i = 0;
  let plain = "";
  const push = (value: string, type: TokenType) => {
    if (value) tokens.push({ value, type });
  };
  const flush = () => {
    if (plain) {
      tokens.push({ value: plain, type: "plain" });
      plain = "";
    }
  };

  while (i < n) {
    const c = line[i];

    // A remark runs to the end of the line.
    if (c === "▸") {
      flush();
      push(line.slice(i), "comment");
      return tokens;
    }
    if (c === "'" || c === '"') {
      flush();
      let j = i + 1;
      while (j < n && line[j] !== c) j++;
      push(line.slice(i, Math.min(j + 1, n)), "string");
      i = j + 1;
      continue;
    }
    if (isDigit(c)) {
      flush();
      let j = i;
      while (j < n && /[0-9.]/.test(line[j])) j++;
      push(line.slice(i, j), "number");
      i = j;
      continue;
    }
    if (isIdentStart(c)) {
      flush();
      let j = i;
      while (j < n && isIdent(line[j])) j++;
      const word = line.slice(i, j);
      let k = j;
      while (k < n && /\s/.test(line[k])) k++;
      let type: TokenType = "plain";
      if (PSEUDO_KEYWORDS.has(word.toLowerCase())) type = "keyword";
      else if (PSEUDO_CONSTANTS.has(word)) type = "constant";
      else if (/^[A-Z][A-Z0-9_]*$/.test(word)) type = "constant";
      else if (line[k] === "(" || /^[A-Z][A-Za-z0-9]*$/.test(word))
        type = "function";
      push(word, type);
      i = j;
      continue;
    }
    if (PSEUDO_OPERATORS.has(c)) {
      flush();
      push(c, "keyword");
      i++;
      continue;
    }
    if (PSEUDO_CONSTANTS.has(c)) {
      flush();
      push(c, "constant");
      i++;
      continue;
    }
    plain += c;
    i++;
  }
  flush();
  return tokens;
}

/** Which of the two views a snippet is written in. */
export type CodeLang = "c" | "pseudo";

/** Tokenize a snippet into one `Token[]` per source line. */
export function tokenize(code: string, lang: CodeLang = "c"): Token[][] {
  if (lang === "pseudo") return code.split("\n").map(tokenizePseudoLine);
  const state: State = { inBlockComment: false };
  return code.split("\n").map((line) => tokenizeLine(line, state));
}
