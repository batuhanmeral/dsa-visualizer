import { expect, test, type Page } from "@playwright/test";
import { categories } from "../lib/data";
import { en, tr } from "../lib/dictionaries";
import { stepNotesEn, stepNotesTr } from "../lib/step-notes";
import { hasBacktrackViz, hasDpViz, hasGraphViz } from "../lib/viz-families";

/**
 * Every page loads without a console error, an uncaught exception, a CSP
 * violation (Chrome reports those as console errors) or a failed request.
 * Step-player pages also play their last steps through to the end, and the
 * data-structure pages run one operation.
 */

const LANGS = [
  { prefix: "", t: { ...en, ...tr }, pickOp: stepNotesTr["n.ds.pickOp"]! },
  { prefix: "/en", t: en, pickOp: stepNotesEn["n.ds.pickOp"] },
] as const;

/** The operation each data-structure page runs, by its button label key. */
const DS_OP = {
  stack: "ds.push",
  queue: "ds.enqueue",
  "linked-list": "ds.pushFront",
  "hash-table": "ds.insert",
} as const;

/** The counter every run of a family shows, by its label key. */
function familyCounter(slug: string) {
  if (hasGraphViz(slug)) return "stat.edgesExamined" as const;
  if (hasDpViz(slug)) return "stat.cellsWritten" as const;
  if (hasBacktrackViz(slug)) return "stat.choices" as const;
  return undefined;
}

/** Collects everything that should fail the page; read it at the end. */
function watchErrors(page: Page, baseURL: string | undefined): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && baseURL && r.url().startsWith(baseURL))
      errors.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  return errors;
}

for (const { prefix, t, pickOp } of LANGS) {
  test(`home ${prefix || "/"}`, async ({ page, baseURL }) => {
    const errors = watchErrors(page, baseURL);
    await page.goto(prefix || "/");
    await expect(page.locator("main")).toBeVisible();
    expect(errors).toEqual([]);
  });

  for (const category of categories) {
    test(`category ${prefix}/${category.slug}`, async ({ page, baseURL }) => {
      const errors = watchErrors(page, baseURL);
      await page.goto(`${prefix}/${category.slug}`);
      await expect(page.locator("main")).toBeVisible();
      expect(errors).toEqual([]);
    });

    for (const algorithm of category.algorithms) {
      const path = `${prefix}/${category.slug}/${algorithm.slug}`;
      test(`algorithm ${path}`, async ({ page, baseURL }) => {
        const errors = watchErrors(page, baseURL);
        await page.goto(path);

        const op = DS_OP[algorithm.slug as keyof typeof DS_OP];
        if (op) {
          const pick = page.getByText(pickOp, { exact: true });
          const button = page.getByRole("button", { name: t[op], exact: true });
          await expect(pick).toBeVisible();
          await button.click();
          // The operation walks its code lines, replacing the "pick an operation"
          // note, and the buttons come back once the last frame has run.
          await expect(pick).toHaveCount(0);
          await expect(button).toBeEnabled({ timeout: 10_000 });
        } else {
          const timeline = page.getByRole("slider", { name: t["ws.timeline"] }).first();
          await expect(timeline).toBeVisible();
          const max = Number(await timeline.getAttribute("max"));
          expect(max, "the run has more than one step").toBeGreaterThan(0);

          // Jump near the end, then let the player run the last steps itself.
          await timeline.focus();
          await page.keyboard.press("End");
          await expect(timeline).toHaveValue(String(max));
          await page.keyboard.press("ArrowLeft");
          await page.keyboard.press("ArrowLeft");
          await page.getByRole("button", { name: t.play, exact: true }).first().click();
          await expect(timeline).toHaveValue(String(max), { timeout: 10_000 });
          // At the end the player stops on its own.
          await expect(page.getByRole("button", { name: t.play, exact: true }).first()).toBeVisible();

          const counter = familyCounter(algorithm.slug);
          if (counter) {
            const stats = page.locator("[data-playback-stats]").first();
            await expect(stats).toContainText(t[counter]);
          }
        }

        expect(errors).toEqual([]);
      });
    }
  }
}

for (const { prefix, t } of LANGS) {
  test(`sound effects ${prefix}/sorting/bubble-sort`, async ({ page, baseURL }) => {
    // Count the oscillators the page starts, to prove the steps are heard.
    await page.addInitScript(() => {
      const w = window as unknown as { __oscillators: number };
      w.__oscillators = 0;
      const create = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function (this: AudioContext) {
        w.__oscillators++;
        return create.call(this);
      };
    });
    const errors = watchErrors(page, baseURL);
    await page.goto(`${prefix}/sorting/bubble-sort`);
    const toggle = page.getByRole("button", { name: t["ws.sound"], exact: true });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const forward = page.getByRole("button", { name: t.stepForward, exact: true }).first();
    await forward.click();
    await forward.click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __oscillators: number }).__oscillators))
      .toBeGreaterThan(0);

    // The choice survives a reload; turning it off is remembered too.
    await page.reload();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => localStorage.getItem("sound"))).toBe("off");
    expect(errors).toEqual([]);
  });
}

test("an unknown page is a 404 without client errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  expect(errors).toEqual([]);
});
