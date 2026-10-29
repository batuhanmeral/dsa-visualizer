import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { htmlClassName, themeBootScript } from "@/components/document-head";
import { translate } from "@/lib/translate";
import "./globals.css";

// Unmatched URLs skip both root layouts, so this page brings its own document
// and stays Turkish: the site's default language lives at the root.
export const metadata: Metadata = {
  title: `${translate("tr", "nf.title")} · Algoritmalar`,
};

export default function GlobalNotFound() {
  return (
    <html lang="tr" suppressHydrationWarning className={htmlClassName}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full">
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-claude-500/10 text-claude-600 dark:text-claude-400">
            <Compass className="size-7" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {translate("tr", "nf.title")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {translate("tr", "nf.desc")}
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-claude-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-claude-500"
          >
            {translate("tr", "nf.back")}
          </Link>
        </main>
      </body>
    </html>
  );
}
