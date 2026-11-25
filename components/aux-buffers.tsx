import type { AuxRow } from "@/lib/simulations/types";

/**
 * The buffers an out-of-place sort copies into (`L`/`R`, `out`, buckets),
 * drawn under the bars. Values moved here leave an empty slot in the main
 * array, so together the two always show the input exactly once.
 *
 * `reserve` is the most rows any step of the run uses: the area keeps that
 * height for the whole run, so the bars above do not jump as buffers come and go.
 */
export default function AuxBuffers({ rows, reserve }: { rows: AuxRow[]; reserve: number }) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-1">
      {Array.from({ length: reserve }, (_, r) => {
        const row = rows[r];
        if (!row) return <div key={`empty-${r}`} aria-hidden className="h-6" />;
        return (
          <div key={row.label} className="flex h-6 min-w-0 items-center gap-2">
            <span className="w-16 shrink-0 text-right font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
              {row.label}
            </span>
            <div className="scrollbar-slim flex min-w-0 gap-1 overflow-x-auto">
              {row.cells.map((value, i) => {
                const active = row.active?.includes(i) ?? false;
                return (
                  <span
                    key={i}
                    className={`flex h-6 min-w-7 shrink-0 items-center justify-center rounded border px-1 font-mono text-[10px] transition-colors duration-200 ${
                      value === null
                        ? `border-dashed ${active ? "border-violet-400 dark:border-violet-500" : "border-zinc-300 dark:border-zinc-700"}`
                        : active
                          ? "border-amber-400 bg-amber-400/20 font-semibold text-amber-700 dark:text-amber-300"
                          : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {value ?? ""}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
