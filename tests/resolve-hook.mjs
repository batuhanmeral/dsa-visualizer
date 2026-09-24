/**
 * Module resolution hook so `node --test` can run the app's TypeScript sources
 * directly (Node strips the types itself; only the specifiers need help).
 *
 * The sources are written for a bundler, so they use extensionless relative
 * imports (`./note`), directory imports (`../step-notes`) and the `@/` alias
 * from tsconfig. Node's ESM resolver requires full paths, so map them here
 * rather than rewriting the app to suit the test runner.
 */
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");

/** Candidate on-disk targets for a bundler-style specifier. */
function candidates(spec, parentURL) {
  const base = spec.startsWith("@/")
    ? resolvePath(ROOT, spec.slice(2))
    : parentURL
      ? resolvePath(dirname(fileURLToPath(parentURL)), spec)
      : null;
  if (!base) return [];
  return [base, `${base}.ts`, `${base}.tsx`, resolvePath(base, "index.ts")];
}

export function resolve(specifier, context, next) {
  const relative = specifier.startsWith("./") || specifier.startsWith("../");
  if (relative || specifier.startsWith("@/")) {
    for (const candidate of candidates(specifier, context.parentURL)) {
      if (candidate.endsWith(".ts") || candidate.endsWith(".tsx")) {
        if (existsSync(candidate))
          return {
            url: pathToFileURL(candidate).href,
            // Declared explicitly so Node does not have to sniff the syntax
            // (the repo root has no "type": "module", and adding one there
            // would change how Next resolves its own config files).
            format: "module-typescript",
            shortCircuit: true,
          };
      }
    }
  }
  return next(specifier, context);
}
