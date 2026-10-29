/**
 * Installs the resolution hook for `node --test`.
 *
 * `registerHooks` runs in-thread (the older `register` is deprecated), which is
 * all this hook needs: it only rewrites specifiers.
 */
import { registerHooks } from "node:module";
import { resolve } from "./resolve-hook.mjs";

registerHooks({ resolve });

// lib/site.ts validates SITE_URL at import time; give tests a default.
process.env.SITE_URL ??= "http://localhost:3000";
