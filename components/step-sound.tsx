"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { SOUND_STORAGE_KEY, parseSoundPref, type Tone } from "@/lib/sound";

/**
 * Web Audio side of the sound effects. The mapping from a step to tones lives
 * in `lib/sound.ts`; this file only plays them.
 *
 * Browsers refuse to start audio before the user interacts with the page, so
 * the context is created inside a click or key handler, never on load: by the
 * toggle itself, or (when the preference was saved on an earlier visit) by the
 * first pointer or key press on the page.
 */

let context: AudioContext | null = null;
let master: GainNode | null = null;

/** Creates or resumes the shared context. Call only from a user gesture. */
function unlockAudio(): void {
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return;
  if (!context) {
    context = new window.AudioContext();
    master = context.createGain();
    master.gain.value = 0.6;
    master.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume().catch(() => {});
}

/** Schedules the tones from now; does nothing until the context is running. */
export function playTones(tones: readonly Tone[]): void {
  if (!context || !master || context.state !== "running") return;
  const t0 = context.currentTime + 0.005;
  for (const tone of tones) {
    const start = t0 + tone.at;
    const end = start + tone.duration;
    const osc = context.createOscillator();
    osc.type = tone.wave;
    osc.frequency.value = tone.freq;
    // Short attack and an exponential tail: no click at either end.
    const env = context.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(tone.gain, start + Math.min(0.01, tone.duration / 4));
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(env).connect(master);
    osc.start(start);
    osc.stop(end + 0.01);
  }
}

/**
 * The remembered on/off preference, off by default. Read after mount like the
 * other stored preferences: the server render has no localStorage.
 */
export function useSoundPreference(): [boolean, () => void] {
  const [on, setOn] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      setOn(parseSoundPref(localStorage.getItem(SOUND_STORAGE_KEY)));
    } catch {
      /* localStorage unavailable: keep sound off */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Turned on during an earlier visit: wait for the first interaction.
  useEffect(() => {
    if (!on || context?.state === "running") return;
    const opts = { capture: true } as const;
    window.addEventListener("pointerdown", unlockAudio, opts);
    window.addEventListener("keydown", unlockAudio, opts);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, opts);
      window.removeEventListener("keydown", unlockAudio, opts);
    };
  }, [on]);

  const toggle = () => {
    const next = !on;
    if (next) unlockAudio();
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* localStorage unavailable: the choice just will not persist */
    }
    setOn(next);
  };

  return [on, toggle];
}

/**
 * Plays a step's tones whenever the shown step changes, not on the first
 * render and not when only the tones' inputs change.
 */
export function useStepSound<S>(step: S | undefined, enabled: boolean, tonesFor: (step: S) => Tone[]): void {
  const shown = useRef(step);
  const latest = useRef(tonesFor);
  useEffect(() => {
    latest.current = tonesFor;
  });
  useEffect(() => {
    if (shown.current === step) return;
    shown.current = step;
    if (enabled && step !== undefined) playTones(latest.current(step));
  }, [step, enabled]);
}

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-claude-500";

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { t } = useLang();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={t("ws.sound")}
      title={t("ws.sound")}
      className={`flex min-h-8.5 shrink-0 items-center justify-center self-stretch rounded-lg border px-2.5 transition-colors ${FOCUS_RING} ${
        on
          ? "border-claude-500/40 bg-claude-500/10 text-claude-600 dark:text-claude-400"
          : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-100"
      }`}
    >
      {on ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
    </button>
  );
}
