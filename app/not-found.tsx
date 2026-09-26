"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-claude-500/10 text-claude-600 dark:text-claude-400">
        <Compass className="size-7" />
      </span>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {t("nf.title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("nf.desc")}
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-claude-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-claude-500"
      >
        {t("nf.back")}
      </Link>
    </div>
  );
}
