import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Compass className="size-7" />
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          This algorithm hasn&apos;t been charted yet.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
      >
        Back to overview
      </Link>
    </div>
  );
}
