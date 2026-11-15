"use client";

import { useLang } from "@/lib/i18n";
import type { PublishedTransport } from "./playback-bridge";
import { TransportControls } from "./step-player";

/**
 * Below lg, the card's playback row scrolls away while the reader follows the
 * code; this fixed bar keeps the run in reach. It stays mounted and slides out
 * (rather than unmounting) so leaving can animate as well as arriving.
 * Height is h-20 plus the safe area: the Workspace reserves the same below it.
 */
export default function PlaybackDock({
  transport,
}: {
  transport: PublishedTransport;
}) {
  const { t } = useLang();
  const hidden = transport.rowVisible;
  return (
    <div
      data-playback-dock
      role="group"
      aria-label={t("ws.dock.label")}
      inert={hidden}
      className={`fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] motion-safe:transition-[translate,visibility] motion-safe:duration-200 lg:hidden dark:border-zinc-800 dark:bg-zinc-950 ${
        hidden ? "invisible translate-y-full" : ""
      }`}
    >
      <div className="flex h-20 flex-col justify-center gap-1.5 px-4">
        <p
          data-dock-note
          className="truncate text-xs text-zinc-700 dark:text-zinc-200"
        >
          {transport.note}
        </p>
        <div className="flex items-center gap-3">
          <TransportControls
            playing={transport.playing}
            onToggle={transport.toggle}
            onReset={transport.reset}
            onStep={transport.stepBy}
          />
          <span className="ml-auto font-mono text-[11px] text-zinc-600 tabular-nums dark:text-zinc-400">
            {transport.index + 1}/{transport.count}
          </span>
        </div>
      </div>
    </div>
  );
}
