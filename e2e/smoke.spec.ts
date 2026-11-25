import { expect, test, type Page } from "@playwright/test";
import { categories } from "../lib/data";
import { en, tr } from "../lib/dictionaries";
import { stepNotesEn, stepNotesTr } from "../lib/step-notes";
import { hasBacktrackViz, hasDpViz, hasGraphViz } from "../lib/viz-families";
import { pitchFor } from "../lib/sound";

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
    const output = await measureOutput(page);
    const errors = watchErrors(page, baseURL);
    await page.goto(`${prefix}/sorting/bubble-sort`);
    const toggle = page.getByRole("button", { name: t["ws.sound"], exact: true });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    // Step 1 of the default input (23, 7, 41, 15, 3, 34, 9, 28) compares 23
    // with 7; the run's values span 3 to 41. Both notes must come out.
    await page.getByRole("button", { name: t.stepForward, exact: true }).first().click();
    await expect.poll(output.peak).toBeGreaterThan(0.01);
    await expect.poll(() => output.heard(pitchFor(23, 3, 41))).toBe(true);
    await expect.poll(() => output.heard(pitchFor(7, 3, 41))).toBe(true);
    expect(await output.heard(pitchFor(41, 3, 41)), "a value not in the step").toBe(false);

    // The choice survives a reload; turning it off is remembered too.
    await page.reload();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(await page.evaluate(() => localStorage.getItem("sound"))).toBe("off");
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 360, 390, 414, 1024, 1440]) {
  test(`the sound toggle shares a row with the transport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/sorting/bubble-sort");
    const centre = async (name: string) => {
      const box = (await page.getByRole("button", { name, exact: true }).first().boundingBox())!;
      return box.y + box.height / 2;
    };
    const slider = (await page.getByRole("slider", { name: tr["ws.timeline"] }).boundingBox())!;
    const sound = await centre(tr["ws.sound"]!);
    const play = await centre(tr.play!);
    // Beside the timeline on a narrow card, beside the speed selector otherwise:
    // never on a row of its own.
    const rows = [slider.y + slider.height / 2, play];
    expect(
      rows.some((y) => Math.abs(y - sound) < 8),
      `sound at y=${sound}, timeline at ${rows[0]}, transport at ${play}`
    ).toBe(true);
  });
}

/**
 * Taps everything the page sends to the speakers. Keeps the loudest sample
 * seen, to prove the steps are actually heard (an oscillator that never
 * reaches the output would not count), and the dominant pitch of every loud
 * moment, to prove they are the right notes.
 */
async function measureOutput(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __peak: number; __pitches: number[] };
    w.__peak = 0;
    w.__pitches = [];
    const analysers: AnalyserNode[] = [];
    const connect = AudioNode.prototype.connect as (this: AudioNode, ...args: unknown[]) => unknown;
    AudioNode.prototype.connect = function (this: AudioNode, ...args: unknown[]) {
      if (args[0] instanceof AudioDestinationNode) {
        const tap = this.context.createAnalyser();
        tap.fftSize = 8192;
        tap.smoothingTimeConstant = 0;
        connect.call(this, tap);
        analysers.push(tap);
      }
      return connect.apply(this, args);
    } as typeof AudioNode.prototype.connect;
    const wave = new Float32Array(8192);
    const spectrum = new Float32Array(4096);
    setInterval(() => {
      for (const a of analysers) {
        a.getFloatTimeDomainData(wave);
        let peak = 0;
        for (const v of wave) peak = Math.max(peak, Math.abs(v));
        w.__peak = Math.max(w.__peak, peak);
        if (peak < 0.02) continue;
        // The strongest bin between 100 Hz and 2 kHz: the note's fundamental.
        a.getFloatFrequencyData(spectrum);
        const hz = a.context.sampleRate / a.fftSize;
        let best = Math.ceil(100 / hz);
        for (let b = best; b < 2000 / hz; b++) if (spectrum[b] > spectrum[best]) best = b;
        w.__pitches.push(best * hz);
      }
    }, 10);
  });
  return {
    peak: () => page.evaluate(() => (window as unknown as { __peak: number }).__peak),
    /** Whether a note within 3% of `freq` has been heard. */
    heard: (freq: number) =>
      page.evaluate(
        (f) => (window as unknown as { __pitches: number[] }).__pitches.some((p) => Math.abs(p / f - 1) < 0.03),
        freq
      ),
  };
}

for (const { prefix, t } of LANGS) {
  test(`large n ${prefix}/sorting/merge-sort`, async ({ page, baseURL }) => {
    const output = await measureOutput(page);
    const errors = watchErrors(page, baseURL);
    await page.goto(`${prefix}/sorting/merge-sort`);
    await page.getByRole("button", { name: t["bign.enter"], exact: true }).click();

    const canvas = page.locator("[data-big-n-canvas]");
    await expect(canvas).toBeVisible();
    await page.getByRole("button", { name: "2000", exact: true }).click();
    await expect(canvas).toHaveAttribute("aria-label", t["bign.canvas"].replace("{n}", "2000"));
    const timeline = page.getByRole("slider", { name: t["ws.timeline"] }).first();
    const max = Number(await timeline.getAttribute("max"));
    expect(max, "2000 values take thousands of steps").toBeGreaterThan(10_000);

    // Something is drawn: the canvas is not blank.
    const painted = () =>
      canvas.evaluate((c: HTMLCanvasElement) => {
        const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
        let alpha = 0;
        for (let i = 3; i < data.length; i += 4) alpha += data[i];
        return alpha;
      });
    expect(await painted()).toBeGreaterThan(0);

    // Play the last stretch of the run with sound on; it stops at the end.
    await page.getByRole("button", { name: t["ws.sound"], exact: true }).click();
    await timeline.focus();
    await page.keyboard.press("End");
    for (let i = 0; i < 200; i++) await page.keyboard.press("ArrowLeft");
    await page.getByRole("button", { name: t.play, exact: true }).first().click();
    await expect(timeline).toHaveValue(String(max), { timeout: 10_000 });
    await expect(page.getByRole("button", { name: t.play, exact: true }).first()).toBeVisible();
    await expect.poll(output.peak).toBeGreaterThan(0.01);
    await expect(page.locator("[data-playback-stats]").first()).toContainText(t["stat.comparisons"]);

    // Back to the small input and its bars.
    await page.getByRole("button", { name: t["bign.exit"], exact: true }).click();
    await expect(canvas).toHaveCount(0);
    expect(Number(await timeline.getAttribute("max"))).toBeLessThan(1000);
    expect(errors).toEqual([]);
  });

  test(`large n runs 2000 values through bubble sort ${prefix}/sorting/bubble-sort`, async ({ page, baseURL }) => {
    test.setTimeout(60_000);
    const errors = watchErrors(page, baseURL);
    await page.goto(`${prefix}/sorting/bubble-sort`);
    await page.getByRole("button", { name: t["bign.enter"], exact: true }).click();
    await expect(page.locator("[data-big-n-canvas]")).toBeVisible();
    await page.getByRole("button", { name: "2000", exact: true }).click();

    // ~3 million steps take a couple of seconds to trace. The worker does it,
    // so the page keeps drawing frames while it waits.
    await expect(page.getByRole("status")).toContainText("2000");
    const frames = await page.evaluate(
      () =>
        new Promise<number>((done) => {
          let n = 0;
          const end = performance.now() + 500;
          const tick = (now: number) => (now < end ? (n++, requestAnimationFrame(tick)) : done(n));
          requestAnimationFrame(tick);
        })
    );
    expect(frames, "frames drawn in 500 ms while tracing").toBeGreaterThan(10);

    const canvas = page.locator("[data-big-n-canvas]");
    await expect(canvas).toHaveAttribute("aria-label", t["bign.canvas"].replace("{n}", "2000"), {
      timeout: 30_000,
    });
    const timeline = page.getByRole("slider", { name: t["ws.timeline"] }).first();
    expect(Number(await timeline.getAttribute("max"))).toBeGreaterThan(1_000_000);
    expect(errors).toEqual([]);
  });

  test(`large n ${prefix}/searching/binary-search`, async ({ page, baseURL }) => {
    // The trace is built in a worker, off the page's main thread.
    await page.addInitScript(() => {
      const w = window as unknown as { __workers: number };
      w.__workers = 0;
      const Native = window.Worker;
      window.Worker = class extends Native {
        constructor(...args: ConstructorParameters<typeof Worker>) {
          super(...args);
          w.__workers++;
        }
      };
    });
    const errors = watchErrors(page, baseURL);
    await page.goto(`${prefix}/searching/binary-search`);
    await page.getByRole("button", { name: t["bign.enter"], exact: true }).click();
    await page.getByRole("button", { name: "2000", exact: true }).click();
    const canvas = page.locator("[data-big-n-canvas]");
    await expect(canvas).toHaveAttribute("aria-label", t["bign.canvas"].replace("{n}", "2000"));
    expect(await page.evaluate(() => (window as unknown as { __workers: number }).__workers)).toBeGreaterThan(0);
    const note = t["bign.note.search"].split("{target}")[0].replace("{n}", "2000");
    await expect(page.locator("[data-playback-note]").first()).toContainText(note);

    // A short run: the last two steps play at the small canvas's pace.
    const timeline = page.getByRole("slider", { name: t["ws.timeline"] }).first();
    const max = Number(await timeline.getAttribute("max"));
    expect(max).toBeGreaterThan(5);
    expect(max).toBeLessThan(100);
    await timeline.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.getByRole("button", { name: t.play, exact: true }).first().click();
    await expect(timeline).toHaveValue(String(max), { timeout: 10_000 });
    await expect(page.locator("[data-playback-stats]").first()).toContainText(t["stat.probes"]);
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
