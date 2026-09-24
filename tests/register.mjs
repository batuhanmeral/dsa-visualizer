/**
 * Installs the resolution hook for `node --test`.
 *
 * `registerHooks` runs in-thread (the older `register` is deprecated), which is
 * all this hook needs: it only rewrites specifiers.
 */
import { registerHooks } from "node:module";
import { resolve } from "./resolve-hook.mjs";

registerHooks({ resolve });
