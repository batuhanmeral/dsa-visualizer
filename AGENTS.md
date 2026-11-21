<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Algoritmalar (dsa-visualizer) — Next.js web

Interactive DSA visualizer, live at https://algoritmalar.com. Architecture, ADRs and progress notes are in `.docs/` (Turkish, local only): read `.docs/ARCHITECTURE.md` before structural changes.

## Stack

Next.js 16 (App Router, static generation, Turbopack), React 19, TypeScript strict, Tailwind CSS v4 (CSS-first `@theme`), Framer Motion, Lucide. npm, Node 24. No i18n, charting or test library: i18n is a small client context, tests use `node --test` with Node's built-in TypeScript type stripping.

## Commands

- Dev: `npm run dev`
- All checks: `npm run check` (`tsc --noEmit && eslint && npm test`)
- Tests: `npm test` · with coverage thresholds (as CI): `npm run test:coverage` · one file: `node --import ./tests/register.mjs --test tests/<name>.test.ts`
- Lint: `npm run lint` · Types: `npm run typecheck`
- Build: `npm run build`, then `npm run verify:html` (checks the prerendered HTML; needs the build output)
- Env: copy `.env.example` to `.env.local`; `SITE_URL` is required.

CI (`.github/workflows/ci.yml`, job `check`) runs typecheck, lint, `test:coverage`, build and `verify:html` in that order; run the same before reporting work as done. `.github/workflows/security.yml` runs Semgrep, zizmor, gitleaks and Trivy from digest-pinned images; `SECURITY.md` is the disclosure policy.

## Structure

`app/(tr)` and `app/(en)` are separate root layouts: the language comes from the route, not from client state. `components/` holds UI (one `*-viz.tsx` per algorithm family, `step-player.tsx`, `workspace.tsx`); `lib/data.ts` is the algorithm catalogue; `lib/simulations/` holds the step generators; `lib/step-notes/` the note dictionaries; `tests/` the node tests; `scripts/verify-html.ts` the post-build check. `docs/` is tracked and holds only README screenshots.

## Invariants

- `pseudo` and `code` in `lib/data.ts` are aligned line for line: one `codeLine` highlights the same line in both views. Tests fail when line counts differ; never add a mapping table.
- Step generators return notes as data (`{ k, v }`), never as text; translation happens at render time through `useStepNote()`.
- In `lib/step-notes/`, `en` is the source of truth for keys (`StepNoteKey` derives from it); `tr` may be partial and falls back to English.
- The code language is C. Do not add another language or a syntax-highlighting dependency (`lib/highlight.ts` is the tokenizer).
- No PixiJS or D3 (ADR-002). New dependencies need a stated reason.
- Every algorithm page is statically generated; do not introduce request-time rendering.
