"use client";

import { createContext, useContext, useEffect, useRef } from "react";

/** What the mobile dock needs from the panel's player to mirror and drive it. */
export interface PublishedTransport {
  index: number;
  count: number;
  playing: boolean;
  /** The current step note, already translated. */
  note: string;
  /** Whether the card's own playback row is on screen. */
  rowVisible: boolean;
  toggle: () => void;
  reset: () => void;
  stepBy: (delta: number) => void;
}

/**
 * Signals from the visualizer families up to the Workspace. Each family keeps
 * its own playback state, so a user advance has to be reported, not observed.
 */
export interface PlaybackBridge {
  /** The user moved the run (play, step, reset, scrub, a DS operation). */
  userAdvanced: () => void;
  /** The active panel's transport, or null once it unmounts. */
  publish: (t: PublishedTransport | null) => void;
}

export const PlaybackBridgeContext = createContext<PlaybackBridge | null>(null);

const noop = () => {};

/** No-op outside a Workspace, so a family still renders on its own. */
export function useUserAdvanced(): () => void {
  return useContext(PlaybackBridgeContext)?.userAdvanced ?? noop;
}

/**
 * Publishes only when a displayed value changes: the handlers are fresh on
 * every render, so they go through a ref instead of the effect's dependencies.
 */
export function usePublishTransport(t: PublishedTransport | null): void {
  const publish = useContext(PlaybackBridgeContext)?.publish;
  const latest = useRef(t);
  useEffect(() => {
    latest.current = t;
  });

  const live = t !== null;
  const index = t?.index ?? 0;
  const count = t?.count ?? 0;
  const playing = t?.playing ?? false;
  const note = t?.note ?? "";
  const rowVisible = t?.rowVisible ?? true;
  useEffect(() => {
    if (!publish) return;
    publish(
      live
        ? {
            index,
            count,
            playing,
            note,
            rowVisible,
            toggle: () => latest.current?.toggle(),
            reset: () => latest.current?.reset(),
            stepBy: (delta) => latest.current?.stepBy(delta),
          }
        : null
    );
  }, [publish, live, index, count, playing, note, rowVisible]);

  useEffect(() => () => publish?.(null), [publish]);
}
